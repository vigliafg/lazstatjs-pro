/**
 * Build the standalone LazStats CLI.
 *
 * The CLI and the heavy-analysis worker are two separate ESM bundles: the
 * worker must exist as its own entry point because worker_threads loads a file,
 * not an in-memory module. Keeping the bundle self-contained means the emitted
 * `lazstats` bin runs with plain Node and does not need tsx.
 */
import { build } from 'esbuild';
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outdir = join(root, 'dist-cli');
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const common = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
  // Some CommonJS dependencies (xlsx, vega internals) call require() lazily.
  // ESM has no ambient require, so provide the Node loader for those calls.
  banner: {
    js: "import { createRequire as __lazstatsCreateRequire } from 'node:module';\nconst require = __lazstatsCreateRequire(import.meta.url);",
  },
};

await Promise.all([
  build({
    ...common,
    entryPoints: [join(root, 'src', 'cli', 'main.ts')],
    outfile: join(outdir, 'lazstats.mjs'),
  }),
  build({
    ...common,
    entryPoints: [join(root, 'src', 'engine', 'worker', 'entry.ts')],
    outfile: join(outdir, 'worker-entry.mjs'),
  }),
]);

if (process.platform !== 'win32') chmodSync(join(outdir, 'lazstats.mjs'), 0o755);

// A standalone manifest keeps `npm pack ./dist-cli` from pulling the Electron
// package entry point and the renderer build into the CLI tarball.
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
writeFileSync(
  join(outdir, 'package.json'),
  `${JSON.stringify(
    {
      name: rootPackage.name,
      version: rootPackage.version,
      description: 'LazStats command line interface',
      type: 'module',
      bin: { lazstats: 'lazstats.mjs' },
      files: ['lazstats.mjs', 'worker-entry.mjs'],
      engines: rootPackage.engines,
      license: rootPackage.license,
      homepage: rootPackage.homepage,
    },
    null,
    2
  )}\n`,
  'utf8'
);

console.log(`Built ${join(outdir, 'lazstats.mjs')} and ${join(outdir, 'package.json')}`);
