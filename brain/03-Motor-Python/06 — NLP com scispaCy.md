---
title: NLP com scispaCy
tags:
  - diagnostic-engine
  - nlp
  - scispacy
---

# 🔤 NLP com scispaCy

> [!abstract] Em uma frase
> O scispaCy lê texto livre ("eu tenho dor de cabeça e febre") e extrai os **CUIs** dos sintomas médicos.

---

## 🎯 O Que Faz

```mermaid
graph LR
    A["'Eu tenho dor de<br/>cabeça e febre'"] -->|scispaCy NER| B["Entidades Médicas"]
    B --> C["CUI: C0018681<br/>Nome: Headache"]
    B --> D["CUI: C0015967<br/>Nome: Fever"]
```

📄 `src/nlp/extractor.py`

---

## 🧠 NER = Named Entity Recognition

> [!tip] Analogia: Marca-texto 🖍️
> Imagine que alguém passa um marca-texto automático no texto,
> destacando APENAS os termos que são sintomas médicos.

| Texto do Paciente | O que o NER encontra |
|-------------------|---------------------|
| "Eu tenho **dor de cabeça** forte" | `Headache` → `C0018681` |
| "Sinto muita **febre** e **tosse**" | `Fever` → `C0015967`, `Cough` → `C0010200` |
| "Estou bem, sem queixas" | *(nada encontrado)* |

---

## 🔧 Como Usar

```python
extractor = ClinicalExtractor()
features = extractor.extract_features("headache and fever")

# Resultado:
# [
#   {"cui": "C0018681", "name": "headache", "is_present": True},
#   {"cui": "C0015967", "name": "fever", "is_present": True}
# ]
```

---

## ⚠️ Limitação Atual

> [!warning] Negação NÃO é detectada ainda
> Se o paciente diz **"não tenho febre"**, o sistema atual marca febre como **presente** ❌
>
> Isso será resolvido com **NegEx/Negation Detection** numa fase futura.

---

## 🔗 Conexão com o Resto

```mermaid
graph LR
    A["Texto Livre"] -->|scispaCy| B["CUIs"]
    B -->|resolve_cuis_to_symptom_ids| C["Symptom IDs"]
    C -->|rank_diseases| D["Ranking Bayesiano"]
    B -->|score_diseases| E["Score TF-IDF"]
```

---

Anterior: [[05 — TF-IDF e Espaço Vetorial]] | Próximo: [[07 — gRPC e Comunicação]]
