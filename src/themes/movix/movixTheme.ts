import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

// Identidade "Sinalização" do Movix (mesma do app 2.12):
// amarelo-sinal #FFD200 só para "você está aqui / faça isto agora", tinta #111111,
// chão branco (claro) ou #121212 (escuro), cantos de placa (3–4px), sem vidro nem sombra.
export const movixTheme = defineTheme({
  name: 'movix',
  extends: neutralTheme,
  tokens: {
    '--color-accent': ['#111111', '#FFD200'],
    '--color-accent-muted': ['rgba(255, 210, 0, 0.22)', 'rgba(255, 210, 0, 0.16)'],
    '--color-on-accent': ['#FFD200', '#111111'],
    '--color-text-accent': ['#111111', '#FFD200'],
    '--color-icon-accent': ['#111111', '#FFD200'],
    '--color-background-body': ['#FFFFFF', '#121212'],
    '--color-background-surface': ['#F4F4F1', '#1A1A1A'],
    '--color-background-card': ['#FFFFFF', '#1C1C1C'],
    '--color-background-popover': ['#FFFFFF', '#222222'],
    '--color-background-muted': ['#F4F4F1', '#242424'],
    '--color-text-primary': ['#111111', '#F2F2EF'],
    '--color-text-secondary': ['#4A4A47', '#B8B8B3'],
    '--color-border': ['#DCDCD7', '#333333'],
    '--color-border-emphasized': ['#111111', '#8A8A86'],
    '--color-success': ['#0F7A45', '#5CCB94'],
    '--color-warning': ['#FFD200', '#FFD200'],
    '--color-on-warning': ['#111111', '#111111'],
    '--radius-element': '3px',
    '--radius-inner': '3px',
    '--radius-container': '4px',
    '--radius-page': '4px',
    '--font-family-heading': '"Overpass", system-ui, "Segoe UI", Arial, sans-serif',
    '--font-family-body': '"Overpass", system-ui, "Segoe UI", Arial, sans-serif',
  },
});
