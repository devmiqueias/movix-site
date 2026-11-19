# Site do Movix PDV

Site oficial do **Movix**, sistema PDV de frente de caixa para mercadinho, distribuidora de bebidas,
depósito e conveniência. Publicado pelo GitHub Pages em https://devmiqueias.github.io/movix-site/.

As imagens são telas reais do Movix, capturadas numa loja de demonstração (dados fictícios).

## Editar o site (sem programar)

Abra **`/admin`** no site publicado (https://devmiqueias.github.io/movix-site/admin/).

1. Na primeira vez, crie uma chave do GitHub restrita a este repositório (o passo a passo aparece na
   tela de entrada): *Contents: Read and write* e *Pages: Read-only*.
2. Edite preços, WhatsApp, textos, perguntas, imagens e o SEO.
3. **Pré-visualizar** mostra o resultado antes; **Publicar** grava tudo num commit e o site é
   atualizado em cerca de 1 minuto. A aba **Publicações** mostra o status e o histórico, e permite
   reabrir uma versão anterior.

Segurança do painel: a página não tem senha própria nem servidor. Sem uma chave com permissão de
escrita neste repositório ela não faz nada. A chave fica só no navegador de quem entrou e só é
enviada para `api.github.com` (garantido pela política de segurança da página). O `/admin` não é
indexado pelo Google.

## Estrutura

| Caminho | O que é |
|---|---|
| `content/site.json` | Todo o conteúdo editável (o painel altera este arquivo). |
| `template/index.html` | Modelo da página: visual, SEO, dados estruturados e animações de rolagem. |
| `admin/render.js` | Gerador: modelo + conteúdo → `index.html`, `sitemap.xml`, `robots.txt`. Usado pelo painel e pelo `build.mjs`. |
| `admin/` | Painel de administração. |
| `img/`, `fonts/` | Telas do Movix (WebP) e a fonte Overpass (licença OFL). |
| `index.html`, `sitemap.xml`, `robots.txt` | Gerados. Não edite à mão. |

Para gerar localmente depois de mudar o modelo: `node build.mjs`.

## SEO

- Título, descrição e palavras-chave focados no nicho (sistema PDV, mercadinho, distribuidora de
  bebidas, controle de fiado, frente de caixa offline), editáveis no painel.
- Todo o texto vai escrito no HTML (o Google lê sem executar JavaScript).
- Dados estruturados (`SoftwareApplication` com preços, `Organization`, `FAQPage`).
- `sitemap.xml` com as imagens, Open Graph para WhatsApp/Facebook, textos alternativos descritivos.

**Domínio próprio (recomendado):** registre o domínio (ex.: `movix.com.br`), aponte o DNS para o
GitHub Pages (*Settings → Pages → Custom domain*), troque o **Endereço do site** no painel e
publique. Depois cadastre o site no [Google Search Console](https://search.google.com/search-console),
cole o código de verificação no painel e envie o `sitemap.xml`.
