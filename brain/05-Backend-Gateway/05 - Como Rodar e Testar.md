# 05 - Como Rodar e Testar

O projeto foi otimizado para rodar via **Docker**, garantindo que todas as dependências (Postgres, Kafka, Motor Python) estejam disponíveis.

## 🚀 Como Rodar (Ambiente Completo)

1. **Certifique-se de estar na raiz do projeto**.
2. **Subir os containers**:
   ```bash
   docker-compose up -d
   ```
3. **Verificar logs**:
   ```bash
   docker-compose logs -f backend-gateway
   ```

O servidor estará disponível em `http://localhost:3000`.

## 🧪 Como Testar

Utilizamos o **Vitest** para todos os tipos de testes.

### 1. Testes Unitários
Testam a lógica de domínio e use cases sem dependências externas.
```bash
docker-compose exec backend-gateway pnpm test
```

### 2. Testes de Integração
Testam a conexão real com o Postgres e gRPC. Devem ser rodados dentro do container.
```bash
docker-compose exec backend-gateway pnpm test:integration
```

### 3. Testes E2E (Em breve)
Testam o fluxo completo das rotas HTTP.
```bash
docker-compose exec backend-gateway pnpm test:e2e
```

## 🛠️ Comandos Úteis do Prisma

Se precisar atualizar o esquema do banco manualmente:
```bash
docker-compose exec backend-gateway npx prisma db push
```

Para abrir o Prisma Studio (Visualizador de dados):
*Nota: Requer exposição de porta no docker-compose.*
```bash
docker-compose exec backend-gateway npx prisma studio
```

## ⚠️ Dica de Troubleshooting
Se as dependências parecerem corrompidas ou o Prisma reclamar de arquivos faltando, force o rebuild do container:
```bash
docker-compose up -d --force-recreate --build backend-gateway
```
