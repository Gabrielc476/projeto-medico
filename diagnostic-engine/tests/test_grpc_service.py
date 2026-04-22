"""Tests for the gRPC DiagnosticServicer.

These tests exercise the servicer directly (in-process) without starting
a real gRPC server, which is the recommended pattern for unit testing
gRPC servicers.
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock

import pytest

# Ensure generated stubs are importable
_GENERATED_DIR = str(
    Path(__file__).resolve().parent.parent / "src" / "grpc" / "generated"
)
if _GENERATED_DIR not in sys.path:
    sys.path.insert(0, _GENERATED_DIR)

import diagnostic_pb2  # noqa: E402

from src.data.knowledge_base import MedicalKnowledgeBase  # noqa: E402
from src.grpc.diagnostic_service import DiagnosticServicer  # noqa: E402


@pytest.fixture
def kb() -> MedicalKnowledgeBase:
    return MedicalKnowledgeBase()


@pytest.fixture
def servicer(kb: MedicalKnowledgeBase) -> DiagnosticServicer:
    """Create a DiagnosticServicer with the default KB."""
    return DiagnosticServicer(knowledge_base=kb)


@pytest.fixture
def mock_context() -> MagicMock:
    """Mock gRPC ServicerContext."""
    return MagicMock()


# ---------------------------------------------------------------------------
# ExtractContext tests
# ---------------------------------------------------------------------------

class TestExtractContext:
    """Test the ExtractContext RPC method."""

    def test_extract_returns_response(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """ExtractContext should return a ContextExtractionResponse."""
        request = diagnostic_pb2.ContextExtractionRequest(
            free_text="Patient has headache and fever"
        )
        response = servicer.ExtractContext(request, mock_context)
        assert response is not None
        assert hasattr(response, "features")

    def test_extract_returns_features_from_known_text(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Known symptom keywords should produce ExtractedFeature entries."""
        request = diagnostic_pb2.ContextExtractionRequest(
            free_text="headache and fever"
        )
        response = servicer.ExtractContext(request, mock_context)
        # The fallback mock extractor should find headache and fever
        assert len(response.features) >= 1

    def test_extract_empty_text_returns_empty(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Empty free text should return no features."""
        request = diagnostic_pb2.ContextExtractionRequest(free_text="")
        response = servicer.ExtractContext(request, mock_context)
        assert len(response.features) == 0


# ---------------------------------------------------------------------------
# AssessSymptoms tests
# ---------------------------------------------------------------------------

class TestAssessSymptoms:
    """Test the AssessSymptoms RPC method."""

    def test_assess_returns_ranked_diseases(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """AssessSymptoms should return all diseases ranked."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0010200", name="Cough", is_present=True
                ),
                diagnostic_pb2.ExtractedFeature(
                    cui="C0015967", name="Fever", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        assert response is not None
        assert len(response.ranked_diseases) == 14  # All diseases

    def test_assess_respiratory_symptoms_rank_pneumonia(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Cough + Fever + Dyspnea should rank Pneumonia in top 3."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0010200", name="Cough", is_present=True
                ),
                diagnostic_pb2.ExtractedFeature(
                    cui="C0015967", name="Fever", is_present=True
                ),
                diagnostic_pb2.ExtractedFeature(
                    cui="C0013404", name="Dyspnea", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        top_3_ids = [d.disease_id for d in response.ranked_diseases[:3]]
        assert "D001" in top_3_ids, (
            f"Pneumonia not in top 3: {top_3_ids}"
        )

    def test_assess_uti_symptoms_rank_uti_first(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Dysuria + Pollakiuria should rank UTI #1."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0085619", name="Dysuria", is_present=True
                ),
                diagnostic_pb2.ExtractedFeature(
                    cui="C0032617", name="Pollakiuria", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        assert response.ranked_diseases[0].disease_id == "D010"
        assert response.ranked_diseases[0].disease_name == "Urinary Tract Infection"

    def test_assess_returns_valid_probabilities(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """All posterior probabilities should be between 0 and 1."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0010200", name="Cough", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        for disease in response.ranked_diseases:
            assert 0.0 <= disease.posterior_probability <= 1.0, (
                f"Invalid prob for {disease.disease_id}: {disease.posterior_probability}"
            )

    def test_assess_returns_tfidf_scores(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Each ranked disease should have a TF-IDF score field."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0010200", name="Cough", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        # At least one disease linked to Cough should have tfidf > 0
        has_tfidf = any(d.tf_idf_score > 0 for d in response.ranked_diseases)
        assert has_tfidf, "No disease has a non-zero TF-IDF score"

    def test_assess_returns_lr_values(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Each ranked disease should have LR+/LR- summary values."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0085619", name="Dysuria", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        # UTI should have a high LR+ since Dysuria is highly specific
        uti = next(d for d in response.ranked_diseases if d.disease_id == "D010")
        assert uti.likelihood_ratio_positive > 1.0

    def test_assess_empty_symptoms_returns_priors(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """No symptoms should return diseases ranked by base prevalence."""
        request = diagnostic_pb2.SymptomAssessmentRequest(symptoms=[])
        response = servicer.AssessSymptoms(request, mock_context)
        assert len(response.ranked_diseases) == 14

    def test_assess_unknown_cui_handled_gracefully(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Unknown CUIs should not crash — they're silently skipped."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C9999999", name="Unknown", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        assert len(response.ranked_diseases) == 14

    def test_assess_ranked_descending(
        self, servicer: DiagnosticServicer, mock_context: MagicMock
    ) -> None:
        """Results should be sorted by posterior probability descending."""
        request = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=[
                diagnostic_pb2.ExtractedFeature(
                    cui="C0010200", name="Cough", is_present=True
                ),
                diagnostic_pb2.ExtractedFeature(
                    cui="C0015967", name="Fever", is_present=True
                ),
            ]
        )
        response = servicer.AssessSymptoms(request, mock_context)
        probs = [d.posterior_probability for d in response.ranked_diseases]
        for i in range(len(probs) - 1):
            assert probs[i] >= probs[i + 1], (
                f"Not sorted at index {i}: {probs[i]} < {probs[i+1]}"
            )
