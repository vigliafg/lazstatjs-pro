/**
 * Bundle the Electron main process and preload with esbuild.
 *
 * The renderer is built by Vite into `dist`; this script only produces the two
 * CommonJS files Electron loads at startup. Node built-ins and Electron itself
 * stay external, while `electron-updater` is left as a production dependency so
 * electron-builder can package it with its update metadata.
 */
import { build } from 'esbuild';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const outdir = join(process.cwd(), 'dist-electron');
rmSync(outdir, { recursive: true, force: true });

const common = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['electron', 'electron-updater'],
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
};

await Promise.all([
  build({
    ...common,
    entryPoints: [join(process.cwd(), 'electron', 'main.ts')],
    outfile: join(outdir, 'main.cjs'),
  }),
  build({
    ...common,
    entryPoints: [join(process.cwd(), 'electron', 'preload.ts')],
    outfile: join(outdir, 'preload.cjs'),
  }),
]);
