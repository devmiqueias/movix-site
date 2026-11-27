# DESIGN.md — Movix PDV Site

## Identidade visual ("Sinalização", a mesma do app Movix 2.12)

- **Conceito:** placas de sinalização de aeroporto: amarelo-sinal com tinta preta para "você está aqui / faça isto agora", quadros pretos com texto branco, superfícies chapadas. Sem vidro, sem desfoque, sem sombra e sem degradê.
- **Marca Movix:** placa amarela `#FFD200` com o "M" em tinta `#111111` e o ponto como quadrado de pictograma (`img/movix-icone.svg`, `src/components/MovixLogo.tsx`; mesmo desenho do app, do instalador, das Ferramentas e do Ativador).
- **Cores:** amarelo-sinal `#FFD200` (CTA principal, seleção, item ativo, filete no topo das placas, barra de progresso de rolagem); tinta `#111111`; chão branco `#FFFFFF` (claro) ou `#121212` (escuro); superfície `#F4F4F1` / `#1A1A1A`; linhas `#DCDCD7` / `#333333`. Verde só para sucesso (`#0F7A45` / `#5CCB94`).
- **Placa principal** (`.movix-plate`): quadro preto, filete amarelo de 8px no topo, título branco com destaque em amarelo, CTA amarelo com tinta preta e ação secundária com contorno.
- **Moldura das telas** (`.movix-stage-card`): faixa amarela com o nome da tela, como a faixa "você está aqui" do app.
- **Cantos:** 3px (elementos) e 4px (cartões e placas).
- **Tipografia:** `Overpass` variável (self-hosted em `fonts/`, licença OFL), `tabular-nums` em valores e `text-wrap: balance` em títulos.
- **Modos de cor:** claro (padrão, como o app) e escuro, alternáveis no cabeçalho.
- **Imagens:** capturas reais do Movix 2.12 numa loja de demonstração (1440×900 e 720×450 em webp; `img/movix-og.jpg` 1200×630).

## Sistema de componentes (`@astryxdesign/core`)

- Controles interativos usam componentes acessíveis de `@astryxdesign/core`: `Button`, `Card`, `ClickableCard`, `SelectableCard`, `SegmentedControl`, `ProgressBar`, `Drawer`, `Lightbox`, `CollapsibleGroup`/`Collapsible`, `Badge`, `Kbd`, `Tooltip` e `useToast`.
- Tema local em `src/themes/movix/movixTheme.ts` (`extends: neutralTheme`), compilado com `npx astryx theme build src/themes/movix/movixTheme.ts` e registrado em `astryx-themes.js`.
- Selos de estado ativo usam `variant="yellow"`; verde (`success`) só para resultado positivo.
- Hierarquia plana: sem `Card` dentro de `Card` (usar `.movix-subsurface` / `.movix-subsurface-row`).
- No celular, seletores (`SegmentedControl`) rolam de lado em vez de cortar o nome.
- Superfícies do navegador estilizadas (`::selection`, `caret-color`, `:focus-visible`, `scrollbar-color`) e respeito a `prefers-reduced-motion: reduce`.
