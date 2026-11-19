// Painel do site Movix. Edita content/site.json, gera o HTML com o mesmo gerador do build
// (render.js) e publica tudo num único commit pela API do GitHub. O GitHub Pages publica sozinho.
import { buildSite, validate } from './render.js';

const OWNER = 'devmiqueias';
const REPO = 'movix-site';
const BRANCH = 'main';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const TOKEN_KEY = 'movix-site-token';

const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k);
  return n;
};

let token = '';
let data = null;          // conteúdo em edição
let template = '';
let dirty = false;
const uploads = new Map(); // caminho no repositório → { base64, url }

// ------------------------------------------------------------------ GitHub
async function gh(path, opts = {}) {
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
  });
  if (res.status === 401) throw new Error('Chave inválida ou expirada. Entre de novo.');
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).message || msg; } catch {}
    const e = new Error(`GitHub: ${msg} (${res.status})`);
    e.status = res.status;
    throw e;
  }
  return res.status === 204 ? null : res;
}
const ghJson = async (p, o) => (await gh(p, o)).json();
const ghRaw = async (path, ref = BRANCH) =>
  (await gh(`/contents/${path}?ref=${encodeURIComponent(ref)}`, { headers: { Accept: 'application/vnd.github.raw+json' } })).text();

// ------------------------------------------------------------------ login
function storedToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
function saveToken(t, remember) {
  try {
    sessionStorage.setItem(TOKEN_KEY, t);
    if (remember) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
function clearToken() { try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch {} }

async function login(t, remember) {
  token = t.trim();
  const repo = await ghJson('');
  if (!repo.permissions?.push) throw new Error('Esta chave não tem permissão de escrita no repositório do site.');
  saveToken(token, remember);
  [template, data] = await Promise.all([ghRaw('template/index.html'), ghRaw('content/site.json').then(JSON.parse)]);
  $('#link-site').href = data.site.url;
  $('#login').hidden = true;
  $('#app').hidden = false;
  $('#top-actions').hidden = false;
  renderTabs();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('#login-msg');
  msg.className = 'msg'; msg.textContent = 'Conferindo a chave…';
  try { await login($('#token').value, $('#remember').checked); $('#token').value = ''; }
  catch (err) { token = ''; msg.className = 'msg err'; msg.textContent = err.message; }
});
$('#btn-logout').addEventListener('click', () => {
  if (dirty && !window.confirm('Há alterações não publicadas. Sair mesmo assim?')) return;
  clearToken(); location.reload();
});
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

// ------------------------------------------------------------------ editor
const LABELS = {
  url: 'Endereço do site', name: 'Nome', title: 'Título', description: 'Descrição', keywords: 'Palavras-chave',
  shareTitle: 'Título ao compartilhar (WhatsApp, Facebook)', shareDescription: 'Descrição ao compartilhar', shareImage: 'Imagem ao compartilhar (1200×630)',
  googleVerification: 'Código de verificação do Google Search Console', company: 'Empresa',
  whatsapp: 'WhatsApp (DDI + DDD + número, só números)', phoneDisplay: 'Telefone exibido', message: 'Mensagem inicial no WhatsApp',
  route: 'Faixa acima do título', titleBefore: 'Título: início', titleHighlight: 'Título: palavra em amarelo', titleAfter: 'Título: final',
  lead: 'Texto de apoio', cta: 'Texto do botão', ctaMessage: 'Mensagem do botão no WhatsApp', facts: 'Destaques', image: 'Imagem',
  imageAlt: 'Descrição da imagem (Google e leitores de tela)', alt: 'Descrição da imagem (Google e leitores de tela)', imageLabel: 'Rótulo da moldura',
  value: 'Valor', label: 'Rótulo', eyebrow: 'Placa da seção', intro: 'Introdução', steps: 'Paradas do percurso', id: 'Âncora (sem espaços)',
  key: 'Tecla', exit: 'Placa', text: 'Texto', ticks: 'Itens (use **negrito**)', items: 'Itens', caption: 'Legenda', price: 'Preço', period: 'Período',
  note: 'Observação', featured: 'Destacar este plano', tag: 'Selo', q: 'Pergunta', a: 'Resposta', left: 'Texto à esquerda', right: 'Texto à direita',
};
const LIMITS = { title: 65, description: 160, shareTitle: 70, shareDescription: 200, imageAlt: 160, alt: 160 };
const LONG = new Set(['description', 'lead', 'text', 'intro', 'note', 'a', 'shareDescription', 'keywords']);
const TABS = [
  ['site', 'SEO e Google', 'Como o site aparece no Google e ao ser compartilhado. Título até ~60 caracteres, descrição até ~155.'],
  ['contact', 'Contato', 'Todos os botões do site abrem o WhatsApp com a mensagem escolhida.'],
  ['hero', 'Topo', 'A primeira coisa que o visitante vê.'],
  ['strip', 'Faixa de números', 'Quatro destaques curtos logo abaixo do topo.'],
  ['tour', 'Percurso (rolagem)', 'Cada parada troca a tela na moldura enquanto a pessoa rola a página.'],
  ['gallery', 'Mais telas', ''],
  ['security', 'Segurança', ''],
  ['audiences', 'Para quem', ''],
  ['plans', 'Como contratar', 'Formatos de contratação. O site não mostra valores: cada botão pede os valores no WhatsApp.'],
  ['faq', 'Perguntas', 'Aparecem no Google como perguntas frequentes.'],
  ['final', 'Chamada final', ''],
  ['footer', 'Rodapé', ''],
  ['_status', 'Publicações', ''],
];
let currentTab = 'site';

function markDirty() {
  dirty = true; $('#dirty').hidden = false;
  // Aviso de erro some assim que o problema é corrigido
  if (!$('#errors').hidden) showErrors(validate(data));
}

function renderTabs() {
  const nav = $('#tabs');
  nav.replaceChildren(...TABS.map(([k, name]) => el('button', {
    type: 'button', 'aria-selected': String(k === currentTab), text: name,
    onclick: () => { currentTab = k; renderTabs(); },
  })));
  renderEditor();
}

function renderEditor() {
  const box = $('#editor');
  if (currentTab === '_status') { box.replaceChildren(statusView()); return; }
  const [key, name, hint] = TABS.find((t) => t[0] === currentTab);
  box.replaceChildren(el('div', { class: 'sec' },
    el('h2', { text: name }), hint ? el('p', { class: 'hint', text: hint }) : null,
    editNode(data, key)));
}

/** Editor genérico: texto, sim/não, listas de textos e listas de blocos, a partir do próprio JSON. */
function editNode(parent, key) {
  const value = parent[key];
  if (Array.isArray(value)) return listEditor(parent, key);
  if (value && typeof value === 'object') {
    return el('div', { class: 'list' }, Object.keys(value).map((k) => editNode(value, k)));
  }
  if (typeof value === 'boolean') {
    const id = uid();
    return el('label', { class: 'check', for: id },
      el('input', { id, type: 'checkbox', ...(value ? { checked: true } : {}), onchange: (e) => { parent[key] = e.target.checked; markDirty(); } }),
      LABELS[key] || key);
  }
  if (key === 'image' || key === 'shareImage') return imageField(parent, key);
  return textField(parent, key);
}

let uidN = 0;
const uid = () => `f${++uidN}`;

function textField(parent, key, labelText) {
  const id = uid();
  const limit = LIMITS[key];
  const count = limit ? el('span', { class: 'count' }) : null;
  const upd = (v) => { if (count) { count.textContent = `${v.length}/${limit}`; count.classList.toggle('over', v.length > limit); } };
  const input = LONG.has(key)
    ? el('textarea', { id, rows: 3 })
    : el('input', { id, type: 'text' });
  input.value = parent[key] ?? '';
  input.addEventListener('input', () => { parent[key] = input.value; upd(input.value); markDirty(); });
  upd(input.value);
  return el('div', { class: 'field' }, el('label', { for: id, text: labelText || LABELS[key] || key }), input, count);
}

function imageField(parent, key) {
  const id = uid();
  const img = el('img', { alt: '' });
  const show = () => { const up = uploads.get(parent[key]); img.src = up ? up.url : new URL('../' + parent[key], location.href).href; };
  show();
  const file = el('input', { id, type: 'file', accept: 'image/webp,image/png,image/jpeg' });
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alertMsg('Imagem acima de 2 MB. Use WebP ou JPG menor (o site carrega mais rápido).'); file.value = ''; return; }
    const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }[f.type];
    if (!ext) { alertMsg('Use uma imagem WebP, PNG ou JPG.'); return; }
    const slug = f.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'imagem';
    const path = `img/${slug}-${Date.now().toString(36)}.${ext}`;
    const base64 = await new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = fail; r.readAsDataURL(f); });
    uploads.set(path, { base64, url: URL.createObjectURL(f) });
    parent[key] = path; markDirty(); show(); pathInfo.textContent = path;
  });
  const pathInfo = el('small', { text: parent[key] });
  return el('div', { class: 'field' }, el('span', { class: 'lbl', text: LABELS[key] || key }),
    el('div', { class: 'img-field' }, img, el('div', { class: 'list' }, pathInfo, el('label', { for: id, text: 'Trocar imagem' }), file)));
}

