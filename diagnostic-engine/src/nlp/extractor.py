from typing import List, Dict

class ClinicalExtractor:
    """
    Wrapper for scispaCy to extract medical entities (Symptoms, Diseases) 
    from free-text clinical notes.
    """
    def __init__(self, model_name: str = "en_core_sci_sm"):
        self.model_name = model_name
        self._nlp = None
        
    def _load_model(self):
        if self._nlp is None:
            try:
                import spacy
                # Note: For production, we need scispacy and the linked UMLS models
                self._nlp = spacy.load(self.model_name)
            except Exception as e:
                print(f"Warning: Could not load spacy model '{self.model_name}'. {e}")
                
    def extract_features(self, text: str) -> List[Dict]:
        """
        Extracts clinical entities from text.
        For now, this is a simplified stub returning dummy data if model fails,
        but logic uses spacy if available.
        """
        self._load_model()
        
        features = []
        if self._nlp:
            doc = self._nlp(text)
            for ent in doc.ents:
                features.append({
                    "cui": "C0000000", # Dummy CUI for now
                    "name": ent.text,
                    "is_present": True # Assuming present. Needs Negex for real use.
                })
        else:
            # Fallback mock for testing if spacy isn't installed
            words = text.lower().replace(".", "").replace(",", "").split()
            if "headache" in words:
                features.append({"cui": "C0018681", "name": "headache", "is_present": True})
            if "fever" in words:
                features.append({"cui": "C0015967", "name": "fever", "is_present": True})
                
        return features
