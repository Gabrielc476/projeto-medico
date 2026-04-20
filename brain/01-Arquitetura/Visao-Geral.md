# Visão Geral da Arquitetura

O sistema é dividido em microsserviços orientados a eventos e comunicação gRPC de baixa latência.

## Stack Principal
- **Mobile:** React Native (Expo)
- **Web Admin:** Next.js 15 (App Router)
- **Gateway:** NestJS
- **Motor Diagnóstico:** Python (gRPC)

## Tecnologias Chave
- `#gRPC` para cálculos rápidos síncronos
- `#RabbitMQ` / `#Kafka` para mensageria assíncrona (CDC)
- `#Neo4j` para grafos de doenças
- `#PostgreSQL` para transações financeiras e EHR

Veja também: [[Redes-Bayesianas]], [[Fluxo-de-Triagem]]
