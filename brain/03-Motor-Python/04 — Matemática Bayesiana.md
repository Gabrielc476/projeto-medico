---
title: Matemática Bayesiana
tags:
  - diagnostic-engine
  - bayesian
  - matematica
---

# 🧮 Matemática Bayesiana

> [!abstract] Em uma frase
> Usamos o **Teorema de Bayes** para atualizar a probabilidade de cada doença conforme cada sintoma é adicionado.

---

## 🎯 A Ideia Central

> [!example] Analogia: Detetive 🕵️
> Antes de investigar: 2% dos casos são Pneumonia (**prior**).
> Descobre **tosse** (LR+=1.33) → sobe para ~2.7%.
> Descobre **febre** (LR+=1.50) → sobe para ~4%.
> ==Cada pista atualiza a probabilidade!==

---

## 📐 Passo a Passo

📄 `src/math/bayesian_network.py`

1️⃣ Prior: $P = 0.02$
2️⃣ Odds: $\frac{0.02}{0.98} = 0.0204$
3️⃣ Log-Odds: $\log(0.0204) = -3.89$
4️⃣ Somar $\log(LR_i)$ de cada sintoma
5️⃣ Converter de volta: $P = \frac{odds}{1 + odds}$

> [!warning] Por que Log-Odds?
> Evita ==underflow numérico==. Somas ao invés de multiplicações.

---

## 🔌 Noisy-OR

Quando múltiplas doenças causam o mesmo sintoma:

$$P(Y=1) = 1 - \prod_{i} (1 - p_i)$$

> [!example] Analogia: Alarme 🔥
> 3 fontes (p=0.8, 0.6, 0.7):
> $P(\text{não toca}) = 0.2 \times 0.4 \times 0.3 = 0.024$
> $P(\text{toca}) = 97.6\%$

---

## 📊 Tabela LR

| LR+ | Significado |
|-----|-----------|
| > 10 | ==Muito forte== |
| 5-10 | Forte |
| 2-5 | Moderado |
| 1-2 | Fraco |

---

Anterior: [[03 — Base de Conhecimento]] | Próximo: [[05 — TF-IDF e Espaço Vetorial]]
