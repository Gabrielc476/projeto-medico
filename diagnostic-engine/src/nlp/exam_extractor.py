"""Exam PDF Extractor.

Extracts text from medical exam PDFs using pdfplumber and uses 
the LLM to identify abnormal findings and map them to CUIs.
"""

from __future__ import annotations

import io
import logging
from typing import Any, Dict, List

import pdfplumber
from google import genai
from pydantic import BaseModel, Field

from src.nlp.llm_extractor import ExtractionResponse, ClinicalContext, SymptomExtraction

logger = logging.getLogger(__name__)


class ExamLLMExtractor:
    """Extractor that uses pdfplumber and LLM for lab exams."""

    def __init__(self, model_id: str = "gemma-4-31b-it") -> None:
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model_id = model_id
        self._client = None
        
        if self.api_key:
            self._client = genai.Client(api_key=self.api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def _extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract all text and tabular data from a PDF."""
        extracted_text = []
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    # Extract raw text
                    text = page.extract_text()
                    if text:
                        extracted_text.append(text)
                    
                    # Extract tables to preserve structural data
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            # Filter empty cells and join
                            row_data = [str(cell).strip() for cell in row if cell]
                            if row_data:
                                extracted_text.append(" | ".join(row_data))
                                
            return "\n".join(extracted_text)
        except Exception as e:
            logger.error(f"Failed to read PDF: {e}")
            return ""

    def extract_from_exam(self, pdf_bytes: bytes, known_symptoms: List[Dict[str, Any]]) -> ExtractionResponse:
        """Extract abnormal exams and map them to CUIs.
        
        Args:
            pdf_bytes: The PDF file content as bytes.
            known_symptoms: List of symptoms/findings from the KB.
        """
        if not self._client:
            raise RuntimeError("Gemini API key not found. Set GEMINI_API_KEY environment variable.")

        # 1. Parse PDF
        exam_text = self._extract_text_from_pdf(pdf_bytes)
        if not exam_text.strip():
            logger.warning("No text could be extracted from the exam PDF.")
            return ExtractionResponse(symptoms=[], context=ClinicalContext())

        # 2. Build prompt
        symptoms_hint = "\n".join([f"- {s['cui']}: {s['name']}" for s in known_symptoms])

        prompt = f"""
        You are an elite Clinical NLP Agent analyzing a laboratory exam report.
        
        EXAM CONTENT:
        "{exam_text}"

        KNOWN FINDINGS / CUIs:
        {symptoms_hint}

        RULES:
        1. Identify ONLY the exams/tests that have ABNORMAL results (e.g., above or below reference range).
        2. Map these abnormal results to the closest clinical finding or symptom using the provided CUIs (e.g., Low Hemoglobin -> Anemia CUI).
        3. Set 'is_present' to true for these abnormalities. Ignore normal results.
        4. If the exact abnormality is not in the list, map it to the most clinically appropriate generic term or use "C0000000".
        5. Return a valid JSON matching the exact schema requested.
        """

        try:
            logger.info(f"Sending exam to LLM ({self.model_id}). Length: {len(exam_text)} chars")
            response = self._client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": ExtractionResponse.model_json_schema()
                }
            )
            
            import json
            data = json.loads(response.text)
            extraction = ExtractionResponse(**data)
            logger.info(f"Exam extraction complete: {len(extraction.symptoms)} abnormalities found.")
            return extraction
            
        except Exception as e:
            logger.error(f"FATAL: Exam LLM Extraction failed: {e}", exc_info=True)
            return ExtractionResponse(symptoms=[], context=ClinicalContext())
