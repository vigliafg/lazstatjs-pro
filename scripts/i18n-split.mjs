/**
 * One-off migration helper: splits the flat dictionary of `src/i18n.ts` into the
 * per-area catalogs of `src/i18n/catalog/en/`.
 *
 * Run with `node --import tsx scripts/i18n-split.mjs <path-to-legacy-i18n.ts>`.
 * The legacy module must still export `MESSAGE_KEYS` and `t`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = process.argv[2] ?? 'src/i18n.ts';
const mod = await import(join(process.cwd(), source));
const keys = mod.MESSAGE_KEYS;

const AREAS = {
  shell: [
    'app', 'nav', 'header', 'footer', 'settings', 'mode', 'action', 'title', 'code',
    'error', 'session', 'autosave', 'toast',
  ],
  form: ['form', 'levels', 'samplesize', 'wizard', 'posthoc', 'preset'],
  data: ['data', 'grid', 'inspector', 'clean', 'recode', 'columns'],
  analysis: ['analysis', 'hint', 'chisq', 'contingency', 'correlation', 'nonparam', 'agreement', 'multivariate'],
  output: ['output', 'io', 'project', 'import'],
};

const areaOf = (key) => {
  const prefix = key.split('.')[0];
  const area = Object.entries(AREAS).find(([, prefixes]) => prefixes.includes(prefix));
  if (!area) throw new Error(`No area for key ${key}`);
  return area[0];
};

const q = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const grouped = new Map(Object.keys(AREAS).map((area) => [area, []]));
for (const key of keys) grouped.get(areaOf(key)).push(key);

const outDir = join(process.cwd(), 'src/i18n/catalog/en');
mkdirSync(outDir, { recursive: true });

for (const [area, areaKeys] of grouped) {
  const body = areaKeys.map((key) => `  ${q(key)}: ${q(mod.t(key))},`).join('\n');
  const text = `/** English messages — ${area}. Source of truth for the message keys. */\nexport const ${area}Messages = {\n${body}\n} as const;\n`;
  writeFileSync(join(outDir, `${area}.ts`), text);
  console.log(`${area}: ${areaKeys.length} keys`);
}
console.log(`total: ${keys.length} keys`);
