from typing import List
import numpy as np

class DiseaseDiagnosticNetwork:
    """
    Implements mathematical foundations for Bayesian diagnostics, 
    including Noisy-OR logic and Log-Odds sequential updating.
    """
    
    def __init__(self):
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
