"""Tests for Pydantic models: Disease, Symptom, and DiseaseSymptomLink."""

import pytest
import numpy as np

from src.models.disease import Disease
from src.models.symptom import Symptom
from src.models.disease_symptom_link import DiseaseSymptomLink


# ---------------------------------------------------------------------------
# Disease model tests
# ---------------------------------------------------------------------------

class TestDiseaseModel:
    """Validate Disease model creation and ICD-10 validation."""

    def test_valid_disease_creation(self) -> None:
        disease = Disease(
            disease_id="D001",
            name="Pneumonia",
            icd10_code="J18.9",
            prevalence=0.02,
            category="respiratory",
        )
        assert disease.disease_id == "D001"
        assert disease.prevalence == 0.02
        assert disease.category == "respiratory"

    def test_valid_icd10_without_decimal(self) -> None:
        disease = Disease(
            disease_id="D007",
            name="Gastroenteritis",
            icd10_code="A09",
            prevalence=0.06,
        )
        assert disease.icd10_code == "A09"

    def test_invalid_icd10_code_rejected(self) -> None:
        with pytest.raises(ValueError, match="Invalid ICD-10 code"):
            Disease(
                disease_id="D999",
                name="Bad",
                icd10_code="123",
                prevalence=0.01,
            )

    def test_prevalence_out_of_range_rejected(self) -> None:
        with pytest.raises(ValueError):
            Disease(
                disease_id="D999",
                name="Bad",
                icd10_code="J18.9",
                prevalence=1.5,
            )

    def test_prevalence_negative_rejected(self) -> None:
        with pytest.raises(ValueError):
            Disease(
                disease_id="D999",
                name="Bad",
                icd10_code="J18.9",
                prevalence=-0.01,
            )

    def test_empty_disease_id_rejected(self) -> None:
        with pytest.raises(ValueError):
            Disease(
                disease_id="",
                name="Bad",
                icd10_code="J18.9",
                prevalence=0.01,
            )


# ---------------------------------------------------------------------------
# Symptom model tests
# ---------------------------------------------------------------------------

class TestSymptomModel:
    """Validate Symptom model creation and CUI format enforcement."""

    def test_valid_symptom_creation(self) -> None:
        symptom = Symptom(
            symptom_id="S001",
            cui="C0010200",
            name="Cough",
            body_region="thorax",
            is_constitutional=False,
        )
        assert symptom.cui == "C0010200"
        assert symptom.body_region == "thorax"
        assert symptom.is_constitutional is False

    def test_constitutional_symptom(self) -> None:
        symptom = Symptom(
            symptom_id="S002",
            cui="C0015967",
            name="Fever",
            is_constitutional=True,
        )
        assert symptom.is_constitutional is True
        assert symptom.body_region is None

    def test_invalid_cui_format_rejected(self) -> None:
        with pytest.raises(ValueError, match="Invalid CUI format"):
            Symptom(
                symptom_id="S999",
                cui="INVALID",
                name="Bad Symptom",
            )

    def test_cui_too_short_rejected(self) -> None:
        with pytest.raises(ValueError, match="Invalid CUI format"):
            Symptom(
                symptom_id="S999",
                cui="C001",
                name="Short CUI",
            )

    def test_cui_wrong_prefix_rejected(self) -> None:
        with pytest.raises(ValueError, match="Invalid CUI format"):
            Symptom(
                symptom_id="S999",
                cui="D0010200",
                name="Wrong Prefix",
            )


# ---------------------------------------------------------------------------
# DiseaseSymptomLink model tests
# ---------------------------------------------------------------------------

class TestDiseaseSymptomLink:
    """Validate link model, auto-computed LR+/LR-, and edge clamping."""

    def test_valid_link_creation(self) -> None:
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S001",
            sensitivity=0.80,
            specificity=0.40,
            link_probability=0.75,
        )
        assert link.sensitivity == 0.80
        assert link.specificity == 0.40

    def test_lr_positive_calculated_correctly(self) -> None:
        """LR+ = sensitivity / (1 - specificity)."""
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S001",
            sensitivity=0.80,
            specificity=0.40,
            link_probability=0.75,
        )
        expected_lr_pos = 0.80 / (1.0 - 0.40)
        assert np.isclose(link.lr_positive, expected_lr_pos)

    def test_lr_negative_calculated_correctly(self) -> None:
        """LR- = (1 - sensitivity) / specificity."""
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S001",
            sensitivity=0.80,
            specificity=0.40,
            link_probability=0.75,
        )
        expected_lr_neg = (1.0 - 0.80) / 0.40
        assert np.isclose(link.lr_negative, expected_lr_neg)

    def test_high_specificity_gives_high_lr_positive(self) -> None:
        """A highly specific symptom should have a strong LR+."""
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S012",
            sensitivity=0.10,
            specificity=0.97,
            link_probability=0.08,
        )
        # LR+ = 0.10 / 0.03 ≈ 3.33 — moderate indicator
        assert link.lr_positive > 3.0

    def test_edge_specificity_1_clamped(self) -> None:
        """Specificity of 1.0 would cause division by zero in LR+.
        The model should clamp it to 1.0 - epsilon."""
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S001",
            sensitivity=0.80,
            specificity=1.0,
            link_probability=0.75,
        )
        # Should not raise, and LR+ should be a very large number
        assert link.lr_positive > 1000
        assert np.isfinite(link.lr_positive)

    def test_edge_specificity_0_clamped(self) -> None:
        """Specificity of 0.0 would cause division by zero in LR-.
        The model should clamp it to epsilon."""
        link = DiseaseSymptomLink(
            disease_id="D001",
            symptom_id="S001",
            sensitivity=0.80,
            specificity=0.0,
            link_probability=0.75,
        )
        assert np.isfinite(link.lr_negative)

    def test_sensitivity_out_of_range_rejected(self) -> None:
        with pytest.raises(ValueError):
            DiseaseSymptomLink(
                disease_id="D001",
                symptom_id="S001",
                sensitivity=1.5,
                specificity=0.40,
                link_probability=0.75,
            )

    def test_link_probability_out_of_range_rejected(self) -> None:
        with pytest.raises(ValueError):
            DiseaseSymptomLink(
                disease_id="D001",
                symptom_id="S001",
                sensitivity=0.80,
                specificity=0.40,
                link_probability=1.5,
            )
