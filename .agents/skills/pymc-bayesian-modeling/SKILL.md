---
name: pymc-bayesian-modeling
description: Bayesian modeling with PyMC. Build hierarchical models, MCMC (NUTS), for probabilistic programming and inference. Use this when creating symptom-crossing algorithms, likelihood ratios, or predictive mathematical models in Python.
---

# Algoritmos de Diagnóstico em Python

## Quando usar esta habilidade
- Rankeamento de doenças com base na entrada de sintomas do usuário.
- Cálculos de probabilidade utilizando o Teorema de Bayes ou pesos TF-IDF.

## Instruções
- **Modelagem Matemática:** Utilize bibliotecas estatísticas rigorosas como o PyMC para lidar com as distribuições de probabilidade condicional ou scikit-learn para calcular métricas como a Razão de Verossimilhança (Likelihood Ratios).
- **Tratamento de Texto:** Se usar TF-IDF para o peso dos sintomas, penalize sintomas muito comuns (ex: febre) e garanta que sintomas raros/patognomônicos tenham pesos preditivos altos.
- **Reprodutibilidade Estocástica:** Para qualquer inferência não determinística ou amostragens randômicas, defina explicitamente as "random seeds" (ex: `np.random.seed(42)`) para que os testes e predições sejam previsíveis e auditáveis na compilação.
