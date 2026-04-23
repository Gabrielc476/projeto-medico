---
title: Matemática Bayesiana
tags:
  - diagnostic-engine
  - bayesian
  - matematica
  - performance
---

# 🧮 Matemática Bayesiana

> [!abstract] Em uma frase
> Usamos o **Teorema de Bayes** para atualizar a probabilidade de cada doença conforme cada sintoma é adicionado, agora otimizado para escala massiva.

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

## ⚡ Otimização de Performance (Grafo)

Com **26.000+ doenças**, calcular o Bayes para todas em cada request seria impossível.

> [!important] Estratégia de Filtragem
> Antes de rodar a matemática, o motor pergunta ao Neo4j: *"Quais doenças têm pelo menos um destes sintomas?"*
> Isso reduz o espaço de busca de **26.000** para **~50-100** candidatos relevantes em milissegundos.

```mermaid
graph LR
    S["Sintomas do Paciente"] --> G["Neo4j Filter"]
    G --> D["Relevant Candidates (N < 100)"]
    D --> B["Bayesian Inference"]
    B --> R["Ranked Differential Diagnosis"]
```

---

## 📊 Interpretando os Resultados

| Valor | Significado | Ação Sugerida |
|-----|-----------|---------------|
| **Prob > 30%** | Alta Probabilidade | Investigar como hipótese principal |
| **Prob 10-30%** | Moderada | Manter no diagnóstico diferencial |
| **LR+ > 10** | Evidência Forte | Sintoma patognomônico ou altamente sugestivo |

---

Anterior: [[03 — Base de Conhecimento]] | Próximo: [[05 — TF-IDF e Espaço Vetorial]]
