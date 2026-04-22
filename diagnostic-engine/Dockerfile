# ── STAGE 1: Builder ──────────────────────────────────────────
FROM python:3.11-slim as builder

# Instalar dependências de build do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copiar apenas arquivos de dependências para aproveitar cache do Docker
COPY pyproject.toml .
RUN pip install --upgrade pip
RUN pip install .

# Pré-download do modelo scispaCy (evita download no runtime)
RUN python -m spacy download en_core_sci_sm

# ── STAGE 2: Runtime ──────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Copiar as bibliotecas instaladas do builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar o código fonte e dados
COPY . .

# Variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DIAGNOSTIC_PORT=50051

# Expor porta gRPC
EXPOSE 50051

# O comando padrão será o start do servidor
# Em desenvolvimento (docker-compose), este comando será sobrescrito pelo watcher
CMD ["python", "src/main.py"]
