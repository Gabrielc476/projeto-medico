# 03 - Persistência com Prisma 7

A camada de persistência utiliza o **Prisma 7**, que introduziu mudanças drásticas na forma como se comunica com o banco de dados dentro de containers Docker.

## 🔄 A Mudança para Driver Adapters

No Prisma 7, o motor Rust padrão (Query Engine) foi descontinuado em favor dos **Driver Adapters**. Isso resolveu problemas crônicos de compatibilidade de binários em ambientes Linux/Docker rodando em hosts Windows.

### Configuração Crítica (`PrismaService`):
Em vez de deixar o Prisma gerenciar a conexão via `DATABASE_URL` no `schema.prisma`, agora injetamos um driver nativo do Node.js:

```typescript
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

## 📂 Repositórios (Implementação)

O `PrismaTriageRepository` implementa a interface `ITriageRepository` do domínio.
- **Mapping**: Converte o modelo do Prisma (Data Object) para a Entidade de Domínio e vice-versa. Isso evita que o vazamento do esquema do banco de dados para a lógica de negócio.

## 🛠️ Schema Prisma

- **Localização**: `backend-gateway/prisma/schema.prisma`
- **Geração**: O cliente é gerado no `node_modules` para evitar problemas de caminho relativo em containers.
- **Provider**: PostgreSQL.

## ⚠️ Dificuldades e Decisões

1. **Erro `Unknown property datasources`**: No Prisma 7, ao usar adaptadores, a propriedade `datasources` não pode ser passada no construtor. A conexão deve ser feita estritamente via adaptador.
2. **Sincronização de Tipos**: Como o Prisma 7 é muito recente, utilizamos `as any` em partes específicas da inicialização do adaptador para contornar restrições temporárias de tipagem enquanto o ecossistema se estabiliza.
