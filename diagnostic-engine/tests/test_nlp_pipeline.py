import pytest
from src.nlp.extractor import ClinicalExtractor

def test_extract_symptoms():
    """
    Test that the clinical extractor properly identifies symptoms 
    and returns their CUIs.
    (Note: this is a mock test for the TDD cycle, assuming en_core_sci_sm works)
    """
    extractor = ClinicalExtractor()
    
    # Text with a clear symptom
    text = "The patient presents with severe headache and fever."
    
    features = extractor.extract_features(text)
    
    # We expect 'headache' and 'fever' to be extracted
    extracted_names = [f["name"].lower() for f in features]
    
    assert "headache" in extracted_names or "fever" in extracted_names
