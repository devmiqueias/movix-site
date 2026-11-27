// Gerador do site Movix. O mesmo arquivo roda no navegador (painel admin) e no Node (build.mjs):
// recebe o modelo (template/index.html) e o conteúdo (content/site.json) e devolve os arquivos
// prontos. O HTML final traz todo o texto escrito, então o Google indexa sem executar JavaScript.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Texto com **negrito** (único formato aceito): escapa tudo e só então aplica o negrito. */
export const richText = (v) => escapeHtml(v).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

const waLink = (number, message) =>
  `https://wa.me/${String(number || '').replace(/\D/g, '')}` + (message ? `?text=${encodeURIComponent(message)}` : '');

const priceNumber = (price) => {
  const n = String(price || '').replace(/[^\d,]/g, '').replace(',', '.');
  return n ? Number(n).toFixed(2) : undefined;
};

const absUrl = (base, path) => {
  try { return new URL(path || '', base).href; } catch { return path || ''; }
};

/** Acrescenta ao conteúdo os campos calculados (links, numeração, HTML seguro). */
export function buildView(data) {
  const d = structuredClone(data);
  const base = d.site.url.endsWith('/') ? d.site.url : d.site.url + '/';
  d.site.url = base;
  d.site.shareImageAbs = absUrl(base, d.site.shareImage);
  d.contact.link = waLink(d.contact.whatsapp, d.contact.message);
  d.hero.link = waLink(d.contact.whatsapp, d.hero.ctaMessage || d.contact.message);
  d.tour.count = d.tour.steps.length;
  d.tour.steps.forEach((s, i) => {
    s.index = i;
    s.number = i + 1;
    s.first = i === 0;
    s.ticksHtml = (s.ticks || []).map((t) => `<li><span>${richText(t)}</span></li>`).join('');
  });
  d.tour.firstLabel = d.tour.steps[0]?.label || '';
  d.tour.firstImage = d.tour.steps[0]?.image || '';
  d.plans.items.forEach((p) => { p.link = waLink(d.contact.whatsapp, p.message); });
  // Versão de 720 px (celular) ao lado de cada .webp: o navegador escolhe pelo tamanho da tela
  const srcset = (img) => (/\.webp$/i.test(img || '') ? `${img.replace(/\.webp$/i, '-720.webp')} 720w, ${img} 1440w` : '');
  d.hero.srcset = srcset(d.hero.image);
  d.tour.steps.forEach((s) => { s.srcset = srcset(s.image); });
  d.gallery.items.forEach((g, i) => { g.srcset = srcset(g.image); g.index = i; });
  if (d.demo) {
    d.demo.products.forEach((p, i) => {
      const kg = /^kg$/i.test(p.unit || '');
      p.index = i;
      p.unitLabel = kg ? 'kg' : 'un';
      p.step = kg ? '0.25' : '1';
      p.value = String(p.price || '0').replace(/\./g, '').replace(',', '.');
    });
    d.demo.debtValue = String(d.demo.customerDebt || '0').replace(/\./g, '').replace(',', '.');
    d.demo.limitValue = String(d.demo.customerLimit || '0').replace(/\./g, '').replace(',', '.');
  }
  d.faq.items.forEach((f, i) => { f.open = i === 0; });
  d.jsonld = JSON.stringify(jsonLd(d), null, 2).replace(/</g, '\\u003c');
  d.siteJson = JSON.stringify(data).replace(/</g, '\\u003c');
  return d;
}

