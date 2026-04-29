# 04 - Integração gRPC e Microserviços

O Backend Gateway se comunica com o **Diagnostic Engine (Python)** via **gRPC**. Esta escolha foi feita para garantir baixa latência e tipagem forte entre os serviços.

## 📡 Cliente gRPC (`DiagnosticGrpcClient`)

Implementamos o cliente usando o módulo `@nestjs/microservices`. 

### Padrão de Injeção:
Utilizamos o `ClientsModule.registerAsync` no `GrpcModule`. Isso permite que o cliente seja injetado via construtor, facilitando testes e mock.

```typescript
constructor(@Inject('DIAGNOSTIC_PACKAGE') private readonly client: ClientGrpc) {}
```

## 📜 Arquivos Proto

As definições de serviço estão localizadas na pasta `shared/proto/`.
- O arquivo principal é o `diagnostic.proto`.
- No Docker, a pasta `shared` é mapeada no container para garantir que tanto o Python quanto o NestJS leiam a mesma "Fonte da Verdade".

## 🛣️ Resolução de Caminhos

Um desafio técnico foi a resolução do `protoPath`. Decidimos usar `process.cwd()` em vez de caminhos relativos complexos, garantindo que o arquivo seja encontrado independentemente de estarmos rodando o servidor ou os testes de integração.

```typescript
protoPath: join(process.cwd(), 'shared/proto/diagnostic.proto')
```

## 🔄 Resiliência

- **Timeout**: As chamadas para o motor Python possuem um timeout configurado, especialmente crítico quando o motor utiliza LLMs externos (como Gemini), que podem demorar para responder.
- **Observables**: A integração usa `rxjs`, permitindo manipulação reativa dos fluxos de dados retornados pelo gRPC.

## ?? Integra��o com Kafka (Pipeline de Dados)

Al�m do gRPC, o sistema utiliza o **Kafka** para o pipeline de ingest�o de dados:
- **Scripts de Enriquecimento**: O script enrich_knowledge_base.py atua como um Producer, enviando novos dados m�dicos para t�picos como medical.knowledge.diseases.
- **Arquitetura Event-Driven**: Esta abordagem permite que a base de conhecimento (Neo4j) seja alimentada de forma ass�ncrona, sem impactar a performance das consultas de triagem em tempo real.
