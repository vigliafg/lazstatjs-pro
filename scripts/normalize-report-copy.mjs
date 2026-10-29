/**
 * Normalises one report-copy wave: reads every per-module catalog, drops
 * duplicate message ids (TypeScript rejects them, JavaScript keeps the last
 * one) and writes a clean, sorted `Record<string, string>` per module.
 *
 * Usage: `node --import tsx scripts/normalize-report-copy.mjs de`
 *
 * The script is deliberately mechanical: it only touches
 * `src/stats/reportCopy/catalog/<locale>/<module>.ts`, never the source
 * builders. It reports keys whose translation equals the Italian source.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const locale = process.argv[2];
if (!locale) {
  console.error('usage: node --import tsx scripts/normalize-report-copy.mjs <locale>');
  process.exit(1);
}

const dir = join('src/stats/reportCopy/catalog', locale);
const files = readdirSync(dir).filter(name => name.endsWith('.ts') && name !== 'index.ts');

const q = value => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

let duplicates = 0;
let identical = 0;
let total = 0;

for (const name of files) {
  const path = join(dir, name);
  const source = readFileSync(path, 'utf8');
  const match = source.match(/export const (\w+):\s*Record<string,\s*string>/);
  if (!match) {
    console.log(`skip ${name}: no exported Record<string, string>`);
    continue;
  }
  const exportName = match[1];
  const module = await import(`../${path}`);
  const entries = Object.entries(module[exportName] ?? {});

  const seen = new Set();
  const unique = [];
  for (const [id, value] of entries) {
    if (seen.has(id)) {
      duplicates += 1;
      continue;
    }
    seen.add(id);
    unique.push([id, value]);
    if (id === value) identical += 1;
  }
  total += unique.length;

  const body = unique
    .sort(([a], [b]) => a.localeCompare(b, 'it'))
    .map(([id, value]) => `  ${q(id)}:\n    ${q(value)},`)
    .join('\n');
  writeFileSync(
    path,
    `/** ${locale}: report and table prose (normalised). */\nexport const ${exportName}: Record<string, string> = {\n${body}\n};\n`
  );
}

console.log(`${locale}: ${files.length} modules, ${total} keys, ${duplicates} duplicates removed, ${identical} identical to source`);
