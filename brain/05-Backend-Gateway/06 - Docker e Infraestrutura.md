# 06 - Docker e Infraestrutura

A infraestrutura foi desenhada para ser agnóstica ao sistema operacional do desenvolvedor, isolando as dependências do Node.js e Prisma dentro do container.

## 🐳 Dockerfile

O Dockerfile do `backend-gateway` utiliza:
- **Base**: `node:20-slim` (Leve e estável).
- **Gerenciador**: `pnpm` (Rápido e eficiente com espaço em disco).
- **Ferramentas**: `openssl` (Necessário para o Prisma Engine).

## 🏗️ Docker Compose (Destaques)

### 1. Isolamento de `node_modules`
Para evitar conflitos entre o Windows e o Linux (container), usamos um volume anônimo:
```yaml
volumes:
  - ./backend-gateway:/app
  - /app/node_modules # Volume anônimo: Mantém as libs instaladas no container
```

### 2. Rede Unificada
Todos os serviços pertencem à `medical-network`, permitindo que se comuniquem usando nomes de serviço como hostnames:
- `postgres-medical`
- `diagnostic-engine`
- `kafka`
- `debezium`
- `kafka-ui`

### 3. Ordem de Inicialização
O `backend-gateway` aguarda (`depends_on`) o banco de dados e o motor de diagnóstico, garantindo que as conexões não falhem no boot inicial.

## 📁 Sincronização de Código
Usamos o mapeamento de volume `./backend-gateway:/app` junto com o comando `nest start --watch`. Isso permite que qualquer alteração feita no seu VS Code (Host) seja refletida instantaneamente dentro do container, disparando o hot-reload.

## 🔐 Variáveis de Ambiente
As variáveis críticas (como `DATABASE_URL` e `DIAGNOSTIC_ENGINE_URL`) são injetadas via Docker Compose, permitindo fácil troca de ambiente (dev/prod) sem alterar o código-fonte.

## ?? Mensageria e CDC (Kafka)

A infraestrutura inclui suporte nativo para Change Data Capture (CDC):
- **Kafka & Zookeeper**: Broker de mensagens para eventos de dom�nio.
- **Debezium**: Conector que monitora o banco PostgreSQL e envia transa��es para o Kafka em tempo real.
- **Kafka UI**: Dispon�vel em http://localhost:8080 para monitoramento visual dos t�picos.

O banco PostgreSQL � configurado automaticamente com wal_level=logical para permitir a sincroniza��o via Debezium.
