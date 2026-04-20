# Sistema de Apoio à Decisão Clínica (CDSS) - Triage Médica Inteligente

Um ecossistema avançado de triagem e rankeamento de sintomas médicos. O sistema possui uma arquitetura de diagnóstico dividida em 3 pilares: **Exames, Contextualização e Sintomas**. Ele utiliza **Inteligência Artificial Generativa (LLMs)** de forma segura e encapsulada para extração estruturada de contexto de vida (histórico, rotina), mitigando o risco de "alucinações algorítmicas". O cálculo final do diagnóstico nunca é isolado em LLMs, mas baseia-se em **Redes Bayesianas**, **Cálculo de Probabilidade (Teorema de Bayes)**, **Processamento de Linguagem Natural (NLP com TF-IDF)** e uma arquitetura unificada de grafos para cruzar sintomas de pacientes com taxonomias médicas globais (UMLS, SNOMED CT, HPO).

## 🌟 Principais Funcionalidades

- **Mapeamento Anatômico Interativo:** Interface móvel com avatares topográficos do corpo em SVG (React Native) para seleção visual de dores e sintomas.
- **Rankeamento de Condições Médicas:** Utilização de Razões de Verossimilhança (Likelihood Ratios - LR+ e LR-) e Redes Bayesianas para atualizar probabilidades pós-teste em tempo real.
- **Processamento Deterministíco de NLP:** Extração precisa de Entidades Médicas (NER) utilizando `scispaCy`, mapeando queixas de texto livre em Identificadores Únicos de Conceito (CUIs).
- **Máquina de Estados de Triagem:** Questionários dinâmicos gerenciados rigidamente por `XState` para evitar fluxos incorretos.
- **Painel Clínico de Alta Performance:** Dashboard médico para revisão de laudos e auditoria com Next.js 15, Shadcn UI e renderização avançada com Recharts e TanStack Table.
- **Comunicação Híbrida e Alta Disponibilidade:** Orquestração de microserviços com NestJS utilizando gRPC para cálculos instantâneos e RabbitMQ para processamento em background (CQRS).
- **Persistência Poliglota:** PostgreSQL como fonte da verdade transacional (ACID/EHR) perfeitamente sincronizado com um Grafo de Conhecimento em Neo4j via Apache Kafka (CDC).
- **Segurança de Nível Hospitalar (Zero Trust):** Tunelamento mTLS entre serviços (gRPC), logs de auditoria imutáveis e conformidade estrutural com LGPD/HIPAA.

---

## 🛠️ Tech Stack

### Frontend & Mobile (@Frontend_Agent)
- **Mobile:** React Native (Expo), React Native Body Highlighter, XState
- **Web (Painel Médico):** Next.js 15 (App Router), React Server Components
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix UI
- **Visualização de Dados:** TanStack Table v8, Recharts 3

### Orquestração & API Gateway (@Backend_Architect)
- **Framework:** NestJS (Node.js/TypeScript)
- **Comunicação Síncrona:** gRPC (Protocol Buffers sobre HTTP/2)
- **Mensageria Assíncrona:** RabbitMQ (AMQP)
- **Autenticação:** JWT, Proxy Centralizado de Acesso (RBAC/ABAC), mTLS intracliuster

### Dados & Infraestrutura (@Backend_Architect)
- **Relacional (EHR/Transações):** PostgreSQL
- **Grafos (Relacionamentos Médicos):** Neo4j (Labeled Property Graph)
- **Sincronização (CDC):** Apache Kafka & Debezium

### Inteligência Artificial & Diagnóstico (@Data_Scientist)
- **Linguagem:** Python
- **LLM (Extração de Contexto):** OpenAI/Anthropic APIs, LangChain/LlamaIndex
- **NLP:** scispaCy, spaCy
- **Modelagem Bayesiana:** pgmpy
- **Matemática Vetorial:** scikit-learn (TF-IDF, Similaridade de Cosseno, Jaccard Enriquecido)

---

## 🏗️ Arquitetura do Sistema

O sistema foi arquitetado para suportar escalabilidade massiva sem perder a exatidão clínica.

### 1. Fluxo de Decisão e Triagem (App Mobile)
1. Paciente interage com o **React Native App**.
2. A jornada passa por 3 etapas sequenciais gerenciadas pelo **XState**: 
   - *Coleta de Exames (Opcional)*
   - *Contextualização de Vida via Texto Livre (Opcional)* 
   - *Mapeamento de Sintomas (Obrigatório)*. Um alerta UI educa o paciente de que omitir as etapas opcionais reduz a precisão final.
