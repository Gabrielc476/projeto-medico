# Log de Decisões Arquiteturais (ADRs)

Registro cronológico das decisões que moldam este projeto.

## Decisões Recentes

### Decisão 001: Adoção do Fluxo de Diagnóstico em 3 Pilares
- **Data:** 2026-04-19
- **Contexto:** Necessidade de absorver históricos complexos e caóticos da vida do paciente (ex: "meu pai teve infarto aos 50") sem poluir a máquina de estado do formulário ou gerar fluxos engessados no frontend.
- **Decisão:** Implementar um fluxo rígido de 3 pilares (`Exames` -> `Contexto` -> `Sintomas`). A etapa de `Contexto` utilizará um **LLM** de forma restrita apenas como extrator semântico de *Fatores de Risco*. O motor Python converterá essas features extraídas em probabilidades matemáticas (Priores).
- **Consequências:** O LLM fica banido do cálculo diagnóstico final, focando apenas em conversão estruturada de texto. A máquina do XState torna os 2 primeiros pilares opcionais, mas força a etapa de sintomas.
