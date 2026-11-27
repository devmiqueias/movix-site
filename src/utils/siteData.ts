import fallbackSiteData from '../../content/site.json';
import type { SiteContent } from '../types/site';

export function getSiteContent(): SiteContent {
  if (typeof document !== 'undefined') {
    const el = document.getElementById('movix-site-data');
    if (el?.textContent) {
      try {
        return JSON.parse(el.textContent) as SiteContent;
      } catch {
        // fallback to bundled JSON
      }
    }
  }
  return fallbackSiteData as unknown as SiteContent;
}

export function buildWhatsappUrl(whatsapp: string, message?: string): string {
  const digits = String(whatsapp || '').replace(/\D/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function parseBrNumber(raw?: string | number): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const normalized = String(raw || '0')
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatBrl(value: number): string {
  return (
    'R$ ' +
    value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function getWebpSrcSet(img?: string): string | undefined {
  if (!img || !/\.webp$/i.test(img)) return undefined;
  return `${img.replace(/\.webp$/i, '-720.webp')} 720w, ${img} 1440w`;
}

export interface RichPart {
  text: string;
  bold: boolean;
}

export function parseRichBold(input: string): RichPart[] {
  const parts: RichPart[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: input.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    parts.push({ text: input.slice(lastIndex), bold: false });
  }
  return parts;
}
