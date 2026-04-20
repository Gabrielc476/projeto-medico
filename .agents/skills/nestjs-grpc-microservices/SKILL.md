---
name: nestjs-grpc-microservices
description: Comprehensive guidance for building scalable, maintainable, and production-ready Node.js backend applications with modern frameworks, architectural patterns, and gRPC.
---

# Microsserviços NestJS & gRPC

## Quando usar esta habilidade
- Criação e atualização de contratos Protobuf (`.proto`).
- Implementação de comunicação interna rápida entre o Gateway NestJS e o Motor Python.

## Instruções
- **Clean Architecture:** Siga estritamente a Clean Architecture. Divida as pastas em `domain` (entidades de negócio), `application` (use cases), `infrastructure` (Prisma, gRPC clients) e `presentation` (gRPC controllers). A camada de domínio nunca deve conhecer as camadas externas.
- **Contratos Protobuf:** Defina serviços, parâmetros e tipos de retorno em arquivos `.proto`. Esta é a fonte universal da verdade para a comunicação entre serviços.
- **Implementação NestJS:** Use `@nestjs/microservices` configurando o transportador com `Transport.GRPC`. Injete serviços usando o decorator `@Injectable()` e mantenha os controllers (ou métodos gRPC) magros.
- **Segurança RPC:** Valide tokens JWT e force controles de acesso no nível do RPC por meio de interceptadores (interceptors), antes que dados confidenciais sejam transmitidos.
