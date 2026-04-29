# 02 - Domínio e Entidades

Esta camada contém a "Verdade" do negócio. É escrita em TypeScript puro, sem decorators de ORM ou bibliotecas externas (exceto utilitários de domínio).

## 🧬 Entidades Principais

### 1. TriageSession (Sessão de Triagem)
Representa o ciclo de vida de um atendimento de triagem.
- **Atributos**:
  - `id`: UUID (Identidade única).
  - `patientId`: FK para o paciente.
  - `status`: Enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - `currentStep`: Inteiro (Controla o progresso do formulário).
  - `symptoms`: Array de strings (IDs dos sintomas coletados).
- **Regras de Negócio**:
  - `nextStep()`: Adiciona novos sintomas e incrementa o passo.
  - `complete()`: Muda o status para concluído.

### 2. Patient (Paciente)
*Nota: Atualmente simplificado para suportar o fluxo de triagem.*
- **Atributos**:
  - `id`: Identificador único.
  - `name`: Nome do paciente.

## ⚓ Ports (Contratos)

Os ports definem como o domínio se comunica com o mundo externo:

### ITriageRepository
Contrato para persistência das sessões.
- `save(session: TriageSession): Promise<void>`
- `findById(id: string): Promise<TriageSession | null>`
- `findByPatientId(patientId: string): Promise<TriageSession[]>`

### IDiagnosticClient
Contrato para comunicação com o motor de diagnóstico.
- `getAppSymptoms(): Observable<SymptomList>`

## 🧩 Value Objects e Enums
- **TriageStatus**: Define os estados válidos da triagem, garantindo consistência em toda a aplicação.
