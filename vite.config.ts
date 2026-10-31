import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode, command}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Electron loads `dist/index.html` from disk, so production assets must be
    // relative. The Vite dev server (browser and e2e) keeps the absolute base.
    base: command === 'build' ? './' : '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // The statistical file reader only needs zlib for compressed .zsav
        // files, which LazStats does not accept. Keep the browser bundle free
        // of a Node builtin without pulling a full zlib polyfill.
        'node:zlib': path.resolve(__dirname, 'src/io/statfmt/zlib-shim.ts'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor chunks: charts and React change rarely and should not share
          // the main chunk with the application code.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // Vega-Lite is loaded on demand by the chart renderer; keeping it
            // in its own chunk prevents the initial bundle and the worker from
            // carrying the runtime.
            if (id.includes('vega') || id.includes('d3-')) {
              return 'vega';
            }
            if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) {
              return 'react';
            }
            if (id.includes('xlsx')) return 'xlsx';
            if (id.includes('@irbisadm/statfmt')) return 'statfiles-vendor';
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
