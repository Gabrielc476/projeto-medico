---
title: Conceitos Neo4j
tags:
  - database
  - graph
  - neo4j
---

# 🕸️ Conceitos Neo4j (Graph Database)

> [!abstract] Em uma frase
> O Neo4j é o **"mapa mental"** do sistema, onde as doenças e sintomas se conectam de forma inteligente e rápida.

---

## 🧠 Por que usar Grafos na Medicina?

> [!question]- O problema das tabelas (SQL)
> Em um banco tradicional, perguntar "Quais doenças compartilham os mesmos 5 sintomas?" exige centenas de `JOINs`.
> ==Isso é lento e difícil de manter==. 🐢

No Neo4j, a medicina flui naturalmente:
1.  **Hierarquias Complexas:** Uma doença tem sintomas, que têm subtipos, que pertencem a regiões do corpo.
2.  **Performance de Travessia:** A busca é feita por "ponteiros" físicos (Index-free adjacency). É instantâneo. ⚡
3.  **Flexibilidade Semântica:** Podemos adicionar `INTERAGE_COM_MEDICAMENTO` sem mudar o esquema.

---

## 🏗️ Elementos Fundamentais

*   **Nodes (Nós):** As entidades principais.
    *   `Disease` (Pneumonia)
    *   `Symptom` (Febre)
*   **Relationships (Relacionamentos):** Como elas se ligam.
    *   `HAS_SYMPTOM` (Doença -> Sintoma)
*   **Properties (Propriedades):** Os pesos clínicos.
    *   `sensitivity: 0.95`
    *   `prevalence: 0.02`
*   **Labels (Rótulos):** Categorias (ex: `:Disease`).

---

## 🔍 Linguagem Cypher

> [!tip] Pense em padrões visuais
> Cypher não usa `SELECT`, ele usa `MATCH` para "desenhar" o que você quer encontrar.

```cypher
// Encontrar doenças que causam 'Febre'
MATCH (d:Disease)-[r:HAS_SYMPTOM]->(s:Symptom {name: 'Febre'})
RETURN d.name, r.sensitivity
```

---

Anterior: [[00-Index]] | Próximo: [[02 — Conceitos PostgreSQL]]
