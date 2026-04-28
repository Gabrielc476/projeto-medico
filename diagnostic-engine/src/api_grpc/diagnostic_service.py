"""gRPC Diagnostic Service implementation.

This module implements the ``DiagnosticService`` defined in
``proto/diagnostic.proto``.  It wires together:

- **ClinicalExtractor** (NLP) — for ``ExtractContext``
- **DiseaseDiagnosticNetwork** (Bayesian) + **SymptomVectorizer** (TF-IDF)
  backed by **MedicalKnowledgeBase** — for ``AssessSymptoms``

Architecture note (from ``nestjs-grpc-microservices`` skill):
  Controllers (gRPC methods) stay thin; heavy logic lives in the math
  and data layers.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any

import grpc

# ---------------------------------------------------------------------------
# Make the generated stubs importable.  ``grpc_tools.protoc`` emits
# ``import diagnostic_pb2`` (flat), so the ``generated/`` directory
# itself must be on ``sys.path``.
# ---------------------------------------------------------------------------
_GENERATED_DIR = str(Path(__file__).resolve().parent / "generated")
if _GENERATED_DIR not in sys.path:
    sys.path.insert(0, _GENERATED_DIR)

import diagnostic_pb2  # noqa: E402
import diagnostic_pb2_grpc  # noqa: E402

from src.data.knowledge_base import KnowledgeBaseProtocol
from src.data.neo4j_knowledge_base import Neo4jKnowledgeBase
from src.math.bayesian_network import DiseaseDiagnosticNetwork
from src.math.vector_space import SymptomVectorizer
from src.nlp.extractor import ClinicalExtractor

logger = logging.getLogger(__name__)


class DiagnosticServicer(diagnostic_pb2_grpc.DiagnosticServiceServicer):
    """Production implementation of the DiagnosticService gRPC contract.

    On initialization it eagerly connects to Neo4j and fits the 
    TF-IDF vectorizer so that first-request latency is minimized.
    """

    def __init__(self, knowledge_base: KnowledgeBaseProtocol | None = None) -> None:
        # Use Neo4j by default as the JSON implementation is discontinued
        self._kb = knowledge_base or Neo4jKnowledgeBase()
        self._extractor = ClinicalExtractor()
        self._network = DiseaseDiagnosticNetwork()
        self._vectorizer = SymptomVectorizer()

        # Pre-fit TF-IDF from the knowledge base at startup
        self._vectorizer.fit_from_knowledge_base(self._kb)

        logger.info(
            "DiagnosticServicer initialized — %d diseases, %d symptoms, %d links",
            self._kb.disease_count,
            self._kb.symptom_count,
            self._kb.link_count,
        )

    # -----------------------------------------------------------------
    # RPC: ExtractContext
    # -----------------------------------------------------------------
    def ExtractContext(
        self,
        request: Any,
        context: grpc.ServicerContext,
    ) -> Any:
        """Extract clinical entities from free-text using scispaCy NER.

        Input:  ``ContextExtractionRequest { free_text: str }``
        Output: ``ContextExtractionResponse { features: [ExtractedFeature] }``
        """
        # Pass a subset of known symptoms to avoid prompt overflow (max 100)
        # In production, we might use a vector search to find relevant hints first
        all_symptoms = self._kb.get_all_symptoms()
        hints = []
        if len(all_symptoms) <= 100:
            hints = [{"cui": s.cui, "name": s.name} for s in all_symptoms]
        else:
            # For now, if we have too many, we let the LLM use its internal knowledge
            # or we could pass the most common symptoms.
            hints = [{"cui": s.cui, "name": s.name} for s in all_symptoms[:100]]

        raw_features = self._extractor.extract_features(request.free_text, hints)

        pb_features = []
        for feat in raw_features:
            pb_features.append(
                diagnostic_pb2.ExtractedFeature(
                    cui=feat["cui"],
                    name=feat["name"],
                    is_present=feat["is_present"],
                )
            )

        return diagnostic_pb2.ContextExtractionResponse(features=pb_features)

    # -----------------------------------------------------------------
    # RPC: ExtractExam
    # -----------------------------------------------------------------
    def ExtractExam(
        self,
        request: Any,
        context: grpc.ServicerContext,
    ) -> Any:
        """Extract abnormal findings from an exam PDF using pdfplumber and LLM.

        Input:  ``ExamExtractionRequest { pdf_content: bytes }``
        Output: ``ContextExtractionResponse { features: [ExtractedFeature] }``
        """
        # Load ExamLLMExtractor locally to avoid circular/heavy imports at startup
        from src.nlp.exam_extractor import ExamLLMExtractor
        
        # Initialize extractor
        exam_extractor = ExamLLMExtractor()
        
        # Get hints from KB (in production use vector search)
        all_symptoms = self._kb.get_all_symptoms()
        hints = [{"cui": s.cui, "name": s.name} for s in all_symptoms[:100]]

        # Call extraction
        try:
            extraction = exam_extractor.extract_from_exam(request.pdf_content, hints)
        except Exception as e:
            logger.error(f"ExtractExam failed: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return diagnostic_pb2.ContextExtractionResponse(features=[])

        # Map to protobuf
        pb_features = []
        for sym in extraction.symptoms:
            pb_features.append(
                diagnostic_pb2.ExtractedFeature(
                    cui=sym.cui,
                    name=sym.name,
                    is_present=sym.is_present,
                )
            )

        return diagnostic_pb2.ContextExtractionResponse(features=pb_features)

    # -----------------------------------------------------------------
    # RPC: GetAppSymptoms
    # -----------------------------------------------------------------
    def GetAppSymptoms(
        self,
        request: Any,
        context: grpc.ServicerContext,
    ) -> Any:
        """Return all symptoms with clinical names translated to layman terms via LLM.

        Input:  ``GetAppSymptomsRequest { language: str }``
        Output: ``GetAppSymptomsResponse { symptoms: [AppSymptom] }``
        """
        # 1. Get all symptoms from Knowledge Base
        all_symptoms = self._kb.get_all_symptoms()
        symptom_dicts = [{"cui": s.cui, "name": s.name} for s in all_symptoms]
        
        logger.info(f"GetAppSymptoms: Translating {len(symptom_dicts)} symptoms to {request.language}")

        # 2. Use LLM to generate layman terms (via the internal _llm of our extractor)
        layman_mapping = self._extractor._llm.translate_symptoms(
            symptom_dicts, 
            language=request.language
        )
        
        # 3. Build response
        pb_symptoms = []
        for s in all_symptoms:
            layman_term = layman_mapping.get(s.cui, s.name)
            pb_symptoms.append(
                diagnostic_pb2.AppSymptom(
                    cui=s.cui,
                    clinical_name=s.name,
                    layman_term=layman_term,
                    body_region=s.body_region or "constitutional",
                )
            )
            
        return diagnostic_pb2.GetAppSymptomsResponse(symptoms=pb_symptoms)

    # -----------------------------------------------------------------
    # RPC: AssessSymptoms
    # -----------------------------------------------------------------
    def AssessSymptoms(
        self,
        request: Any,
        context: grpc.ServicerContext,
    ) -> Any:
        """Rank diseases by posterior probability given patient symptoms.

        Input:  ``SymptomAssessmentRequest { symptoms, contextual_factors }``
        Output: ``SymptomAssessmentResponse { ranked_diseases }``

        Pipeline:
        1. Resolve CUIs from the request into symptom IDs via the KB.
        2. Run Bayesian ranking (Log-Odds with LR+/LR-).
        3. Run TF-IDF cosine similarity scoring.
        4. Merge both scores into ``RankedDisease`` messages.
        """
        # 1. Collect CUIs from the request (Symptoms + Contextual Factors)
        patient_cuis = [s.cui for s in request.symptoms if s.is_present]
        context_cuis = [c.cui for c in request.contextual_factors if c.is_present]
        
        all_cuis = list(set(patient_cuis + context_cuis))
        
        logger.info(
            "AssessSymptoms called — %d symptoms, %d context factors received", 
            len(patient_cuis), len(context_cuis)
        )

        # 2. Resolve CUIs → symptom IDs
        symptom_ids = self._kb.resolve_cuis_to_symptom_ids(all_cuis)

        # 3. Bayesian ranking
        bayesian_ranking = self._network.rank_diseases(symptom_ids, self._kb)
        bayesian_map = {did: prob for did, prob in bayesian_ranking}

        # 4. TF-IDF ranking
        tfidf_scores = self._vectorizer.score_diseases(all_cuis)

        # 5. Build response
        ranked_diseases = []
        for disease_id, posterior in bayesian_ranking:
            disease = self._kb.get_disease(disease_id)
            if disease is None:
                continue

            # Aggregate LR+ and LR- for the matched symptoms
            links = self._kb.get_links_for_disease(disease_id)
            patient_set = set(symptom_ids)
            lr_pos_values = []
            lr_neg_values = []
            for link in links:
                if link.symptom_id in patient_set:
                    lr_pos_values.append(link.lr_positive)
                else:
                    lr_neg_values.append(link.lr_negative)

            # Use geometric mean of LR+ as a summary statistic
            avg_lr_pos = (
                _geometric_mean(lr_pos_values) if lr_pos_values else 1.0
            )
            avg_lr_neg = (
                _geometric_mean(lr_neg_values) if lr_neg_values else 1.0
            )

            ranked_diseases.append(
                diagnostic_pb2.RankedDisease(
                    disease_id=disease_id,
                    disease_name=disease.name,
                    posterior_probability=float(posterior),
                    likelihood_ratio_positive=float(avg_lr_pos),
                    likelihood_ratio_negative=float(avg_lr_neg),
                    tf_idf_score=float(tfidf_scores.get(disease_id, 0.0)),
                )
            )

        logger.info("AssessSymptoms returning %d ranked diseases", len(ranked_diseases))
        return diagnostic_pb2.SymptomAssessmentResponse(
            ranked_diseases=ranked_diseases
        )


def _geometric_mean(values: list[float]) -> float:
    """Compute geometric mean for a list of positive floats."""
    import numpy as np

    if not values:
        return 1.0
    log_sum = sum(np.log(max(v, 1e-15)) for v in values)
    return float(np.exp(log_sum / len(values)))
