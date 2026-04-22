---
title: Como Rodar e Testar
tags:
  - diagnostic-engine
  - testes
  - comandos
---

# ▶️ Como Rodar e Testar

> [!abstract] Em uma frase
> Todos os comandos práticos para instalar, rodar e testar o motor de diagnóstico.

---

## 🔧 Setup Inicial (Local)

```bash
cd diagnostic-engine

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate

# Instalar dependências
pip install -e ".[dev]"

# Compilar o protobuf
python scripts/compile_proto.py
```

---

## 🔑 Configuração de API (LLM)

Para rodar a extração semântica com o **Gemma 4 31B**:

1. Crie um arquivo `.env` em `diagnostic-engine/.env`.
2. Adicione sua chave: `GEMINI_API_KEY=sua_chave`.

---

## 🧪 Rodar os Testes

```bash
# Todos os testes
python -m pytest tests/ -v
```

| Arquivo de Teste | O que testa | Qtd |
|-----------------|------------|-----|
| `test_models.py` | Validação Pydantic | 19 |
| `test_knowledge_base.py` | Carregamento JSON/KB | 20 |
| `test_ranking_integration.py` | Ranking Bayesiano + TF-IDF | 13 |
| `test_grpc_service.py` | RPCs End-to-End | 12 |
| **Total** | | **68** ✅ |

---

## 🏥 Simulação Clínica End-to-End

Script que testa o pipeline completo (Texto ➡️ Diagnóstico):

```bash
python scripts/simulate_case.py
```

---

## 🐳 Rodando com Docker

Se você prefere rodar o motor em um container (com **Hot Reload**):

```bash
# Na raiz do projeto
docker-compose up --build
```

Para mais detalhes sobre Docker, veja [[09 — Docker e Infraestrutura]].

---

Anterior: [[07 — gRPC e Comunicação]] | Próximo: [[09 — Docker e Infraestrutura]]
