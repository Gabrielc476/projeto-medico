---
name: xstate-medical-flows
description: Modelagem de fluxos clínicos rigorosos usando Finite State Machines (XState). Evita estados impossíveis em anamneses e triagens.
---

# Máquinas de Estado para Triagem Clínica

## Quando usar esta habilidade
- Construção de questionários médicos, árvores de decisão do paciente e fluxos de anamnese no frontend e backend.

## Instruções
- **Finite State Machines (XState):** O diagnóstico médico e os formulários do paciente não podem assumir "estados impossíveis". Abandone `useState` para controle de fluxos multifásicos. Defina estados rígidos e transições explícitas com XState.
- **Fluxo de 3 Pilares:** A máquina de estado deve guiar a anamnese em três nós primários sequenciais: `ColetaDeExames` -> `ColetaDeContexto` -> `ColetaDeSintomas`.
- **Opcionalidade vs. Obrigatoriedade:** As etapas de Exames e Contexto são OPCIONAIS. A transição pode pular diretamente delas para `ColetaDeSintomas`, exigindo apenas que a UI informe ao usuário que a ausência desses dados afeta a precisão. A etapa de `Sintomas` é OBRIGATÓRIA (a máquina não pode finalizar o estado em 'Sucesso' sem sintomas registrados).
- **Contexto e Guardas:** Use o contexto (context) do XState para armazenar o acúmulo de laudos e textos inseridos. Proteja a transição final de envio à API usando "Guards" lógicos (verificando se o array de sintomas tem tamanho > 0).
- **Rastreabilidade e Determinismo:** A máquina deve garantir que o usuário consiga retroceder para preencher etapas opcionais que ele pulou sem corromper a sessão de triagem, assegurando previsibilidade absoluta.
