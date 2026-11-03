import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    entries: ['index.html', 'x440.html']
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: { portfolio: 'index.html', x440: 'x440.html', models:'x440-assets.html' },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') && !id.includes('/examples/')) return 'three-core';
          return undefined;
        }
      }
    }
  }
});
