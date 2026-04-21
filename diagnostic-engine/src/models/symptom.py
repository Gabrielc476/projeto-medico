"""Symptom entity model with UMLS CUI validation."""

from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class Symptom(BaseModel):
    """Represents a clinical symptom mapped to a UMLS Concept Unique Identifier.

    The CUI is the primary key for matching NLP-extracted entities to
    the knowledge base. scispaCy outputs CUIs in the format C[0-9]{7}.

    Attributes:
        symptom_id: Internal identifier (e.g. "S001").
        cui: UMLS Concept Unique Identifier (e.g. "C0010200" for cough).
        name: Human-readable symptom name.
        body_region: Anatomical region for body-map UI grouping.
        is_constitutional: Whether the symptom is systemic (fever, fatigue)
            rather than localized, affecting TF-IDF weighting.
    """

    symptom_id: str = Field(
        ...,
        min_length=1,
        description="Unique symptom identifier, e.g. 'S001'",
    )
    cui: str = Field(
        ...,
        description="UMLS Concept Unique Identifier, e.g. 'C0010200'",
    )
    name: str = Field(
        ...,
        min_length=1,
        description="Human-readable symptom name",
    )
    body_region: Optional[str] = Field(
        default=None,
        description="Anatomical region for body-map UI (e.g. 'thorax', 'head')",
    )
    is_constitutional: bool = Field(
        default=False,
        description="True for systemic symptoms (fever, fatigue, weight loss)",
    )

    @field_validator("cui")
    @classmethod
    def validate_cui_format(cls, v: str) -> str:
        """Validate CUI follows UMLS format: C followed by 7 digits."""
        pattern = r"^C\d{7}$"
        if not re.match(pattern, v):
            msg = f"Invalid CUI format: '{v}'. Expected 'C' followed by 7 digits (e.g. 'C0010200')."
            raise ValueError(msg)
        return v
