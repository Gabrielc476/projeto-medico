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

from src.data.knowledge_base import MedicalKnowledgeBase
from src.math.bayesian_network import DiseaseDiagnosticNetwork
from src.math.vector_space import SymptomVectorizer
from src.nlp.extractor import ClinicalExtractor

logger = logging.getLogger(__name__)


class DiagnosticServicer(diagnostic_pb2_grpc.DiagnosticServiceServicer):
    """Production implementation of the DiagnosticService gRPC contract.

    On initialization it eagerly loads the MedicalKnowledgeBase and fits
    the TF-IDF vectorizer so that first-request latency is minimized.
    """

    def __init__(self, knowledge_base: MedicalKnowledgeBase | None = None) -> None:
        self._kb = knowledge_base or MedicalKnowledgeBase()
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
        logger.info("ExtractContext called — text length: %d", len(request.free_text))

        raw_features = self._extractor.extract_features(request.free_text)

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
        # 1. Collect CUIs from the request
        patient_cuis = [s.cui for s in request.symptoms if s.is_present]
        logger.info("AssessSymptoms called — %d symptoms received", len(patient_cuis))

        # 2. Resolve CUIs → symptom IDs
        symptom_ids = self._kb.resolve_cuis_to_symptom_ids(patient_cuis)

        # 3. Bayesian ranking
        bayesian_ranking = self._network.rank_diseases(symptom_ids, self._kb)
        bayesian_map = {did: prob for did, prob in bayesian_ranking}

        # 4. TF-IDF ranking
        tfidf_scores = self._vectorizer.score_diseases(patient_cuis)

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
