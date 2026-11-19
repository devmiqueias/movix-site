// Gera index.html, sitemap.xml e robots.txt a partir de template/ + content/site.json.
// Uso: node build.mjs   (o painel /admin faz o mesmo no navegador ao publicar)
import { readFileSync, writeFileSync } from 'node:fs';
import { buildSite, validate } from './admin/render.js';

const data = JSON.parse(readFileSync('content/site.json', 'utf8'));
const errors = validate(data);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
const files = buildSite(readFileSync('template/index.html', 'utf8'), data, today);
for (const [name, body] of Object.entries(files)) writeFileSync(name, body);
console.log('Gerado:', Object.keys(files).join(', '));
