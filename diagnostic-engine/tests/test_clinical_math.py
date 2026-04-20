import pytest
import numpy as np
from scipy.sparse import csr_matrix
from src.math.vector_space import SymptomVectorizer
from src.math.bayesian_network import DiseaseDiagnosticNetwork

def test_tfidf_cosine_similarity():
    """
    Test that the TF-IDF vectorizer correctly scores diseases 
    based on symptom overlap using cosine similarity.
    """
    vectorizer = SymptomVectorizer()
    
    # Mocking some disease profiles (List of symptom CUIs)
    vectorizer.fit_diseases({
        "D1": ["C001", "C002"],
        "D2": ["C001", "C003", "C004"],
        "D3": ["C005"]
    })
    
    # Patient has symptoms C001 and C003
    patient_symptoms = ["C001", "C003"]
    scores = vectorizer.score_diseases(patient_symptoms)
    
    # D2 should have a higher score than D1, because D2 has both symptoms
    # D3 should have a score of 0
    assert scores["D2"] > scores["D1"]
    assert scores["D3"] == 0.0

def test_noisy_or_probability():
    """
    Test the Noisy-OR logic for combining independent causal links.
    """
    network = DiseaseDiagnosticNetwork()
    
    # Two diseases D1, D2 causing symptom S1 with link probabilities
    # p(S1 | D1) = 0.8  --> link probability
    # p(S1 | D2) = 0.6  --> link probability
    
    prob_none = network.calculate_noisy_or_absence([0.8, 0.6])
    # prob_none = (1 - 0.8) * (1 - 0.6) = 0.2 * 0.4 = 0.08
    assert np.isclose(prob_none, 0.08)
    
    prob_presence = network.calculate_noisy_or_presence([0.8, 0.6])
    # prob_presence = 1 - 0.08 = 0.92
    assert np.isclose(prob_presence, 0.92)

def test_log_odds_update():
    """
    Test sequential Bayesian updating using Log-Odds for numerical stability.
    """
    network = DiseaseDiagnosticNetwork()
    
    prior_prob = 0.1 # Base prevalence
    
    # Symptom 1 (LR+ = 10.0), Symptom 2 (LR+ = 5.0)
    # log(O_post) = log(O_prior) + log(LR1) + log(LR2)
    
    prior_odds = prior_prob / (1 - prior_prob)
    log_prior_odds = np.log(prior_odds)
    
    lr_list = [10.0, 5.0]
    log_lr_sum = np.sum(np.log(lr_list))
    
    log_post_odds = log_prior_odds + log_lr_sum
    post_odds = np.exp(log_post_odds)
    post_prob = post_odds / (1 + post_odds)
    
    calculated_prob = network.calculate_posterior_with_log_odds(prior_prob, lr_list)
    assert np.isclose(calculated_prob, post_prob)
