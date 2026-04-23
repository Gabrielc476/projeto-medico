"""Disease entity model with ICD-10 classification and base prevalence."""

from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class Disease(BaseModel):
    """Represents a diagnosable disease in the knowledge base.

    Attributes:
        disease_id: Unique internal identifier (e.g. "D001").
        name: Human-readable disease name.
        icd10_code: ICD-10 classification code for interoperability.
        prevalence: Base prevalence in the general population (0-1).
            Used as the Bayesian prior when no patient context is available.
        category: Optional clinical category for grouping (e.g. "respiratory").
    """

    disease_id: str = Field(
        ...,
        min_length=1,
        description="Unique disease identifier, e.g. 'D001'",
    )
    name: Optional[str] = Field(
        default=None,
        description="Human-readable disease name",
    )
    icd10_code: Optional[str] = Field(
        default=None,
        description="ICD-10 code, e.g. 'J18.9'",
    )
    prevalence: float = Field(
        default=0.001,
        ge=0.0,
        le=1.0,
        description="Base prevalence in general population (0-1)",
    )
    category: Optional[str] = Field(
        default=None,
        description="Clinical category for grouping",
    )

    @field_validator("icd10_code")
    @classmethod
    def validate_icd10_format(cls, v: str | None) -> str | None:
        """Validate ICD-10 code follows the standard pattern (e.g. J18.9, A09)."""
        if v is None:
            return v
        pattern = r"^[A-Z]\d{2}(\.\d{1,2})?$"
        if not re.match(pattern, v):
            msg = f"Invalid ICD-10 code format: '{v}'. Expected pattern like 'J18.9' or 'A09'."
            raise ValueError(msg)
        return v
