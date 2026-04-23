---
title: Conceitos PostgreSQL
tags:
  - database
  - relational
  - postgresql
---

# 🐘 Conceitos PostgreSQL (Relational Database)

> [!abstract] Em uma frase
> O PostgreSQL é o **"cartório"** do sistema, guardando os dados dos pacientes com segurança e integridade total.

---

## 🛡️ O Papel do Postgres no Sistema

> [!important] Fonte da Verdade Transacional
> Enquanto o Neo4j guarda o *conhecimento médico abstrato*, o Postgres guarda a ==vida real do paciente==:

1.  **Registros de Saúde (EHR):** Identidade, alergias, condições crônicas.
2.  **Consultas e Triagens:** Histórico de cada uso do app.
3.  **Auditoria:** Logs imutáveis para conformidade com **LGPD/HIPAA**.

---

## ⚙️ Características Relevantes

*   **ACID Compliant:** Garante que uma triagem nunca seja salva "pela metade". 🛑
*   **JSONB Support:** Para payloads flexíveis (ex: resultados de exames variados).
*   **Integração com Kafka:** Via **Debezium**, o Postgres avisa o Neo4j sobre mudanças em tempo real.

---

## 📊 Por que não usar apenas Postgres?

> [!warning] O limite do Relacional
> O Postgres sofre com a ==explosão de JOINs== ao tentar modelar ontologias médicas massivas (ex: SNOMED CT).

**A Divisão de Trabalho:**
- **Postgres para FATOS:** "O Paciente X sentiu Febre ontem".
- **Neo4j para RELAÇÕES:** "A Febre está associada à Pneumonia com peso 0.85".

---

Anterior: [[01 — Conceitos Neo4j]] | Próximo: [[03 — Implementação e Entidades]]
