"""Clinical NLP Extractor.

This module provides a unified interface for extracting medical concepts
from free-text, utilizing both LLM (Gemma 4 31B) for semantic understanding
and scispaCy as a fallback.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from src.nlp.llm_extractor import LLMExtractor


class ClinicalExtractor:
    """Orchestrator for medical entity extraction.
    
    Tries to use LLM for high-fidelity extraction (CUI mapping + negation).
    Falls back to scispaCy/Keywords if LLM is unavailable.
    """

    def __init__(self, spacy_model: str = "en_core_sci_sm") -> None:
        self.spacy_model = spacy_model
        self._nlp = None
        self._llm = LLMExtractor()

    def _load_spacy(self) -> None:
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load(self.spacy_model)
            except Exception as e:
                print(f"Warning: Could not load spacy model '{self.spacy_model}'. {e}")

    def extract_features(
        self, 
        text: str, 
        known_symptoms: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Extract clinical features from text.
        
        Args:
            text: Raw clinical note.
            known_symptoms: List of symptom dicts from KB (cui, name).
            
        Returns:
            List of dicts with keys: cui, name, is_present, confidence.
        """
        # 1. Try LLM first if available
        if self._llm.is_available:
            print(f"DEBUG: Using LLM ({self._llm.model_id}) for extraction...")
            response = self._llm.extract_structured_data(text, known_symptoms or [])
            if response.symptoms:
                return [s.model_dump() for s in response.symptoms]

        # 2. Fallback to scispaCy/Keywords
        print("DEBUG: Using scispaCy/Keyword fallback...")
        return self._extract_fallback(text)

    def _extract_fallback(self, text: str) -> List[Dict[str, Any]]:
        """Lightweight fallback extraction."""
        self._load_spacy()
        features: list[dict] = []
        
        if self._nlp:
            doc = self._nlp(text)
            for ent in doc.ents:
                features.append({
                    "cui": "C0000000",
                    "name": ent.text,
                    "is_present": True,
                    "confidence": 0.5
                })
        else:
            # Simple keyword matching
            words = text.lower().replace(".", "").replace(",", "").split()
            mapping = {
                "headache": "C0018681",
                "fever": "C0015967",
                "cough": "C0010200",
                "sore throat": "C0037763",
                "hoarseness": "C0019825"
            }
            for word, cui in mapping.items():
                if word in text.lower():
                    features.append({
                        "cui": cui,
                        "name": word,
                        "is_present": True,
                        "confidence": 0.7
                    })
        
        return features
