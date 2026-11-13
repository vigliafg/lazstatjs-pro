/** Build the stdio MCP server and its heavy-analysis worker. */
import { build } from 'esbuild';
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outdir = join(root, 'dist-mcp');
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
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire as __lazstatsCreateRequire } from 'node:module';\nconst require = __lazstatsCreateRequire(import.meta.url);",
  },
};

await Promise.all([
  build({
    ...common,
    entryPoints: [join(root, 'src', 'mcp', 'main.ts')],
    outfile: join(outdir, 'lazstats-mcp.mjs'),
  }),
  build({
    ...common,
    entryPoints: [join(root, 'src', 'engine', 'worker', 'entry.ts')],
    outfile: join(outdir, 'worker-entry.mjs'),
  }),
]);

if (process.platform !== 'win32') chmodSync(join(outdir, 'lazstats-mcp.mjs'), 0o755);

// Keep the npm tarball self-contained: the MCP entry point and its worker are
// the only runtime files, and the package has its own `lazstats-mcp` bin.
const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
writeFileSync(
  join(outdir, 'package.json'),
  `${JSON.stringify(
    {
      name: 'lazstats-mcp',
      version: rootPackage.version,
      description: 'LazStats MCP stdio server',
      type: 'module',
      bin: { 'lazstats-mcp': 'lazstats-mcp.mjs' },
      files: ['lazstats-mcp.mjs', 'worker-entry.mjs'],
      engines: rootPackage.engines,
      license: rootPackage.license,
      homepage: rootPackage.homepage,
    },
    null,
    2
  )}\n`,
  'utf8'
);

console.log(
  `Built ${join(outdir, 'lazstats-mcp.mjs')}, ${join(outdir, 'worker-entry.mjs')} and ${join(outdir, 'package.json')}`
);
