import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function devEntryPlugin(): Plugin {
  return {
    name: 'movix-dev-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const r = req as { url?: string };
        if (r.url === '/' || r.url === '/index.html') {
          r.url = '/app.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), devEntryPlugin()],
  build: {
    outDir: 'assets',
    emptyOutDir: true,
    assetsDir: '',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        format: 'es',
        entryFileNames: 'movix-app.js',
        chunkFileNames: 'movix-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((n) => n.endsWith('.css'))) {
            return 'movix-app.css';
          }
          return '[name]-[hash][extname]';
        },
      },
    },
  },
});
