---
title: Modelos de Dados (Pydantic)
tags:
  - diagnostic-engine
  - pydantic
  - modelos
---

# 📋 Modelos de Dados (Pydantic)

> [!abstract] Em uma frase
> Os modelos Pydantic são os **"formulários"** que garantem que os dados médicos estão corretos antes de usar.

---

## 🤔 Por que Pydantic?

> [!question]- O que acontece sem validação?
> - Alguém coloca `sensitivity = 2.5` (deveria ser no máximo 1.0)
> - Um CUI inválido como `"ABC"` quebra o NLP
> - O cálculo do LR+ dá **divisão por zero**
>
> ==Pydantic impede tudo isso automaticamente== ✅

---

## 🏥 Modelo: Disease (Doença)

📄 Arquivo: `src/models/disease.py`

```python
class Disease(BaseModel):
    disease_id: str       # "D001"
    name: str             # "Pneumonia"
    icd10_code: str       # "J18.9"
    prevalence: float     # 0.02 (2% da população)
    category: str | None  # "respiratory"
```

> [!important] Validações automáticas
> - `icd10_code` deve seguir o padrão `J18.9` ou `A09`
> - `prevalence` deve estar entre `0.0` e `1.0`
> - `disease_id` não pode ser vazio

**Exemplo prático:**
```python
# ✅ Funciona
Disease(disease_id="D001", name="Pneumonia", icd10_code="J18.9", prevalence=0.02)

# ❌ Erro! ICD-10 inválido
Disease(disease_id="D001", name="Pneumonia", icd10_code="123", prevalence=0.02)
```

---

## 🤒 Modelo: Symptom (Sintoma)

📄 Arquivo: `src/models/symptom.py`

```python
class Symptom(BaseModel):
    symptom_id: str           # "S001"
    cui: str                  # "C0010200" (UMLS)
    name: str                 # "Cough"
    body_region: str | None   # "thorax"
    is_constitutional: bool   # False
```

> [!tip] O que é CUI?
> **Concept Unique Identifier** — é o "CPF" de cada conceito médico.
> Exemplo: `C0015967` = Febre, em qualquer idioma do mundo.

> [!important] Validação do CUI
> Deve seguir o formato: ==letra C + 7 dígitos== → `C0010200` ✅

---

## 🔗 Modelo: DiseaseSymptomLink (a Estrela ⭐)

📄 Arquivo: `src/models/disease_symptom_link.py`

> [!warning] Este é o modelo mais importante!
> É ele que contém os **números clínicos** que o motor usa para calcular.

```python
class DiseaseSymptomLink(BaseModel):
    disease_id: str       # "D001"
    symptom_id: str       # "S001"
    sensitivity: float    # 0.80  → Taxa de Verdadeiro Positivo
    specificity: float    # 0.40  → Taxa de Verdadeiro Negativo
    link_probability: float  # 0.75 → Força causal (Noisy-OR)
```

### 🧮 LR+ e LR- são calculados AUTOMATICAMENTE

$$LR+ = \frac{\text{sensibilidade}}{1 - \text{especificidade}}$$

$$LR- = \frac{1 - \text{sensibilidade}}{\text{especificidade}}$$

> [!example] Exemplo com Tosse → Pneumonia
> - Sensibilidade: 0.80 (80% dos pacientes com pneumonia têm tosse)
> - Especificidade: 0.40 (40% dos pacientes SEM pneumonia NÃO têm tosse)
> - **LR+ = 0.80 / 0.60 = 1.33** → Tosse aumenta um pouco a chance
> - **LR- = 0.20 / 0.40 = 0.50** → Ausência de tosse diminui a chance

### 🛡️ Proteção contra Divisão por Zero

Se `specificity = 1.0`, o denominador do LR+ seria zero.
O modelo automaticamente ajusta para `1.0 - ε` (epsilon muito pequeno).

---

Anterior: [[01 — Visão Geral da Arquitetura]] | Próximo: [[03 — Base de Conhecimento]]
