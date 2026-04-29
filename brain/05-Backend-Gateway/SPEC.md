# Specification: NestJS Medical Gateway (backend-gateway)

**Status:** Approved
**Created:** 2026-04-28
**Type:** Feature / Core Infrastructure

## 1. Summary
Este componente atua como o ponto central de entrada (API Gateway) para o Sistema de Apoio à Decisão Clínica (CDSS). Ele orquestra a comunicação entre os aplicativos clientes (Mobile/Web) e o motor de inferência bayesiana (Python), gerenciando sessões de triagem, extração multimodal de dados e tradução semântica de sintomas.

## 2. Context
O sistema atual possui um motor Python (`diagnostic-engine`) que realiza cálculos complexos. Precisamos de um gateway robusto em NestJS que siga a **Clean Architecture** para garantir escalabilidade, segurança (Zero Trust) e uma experiência de usuário (UX) fluida através de termos leigos mapeados dinamicamente via LLM.

## 3. User Story
As a **Patient**, I want to **describe my symptoms and provide medical context (text/exams)** so that **I can receive an accurate, data-driven diagnostic ranking** with terminology I understand.

## 4. Acceptance Criteria
- [ ] **Shared Contracts:** Contrato gRPC centralizado em `shared/proto/` e consumido por ambos os serviços.
- [ ] **Standardized Stack:** NestJS v10+, TypeScript estrito, Biome para linting e Pnpm para gerenciamento.
- [ ] **Pure Domain:** Camada `domain/` sem dependências externas, contendo as entidades `TriageSession` (Aggregate Root), `Patient` e os Value Objects de sintomas e resultados.
- [ ] **Persistence:** Implementação de repositórios via **Prisma ORM** conectando ao banco de dados Postgres para persistência de sessões e histórico de pacientes.
- [ ] **Symptom Dictionary:** RPC `GetAppSymptoms` integrado com cache **In-memory** no Gateway para tradução de Layman Terms (Gemma 4).
- [ ] **Multimodal Pipeline:** Suporte a envio de texto livre (`ExtractContext`) e arquivos PDF (`ExtractExam`) como insumos para o motor.
- [ ] **Dockerized Environment:** Gateway rodando em container Docker, orquestrado no mesmo `docker-compose.yml` que os demais serviços.

## 5. Technical Constraints
- **Architecture:** Strict Clean Architecture (Presentation -> Application -> Domain <- Infrastructure).
- **Security:** mTLS para gRPC e JWT para clientes externos.
- **Performance:** Caching agressivo do dicionário de sintomas para minimizar latência de LLM.
- **Linting:** Estratégia Híbrida (Biome para DX, tsc para verdade final).

## 6. Out of Scope
- Implementação da lógica matemática bayesiana (pertence ao motor Python).
- Interface visual do App Mobile (será tratada em outro track).
- Persistência definitiva de exames em Cloud Storage (nesta fase, apenas buffer/bytes).

---
*Generated following Spec-Driven Design skills.*
