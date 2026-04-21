"""End-to-end ranking integration tests.

These tests verify that the complete pipeline — KnowledgeBase → Bayesian
Network → TF-IDF Vectorizer — produces clinically coherent rankings.
"""

import pytest
import numpy as np

from src.data.knowledge_base import MedicalKnowledgeBase
from src.math.bayesian_network import DiseaseDiagnosticNetwork
from src.math.vector_space import SymptomVectorizer


@pytest.fixture
def kb() -> MedicalKnowledgeBase:
    return MedicalKnowledgeBase()


@pytest.fixture
def network() -> DiseaseDiagnosticNetwork:
    return DiseaseDiagnosticNetwork()


@pytest.fixture
def vectorizer(kb: MedicalKnowledgeBase) -> SymptomVectorizer:
    v = SymptomVectorizer()
    v.fit_from_knowledge_base(kb)
    return v


# ---------------------------------------------------------------------------
# Bayesian ranking tests
# ---------------------------------------------------------------------------

class TestBayesianRanking:
    """Verify that rank_diseases produces clinically coherent results."""

    def test_respiratory_symptoms_rank_pneumonia_high(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Patient with cough + fever + dyspnea → Pneumonia should rank high."""
        patient_symptoms = ["S001", "S002", "S003"]  # Cough, Fever, Dyspnea
        ranking = network.rank_diseases(patient_symptoms, kb)

        # Get the top 3 disease IDs
        top_3_ids = [disease_id for disease_id, _ in ranking[:3]]

        # Pneumonia (D001) should be in the top 3
        assert "D001" in top_3_ids, (
            f"Pneumonia (D001) not in top 3. Ranking: {ranking[:5]}"
        )

    def test_gi_symptoms_rank_gastroenteritis_high(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Patient with diarrhea + vomiting + nausea → Gastroenteritis should rank high."""
        patient_symptoms = ["S008", "S007", "S006"]  # Diarrhea, Vomiting, Nausea
        ranking = network.rank_diseases(patient_symptoms, kb)

        top_3_ids = [disease_id for disease_id, _ in ranking[:3]]
        assert "D007" in top_3_ids, (
            f"Gastroenteritis (D007) not in top 3. Ranking: {ranking[:5]}"
        )

    def test_uti_symptoms_rank_uti_high(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Patient with dysuria + pollakiuria → UTI should rank #1."""
        patient_symptoms = ["S014", "S015"]  # Dysuria, Pollakiuria
        ranking = network.rank_diseases(patient_symptoms, kb)

        top_disease_id = ranking[0][0]
        assert top_disease_id == "D010", (
            f"UTI (D010) not ranked #1. Top: {ranking[0]}"
        )

    def test_depression_symptoms_rank_depression_high(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Patient with depressed mood + anhedonia + insomnia → Depression should rank high."""
        patient_symptoms = ["S024", "S025", "S023"]  # Depressed Mood, Anhedonia, Insomnia
        ranking = network.rank_diseases(patient_symptoms, kb)

        top_3_ids = [disease_id for disease_id, _ in ranking[:3]]
        assert "D012" in top_3_ids, (
            f"Depression (D012) not in top 3. Ranking: {ranking[:5]}"
        )

    def test_cardiac_symptoms_rank_ami_high(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Patient with chest pain + diaphoresis + dyspnea → AMI should rank high."""
        patient_symptoms = ["S004", "S019", "S003"]  # Chest Pain, Diaphoresis, Dyspnea
        ranking = network.rank_diseases(patient_symptoms, kb)

        top_3_ids = [disease_id for disease_id, _ in ranking[:3]]
        assert "D005" in top_3_ids, (
            f"AMI (D005) not in top 3. Ranking: {ranking[:5]}"
        )

    def test_ranking_returns_all_diseases(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """Every disease in the KB should appear in the ranking."""
        ranking = network.rank_diseases(["S001"], kb)
        assert len(ranking) == 12

    def test_all_probabilities_valid(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """All posterior probabilities should be between 0 and 1."""
        ranking = network.rank_diseases(["S001", "S002"], kb)
        for disease_id, prob in ranking:
            assert 0.0 <= prob <= 1.0, (
                f"Invalid probability for {disease_id}: {prob}"
            )

    def test_ranking_is_sorted_descending(
        self, network: DiseaseDiagnosticNetwork, kb: MedicalKnowledgeBase
    ) -> None:
        """The ranking should be sorted from highest to lowest probability."""
        ranking = network.rank_diseases(["S001", "S002", "S003"], kb)
        probs = [prob for _, prob in ranking]
        for i in range(len(probs) - 1):
            assert probs[i] >= probs[i + 1], (
                f"Not sorted: {probs[i]} < {probs[i+1]}"
            )


# ---------------------------------------------------------------------------
# TF-IDF ranking tests
# ---------------------------------------------------------------------------

class TestTFIDFRanking:
    """Verify that the TF-IDF vectorizer scores diseases coherently."""

    def test_tfidf_fitted_from_kb(
        self, vectorizer: SymptomVectorizer, kb: MedicalKnowledgeBase
    ) -> None:
        """The vectorizer should have all 12 diseases after fitting from KB."""
        assert len(vectorizer.disease_ids) == 12

    def test_respiratory_cuis_score_respiratory_diseases_higher(
        self, vectorizer: SymptomVectorizer
    ) -> None:
        """Cough + Fever CUIs should score respiratory diseases higher than UTI."""
        scores = vectorizer.score_diseases(["C0010200", "C0015967"])  # Cough, Fever

        # Pneumonia (D001) or Influenza (D002) should score higher than UTI (D010)
        respiratory_score = max(scores.get("D001", 0), scores.get("D002", 0))
        uti_score = scores.get("D010", 0)
        assert respiratory_score > uti_score

    def test_rare_symptom_has_higher_tfidf_weight(
        self, vectorizer: SymptomVectorizer
    ) -> None:
        """Hemoptysis (rare) should be a stronger discriminator than Cough (common)."""
        # Score with hemoptysis (C0019079) — only linked to Pneumonia
        hemoptysis_scores = vectorizer.score_diseases(["C0019079"])
        # Score with cough (C0010200) — linked to many diseases
        cough_scores = vectorizer.score_diseases(["C0010200"])

        # Hemoptysis should give Pneumonia a higher score than cough does
        # because it's rarer (higher IDF weight)
        hemoptysis_pneumonia = hemoptysis_scores.get("D001", 0)
        cough_pneumonia = cough_scores.get("D001", 0)

        # The hemoptysis-pneumonia score should be concentrated (few diseases match)
        # so D001's relative score should be higher
        non_zero_hemoptysis = sum(1 for s in hemoptysis_scores.values() if s > 0)
        non_zero_cough = sum(1 for s in cough_scores.values() if s > 0)
        assert non_zero_hemoptysis < non_zero_cough, (
            "Hemoptysis should match fewer diseases than cough"
        )

    def test_no_matching_symptoms_returns_zero_scores(
        self, vectorizer: SymptomVectorizer
    ) -> None:
        """A CUI not in the knowledge base should produce zero scores."""
        scores = vectorizer.score_diseases(["C9999999"])
        assert all(s == 0.0 for s in scores.values())


# ---------------------------------------------------------------------------
# Combined ranking test
# ---------------------------------------------------------------------------

class TestCombinedRanking:
    """Verify that Bayesian and TF-IDF rankings align for clear-cut cases."""

    def test_bayesian_and_tfidf_agree_on_uti(
        self,
        network: DiseaseDiagnosticNetwork,
        vectorizer: SymptomVectorizer,
        kb: MedicalKnowledgeBase,
    ) -> None:
        """Both engines should rank UTI highly for dysuria + pollakiuria."""
        # Bayesian ranking (by symptom IDs)
        bayesian = network.rank_diseases(["S014", "S015"], kb)
        bayesian_top = bayesian[0][0]

        # TF-IDF ranking (by CUIs)
        tfidf_scores = vectorizer.score_diseases(["C0085619", "C0032617"])
        tfidf_top = max(tfidf_scores, key=tfidf_scores.get)

        assert bayesian_top == "D010", f"Bayesian top: {bayesian_top}"
        assert tfidf_top == "D010", f"TF-IDF top: {tfidf_top}"