function listEditor(parent, key) {
  const arr = parent[key];
  const isText = arr.every((v) => typeof v === 'string');
  const wrap = el('div', { class: 'group' });
  const draw = () => {
    wrap.replaceChildren(
      el('div', { class: 'group-head' }, el('b', { text: LABELS[key] || key }),
        el('button', { type: 'button', class: 'b small', text: '+ Adicionar', onclick: () => {
          arr.push(isText ? '' : blankLike(arr[0] || {})); markDirty(); draw();
        } })),
      ...arr.map((item, i) => {
        const tools = el('div', { class: 'group-head' },
          el('b', { text: `${i + 1}${item && item.title ? ' · ' + item.title : item && item.q ? ' · ' + item.q : item && item.name ? ' · ' + item.name : ''}` }),
          el('button', { type: 'button', class: 'b small', text: '↑', title: 'Subir', disabled: i === 0 ? true : undefined,
            onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; markDirty(); draw(); } }),
          el('button', { type: 'button', class: 'b small', text: '↓', title: 'Descer', disabled: i === arr.length - 1 ? true : undefined,
            onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; markDirty(); draw(); } }),
          el('button', { type: 'button', class: 'b small danger', text: 'Remover',
            onclick: () => { if (window.confirm('Remover este item?')) { arr.splice(i, 1); markDirty(); draw(); } } }));
        const body = isText ? textField(arr, i, LABELS[key] || 'Texto') : editNode({ v: item }, 'v');
        return el('div', { class: 'group' }, tools, body);
      }));
  };
  draw();
  return wrap;
}

