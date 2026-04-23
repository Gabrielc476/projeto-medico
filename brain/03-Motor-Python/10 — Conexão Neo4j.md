---
title: Conexão Neo4j
tags:
  - python
  - neo4j
  - infra
  - cypher
---

# 🔌 Conexão Neo4j (Python Engine)

O motor de diagnóstico utiliza o driver oficial `neo4j` para realizar consultas de alta performance no Grafo de Conhecimento Médico.

---

## 🛠️ Configuração de Ambiente

As credenciais são gerenciadas via variáveis de ambiente para segurança e facilidade em Docker:

```bash
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=medical123
```

---

## 🏗️ Implementação: `Neo4jKnowledgeBase`

A classe implementa o `KnowledgeBaseProtocol` e encapsula a complexidade das queries Cypher.

### Query de Filtragem (Otimização Crítica)
Esta query permite que o motor bayesiano ignore 99% das doenças irrelevantes:

```cypher
MATCH (s:Symptom) WHERE s.symptom_id IN $symptom_ids
MATCH (d:Disease)-[:HAS_SYMPTOM]->(s)
RETURN DISTINCT d.disease_id
```

### Recuperação de Links
Busca as probabilidades e razões de verossimilhança para o cálculo do Bayes:

```cypher
MATCH (d:Disease {disease_id: $did})-[r:HAS_SYMPTOM]->(s:Symptom)
RETURN d.disease_id as disease_id, s.symptom_id as symptom_id, 
       r.sensitivity as sensitivity, r.specificity as specificity,
       r.link_probability as link_probability
```

---

## 🏎️ Performance e Escalabilidade

> [!info] Pooling de Conexões
> O driver do Neo4j gerencia automaticamente um pool de conexões. O `DiagnosticServicer` mantém uma instância única da `Neo4jKnowledgeBase` durante todo o ciclo de vida do container para maximizar o reúso de sockets.

---

## 🛡️ Tratamento de Erros e Validação

- **CUIs Vazios:** O sistema filtra automaticamente nós de sintomas sem CUI válido para evitar falhas no Pipeline de NLP.
- **Normalização:** Probabilidades vindas do dataset HSDN são normalizadas para o intervalo [0, 1] antes de serem processadas pelo Pydantic.

---

Voltar para: [[00 — Mapa Geral]]
