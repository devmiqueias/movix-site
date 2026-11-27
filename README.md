# Site Oficial do Movix PDV

Site institucional e demonstração interativa do **Movix**, sistema PDV de frente de caixa 100% offline para mercadinho, distribuidora de bebidas, depósito, adega e conveniência — desenvolvido pela **Brantec**.

Publicado via GitHub Pages em [https://devmiqueias.github.io/movix-site/](https://devmiqueias.github.io/movix-site/).

> As imagens exibidas são telas reais do Movix capturadas numa loja de demonstração com dados fictícios.

---

## Arquitetura & Stack

O site combina uma aplicação interativa em **React 19 + TypeScript + Vite** construída sobre o design system **`@astryxdesign/core`** (Meta) com o gerador estático compatível com o painel **`/admin`** e com o **GitHub Pages** sem depender de servidor:

- **UI & Design System:** `@astryxdesign/core` (`v0.7.17`) + tema local customizado **`movix`** (`src/themes/movix/`) estendendo `@astryxdesign/theme-neutral`, com a identidade **Sinalização** do app Movix 2.12 (amarelo-sinal `#FFD200`, tinta `#111111`, placas chapadas com cantos de 3–4px, fonte `Overpass` hospedada localmente, modo claro por padrão e escuro alternável, atalhos `F1`–`F10`).
- **Apresentação & Conversão:**
  - **Hero focado em proposta de valor:** placa principal do Movix com CTA direto para WhatsApp e vitrine interativa de telas reais (`Caixa`, `Pagamento`, `Fiado`, `Estoque`, `Lucro`) com ampliação em `Lightbox`.
  - **Demonstração rápida do caixa (`F2`):** simulação direta de 1 clique por produto (sem formulários ou campos extras), com cálculo instantâneo de total, troco em dinheiro e trava de limite no fiado, direcionando para agendamento no WhatsApp.
  - **Percurso tela a tela, personalizador por tipo de loja, galeria real com zoom, segurança, planos e FAQ em acordeão.**
- **Ponte CMS `/admin` + SEO Estático:** o `template/index.html` recebe os dados de `content/site.json` via `admin/render.js`, gerando `index.html` (com meta tags, Open Graph, JSON-LD e fallback semântico de SEO para indexadores sem JS), `sitemap.xml` e `robots.txt`. A aplicação React lê `#movix-site-data` diretamente do HTML, de modo que qualquer edição publicada pelo `/admin` atualiza o site automaticamente sem precisar rodar build em Node.

---

## Estrutura de pastas

| Caminho | Função |
|---|---|
| `src/App.tsx` e `src/main.tsx` | Entrada da aplicação React 19, `<Theme>`, `<LayerProvider>`, atalhos globais (`Ctrl+K`, `F1`–`F10`) e `Lightbox`. |
| `src/components/` | Componentes modulares em `@astryxdesign/core` (`HeaderNav`, `HeroSection`, `InteractivePosSandbox`, `InteractiveTour`, `AudienceCustomizer`, `ScreensGallery`, `SecurityShowcase`, `PlansAndFaq`, `MovixLogo`). |
| `src/themes/movix/` | Fonte (`movixTheme.ts`), descriptor (`movixTheme.doc.mjs`), fonte self-hosted (`movix.fonts.css`) e artefatos compilados (`movix.js`, `movix.css`) do tema Astryx do Movix. |
| `src/styles/movix.css` | Camada de estilos complementares (`@layer movix-custom`) respeitando `@layer reset, astryx-base, astryx-theme`. |
| `src/types/` e `src/utils/` | Tipagem do schema de `content/site.json` e utilitários de formatação BRL, WhatsApp e `srcset`. |
| `astryx-themes.js` | Módulo gerado automaticamente por `astryx theme add` que registra os temas compilados. |
| `content/site.json` | Todo o conteúdo editável do site (também alterado pelo painel `/admin`). |
| `template/index.html` | Molde HTML com SEO, JSON-LD, fallback semântico e injeção de `#movix-site-data` + bundles de `assets/`. |
| `assets/` | Bundle de produção gerado pelo Vite (`movix-app.js`, `movix-app.css` e fontes). |
| `admin/` | Painel web sem servidor (`/admin`) + `render.js` compartilhado com `build.mjs`. |
| `img/` e `fonts/` | Capturas reais do Movix (WebP 1440px e 720px), ícone SVG, Open Graph e fonte Overpass (licença OFL). |
| `index.html`, `sitemap.xml`, `robots.txt` | Arquivos finais gerados por `npm run build` / `node build.mjs` (ou pelo `/admin`). **Não edite à mão.** |

---

## Desenvolvimento local

Requer **Node.js >= 22.13** (testado em Node 24) e npm.

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento com HMR (usa app.html + content/site.json)
npm run dev

# Checar tipagem TypeScript
npm run typecheck

# Recompilar o tema customizado do Movix no Astryx (quando editar src/themes/movix/movixTheme.ts)
npm run astryx -- theme build src/themes/movix/movixTheme.ts
npm run astryx -- theme add movix

# Build completo de produção (Vite -> assets/ + node build.mjs -> index.html, sitemap.xml, robots.txt)
npm run build

# Diagnóstico de integridade do Design System Astryx
npm run astryx -- doctor
```

---

## Editar conteúdo sem programar (`/admin`)

Abra **`/admin`** no site publicado ([https://devmiqueias.github.io/movix-site/admin/](https://devmiqueias.github.io/movix-site/admin/)):

1. Na primeira vez, crie um Fine-Grained Personal Access Token no GitHub restrito a este repositório com as permissões *Contents: Read and write* e *Pages: Read-only*.
2. Edite textos, WhatsApp, produtos do caixa de demonstração, etapas do percurso, formatos de contratação, perguntas frequentes, imagens e SEO.
3. **Pré-visualizar** mostra a estrutura atualizada; **Publicar** grava `content/site.json`, `index.html`, `sitemap.xml` e `robots.txt` num único commit e o GitHub Pages publica em cerca de 1 minuto.

Segurança do painel: não há senha própria nem backend. Sem uma chave com permissão de escrita neste repositório, nada é alterado. A chave permanece apenas no navegador e só se comunica com `api.github.com` (garantido pela CSP). A rota `/admin` possui `noindex, nofollow` e está bloqueada em `robots.txt`.

---

## SEO e Domínio Próprio

- Metadados, Open Graph e dados estruturados JSON-LD (`SoftwareApplication`, `Organization`, `FAQPage`) gerados no HTML estático a partir de `content/site.json`.
- O site não exibe preços fixos nos planos por padrão; caso um preço seja preenchido no `/admin`, ele passa a aparecer nos cartões e no bloco `Offer` do JSON-LD.
- **Domínio próprio (recomendado):** configure o DNS apontando para o GitHub Pages (*Settings → Pages → Custom domain*), atualize o **Endereço do site** no `/admin`, publique e cadastre o `sitemap.xml` no [Google Search Console](https://search.google.com/search-console).
