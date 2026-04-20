---
name: react-native-architecture
description: Develop React Native, Flutter, or native mobile apps with modern architecture patterns. Masters cross-platform development, native integrations, offline sync, and app store optimization. Use when building the mobile symptom selector or interactive body maps.
---

# Arquitetura React Native & Mapa Sintomatológico

## Quando usar esta habilidade
- Construção de componentes UI móveis e navegação.
- Implementação de seleção interativa de sintomas visuais.

## Instruções
- **Design Atômico (Atomic Design):** Para qualquer componente UI, siga a estrutura atômica: `atoms` (botões, inputs), `molecules` (grupos de inputs, cards simples), `organisms` (formulários completos, headers), `templates` (estruturas de página) e `pages`.
- **Componentes Padrão:** Use sempre componentes funcionais e React Hooks.
- **Mapa do Corpo (Body Map):** Para seleção de sintomas, utilize a biblioteca `react-native-body-highlighter`. Gerencie o estado `selectedBodyPart` e passe-o para a matriz `data` do componente `<Body />` para destacar visualmente a área selecionada pelo paciente.
- **Performance:** Ao renderizar grandes listas de sintomas de doenças, use `FlatList` (ou `FlashList`) no lugar de `ScrollView` para otimizar o uso de memória.
