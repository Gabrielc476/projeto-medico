"""Medical Knowledge Base: loads, indexes, and serves clinical evidence data.

This module provides a JSON-backed knowledge base that is designed to be
replaced by a Neo4j/PostgreSQL implementation in the future. The public
interface is defined by the ``KnowledgeBaseProtocol`` so that the math
engine depends on an abstraction, not a concrete loader.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional, Protocol, Sequence, runtime_checkable

from src.models.disease import Disease
from src.models.disease_symptom_link import DiseaseSymptomLink
from src.models.symptom import Symptom


# ---------------------------------------------------------------------------
# Protocol (interface) for future Neo4j/PostgreSQL swap
# ---------------------------------------------------------------------------

@runtime_checkable
class KnowledgeBaseProtocol(Protocol):
    """Abstract interface the math engine depends on.

    Any future persistence backend (Neo4j, PostgreSQL) only needs to
    implement these methods to be a drop-in replacement.
    """

    def get_disease(self, disease_id: str) -> Optional[Disease]: ...

    def get_symptom(self, symptom_id: str) -> Optional[Symptom]: ...

    def get_symptom_by_cui(self, cui: str) -> Optional[Symptom]: ...

    def get_all_diseases(self) -> List[Disease]: ...

    def get_all_symptoms(self) -> List[Symptom]: ...

    def get_links_for_disease(self, disease_id: str) -> List[DiseaseSymptomLink]: ...

    def get_link(
        self, disease_id: str, symptom_id: str
    ) -> Optional[DiseaseSymptomLink]: ...

    def get_disease_profiles(self) -> Dict[str, List[str]]: ...

    def get_relevant_disease_ids(self, symptom_ids: List[str]) -> List[str]: ...


# ---------------------------------------------------------------------------
# JSON-backed implementation
# ---------------------------------------------------------------------------

_DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


class MedicalKnowledgeBase:
    """JSON-backed knowledge base implementing ``KnowledgeBaseProtocol``.

    On initialization it loads ``diseases.json``, ``symptoms.json`` and
    ``disease_symptom_links.json`` from *data_dir*, validates every record
    through Pydantic, and builds in-memory indices for O(1) lookups.

    Parameters:
        data_dir: Path to the directory containing the JSON seed files.
            Defaults to ``<project_root>/data/``.
    """

    def __init__(self, data_dir: Path | None = None) -> None:
        self._data_dir = data_dir or _DEFAULT_DATA_DIR

        # Primary storage
        self._diseases: Dict[str, Disease] = {}
        self._symptoms: Dict[str, Symptom] = {}
        self._links: List[DiseaseSymptomLink] = []

        # Indices
        self._cui_to_symptom: Dict[str, Symptom] = {}
        self._disease_links: Dict[str, List[DiseaseSymptomLink]] = {}
        self._link_index: Dict[str, DiseaseSymptomLink] = {}

        self._load()

    # -- public interface ---------------------------------------------------

    def get_disease(self, disease_id: str) -> Optional[Disease]:
        """Return a Disease by its ID, or ``None``."""
        return self._diseases.get(disease_id)

    def get_symptom(self, symptom_id: str) -> Optional[Symptom]:
        """Return a Symptom by its internal ID, or ``None``."""
        return self._symptoms.get(symptom_id)

    def get_symptom_by_cui(self, cui: str) -> Optional[Symptom]:
        """Return a Symptom by its UMLS CUI, or ``None``."""
        return self._cui_to_symptom.get(cui)

    def get_all_diseases(self) -> List[Disease]:
        """Return all diseases in the knowledge base."""
        return list(self._diseases.values())

    def get_all_symptoms(self) -> List[Symptom]:
        """Return all symptoms in the knowledge base."""
        return list(self._symptoms.values())

    def get_links_for_disease(self, disease_id: str) -> List[DiseaseSymptomLink]:
        """Return all symptom links for a given disease."""
        return self._disease_links.get(disease_id, [])

    def get_link(
        self, disease_id: str, symptom_id: str
    ) -> Optional[DiseaseSymptomLink]:
        """Return the specific link between a disease and a symptom."""
        key = f"{disease_id}::{symptom_id}"
        return self._link_index.get(key)

    def get_disease_profiles(self) -> Dict[str, List[str]]:
        """Build disease→CUI-list mapping for the TF-IDF vectorizer.

        Returns a dict where keys are disease IDs and values are lists of
        CUI strings belonging to that disease's symptom profile.
        """
        profiles: Dict[str, List[str]] = {}
        for disease_id, links in self._disease_links.items():
            cuis: List[str] = []
            for link in links:
                symptom = self._symptoms.get(link.symptom_id)
                if symptom:
                    cuis.append(symptom.cui)
            profiles[disease_id] = cuis
        return profiles

    def get_relevant_disease_ids(self, symptom_ids: List[str]) -> List[str]:
        """Return IDs of diseases that have at least one link to the provided symptoms."""
        relevant = set()
        symptom_set = set(symptom_ids)
        for disease_id, links in self._disease_links.items():
            for link in links:
                if link.symptom_id in symptom_set:
                    relevant.add(disease_id)
                    break
        return list(relevant)

    def resolve_cuis_to_symptom_ids(self, cuis: Sequence[str]) -> List[str]:
        """Convert a list of CUIs to their corresponding symptom IDs.

        CUIs not found in the knowledge base are silently skipped.
        """
        ids: List[str] = []
        for cui in cuis:
            symptom = self._cui_to_symptom.get(cui)
            if symptom:
                ids.append(symptom.symptom_id)
        return ids

    @property
    def disease_count(self) -> int:
        return len(self._diseases)

    @property
    def symptom_count(self) -> int:
        return len(self._symptoms)

    @property
    def link_count(self) -> int:
        return len(self._links)

    # -- private loaders ----------------------------------------------------

    def _load(self) -> None:
        """Load and validate all JSON seed files."""
        self._load_diseases()
        self._load_symptoms()
        self._load_links()

    def _load_diseases(self) -> None:
        path = self._data_dir / "diseases.json"
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
        for item in raw:
            disease = Disease(**item)
            self._diseases[disease.disease_id] = disease

    def _load_symptoms(self) -> None:
        path = self._data_dir / "symptoms.json"
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
        for item in raw:
            symptom = Symptom(**item)
            self._symptoms[symptom.symptom_id] = symptom
            self._cui_to_symptom[symptom.cui] = symptom

    def _load_links(self) -> None:
        path = self._data_dir / "disease_symptom_links.json"
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
        for item in raw:
            link = DiseaseSymptomLink(**item)
            self._links.append(link)

            # Index by disease
            if link.disease_id not in self._disease_links:
                self._disease_links[link.disease_id] = []
            self._disease_links[link.disease_id].append(link)

            # Index by disease::symptom compound key
            key = f"{link.disease_id}::{link.symptom_id}"
            self._link_index[key] = link
