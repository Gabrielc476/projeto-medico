---
name: advanced-clinical-math
description: Guia matemático profundo para o projeto médico, atuando em conjunto com pymc-bayesian-modeling. Cobre TF-IDF, Noisy-OR, Razão de Verossimilhança (LR+, LR-) e Log-Odds.
---

# Fundamentação Matemática de Diagnóstico Avançado

## Quando usar esta habilidade
- Quando estiver implementando o núcleo matemático do motor de diagnóstico em Python.
- Sempre que a skill `pymc-bayesian-modeling` for engatilhada para cálculos probabilísticos preditivos ou extração semântica de sintomas.

## Instruções
- **TF-IDF e Similaridade de Cosseno:** Para recuperar doenças baseadas em sintomas de texto livre, use TF-IDF para penalizar sintomas comuns (fadiga, febre) e recompensar sintomas raros e patognomônicos. Use `scipy.sparse` (CSR) para lidar com matrizes hiper-esparsas e execute similaridade de cosseno via dot product de vetores normalizados L2.
- **Extração Semântica por LLM e Priores:** Utilize um LLM apenas para ler o "texto livre de contextualização" e convertê-lo em "Features de Risco" rígidas (ex: *has_family_history_cad*, *is_smoker*). O núcleo matemático absorverá essas features, ajustando matematicamente as **Probabilidades a Priori (Priors)** dos nós pais correspondentes antes de observar qualquer evidência de sintoma.
- **Redes Bayesianas e Noisy-OR:** Não modele redes condicionais conjuntas ingênuas (isso causa explosão combinatória de tabelas CPT $2^n$). Utilize o portão lógico "Noisy-OR" e sua extensão "Leaky Noisy-OR" (para absorver doenças idiopáticas/não listadas), assegurando a premissa de "Independência de Influências Causais" (ICI).
- **Atualização Bayesiana Iterativa:** Empregue métricas clínicas validadas epidemiologicamente (Sensibilidade e Especificidade) para extrair a Razão de Verossimilhança (Likelihood Ratio). Valores LR+ > 10 confirmam suspeitas ativamente (SpPIn), valores LR- se aproximando de 0 descartam (SnNout).
- **Estabilidade Numérica (Log-Odds):** Para contornar erros de quantização de underflow numérico (onde probabilidades fracionárias mergulham para o zero absoluto), todas as atualizações de probabilidade e Belief Updating iterativo devem ocorrer no plano da soma linear através da transformação `Log-Odds`.
