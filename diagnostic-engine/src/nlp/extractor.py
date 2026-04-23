"""Clinical NLP Extractor.

This module provides a unified interface for extracting medical concepts
from free-text, utilizing both LLM (Gemma 4 31B) for semantic understanding
and scispaCy as a fallback.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from src.nlp.llm_extractor import LLMExtractor

logger = logging.getLogger(__name__)


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
        logger.info("LLM extraction failed or returned no features. Using fallback...")
        return self._extract_fallback(text, known_symptoms)

    def _extract_fallback(self, text: str, known_symptoms: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Lightweight fallback extraction using Keyword matching and scispaCy."""
        logger.info("Entering extraction fallback (NLP models unavailable or failed)")
        self._load_spacy()
        features: list[dict] = []
        
        # 1. Improved Keyword matching with basic Portuguese translation support
        text_lower = text.lower()
        translations = {
            "dor de garganta": "Sore Throat",
            "febre": "Fever",
            "tosse": "Cough",
            "rouquidão": "Hoarseness",
            "dificuldade para engolir": "Dysphagia",
            "dor de cabeça": "Headache",
            "falta de ar": "Dyspnea"
        }
        
        # Add translated terms to text for matching
        augmented_text = text_lower
        for pt, en in translations.items():
            if pt in text_lower:
                augmented_text += f" {en.lower()}"

        if known_symptoms:
            for symptom in known_symptoms:
                if symptom["name"].lower() in augmented_text:
                    logger.debug(f"Keyword Match: '{symptom['name']}' -> {symptom['cui']}")
                    features.append({
                        "cui": symptom["cui"],
                        "name": symptom["name"],
                        "is_present": True,
                        "confidence": 0.8
                    })

        # 2. scispaCy NER (generic mapping)
        if self._nlp:
            doc = self._nlp(text)
            for ent in doc.ents:
                # Only add if not already found via keywords
                if not any(f["name"] == ent.text for f in features):
                    logger.debug(f"scispaCy Entity: '{ent.text}' (unmapped)")
                    features.append({
                        "cui": "C0000000",
                        "name": ent.text,
                        "is_present": True,
                        "confidence": 0.5
                    })
        
        logger.info(f"Fallback extraction complete: {len(features)} features found.")
        return features
