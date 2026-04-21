"""Disease-Symptom link model with auto-calculated Likelihood Ratios.

This is the core evidence table that powers the Bayesian ranking engine.
Each link represents the epidemiological relationship between a disease
and a symptom, with sensitivity, specificity, and Noisy-OR parameters.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, computed_field, field_validator, model_validator


class DiseaseSymptomLink(BaseModel):
    """Epidemiological link between a Disease and a Symptom.

    The key clinical parameters are:
    - sensitivity: P(symptom present | disease present) — True Positive Rate
    - specificity: P(symptom absent | disease absent) — True Negative Rate
    - link_probability: Noisy-OR parameter p_i — causal strength

    From sensitivity and specificity, we auto-derive:
    - lr_positive: sensitivity / (1 - specificity) — how much MORE likely
      the symptom is in a diseased vs. healthy patient.
    - lr_negative: (1 - sensitivity) / specificity — how much LESS likely
      the symptom is when the disease is absent.

    Attributes:
        disease_id: References Disease.disease_id.
        symptom_id: References Symptom.symptom_id.
        sensitivity: True Positive Rate (0-1).
        specificity: True Negative Rate (0-1).
        link_probability: Noisy-OR causal strength (0-1).
        weight: Optional manual weight for domain-expert overrides.
    """

    disease_id: str = Field(..., min_length=1)
    symptom_id: str = Field(..., min_length=1)

    sensitivity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="P(symptom+ | disease+) — True Positive Rate",
    )
    specificity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="P(symptom- | disease-) — True Negative Rate",
    )
    link_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Noisy-OR causal strength p_i",
    )
    weight: float = Field(
        default=1.0,
        ge=0.0,
        description="Optional manual weight for expert overrides",
    )

    @model_validator(mode="after")
    def validate_clinical_coherence(self) -> "DiseaseSymptomLink":
        """Ensure sensitivity and specificity are not both extreme edges.

        A specificity of exactly 1.0 would cause division by zero in LR+.
        A specificity of exactly 0.0 would cause division by zero in LR-.
        We clamp to a safe epsilon to maintain numerical stability.
        """
        eps = 1e-10
        if self.specificity >= 1.0:
            object.__setattr__(self, "specificity", 1.0 - eps)
        if self.specificity <= 0.0:
            object.__setattr__(self, "specificity", eps)
        if self.sensitivity >= 1.0:
            object.__setattr__(self, "sensitivity", 1.0 - eps)
        if self.sensitivity <= 0.0:
            object.__setattr__(self, "sensitivity", eps)
        return self

    @computed_field  # type: ignore[prop-decorator]
    @property
    def lr_positive(self) -> float:
        """Positive Likelihood Ratio: sensitivity / (1 - specificity).

        Higher values mean the symptom is a stronger indicator FOR the disease.
        LR+ > 10 is considered a strong diagnostic indicator.
        """
        return self.sensitivity / (1.0 - self.specificity)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def lr_negative(self) -> float:
        """Negative Likelihood Ratio: (1 - sensitivity) / specificity.

        Lower values mean absence of the symptom is a stronger indicator
        AGAINST the disease. LR- < 0.1 is considered strong exclusion.
        """
        return (1.0 - self.sensitivity) / self.specificity
