import requests
import json
import time

import os
GATEWAY_URL = os.environ.get("GATEWAY_URL", "http://localhost:3000")

def log_step(step, description):
    print(f"\n--- [ETAPA {step}]: {description} ---")

def simulate():
    print(">>> INICIANDO SIMULACAO DE FLUXO MEDICO COMPLETO")
    
    # ---------------------------------------------------------
    log_step(1, "Iniciando Sessao de Triagem no Gateway")
    # ---------------------------------------------------------
    start_payload = {"patientId": "paciente-teste-001"}
    try:
        response = requests.post(f"{GATEWAY_URL}/triage/start", json=start_payload)
        response.raise_for_status()
        session_data = response.json()
        session_id = session_data['sessionId']
        print(f"Sessao criada com sucesso: {session_id}")
    except Exception as e:
        print(f"Erro ao iniciar triagem: {e}")
        return

    # ---------------------------------------------------------
    log_step(2, "Simulando Coleta de Sintomas e Contexto")
    # ---------------------------------------------------------
    # Vamos simular um paciente com:
    # - Sintoma: Febre Alta (CUI: C0015967)
    # - Sintoma: Tosse (CUI: C0010200)
    # - Contexto: Exposicao a malaria (CUI: C0024530)
    
    payload = {
        "symptoms": [
            {"cui": "C0015967", "name": "Fever", "is_present": True},
            {"cui": "C0010200", "name": "Cough", "is_present": True}
        ],
        "contextualFactors": [
            {"cui": "C0024530", "name": "Malaria Exposure", "is_present": True}
        ]
    }
    
    print(f"Enviando {len(payload['symptoms'])} sintomas e {len(payload['contextualFactors'])} fatores contextuais...")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    # ---------------------------------------------------------
    log_step(3, "Processando Diagnostico (Gateway -> gRPC -> Python)")
    # ---------------------------------------------------------
    print("Aguardando processamento do motor Bayesiano...")
    start_time = time.time()
    
    try:
        response = requests.post(f"{GATEWAY_URL}/triage/diagnose", json=payload)
        response.raise_for_status()
        result = response.json()
        duration = time.time() - start_time
        print(f"Diagnostico concluido em {duration:.2f}s")
    except Exception as e:
        print(f"Erro no diagnostico: {e}")
        return

    # ---------------------------------------------------------
    log_step(4, "Exibindo Ranking de Doencas")
    # ---------------------------------------------------------
    ranking = result.get('ranked_diseases', [])
    if not ranking:
        print("Nenhuma doenca encontrada no ranking.")
    else:
        print(f"{'DOENCA':<30} | {'PROBABILIDADE':<15} | {'TF-IDF'}")
        print("-" * 60)
        for disease in ranking[:5]: # Mostrar Top 5
            name = disease['disease_name']
            prob = f"{disease['posterior_probability']:.4f}"
            tfidf = f"{disease['tf_idf_score']:.4f}"
            print(f"{name:<30} | {prob:<15} | {tfidf}")

    print("\nSIMULACAO FINALIZADA COM SUCESSO!")

if __name__ == "__main__":
    simulate()
