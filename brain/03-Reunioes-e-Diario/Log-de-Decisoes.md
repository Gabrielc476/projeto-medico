# Log de Decisões Arquiteturais (ADRs)

Registro cronológico das decisões que moldam este projeto.

## Decisões Recentes

### Decisão 001: Adoção do Fluxo de Diagnóstico em 3 Pilares
- **Data:** 2026-04-19
- **Contexto:** Necessidade de absorver históricos complexos e caóticos da vida do paciente (ex: "meu pai teve infarto aos 50") sem poluir a máquina de estado do formulário ou gerar fluxos engessados no frontend.
- **Decisão:** Implementar um fluxo rígido de 3 pilares (`Exames` -> `Contexto` -> `Sintomas`). A etapa de `Contexto` utilizará um **LLM** de forma restrita apenas como extrator semântico de *Fatores de Risco*. O motor Python converterá essas features extraídas em probabilidades matemáticas (Priores).
- **Consequências:** O LLM fica banido do cálculo diagnóstico final, focando apenas em conversão estruturada de texto. A máquina do XState torna os 2 primeiros pilares opcionais, mas força a etapa de sintomas.

### Decisão 002: Tradução Semântica de Sintomas (Layman Terms) via LLM
- **Data:** 2026-04-28
- **Contexto:** A base de conhecimento (Neo4j/UMLS) utiliza terminologia clínica técnica (ex: "Disúria", "Mialgia"). Para o paciente no App Mobile, precisamos exibir termos leigos (ex: "Dor ao urinar", "Dor muscular") para garantir acessibilidade.
- **Decisão:** Em vez de realizar uma migração massiva no banco de dados para incluir termos leigos, utilizaremos o **LLM (Gemma 4)** dinamicamente através do RPC `GetAppSymptoms`. O motor Python traduzirá a lista de nomes clínicos para termos leigos na linguagem solicitada (`language: "pt-BR"`) e o Gateway (NestJS) deve cachear este dicionário para otimizar a performance.
- **Consequências:** Mantemos a base de dados limpa e estritamente clínica, permitindo que a "camada de apresentação" (termos leigos) evolua ou seja traduzida para novos idiomas via prompt, sem alterações de infraestrutura.
