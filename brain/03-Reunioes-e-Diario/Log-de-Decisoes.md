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
### Decisão 003: Adoção do Prisma 7 e Driver Adapters no Backend Gateway
- **Data:** 2026-04-29
- **Contexto:** Durante a estabilização do `backend-gateway` no Docker, o Prisma 7 apresentou incompatibilidades críticas com os binários do motor Rust (Query Engine) ao rodar em containers Linux sobre hosts Windows. Além disso, a validação de esquema da versão 7 impôs novas restrições sobre a configuração de `datasources`.
- **Decisão:** Abandonar o uso do motor Rust padrão e adotar o **Prisma Driver Adapter** (`@prisma/adapter-pg`). A conexão com o banco de dados PostgreSQL passou a ser gerenciada por um pool do `pg` (Node-Postgres) injetado manualmente no `PrismaClient` via código, removendo a URL de conexão do arquivo `schema.prisma`.
- **Consequências:** Estabilidade total do ambiente Docker, eliminação de erros de binários ausentes e maior controle sobre o ciclo de vida das conexões. Como contrapartida, a configuração do `PrismaService` tornou-se mais explícita e menos dependente de automações do CLI do Prisma.
### Decisão 004: Restauração do Kafka e Zookeeper (Reversão)
- **Data:** 2026-04-29
- **Contexto:** Após a remoção inicial para otimização de recursos, foi identificado que os scripts de enriquecimento de dados (`enrich_knowledge_base.py`) utilizam o Kafka para publicar dados de doenças, sintomas e mapeamentos ontológicos.
- **Decisão:** Reverter a remoção e manter o Kafka e Zookeeper ativos na infraestrutura. Eles são essenciais para o pipeline de dados que alimenta a base Neo4j.
- **Consequências:** O ambiente volta a ter o pipeline de dados operacional. A carga de recursos é justificada pela necessidade de processamento de dados do motor de diagnóstico.
