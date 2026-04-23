"""Script de teste end-to-end para o Motor de Diagnóstico via gRPC.

Este script simula um caso clínico completo enviando uma requisição para o microserviço Python,
seguindo a lógica de simulação do script simulate_case.py.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import grpc

# Adicionar o diretório de arquivos gerados ao path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src" / "api_grpc" / "generated"))

import diagnostic_pb2
import diagnostic_pb2_grpc


def run_test():
    # 1. Configuração do canal gRPC
    # Como o script rodará dentro do container, usamos localhost:50051
    # Se rodar fora, pode ser necessário mudar para o IP do docker ou localhost se mapeado
    channel = grpc.insecure_channel("localhost:50051")
    stub = diagnostic_pb2_grpc.DiagnosticServiceStub(channel)

    print("=" * 70)
    print("🏥  TESTE DE INTEGRAÇÃO — Diagnostic Engine (gRPC)")
    print("=" * 70)

    # ── PASSO 1: Extração de Contexto ──────────────────────────────
    # Texto solicitado pelo usuário (Garganta Inflamada + Contexto)
    input_text = (
        "Paciente apresenta dor de garganta intensa, febre alta de 39 graus "
        "e dificuldade para engolir há dois dias. Relata ter tido contato com "
        "outras pessoas doentes no trabalho recentemente."
    )

    print(f"\n📝 Texto de Entrada:\n   \"{input_text}\"")
    print("\n─" * 70)
    print("🤖 Chamando RPC: ExtractContext...")
    
    try:
        extract_req = diagnostic_pb2.ContextExtractionRequest(free_text=input_text)
        extract_resp = stub.ExtractContext(extract_req)

        print(f"✅ Recebidos {len(extract_resp.features)} recursos extraídos:")
        for f in extract_resp.features:
            status = "Presente" if f.is_present else "Negado"
            print(f"   - [{f.cui}] {f.name} ({status})")

        # ── PASSO 2: Avaliação de Sintomas ───────────────────────────
        print("\n─" * 70)
        print("🧮 Chamando RPC: AssessSymptoms...")

        # Construir fatores contextuais (metadata solicitada pelo usuário)
        # Em um sistema real, isso viria da extração ou de campos de formulário
        contextual_factors = [
            diagnostic_pb2.ExtractedFeature(cui="C0001779", name="Adult Patient", is_present=True),
            diagnostic_pb2.ExtractedFeature(cui="C0332157", name="Exposure to infected person", is_present=True),
            diagnostic_pb2.ExtractedFeature(cui="C0439227", name="Duration 2 days", is_present=True)
        ]

        assess_req = diagnostic_pb2.SymptomAssessmentRequest(
            symptoms=extract_resp.features,
            contextual_factors=contextual_factors
        )

        assess_resp = stub.AssessSymptoms(assess_req)

        print(f"✅ Diagnóstico Diferencial (Ranked {len(assess_resp.ranked_diseases)} conditions):")
        print(f"\n   {'#':<4} {'Doença':<35} {'Probabilidade':>15} {'TF-IDF':>10}")
        print(f"   {'─'*4} {'─'*35} {'─'*15} {'─'*10}")

        for i, disease in enumerate(assess_resp.ranked_diseases[:10], 1):
            print(
                f"   {i:<4} {disease.disease_name[:35]:<35} "
                f"{disease.posterior_probability:>14.4%} {disease.tf_idf_score:>10.4f}"
            )

        if not assess_resp.ranked_diseases:
            print("   ⚠️  Nenhuma condição encontrada para os sintomas fornecidos.")

    except grpc.RpcError as e:
        print(f"\n❌ Erro gRPC: {e.code()} - {e.details()}")
    except Exception as e:
        print(f"\n❌ Erro Inesperado: {type(e)} - {e}")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    run_test()
