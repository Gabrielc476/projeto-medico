---
name: hybrid-database-neo4j
description: Arquitetura de dados híbrida e mensageria CDC. Integração de PostgreSQL para transações ACID com Neo4j para mapeamento gráfico de sintomas, usando RabbitMQ/Kafka.
---

# Persistência Híbrida e Mensageria

## Quando usar esta habilidade
- Modelagem de bancos de dados, integrações de microsserviços, ou sincronização de dados via eventos.

## Instruções
- **Fonte da Verdade Transacional (PostgreSQL):** Dados financeiros, cadastros de pacientes (EHR) e logs de auditoria exigem conformidade ACID. Devem residir no PostgreSQL.
- **Motor de Relações Médicas (Neo4j):** A rede intrincada de relacionamentos entre doenças, sintomas e fatores de risco usa Labeled Property Graph (LPG). Ideal para cálculos rápidos de grafos patológicos.
- **Mensageria e Sincronização (CDC):** Não atualize ambas as bases de dados sincronicamente na thread principal. Empregue um padrão Change Data Capture (Kafka/Debezium ou RabbitMQ) para injetar eventos do Postgres no Neo4j de forma assíncrona, tolerante a falhas e escalável.
- **Isolamento de Domínio:** Os microsserviços não devem compartilhar bancos de dados de forma direta. A comunicação se dá por gRPC (para inferências rápidas sincrônicas) ou RabbitMQ (assíncronas).
