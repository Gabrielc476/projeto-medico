# 🏛️ Projeto Médico - Hub de Documentação

Bem-vindo ao centro de conhecimento do Projeto Médico. Esta documentação foi organizada para fornecer desde uma visão de alto nível até detalhes técnicos profundos.

## 🚀 Início Rápido
- **[Zero to Hero Learning Path](file:///c:/projetos/projeto%20medico/projeto-medico/brain/ONBOARDING_LEARNING_PATH.md)**: Se você é novo no projeto, comece por aqui.
- **[Principal-Level Architecture Guide](file:///c:/projetos/projeto%20medico/projeto-medico/brain/ARCH_PRINCIPAL_GUIDE.md)**: Para uma visão técnica profunda dos padrões e decisões de design.

## 🧩 Componentes do Sistema
- **[Backend Gateway (NestJS)](file:///c:/projetos/projeto%20medico/projeto-medico/brain/wiki/gateway_overview.md)**: Porta de entrada da aplicação, segurança e orquestração.
- **[Diagnostic Engine (Python)](file:///c:/projetos/projeto%20medico/projeto-medico/brain/wiki/engine_overview.md)**: O coração inteligente do sistema, processando sintomas via modelos bayesianos.
- **[Infraestrutura de Dados](file:///c:/projetos/projeto%20medico/projeto-medico/brain/wiki/infrastructure_data.md)**: Detalhes sobre Postgres (Triagens) e Neo4j (Conhecimento Médico).

## 📊 Grafo de Conhecimento (Graphify)
- **[Mapa Interativo da Codebase](file:///c:/projetos/projeto%20medico/projeto-medico/graphify-out/graph.html)** (Abra no navegador)
- **[Relatório de Auditoria do Grafo](file:///c:/projetos/projeto%20medico/projeto-medico/graphify-out/GRAPH_REPORT.md)**
- **[Wiki Gerada Automaticamente](file:///c:/projetos/projeto%20medico/projeto-medico/brain/wiki/index.md)**: Exploração baseada em comunidades de código.

## 🏆 Milestones
- ✅ **Task 1**: Diagnostic Engine (PGM + LLM)
- ✅ **Task 2**: Zero-Trust Security (mTLS) & Audit Logging
- ⏳ **Task 3**: Real-time Sync CDC (Debezium + Neo4j)


---
> [!TIP]
> Para manter esta wiki atualizada, utilize o comando `python -m graphify update .` após mudanças significativas no código.
