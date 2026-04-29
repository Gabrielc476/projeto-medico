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
### Decisão 004: Remoção Temporária do Kafka e Zookeeper
- **Data:** 2026-04-29
- **Contexto:** Os serviços Kafka e Zookeeper estavam presentes na infraestrutura de containers mas não estavam sendo consumidos por nenhuma funcionalidade implementada no código. Como esses serviços possuem um consumo de memória RAM e CPU considerável, estavam impactando a performance do ambiente de desenvolvimento.
- **Decisão:** Remover os serviços Kafka e Zookeeper do arquivo `docker-compose.yml` e das dependências de boot do `backend-gateway`. A prioridade atual é a estabilização do fluxo síncrono de triagem via gRPC.
- **Consequências:** Ambiente de desenvolvimento significativamente mais leve e rápido para inicializar. A arquitetura orientada a eventos (EDA) permanece nos planos futuros, mas será reintroduzida apenas quando houver necessidade de uso real (ex: telemetria ou notificações assíncronas).
