"""Simulação clínica end-to-end com integração LLM.

Este script demonstra o pipeline completo:
1. Extração de texto livre via Gemma 4 31B (Structured Output)
2. Resolução de CUIs na Knowledge Base
3. Cálculo Bayesiano (Probabilidades Posteriores)
4. Similaridade TF-IDF

Usage:
    python scripts/simulate_case.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Force UTF-8 on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data.knowledge_base import MedicalKnowledgeBase
from src.math.bayesian_network import DiseaseDiagnosticNetwork
from src.math.vector_space import SymptomVectorizer
from src.nlp.extractor import ClinicalExtractor


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent

    # ── Input do Paciente ────────────────────────────────────────
    clinical_text = (
        "estou com dor de garganta e rouquidão, faz 2 dias, "
        "eu tomei chuva nesse periodo, a dor foi aliviada com nimesulida. "
        "Não tenho febre nem tosse."
    )

    print("=" * 70)
    print("🏥  SIMULAÇÃO CLÍNICA — Motor de Diagnóstico (LLM-Powered)")
    print("=" * 70)
    print()
    print(f"📝 Queixa do paciente:")
    print(f'   "{clinical_text}"')
    print()

    # ── 1. Extração via LLM (Gemma 4 31B) ─────────────────────────
    print("─" * 70)
    print("🤖 ETAPA 1: Extração Semântica (LLM)")
    print("─" * 70)

    kb = MedicalKnowledgeBase()
    # Preparar hints de sintomas para a LLM (melhora a acurácia de mapeamento CUI)
    known_symptoms = [
        {"cui": s.cui, "name": s.name} for s in kb.get_all_symptoms()
    ]

    extractor = ClinicalExtractor()
    
    # Extrair sintomas e contexto do texto livre
    extracted_features = extractor.extract_features(clinical_text, known_symptoms)

    for f in extracted_features:
        status = "✅ PRESENTE" if f["is_present"] else "❌ NEGADO"
        conf = f.get("confidence", 1.0)
        print(f"   {status:11} | {f['name']:20} | CUI: {f['cui']} | conf: {conf:.2f}")

    if not extracted_features:
        print("   ⚠️  Nenhum sintoma extraído do texto.")

    patient_cuis = [f["cui"] for f in extracted_features if f["is_present"]]
    print()
    
    # ── 1.5. Extração de Exame via LLM (Gemma 4 31B) ────────────────
    print("─" * 70)
    print("🧪 ETAPA 1.5: Extração de Exame PDF (LLM)")
    print("─" * 70)
    
    exam_pdf_path = project_root / "dummy_exam.pdf"
    if exam_pdf_path.exists():
        from src.nlp.exam_extractor import ExamLLMExtractor
        exam_extractor = ExamLLMExtractor()
        
        with open(exam_pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        print(f"📝 Lendo PDF: {exam_pdf_path.name}")
        exam_features = exam_extractor.extract_from_exam(pdf_bytes, known_symptoms)
        
        for sym in exam_features.symptoms:
            status = "✅ ANORMAL" if sym.is_present else "❌ NORMAL"
            conf = sym.confidence
            print(f"   {status:11} | {sym.name[:20]:20} | CUI: {sym.cui} | conf: {conf:.2f}")
            if sym.is_present:
                patient_cuis.append(sym.cui)
                
        if not exam_features.symptoms:
            print("   ⚠️  Nenhuma anormalidade extraída do exame.")
    else:
        print(f"   ⚠️  Arquivo {exam_pdf_path.name} não encontrado. Pulando extração de PDF.")
        
    symptom_ids = kb.resolve_cuis_to_symptom_ids(patient_cuis)
    print()

    # ── 2. Knowledge Base ─────────────────────────────────────────
    print("─" * 70)
    print("📚 ETAPA 2: Resolução na Base de Conhecimento")
    print("─" * 70)

    for cui in patient_cuis:
        symptom = kb.get_symptom_by_cui(cui)
        if symptom:
            print(f"   ✅ {cui} → {symptom.name} (ID: {symptom.symptom_id})")
        else:
            print(f"   ⚠️  {cui} → NÃO encontrado na KB")

    print()

    # ── 3. Bayesian Ranking ───────────────────────────────────────
    print("─" * 70)
    print("🧮 ETAPA 3: Ranking Bayesiano (Log-Odds + LR)")
    print("─" * 70)

    network = DiseaseDiagnosticNetwork()
    ranking = network.rank_diseases(symptom_ids, kb)

    print()
    print(f"   {'#':<4} {'Doença':<35} {'Posterior':>10} {'Prior':>8} {'Δ':>6}")
    print(f"   {'─'*4} {'─'*35} {'─'*10} {'─'*8} {'─'*6}")

    for i, (disease_id, posterior) in enumerate(ranking, 1):
        disease = kb.get_disease(disease_id)
        if not disease:
            continue
        prior = disease.prevalence
        delta = posterior - prior
        arrow = "↑" if delta > 0.001 else "↓" if delta < -0.001 else "="
        print(
            f"   {i:<4} {disease.name:<35} "
            f"{posterior:>9.4%} {prior:>7.2%} {arrow}{abs(delta):>5.2%}"
        )

    print()

    # ── 4. TF-IDF Scoring ─────────────────────────────────────────
    print("─" * 70)
    print("📊 ETAPA 4: TF-IDF Similarity Scoring")
    print("─" * 70)

    vectorizer = SymptomVectorizer()
    vectorizer.fit_from_knowledge_base(kb)
    tfidf_scores = vectorizer.score_diseases(patient_cuis)

    sorted_tfidf = sorted(tfidf_scores.items(), key=lambda x: x[1], reverse=True)

    print()
    print(f"   {'#':<4} {'Doença':<35} {'TF-IDF':>8}")
    print(f"   {'─'*4} {'─'*35} {'─'*8}")

    for i, (disease_id, score) in enumerate(sorted_tfidf[:6], 1):
        disease = kb.get_disease(disease_id)
        bar = "█" * int(score * 40)
        print(
            f"   {i:<4} {disease.name if disease else disease_id:<35} "
            f"{score:>7.4f} {bar}"
        )

    print()

    # ── 5. Diagnóstico Diferencial ────────────────────────────────
    print("=" * 70)
    print("📋 DIAGNÓSTICO DIFERENCIAL — Resumo")
    print("=" * 70)
    print()

    top_bayesian = ranking[:3]
    top_tfidf = sorted_tfidf[:3]

    print("   🏆 Top 3 — Ranking Bayesiano:")
    for i, (did, prob) in enumerate(top_bayesian, 1):
        d = kb.get_disease(did)
        print(f"      {i}. {d.name if d else did} — {prob:.4%}")

    print()
    print("   📊 Top 3 — Ranking TF-IDF:")
    for i, (did, score) in enumerate(top_tfidf, 1):
        d = kb.get_disease(did)
        print(f"      {i}. {d.name if d else did} — {score:.4f}")

    # Concordância
    bay_top = {did for did, _ in top_bayesian}
    tfidf_top = {did for did, _ in top_tfidf}
    agreed = bay_top & tfidf_top

    print()
    if agreed:
        print("   ✅ Concordância Bayesiano ∩ TF-IDF:")
        for did in agreed:
            d = kb.get_disease(did)
            print(f"      → {d.name if d else did}")
    else:
        print("   ⚠️  Sem concordância nos Top 3")

    print()
    print("=" * 70)
    print("⚠️  AVISO: Este é um sistema de apoio à decisão (CDSS).")
    print("   O diagnóstico final deve ser feito por um profissional.")
    print("=" * 70)


if __name__ == "__main__":
    main()
