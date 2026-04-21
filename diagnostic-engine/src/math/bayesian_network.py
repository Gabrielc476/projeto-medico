from __future__ import annotations

from typing import TYPE_CHECKING, Dict, List, Tuple

import numpy as np

if TYPE_CHECKING:
    from src.data.knowledge_base import KnowledgeBaseProtocol


class DiseaseDiagnosticNetwork:
    """
    Implements mathematical foundations for Bayesian diagnostics, 
    including Noisy-OR logic and Log-Odds sequential updating.
    """
    
    def __init__(self) -> None:
        pass
        
    def calculate_noisy_or_absence(self, link_probabilities: List[float]) -> float:
        """
        Calculates the probability of a symptom NOT occurring given active causes.
        P(Y=0 | X) = Product_i(1 - p_i)
        """
        if not link_probabilities:
            return 1.0 # Leaky probability can be added later if needed
            
        # P(Y=0) = \prod_{x_i \in X_p} (1 - p_i)
        prob_absence = np.prod([1.0 - p for p in link_probabilities])
        return float(prob_absence)
        
    def calculate_noisy_or_presence(self, link_probabilities: List[float]) -> float:
        """
        Calculates the probability of a symptom occurring (Noisy-OR).
        P(Y=1 | X) = 1 - P(Y=0 | X)
        """
        return 1.0 - self.calculate_noisy_or_absence(link_probabilities)

    def calculate_posterior_with_log_odds(self, prior_prob: float, likelihood_ratios: List[float]) -> float:
        """
        Sequentially updates the probability using Log-Odds transformation
        to avoid numeric underflow.
        log(O_post) = log(O_prior) + Sum(log(LR_i))
        """
        if prior_prob >= 1.0:
            return 1.0
        if prior_prob <= 0.0:
            return 0.0
            
        # Convert prior probability to odds
        prior_odds = prior_prob / (1.0 - prior_prob)
        log_prior_odds = np.log(prior_odds)
        
        # Sum logs of likelihood ratios
        # We add a small epsilon to avoid log(0) if LR is exactly 0
        epsilon = 1e-15
        log_lrs = [np.log(max(lr, epsilon)) for lr in likelihood_ratios]
        sum_log_lrs = sum(log_lrs)
        
        # Calculate posterior log odds
        log_post_odds = log_prior_odds + sum_log_lrs
        
        # Convert back to odds and probability
        post_odds = np.exp(log_post_odds)
        post_prob = post_odds / (1.0 + post_odds)
        
        return float(post_prob)

    def rank_diseases(
        self,
        patient_symptom_ids: List[str],
        knowledge_base: KnowledgeBaseProtocol,
        *,
        use_absent_evidence: bool = True,
    ) -> List[Tuple[str, float]]:
        """Rank all diseases by posterior probability given patient symptoms.

        For each disease in the knowledge base:
        1. Start with the disease's prevalence as the Bayesian prior.
        2. For each symptom the disease is linked to:
           - If the symptom IS in the patient's list → apply LR+
           - If the symptom is NOT in the patient's list → apply LR-
             (only when ``use_absent_evidence=True``)
        3. Convert to posterior probability via Log-Odds.

        Parameters:
            patient_symptom_ids: Symptom IDs present in the patient.
            knowledge_base: Data source implementing KnowledgeBaseProtocol.
            use_absent_evidence: Whether to penalise diseases for symptoms
                the patient does NOT have. Defaults to True.

        Returns:
            Sorted list of (disease_id, posterior_probability) tuples,
            highest probability first.
        """
        patient_set = set(patient_symptom_ids)
        results: List[Tuple[str, float]] = []

        for disease in knowledge_base.get_all_diseases():
            prior = disease.prevalence
            links = knowledge_base.get_links_for_disease(disease.disease_id)

            if not links:
                results.append((disease.disease_id, prior))
                continue

            likelihood_ratios: List[float] = []
            for link in links:
                if link.symptom_id in patient_set:
                    # Symptom IS present → use LR+
                    likelihood_ratios.append(link.lr_positive)
                elif use_absent_evidence:
                    # Symptom is NOT present → use LR-
                    likelihood_ratios.append(link.lr_negative)

            if likelihood_ratios:
                posterior = self.calculate_posterior_with_log_odds(
                    prior, likelihood_ratios
                )
            else:
                posterior = prior

            results.append((disease.disease_id, posterior))

        # Sort descending by posterior probability
        results.sort(key=lambda x: x[1], reverse=True)
        return results
