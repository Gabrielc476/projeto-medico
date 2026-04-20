from typing import List, Dict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import scipy.sparse as sp

class SymptomVectorizer:
    def __init__(self):
        # We treat each CUI code as a "word" in our corpus
        # We disable lowercase and tokenization to treat them as raw tokens
        self.vectorizer = TfidfVectorizer(
            lowercase=False, 
            token_pattern=r"\b\w+\b"
        )
        self.disease_ids: List[str] = []
        self.tfidf_matrix: sp.csr_matrix = None

    def fit_diseases(self, disease_profiles: Dict[str, List[str]]):
        """
        Fit the TF-IDF model on a dictionary of disease_id -> list of CUIs.
        """
        self.disease_ids = list(disease_profiles.keys())
        
        # Convert symptom lists to a space-separated string for the vectorizer
        corpus = [" ".join(symptoms) for symptoms in disease_profiles.values()]
        
        # Fit and transform to get the sparse CSR matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def score_diseases(self, patient_symptoms: List[str]) -> Dict[str, float]:
        """
        Calculate cosine similarity between patient symptoms and all known diseases.
        Returns a dictionary of disease_id -> similarity_score.
        """
        if self.tfidf_matrix is None or not self.disease_ids:
            return {}

        query_str = " ".join(patient_symptoms)
        query_vector = self.vectorizer.transform([query_str])
        
        # Compute cosine similarity (dot product of L2 normalized vectors)
        # using sparse matrices for efficiency
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        scores = {}
        for idx, disease_id in enumerate(self.disease_ids):
            scores[disease_id] = float(similarities[idx])
            
        return scores
