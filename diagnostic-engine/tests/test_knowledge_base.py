"""Tests for MedicalKnowledgeBase: loading, indexing, and data access."""

import pytest
import numpy as np

from src.data.knowledge_base import MedicalKnowledgeBase


@pytest.fixture
def kb() -> MedicalKnowledgeBase:
    """Load the default knowledge base from data/ seed files."""
    return MedicalKnowledgeBase()


# ---------------------------------------------------------------------------
# Loading & counts
# ---------------------------------------------------------------------------

class TestKnowledgeBaseLoading:
    """Verify that all seed data loads and validates correctly."""

    def test_diseases_loaded(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.disease_count == 12

    def test_symptoms_loaded(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.symptom_count == 30

    def test_links_loaded(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.link_count == 55


# ---------------------------------------------------------------------------
# Disease lookups
# ---------------------------------------------------------------------------

class TestDiseaseLookups:
    """Verify disease retrieval by ID."""

    def test_get_existing_disease(self, kb: MedicalKnowledgeBase) -> None:
        disease = kb.get_disease("D001")
        assert disease is not None
        assert disease.name == "Community-Acquired Pneumonia"
        assert disease.icd10_code == "J18.9"
        assert np.isclose(disease.prevalence, 0.02)

    def test_get_nonexistent_disease_returns_none(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.get_disease("D999") is None

    def test_get_all_diseases(self, kb: MedicalKnowledgeBase) -> None:
        diseases = kb.get_all_diseases()
        assert len(diseases) == 12
        ids = {d.disease_id for d in diseases}
        assert "D001" in ids
        assert "D012" in ids


# ---------------------------------------------------------------------------
# Symptom lookups
# ---------------------------------------------------------------------------

class TestSymptomLookups:
    """Verify symptom retrieval by ID and CUI."""

    def test_get_symptom_by_id(self, kb: MedicalKnowledgeBase) -> None:
        symptom = kb.get_symptom("S001")
        assert symptom is not None
        assert symptom.name == "Cough"
        assert symptom.cui == "C0010200"

    def test_get_symptom_by_cui(self, kb: MedicalKnowledgeBase) -> None:
        symptom = kb.get_symptom_by_cui("C0015967")
        assert symptom is not None
        assert symptom.name == "Fever"

    def test_get_nonexistent_symptom_returns_none(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.get_symptom("S999") is None
        assert kb.get_symptom_by_cui("C9999999") is None


# ---------------------------------------------------------------------------
# Link lookups & LR calculations
# ---------------------------------------------------------------------------

class TestLinkLookups:
    """Verify disease-symptom link retrieval and auto-computed LR values."""

    def test_get_links_for_disease(self, kb: MedicalKnowledgeBase) -> None:
        links = kb.get_links_for_disease("D001")
        # Pneumonia has 5 linked symptoms
        assert len(links) == 5
        symptom_ids = {link.symptom_id for link in links}
        assert "S001" in symptom_ids  # Cough
        assert "S002" in symptom_ids  # Fever

    def test_get_specific_link(self, kb: MedicalKnowledgeBase) -> None:
        link = kb.get_link("D001", "S001")
        assert link is not None
        assert np.isclose(link.sensitivity, 0.80)
        assert np.isclose(link.specificity, 0.40)

    def test_lr_positive_computed_from_link(self, kb: MedicalKnowledgeBase) -> None:
        link = kb.get_link("D001", "S001")
        assert link is not None
        # LR+ = 0.80 / (1 - 0.40) = 1.333...
        expected = 0.80 / 0.60
        assert np.isclose(link.lr_positive, expected)

    def test_lr_negative_computed_from_link(self, kb: MedicalKnowledgeBase) -> None:
        link = kb.get_link("D001", "S001")
        assert link is not None
        # LR- = (1 - 0.80) / 0.40 = 0.50
        expected = 0.20 / 0.40
        assert np.isclose(link.lr_negative, expected)

    def test_nonexistent_link_returns_none(self, kb: MedicalKnowledgeBase) -> None:
        # Cough is not linked to Depression
        assert kb.get_link("D012", "S001") is None


# ---------------------------------------------------------------------------
# Disease profiles for TF-IDF
# ---------------------------------------------------------------------------

class TestDiseaseProfiles:
    """Verify disease profile generation for the TF-IDF vectorizer."""

    def test_profiles_generated(self, kb: MedicalKnowledgeBase) -> None:
        profiles = kb.get_disease_profiles()
        assert len(profiles) == 12
        # Each disease should have a non-empty CUI list
        for disease_id, cuis in profiles.items():
            assert len(cuis) > 0, f"Disease {disease_id} has no CUI profile"

    def test_pneumonia_profile_contains_cough(self, kb: MedicalKnowledgeBase) -> None:
        profiles = kb.get_disease_profiles()
        pneumonia_cuis = profiles["D001"]
        # C0010200 = Cough
        assert "C0010200" in pneumonia_cuis


# ---------------------------------------------------------------------------
# CUI resolution
# ---------------------------------------------------------------------------

class TestCUIResolution:
    """Verify CUI-to-symptom-ID resolution for the NLP pipeline."""

    def test_resolve_known_cuis(self, kb: MedicalKnowledgeBase) -> None:
        cuis = ["C0010200", "C0015967"]  # Cough, Fever
        ids = kb.resolve_cuis_to_symptom_ids(cuis)
        assert ids == ["S001", "S002"]

    def test_resolve_unknown_cuis_skipped(self, kb: MedicalKnowledgeBase) -> None:
        cuis = ["C0010200", "C9999999", "C0015967"]
        ids = kb.resolve_cuis_to_symptom_ids(cuis)
        assert ids == ["S001", "S002"]

    def test_resolve_empty_list(self, kb: MedicalKnowledgeBase) -> None:
        assert kb.resolve_cuis_to_symptom_ids([]) == []
