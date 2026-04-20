# Fluxo de Triagem Clínica

A jornada do paciente é regida de forma estrita pelo **XState** (Finite State Machines).

## Os 3 Pilares da Anamnese
1. **Coleta de Exames** *(Opcional)*
2. **Contextualização via LLM** *(Opcional)* - Onde extraímos as *Priores* matemáticas baseadas no histórico de vida e rotina.
3. **Mapeamento de Sintomas** *(Obrigatório)* - Aciona o cálculo Bayesiano e é a única etapa que não pode ser ignorada ("Guard").

> [!warning] Alerta Clínico
> Omitir os passos opcionais reduz a precisão da inferência Bayesiana, já que o sistema parte de Priores genéricas da população ao invés de Priores personalizadas. A UI deve alertar o usuário sobre isso.

Relacionado: [[Redes-Bayesianas]]
