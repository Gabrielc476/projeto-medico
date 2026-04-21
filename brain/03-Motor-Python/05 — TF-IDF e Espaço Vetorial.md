---
title: TF-IDF e Espaço Vetorial
tags:
  - diagnostic-engine
  - tfidf
  - matematica
---

# 📊 TF-IDF e Espaço Vetorial

> [!abstract] Em uma frase
> TF-IDF transforma sintomas em **números** e usa **similaridade de cosseno** para encontrar doenças parecidas.

---

## 🤔 O Problema

O paciente diz: "tenho tosse e hemoptise".
Como saber qual doença é mais parecida com esses sintomas?

> [!tip] Analogia: Google 🔍
> É como o Google busca páginas parecidas com o que você digitou.
> Só que aqui buscamos **doenças** parecidas com os **sintomas**.

---

## 📐 Como Funciona

📄 `src/math/vector_space.py`

### 1️⃣ TF-IDF — Valorizar o Raro

| Termo | TF (frequência) | IDF (raridade) | TF-IDF |
|-------|-----------------|----------------|--------|
| Tosse | Aparece em 5 doenças | Baixo (comum) | ==Peso baixo== |
| Hemoptise | Aparece em 1 doença | Alto (raro) | ==Peso alto== ⭐ |

> [!important] Regra de ouro
> **Sintomas raros são mais úteis** para o diagnóstico!
> Hemoptise (tossir sangue) quase só aparece em Pneumonia → peso alto.

### 2️⃣ Similaridade de Cosseno

Cada doença e o paciente viram **vetores** (listas de números).
O ângulo entre eles mede a similaridade:

- **1.0** = Perfeitamente igual ✅
- **0.0** = Completamente diferente ❌

---

## 🔧 Código Simplificado

```python
vectorizer = SymptomVectorizer()

# Cada doença = lista de CUIs dos seus sintomas
vectorizer.fit_from_knowledge_base(kb)

# Paciente chega com esses CUIs
scores = vectorizer.score_diseases(["C0010200", "C0019079"])
# → {"D001": 0.85, "D002": 0.30, "D010": 0.0, ...}
```

---

## 🤝 TF-IDF + Bayes = Ranking Final

| Motor | O que faz | Ponto forte |
|-------|----------|------------|
| **Bayesian** | Calcula probabilidade real | Usa dados clínicos (LR+/LR-) |
| **TF-IDF** | Busca por similaridade | Bom com texto livre |

> [!success] Quando os dois concordam, temos confiança alta!

---

Anterior: [[04 — Matemática Bayesiana]] | Próximo: [[06 — NLP com scispaCy]]
