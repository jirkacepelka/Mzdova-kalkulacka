import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Dvě stránky: kalkulačka a informace s metodikou. Metodika je jako
      // informace/index.html, takže /informace/ funguje na jakémkoli statickém hostingu.
      input: {
        index: 'index.html',
        informace: 'informace/index.html',
      },
    },
  },
});
