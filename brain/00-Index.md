# 🧠 Segundo Cérebro: Sistema de Apoio à Decisão Clínica (CDSS)

Bem-vindo ao Vault do projeto médico. Este espaço serve como a memória de trabalho e documentação viva da arquitetura, algoritmos e log de decisões.

## 🗺️ Mapa de Conteúdo (MOC)

### 🏗️ Arquitetura e Engenharia
- [[Visao-Geral]] - Arquitetura, Tech Stack e Microsserviços
- [[Padrao-de-Banco-de-Dados]] - Persistência Híbrida (Neo4j + PostgreSQL)

### 🐍 Motor de Diagnóstico (Python)
- [[00 — Mapa Geral]] - ==Comece por aqui== — Índice e glossário do motor
- [[01 — Visão Geral da Arquitetura]] - Estrutura de pastas e fluxo de requisição
- [[02 — Modelos de Dados (Pydantic)]] - Disease, Symptom, Link com LR+/LR-
- [[03 — Base de Conhecimento]] - JSON seed (12 doenças, 30 sintomas, 55 links)
- [[04 — Matemática Bayesiana]] - Log-Odds, Noisy-OR, Likelihood Ratios
- [[05 — TF-IDF e Espaço Vetorial]] - Rankeamento por similaridade vetorial
- [[06 — NLP com scispaCy]] - Extração de entidades médicas (NER)
- [[07 — gRPC e Comunicação]] - Protobuf, servidor async, RPCs
- [[08 — Como Rodar e Testar]] - Setup, comandos e troubleshooting

### 🤖 Inteligência Artificial e Algoritmos
- [[Redes-Bayesianas]] - Fundamentos matemáticos do diagnóstico
- [[Fluxo-de-Triagem]] - Máquinas de Estado e pilares de anamnese

### 📅 Diário e Log de Decisões
- [[Log-de-Decisoes]] - Registro cronológico de decisões arquiteturais importantes

---

## 📊 Progresso Geral

| Módulo | Status | Testes |
|--------|--------|--------|
| 🐍 Motor Python — Algoritmos | ✅ Completo | 67/67 |
| 🐍 Motor Python — gRPC | ✅ Completo | 12/12 |
| 🐍 Motor Python — NLP | ⚠️ 80% (falta negação) | 1/1 |
| 🔀 NestJS Gateway | ❌ Não iniciado | — |
| 📱 React Native App | ❌ Não iniciado | — |
| 🖥️ Next.js Admin | ❌ Não iniciado | — |
| 🐳 Docker / Infra | ❌ Não iniciado | — |

---
*Dica: No Obsidian, use `Ctrl+O` para abrir arquivos e `Ctrl+Shift+F` para buscar em todo o cofre.*
