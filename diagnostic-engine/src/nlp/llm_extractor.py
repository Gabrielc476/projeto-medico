"""LLM Clinical Extractor.

Uses Google GenAI (Gemma 4 31B) to extract structured clinical data
from free-text notes, including symptoms (CUIs), negation status,
and clinical context.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field

# Load environment variables from .env
load_dotenv()


class SymptomExtraction(BaseModel):
    """Schema for a single symptom extraction."""
    cui: str = Field(description="UMLS CUI (e.g., C0015967)")
    name: str = Field(description="Clinical name of the symptom")
    is_present: bool = Field(description="True if the patient has it, False if denied/negated")
    confidence: float = Field(description="Confidence score between 0 and 1")


class ClinicalContext(BaseModel):
    """Schema for extracted clinical context."""
    duration: Optional[str] = Field(None, description="Duration of symptoms (e.g., '2 days')")
    severity: Optional[str] = Field(None, description="Severity level (mild, moderate, severe)")
    risk_factors: List[str] = Field(default_factory=list, description="Extracted risk factors or history")


class ExtractionResponse(BaseModel):
    """Full response schema for the LLM."""
    symptoms: List[SymptomExtraction]
    context: ClinicalContext


class LLMExtractor:
    """Extractor that uses Gemma 4 31B for semantic medical NLP."""

    def __init__(self, model_id: str = "gemma-4-31b-it") -> None:
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model_id = model_id
        self._client: Optional[genai.Client] = None
        
        if self.api_key:
            self._client = genai.Client(api_key=self.api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def extract_structured_data(self, text: str, known_symptoms: List[Dict[str, Any]]) -> ExtractionResponse:
        """Extract clinical data using LLM with structured output.
        
        Args:
            text: The free-text clinical note.
            known_symptoms: List of symptoms from the Knowledge Base (cui, name) 
                           to help the LLM match correctly.
        """
        if not self._client:
            raise RuntimeError("Gemini API key not found. Set GEMINI_API_KEY environment variable.")

        symptoms_hint = "\n".join([f"- {s['cui']}: {s['name']}" for s in known_symptoms])

        prompt = f"""
        You are an elite Clinical NLP Agent. Your task is to extract medical symptoms and context 
        from the following patient note.

        PATIENT NOTE:
        "{text}"

        KNOWN SYMPTOMS (Use these CUIs if they match):
        {symptoms_hint}

        RULES:
        1. Identify all symptoms mentioned.
        2. Set 'is_present' to false if the symptom is explicitly negated (e.g., "no fever", "denies cough", "sem febre").
        3. Map symptoms to the provided CUIs when possible. If a symptom is not in the list, use its closest UMLS CUI if known, or "C0000000" if unknown.
        4. Extract duration, severity, and risk factors into the context object.
        5. Return ONLY a valid JSON object matching the requested schema.
        """

        try:
            # Using the new google-genai SDK pattern
            response = self._client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": ExtractionResponse.model_json_schema()
                }
            )
            
            # The SDK handles JSON parsing if response_schema is provided, 
            # but we parse response.text to be safe if it returns a string.
            import json
            data = json.loads(response.text)
            return ExtractionResponse(**data)
            
        except Exception as e:
            print(f"Error calling LLM: {e}")
            # Return empty response on failure to allow fallback
            return ExtractionResponse(symptoms=[], context=ClinicalContext())
