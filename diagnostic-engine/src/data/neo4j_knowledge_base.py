"""Neo4j implementation of the Medical Knowledge Base.

This module provides a graph-backed knowledge base that implements
the ``KnowledgeBaseProtocol``. It uses Cypher queries to navigate
the medical taxonomy (UMLS, SNOMED, HPO) and retrieve probabilistic
associations between diseases and symptoms.
"""

from __future__ import annotations

import os
from typing import Dict, List, Optional, Sequence

from neo4j import GraphDatabase, Driver

from src.models.disease import Disease
from src.models.disease_symptom_link import DiseaseSymptomLink
from src.models.symptom import Symptom
from .knowledge_base import KnowledgeBaseProtocol


class Neo4jKnowledgeBase(KnowledgeBaseProtocol):
    """Neo4j-backed knowledge base implementing ``KnowledgeBaseProtocol``.

    Uses a direct connection to a Neo4j Labeled Property Graph.
    """

    def __init__(self, uri: str | None = None, user: str | None = None, password: str | None = None) -> None:
        self._uri = uri or os.environ.get("NEO4J_URI", "bolt://localhost:7687")
        self._user = user or os.environ.get("NEO4J_USER", "neo4j")
        self._password = password or os.environ.get("NEO4J_PASSWORD", "medical123")
        
        self._driver: Driver = GraphDatabase.driver(self._uri, auth=(self._user, self._password))

    def close(self):
        """Close the Neo4j driver connection."""
        self._driver.close()

    # -- public interface ---------------------------------------------------

    def get_disease(self, disease_id: str) -> Optional[Disease]:
        """Return a Disease by its ID from Neo4j."""
        with self._driver.session() as session:
            result = session.run(
                "MATCH (d:Disease {disease_id: $disease_id}) RETURN d",
                disease_id=disease_id
            )
            record = result.single()
            if record:
                props = dict(record["d"])
                return Disease(**props)
        return None

    def get_symptom(self, symptom_id: str) -> Optional[Symptom]:
        """Return a Symptom by its internal ID from Neo4j."""
        with self._driver.session() as session:
            result = session.run(
                "MATCH (s:Symptom {symptom_id: $symptom_id}) RETURN s",
                symptom_id=symptom_id
            )
            record = result.single()
            if record:
                props = dict(record["s"])
                return Symptom(**props)
        return None

    def get_symptom_by_cui(self, cui: str) -> Optional[Symptom]:
        """Return a Symptom by its UMLS CUI from Neo4j."""
        with self._driver.session() as session:
            result = session.run(
                "MATCH (s:Symptom {cui: $cui}) RETURN s",
                cui=cui
            )
            record = result.single()
            if record:
                props = dict(record["s"])
                return Symptom(**props)
        return None

    def get_all_diseases(self) -> List[Disease]:
        """Return all diseases in the knowledge base."""
        with self._driver.session() as session:
            result = session.run("MATCH (d:Disease) RETURN d")
            return [Disease(**dict(record["d"])) for record in result]

    def get_all_symptoms(self) -> List[Symptom]:
        """Return all symptoms in the knowledge base that have a valid CUI."""
        with self._driver.session() as session:
            result = session.run("MATCH (s:Symptom) WHERE s.cui <> '' RETURN s")
            return [Symptom(**dict(record["s"])) for record in result]

    def get_links_for_disease(self, disease_id: str) -> List[DiseaseSymptomLink]:
        """Return all symptom links for a given disease from the graph."""
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (d:Disease {disease_id: $disease_id})-[r:HAS_SYMPTOM]->(s:Symptom)
                RETURN d.disease_id as disease_id, s.symptom_id as symptom_id, 
                       r.sensitivity as sensitivity, r.specificity as specificity,
                       r.link_probability as link_probability
                """,
                disease_id=disease_id
            )
            return [DiseaseSymptomLink(**record.data()) for record in result]

    def get_link(self, disease_id: str, symptom_id: str) -> Optional[DiseaseSymptomLink]:
        """Return the specific link between a disease and a symptom."""
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (d:Disease {disease_id: $disease_id})-[r:HAS_SYMPTOM]->(s:Symptom {symptom_id: $symptom_id})
                RETURN d.disease_id as disease_id, s.symptom_id as symptom_id, 
                       r.sensitivity as sensitivity, r.specificity as specificity,
                       r.link_probability as link_probability
                """,
                disease_id=disease_id,
                symptom_id=symptom_id
            )
            record = result.single()
            if record:
                return DiseaseSymptomLink(**record.data())
        return None

    def get_disease_profiles(self) -> Dict[str, List[str]]:
        """Build disease→CUI-list mapping from the graph traversal."""
        profiles: Dict[str, List[str]] = {}
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (d:Disease)-[:HAS_SYMPTOM]->(s:Symptom)
                RETURN d.disease_id as disease_id, collect(s.cui) as cuis
                """
            )
            for record in result:
                profiles[record["disease_id"]] = record["cuis"]
        return profiles

    def get_relevant_disease_ids(self, symptom_ids: List[str]) -> List[str]:
        """Return IDs of diseases that have at least one link to the provided symptoms."""
        if not symptom_ids:
            return []
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (s:Symptom)-[:HAS_SYMPTOM]-(d:Disease)
                WHERE s.symptom_id IN $symptom_ids
                RETURN DISTINCT d.disease_id as disease_id
                """,
                symptom_ids=symptom_ids
            )
            return [record["disease_id"] for record in result]

    def resolve_cuis_to_symptom_ids(self, cuis: Sequence[str]) -> List[str]:
        """Convert a list of CUIs to their corresponding symptom IDs via graph lookup."""
        if not cuis:
            return []
        with self._driver.session() as session:
            result = session.run(
                """
                MATCH (s:Symptom)
                WHERE s.cui IN $cuis
                RETURN s.symptom_id as symptom_id
                """,
                cuis=list(cuis)
            )
            return [record["symptom_id"] for record in result]

    @property
    def disease_count(self) -> int:
        with self._driver.session() as session:
            return session.run("MATCH (d:Disease) RETURN count(d) as c").single()["c"]

    @property
    def symptom_count(self) -> int:
        with self._driver.session() as session:
            return session.run("MATCH (s:Symptom) RETURN count(s) as c").single()["c"]

    @property
    def link_count(self) -> int:
        with self._driver.session() as session:
            return session.run("MATCH ()-[r:HAS_SYMPTOM]->() RETURN count(r) as c").single()["c"]
