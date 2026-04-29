# 01 - Visão Geral da Arquitetura

O Backend Gateway foi construído seguindo os princípios da **Clean Architecture** (Arquitetura Limpa) e **Hexagonal Architecture**. O objetivo principal é manter o "Coração" do sistema (Domínio e Casos de Uso) isolado de detalhes técnicos como o Banco de Dados e gRPC.

## 🏗️ Camadas do Sistema

### 1. Domain (Núcleo)
- Localização: `src/domain/`
- É a camada mais interna. Não depende de nenhuma outra pasta.
- **Entidades**: Representam os conceitos de negócio (ex: `TriageSession`).
- **Ports**: Interfaces que definem o que o sistema precisa do mundo externo (ex: `ITriageRepository`).

### 2. Application (Casos de Uso)
- Localização: `src/application/`
- Depende apenas do **Domain**.
- Contém os Use Cases que orquestram a lógica. Ex: "Para iniciar uma triagem, crie a entidade e salve no repositório".

### 3. Infrastructure (Adaptadores)
- Localização: `src/infrastructure/`
- Implementa as interfaces (Ports) do domínio.
- Aqui fica o código específico do **Prisma**, **gRPC**, **Kafka**, etc.
- Se mudarmos de Prisma para TypeORM, apenas esta camada muda.

### 4. Presentation (Interface)
- Localização: `src/presentation/`
- Responsável por expor a funcionalidade (Controllers HTTP).

## 💉 Injeção de Dependência

Utilizamos o container de IoC nativo do **NestJS**.
- As interfaces de domínio são usadas como tokens de injeção.
- No `InfrastructureModule`, vinculamos as implementações reais (ex: `PrismaTriageRepository`) às interfaces.

## 📦 Gestão de Módulos

O projeto é modularizado para facilitar a manutenção:
- `DatabaseModule`: Encapsula o Prisma e repositórios.
- `GrpcModule`: Encapsula a complexidade dos clientes gRPC.
- `InfrastructureModule`: Agrega todos os adaptadores externos.
- `ApplicationModule`: Registra os Casos de Uso.
- `AppModule`: O módulo raiz que orquestra tudo.

## 🛡️ Princípios Aplicados

- **S.O.L.I.D.**: Especialmente o *Dependency Inversion* (DIP).
- **ESM Nativo**: O projeto utiliza módulos ECMAScript para performance e compatibilidade com ferramentas modernas.
- **Strict Typing**: TypeScript configurado em modo estrito para evitar erros de runtime.
