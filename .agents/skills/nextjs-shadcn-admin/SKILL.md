---
name: nextjs-shadcn-admin
description: Desenvolvimento do painel administrativo e médico web. Foco em Next.js 15 App Router, React Server Components (RSC), shadcn/ui e Tailwind CSS v4.
---

# Painel Web Admin (Next.js & shadcn/ui)

## Quando usar esta habilidade
- Construção da interface web para médicos e administradores hospitalares.
- Manipulação de grandes tabelas de pacientes e prontuários.

## Instruções
- **Next.js 15 (App Router):** Priorize React Server Components (RSC) para carregar dados sensíveis e pesados (EHR) sem inflar o bundle do cliente. Use Server Actions para mutações de dados.
- **Design System:** Use os componentes `shadcn/ui` alinhados com Tailwind CSS v4. IMPORTANTE: Siga sempre as definições visuais restritas encontradas em `DESIGN.md` (modo escuro, tipografia Inter, paleta cv01/ss03).
- **Tabelas de Dados:** Utilize `TanStack Table v8` para renderizar grids massivos de pacientes com paginação e ordenação no servidor, otimizando cache.
- **Segurança e Acessibilidade:** Certifique-se de que formulários clínicos usem validação estrita (Zod + React Hook Form) e preservem acessibilidade total (WAI-ARIA).