function jsonLd(d) {
  const base = d.site.url;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': base + '#software',
        name: d.site.name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Sistema PDV / Frente de caixa',
        operatingSystem: 'Windows 10, Windows 11',
        inLanguage: 'pt-BR',
        description: d.site.description,
        image: absUrl(base, d.hero.image),
        screenshot: d.tour.steps.map((s) => absUrl(base, s.image)),
        featureList: d.tour.steps.map((s) => s.title).join('; '),
        // Preço só entra nos dados do Google se estiver preenchido no painel (hoje o site não mostra valores)
        ...(d.plans.items.some((p) => priceNumber(p.price)) ? { offers: d.plans.items.filter((p) => priceNumber(p.price)).map((p) => ({ '@type': 'Offer', name: `Plano ${p.name}`, price: priceNumber(p.price), priceCurrency: 'BRL' })) } : {}),
        publisher: { '@id': base + '#empresa' },
      },
      {
        '@type': 'Organization',
        '@id': base + '#empresa',
        name: d.site.company,
        url: base,
        logo: absUrl(base, 'img/movix-icone.svg'),
        contactPoint: { '@type': 'ContactPoint', telephone: '+' + String(d.contact.whatsapp).replace(/\D/g, ''), contactType: 'sales', areaServed: 'BR', availableLanguage: 'Portuguese' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: d.faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

// --------------------------------------------------------------- modelo
// Subconjunto do Mustache: {{campo}} (escapado), {{{campo}}} (HTML pronto),
// {{#lista}}...{{/lista}} (repete / condição), {{^campo}}...{{/campo}} (se vazio) e {{.}}.

function lookup(stack, name) {
  if (name === '.') return stack[stack.length - 1];
  for (let i = stack.length - 1; i >= 0; i--) {
    let v = stack[i];
    let found = true;
    for (const part of name.split('.')) {
      if (v != null && typeof v === 'object' && part in v) v = v[part];
      else { found = false; break; }
    }
    if (found) return v;
  }
  return undefined;
}

function parse(tpl) {
  const re = /\{\{(\{?)([#^/]?)\s*([\w.@]+|\.)\s*\}?\}\}/g;
  const root = { children: [] };
  const stack = [root];
  let last = 0, m;
  while ((m = re.exec(tpl))) {
    const top = stack[stack.length - 1];
    if (m.index > last) top.children.push({ t: 'text', v: tpl.slice(last, m.index) });
    last = re.lastIndex;
    const [, raw, kind, name] = m;
    if (kind === '#' || kind === '^') {
      const node = { t: kind, name, children: [] };
      top.children.push(node);
      stack.push(node);
    } else if (kind === '/') {
      const open = stack.pop();
      if (!open || open.name !== name) throw new Error(`Modelo: {{/${name}}} sem abertura correspondente`);
    } else {
      top.children.push({ t: raw ? 'raw' : 'var', name });
    }
  }
  if (stack.length !== 1) throw new Error(`Modelo: {{#${stack[stack.length - 1].name}}} não foi fechado`);
  if (last < tpl.length) root.children.push({ t: 'text', v: tpl.slice(last) });
  return root.children;
}

function run(nodes, stack) {
  let out = '';
  for (const n of nodes) {
    if (n.t === 'text') out += n.v;
    else if (n.t === 'var') out += escapeHtml(lookup(stack, n.name));
    else if (n.t === 'raw') out += lookup(stack, n.name) ?? '';
    else {
      const v = lookup(stack, n.name);
      const empty = v == null || v === false || v === '' || (Array.isArray(v) && v.length === 0);
      if (n.t === '^') { if (empty) out += run(n.children, stack); continue; }
      if (empty) continue;
      if (Array.isArray(v)) for (const item of v) out += run(n.children, [...stack, item]);
      else out += run(n.children, typeof v === 'object' ? [...stack, v] : stack);
    }
  }
  return out;
}

export const render = (tpl, view) => run(parse(tpl), [view]);

/** Valida o conteúdo antes de publicar (o painel mostra estes erros e não deixa salvar). */
export function validate(data) {
  const errs = [];
  const req = (v, label) => { if (!String(v ?? '').trim()) errs.push(`Preencha: ${label}`); };
  try { new URL(data.site.url); } catch { errs.push('Endereço do site inválido (ex.: https://movix.com.br/)'); }
  req(data.site.title, 'Título da página (SEO)');
  req(data.site.description, 'Descrição da página (SEO)');
  if ((data.site.description || '').length > 300) errs.push('Descrição do SEO muito longa (o Google mostra cerca de 160 caracteres).');
  if (String(data.contact.whatsapp).replace(/\D/g, '').length < 12) errs.push('WhatsApp com DDI e DDD, só números (ex.: 5573974007373).');
  if (!data.tour.steps.length) errs.push('O percurso precisa de ao menos uma tela.');
  data.tour.steps.forEach((s, i) => { req(s.title, `Percurso ${i + 1}: título`); req(s.image, `Percurso ${i + 1}: imagem`); req(s.alt, `Percurso ${i + 1}: descrição da imagem`); });
  return errs;
}

/** Gera os arquivos do site. `today` no formato AAAA-MM-DD (data da publicação, para o sitemap). */
export function buildSite(template, data, today) {
  const view = buildView(data);
  const html = render(template, view);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escapeHtml(view.site.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${view.tour.steps.map((s) => `    <image:image><image:loc>${escapeHtml(absUrl(view.site.url, s.image))}</image:loc></image:image>`).join('\n')}
  </url>
</urlset>
`;
  const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${new URL('sitemap.xml', view.site.url).href}
`;
  return { 'index.html': html, 'sitemap.xml': sitemap, 'robots.txt': robots };
}
