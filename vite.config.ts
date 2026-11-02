import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `/informace` bez přípony i v `npm run dev`. Na Vercelu totéž zařídí
 * `cleanUrls` ve `vercel.json`.
 */
function cleanUrls(): Plugin {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/informace' || req.url?.startsWith('/informace?')) {
          req.url = req.url.replace('/informace', '/informace.html');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cleanUrls()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Dvě stránky: kalkulačka a informace s metodikou.
      input: {
        index: 'index.html',
        informace: 'informace.html',
      },
    },
  },
});
