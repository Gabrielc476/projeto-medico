# Redes Bayesianas e Matemática de Diagnóstico

O sistema evita "alucinações algorítmicas" limitando LLMs à extração de texto, transferindo o peso probabilístico para Redes Bayesianas (com `pgmpy`).

## Pilares Matemáticos
1. **TF-IDF e Similaridade de Cosseno:** Usado para recuperar doenças e rankear sintomas de texto livre, recompensando os raros.
2. **Prior Probabilities (Priores):** Calculados a partir dos Fatores de Risco extraídos pelo LLM (histórico familiar, rotina) na etapa de Contextualização.
3. **Noisy-OR / Leaky Noisy-OR:** Portão lógico usado para assumir Independência de Influências Causais (ICI) e evitar a explosão de tabelas de probabilidade conjuntas (CPTs $2^n$).
4. **Likelihood Ratios (LR+ e LR-):** Utilizados para Atualização Bayesiana iterativa baseando-se na sensibilidade e especificidade clínica.
5. **Log-Odds:** Usado para garantir estabilidade numérica e evitar *Underflow* de Ponto Flutuante em cálculos de probabilidades rasas.

Relacionado: [[Fluxo-de-Triagem]]