3. O App emite a requisição completa via API Gateway (**NestJS**).

### 2. Inferência Bayesiana e LLMs (Microserviço Python)
1. O NestJS serializa os sintomas e contexto usando **Protobuf** e chama o serviço Python via **gRPC**.
2. Um **LLM** especializado atua como extrator, transformando a "Contextualização" de texto livre em entidades estruturadas (fatores de risco) para calcular "Probabilidades a Priori" (Priors) mais refinadas.
3. No Python, o **scispaCy** valida e normaliza os termos de sintomas contra a base UMLS.
4. O algoritmo calcula a penalidade *TF-IDF* e propaga as evidências combinadas no Grafo Direcionado (DAG) da **Rede Bayesiana**.
5. Vetores de probabilidade pós-teste e as *Razões de Verossimilhança* são devolvidos em milissegundos para o gateway.

### 3. Persistência e Grafos de Conhecimento
1. Interações estruturais críticas, dados de faturamento e auditoria são persistidos no **PostgreSQL** (Garantia ACID).
2. O **Debezium** escuta o WAL (Write-Ahead Logging) do banco e envia as transações pelo **Apache Kafka**.
3. Um conector (Sink) absorve os eventos e injeta as relações e os sub-grafos instantaneamente no **Neo4j** para análises topológicas de doenças e tratamentos de altíssima performance.

---

## 🚦 Pré-requisitos

Certifique-se de ter as ferramentas instaladas no seu ambiente de desenvolvimento:

- Node.js >= 20.0.0
- Python >= 3.11 com `uv` ou `poetry` instalados
- Docker & Docker Compose (Para rodar Postgres, Neo4j, RabbitMQ e Kafka)
- Expo CLI

---

## 🚀 Getting Started (Ambiente de Desenvolvimento)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/projeto-medico.git
cd projeto-medico
```

### 2. Subir a Infraestrutura (Bancos e Mensageria)

Utilize o Docker Compose para levantar todos os bancos de dados e serviços auxiliares:

```bash
docker-compose up -d
```
*(Os containers de PostgreSQL, Neo4j, RabbitMQ, Kafka e Zookeeper ficarão disponíveis em background).*

### 3. Configurar o Backend Node.js (NestJS)

```bash
cd backend-gateway
npm install # ou pnpm install
cp .env.example .env
npm run start:dev
```

### 4. Configurar o Motor de IA (Python)

```bash
cd diagnostic-engine
uv venv
source .venv/bin/activate # ou .venv\Scripts\activate no Windows
uv pip install -r requirements.txt
python src/main.py
```

### 5. Configurar o Painel Clínico Web (Next.js)

```bash
cd web-admin
npm install # ou pnpm install
cp .env.example .env.local
npm run dev
```

### 6. Iniciar o Aplicativo Mobile (Expo)

```bash
cd mobile-app
npm install
npx expo start
```

---

## 🔐 Segurança e Conformidade

A plataforma foi desenhada seguindo o princípio **Security by Design** (LGPD / HIPAA):
- **Zero Trust Architecture:** mTLS exigido entre a comunicação do Node.js e Python.
- **Audit Logging Imutável:** Todas as ações médicas rodam através de interceptors que despejam rastros em storages auditáveis.
- **Field-Level Encryption:** Dados extremamente sensíveis ou identificadores (PHI) são encriptados na serialização do payload antes de trafegar na rede assíncrona.

---

## 🎨 Design System

Consulte estritamente o arquivo `DESIGN.md` na raiz do projeto antes de efetuar alterações de UI. Toda a aplicação é estritamente aderente ao padrão Linear-inspired, dark-mode-first com espaçamentos padronizados e a tipografia `Inter`.

---

## 🤖 Regras para Agentes Autônomos de IA
Este projeto é assistido pelo Antigravity e outros agentes. Todas as contribuições de código realizadas pelos agentes devem incluir no commit:
```text
Co-Authored-By: Antigravity <noreply@google.com>
```
**Regras Críticas:**
- Construir e validar sempre através de *Implementation Plans* antes do desenvolvimento.
- Respeitar estritamente o papel das personas listadas (`@Frontend_Agent`, `@Backend_Architect`, `@Data_Scientist`).

---
