import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor chunks: charts and React change rarely and should not share
          // the main chunk with the application code.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('victory') || id.includes('d3-')) return 'charts';
            if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) {
              return 'react';
            }
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('jstat')) return 'stats-vendor';
            if (id.includes('motion')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            return 'vendor';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