function blankLike(o) {
  const b = {};
  for (const [k, v] of Object.entries(o)) b[k] = Array.isArray(v) ? [] : typeof v === 'boolean' ? false : typeof v === 'object' && v ? blankLike(v) : '';
  return b;
}

function alertMsg(text) {
  const box = $('#errors');
  box.replaceChildren(el('span', { text }));
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ------------------------------------------------------------------ pré-visualização
$('#btn-preview').addEventListener('click', () => {
  const errs = validate(data);
  showErrors(errs);
  const files = buildSite(template, data, today());
  // Base no endereço publicado: imagens e fontes vêm do site; imagens novas ainda não enviadas usam a cópia local
  const site = data.site.url.endsWith('/') ? data.site.url : data.site.url + '/';
  let html = files['index.html']
    .replace(/(src|href)="(img|fonts)\//g, `$1="${site}$2/`)
    .replace(/url\("fonts\//g, `url("${site}fonts/`);
  for (const [path, up] of uploads) html = html.split(path).join(up.url);
  $('#preview-frame').srcdoc = html;
  $('#preview-frame').style.width = '100%';
  $('#preview-dlg').showModal();
});
$('#close-preview').addEventListener('click', () => $('#preview-dlg').close());
document.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { $('#preview-frame').style.width = b.dataset.w + 'px'; }));

function showErrors(errs) {
  const box = $('#errors');
  if (!errs.length) { box.hidden = true; return; }
  box.replaceChildren(el('span', { text: 'Corrija antes de publicar:' }), el('ul', {}, errs.map((e) => el('li', { text: e }))));
  box.hidden = false;
}

const today = () => new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------ publicar
$('#btn-publish').addEventListener('click', publish);

async function publish() {
  const errs = validate(data);
  showErrors(errs);
  if (errs.length) return;
  const btn = $('#btn-publish');
  btn.disabled = true; btn.textContent = 'Publicando…';
  try {
    const files = buildSite(template, data, today());
    files['content/site.json'] = JSON.stringify(data, null, 2) + '\n';
    const ref = await ghJson(`/git/ref/heads/${BRANCH}`);
    const head = await ghJson(`/git/commits/${ref.object.sha}`);
    const entries = [];
    for (const [path, content] of Object.entries(files)) {
      const blob = await ghJson('/git/blobs', { method: 'POST', body: JSON.stringify({ content, encoding: 'utf-8' }) });
      entries.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    for (const [path, up] of uploads) {
      const blob = await ghJson('/git/blobs', { method: 'POST', body: JSON.stringify({ content: up.base64, encoding: 'base64' }) });
      entries.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const tree = await ghJson('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree: entries }) });
    const commit = await ghJson('/git/commits', { method: 'POST', body: JSON.stringify({
      message: `Painel: atualiza o site (${new Date().toLocaleString('pt-BR')})`, tree: tree.sha, parents: [ref.object.sha] }) });
    await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
    uploads.clear();
    dirty = false; $('#dirty').hidden = true;
    currentTab = '_status'; renderTabs();
  } catch (err) {
    alertMsg(err.status === 422 || err.status === 409
      ? 'O site foi alterado em outro lugar enquanto você editava. Recarregue a página e refaça a alteração.'
      : err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Publicar';
  }
}

// ------------------------------------------------------------------ publicações e histórico
function statusView() {
  const sec = el('div', { class: 'sec' }, el('h2', { text: 'Publicações' }),
    el('p', { class: 'hint', text: 'Depois de publicar, o GitHub leva cerca de 1 minuto para colocar a nova versão no ar.' }));
  const live = el('div', { class: 'list' }, el('p', { class: 'hint', text: 'Consultando…' }));
  const hist = el('div', {}, el('p', { class: 'hint', text: 'Carregando histórico…' }));
  sec.append(live, el('h2', { text: 'Histórico do conteúdo' }),
    el('p', { class: 'hint', text: '“Abrir no editor” carrega aquela versão para você revisar; ela só vai ao ar quando você clicar em Publicar.' }), hist);
  pollStatus(live);
  loadHistory(hist);
  return sec;
}

async function pollStatus(box, tries = 0) {
  if (!box.isConnected) return;
  try {
    const b = await ghJson('/pages/builds/latest');
    const st = { built: ['ok', 'No ar'], building: ['run', 'Publicando…'], queued: ['run', 'Na fila…'], errored: ['err', 'Falhou'] }[b.status] || ['run', b.status];
    box.replaceChildren(el('div', { class: 'status-row' },
      el('span', { class: `pill ${st[0]}`, text: st[1] }),
      el('span', { text: `Última publicação: ${new Date(b.updated_at || b.created_at).toLocaleString('pt-BR')}` }),
      el('a', { href: data.site.url, target: '_blank', rel: 'noopener', text: 'Abrir site' })));
    if (st[0] === 'run' && tries < 40) setTimeout(() => pollStatus(box, tries + 1), 5000);
  } catch (err) {
    box.replaceChildren(el('p', { class: 'hint', text: err.status === 403 || err.status === 404
      ? 'Sem permissão para ver o status do GitHub Pages (dê à chave a permissão “Pages: Read-only”).'
      : err.message }));
  }
}

async function loadHistory(box) {
  try {
    const commits = await ghJson(`/commits?path=content/site.json&sha=${BRANCH}&per_page=15`);
    box.replaceChildren(...commits.map((c) => el('div', { class: 'status-row' },
      el('span', { class: 'pill', text: new Date(c.commit.author.date).toLocaleDateString('pt-BR') }),
      el('span', { text: c.commit.message.split('\n')[0] }),
      el('button', { type: 'button', class: 'b small', text: 'Abrir no editor', onclick: async () => {
        if (dirty && !window.confirm('Descartar as alterações não publicadas?')) return;
        data = JSON.parse(await ghRaw('content/site.json', c.sha));
        uploads.clear(); markDirty(); currentTab = 'site'; renderTabs();
      } }))));
  } catch (err) { box.replaceChildren(el('p', { class: 'hint', text: err.message })); }
}

// ------------------------------------------------------------------ início
$('#repo-name-hint').textContent = `${OWNER}/${REPO}`;
const saved = storedToken();
let remembered = false;
try { remembered = !!localStorage.getItem(TOKEN_KEY); } catch {}
if (saved) login(saved, remembered).catch((err) => { clearToken(); $('#login-msg').className = 'msg err'; $('#login-msg').textContent = err.message; });
