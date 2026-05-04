# Agent Instructions

## Architecture
- **Mobile**: React Native (Expo), SVG interactive body maps
- **Web**: Next.js 15 (App Router), shadcn/ui, Tailwind CSS v4
- **Backend**: NestJS microservices, API Gateway
- **Diagnostics**: Python, Bayesian Networks, TF-IDF
- **Communication**: gRPC (Protocol Buffers)

## Personas
- **@Frontend_Agent**: React Native, Next.js, UI/UX, XState, rendering
- **@Backend_Architect**: Node.js, NestJS, scalability, .proto, Prisma, security
- **@Data_Scientist**: Python, probability, Bayesian math, ranking algorithms

## Package Manager
Use **npm/pnpm** (Node.js) and **uv/poetry** (Python) as applicable per directory.

## Commit Attribution
AI commits MUST include:
```text
Co-Authored-By: Antigravity <noreply@google.com>
```

## Engineering Rules
- **Spec-Driven**: Create Implementation Plan before coding
- **Review**: Await approval before generating code
- **UI Design**: See `DESIGN.md` for Linear-inspired design system
- **Docker First**: All modules (Gateway, Engine, DBs) MUST always run via Docker. See [Execution Guide](file:///c:/projetos/projeto%20medico/projeto-medico/brain/05-Backend-Gateway/05%20-%20Como%20Rodar%20e%20Testar.md) for details. Use `docker-compose up -d`.
- **Knowledge Graph**: Keep the graph updated by running `python -m graphify update .` after significant changes. Use `graphify-out/GRAPH_REPORT.md` to understand system architecture.