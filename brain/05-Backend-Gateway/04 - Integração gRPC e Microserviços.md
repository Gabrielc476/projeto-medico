# 04 - Integração gRPC e Microserviços

O Backend Gateway se comunica com o **Diagnostic Engine (Python)** via **gRPC** e com o ecossistema de dados via **Kafka** (Mensageria e CDC).

## ??? Cliente gRPC (DiagnosticGrpcClient)

Implementamos o cliente usando o módulo @nestjs/microservices.

### Padrão de Injeção:
Utilizamos o ClientsModule.registerAsync no GrpcModule. Isso permite que o cliente seja injetado via construtor.

## ?? Mensageria e Eventos (Kafka)

O Gateway utiliza o **Kafka** para comunicação assíncrona e persistência em grafos:

### 1. Change Data Capture (CDC)
Utilizamos o **Debezium** para monitorar o banco PostgreSQL. Toda vez que uma sessão de triagem é atualizada ou criada, o Debezium captura a mudança e a publica em um tópico Kafka automaticamente. Isso alimenta o **Neo4j** para análises de grafos sem onerar a API.

### 2. Domain Events
O Gateway publica eventos manuais via KafkaService, como o evento 	riage.completed. Este evento contém o payload completo do diagnóstico para ser consumido por serviços de auditoria e notificações.

## ?? Arquivos Proto

As definições de serviço estão localizadas na pasta shared/proto/.
- O arquivo principal é o diagnostic.proto.
- No Docker, a pasta shared é mapeada no container para garantir que tanto o Python quanto o NestJS leiam a mesma 'Fonte da Verdade'.
