"""Tests for the NLP extractor (basic scispaCy wrapper)."""

from __future__ import annotations

import pytest

from src.nlp.extractor import ClinicalExtractor


@pytest.fixture
def extractor() -> ClinicalExtractor:
    return ClinicalExtractor()


def test_extract_symptoms(extractor: ClinicalExtractor) -> None:
    """Keyword fallback should find headache and fever."""
    features = extractor.extract_features("headache and fever")
    cuis = {f["cui"] for f in features}
    assert "C0018681" in cuis  # Headache
    assert "C0015967" in cuis  # Fever


def test_empty_text(extractor: ClinicalExtractor) -> None:
    assert extractor.extract_features("") == []
