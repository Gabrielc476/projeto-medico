# 🚀 Zero to Hero Learning Path

Bem-vindo ao Projeto Médico! Siga este roteiro para se tornar produtivo na nossa codebase.

## Parte I: Fundamentos da Stack
O projeto utiliza uma stack poliglota. Se você vem de uma linguagem e não conhece a outra, veja a comparação:

| Conceito | NestJS (TypeScript) | Python (Diagnostic Engine) |
|---|---|---|
| **Injeção de Dependência** | Nativa (@Injectable) | Manual / Injetores Simples |
| **ORM / Data Access** | Prisma | Pydantic / Neo4j Driver |
| **Servidor de API** | Express/Fastify (via Nest) | gRPC (asyncio) |
| **Testes** | Vitest | Pytest |

## Parte II: Navegação na Codebase
- `backend-gateway/`: Onde a lógica de negócio e segurança reside.
- `diagnostic-engine/`: Onde a matemática do diagnóstico acontece.
- `shared/`: Contratos e definições comuns (como arquivos `.proto`).
- `brain/`: Esta wiki e documentação técnica.

## Parte III: Setup do Desenvolvedor
1. **Docker**: Tudo roda via `docker-compose up -d`.
2. **Migrations**: `pnpm prisma db push` para sincronizar o banco.
3. **Logs**: `docker-compose logs -f` é seu melhor amigo.

## Parte IV: Primeiro Desafio
Tente adicionar um novo sintoma ao dicionário:
1. Localize `diagnostic.proto` em `shared/proto/`.
2. Adicione o sintoma no dicionário JSON da Engine.
3. Rode `python -m graphify update .` para ver a mudança refletida no grafo.

---
### Glossário de Termos
- **CUI**: Concept Unique Identifier (Código UMLS para sintomas).
- **Noisy-OR**: Modelo probabilístico usado para combinar evidências de sintomas.
- **Triagem**: O processo de coleta inicial de dados do paciente.
