/**
 * Remove obsolete English chart-copy entries by exact Italian key.
 *
 * Usage: node scripts/remove-chart-copy.mjs "<chiave italiana>" ...
 *
 * The copy test rejects entries that no longer have a `copy()` call, so when a
 * note is reworded the old translation must go with it. The entry is either a
 * single line (`"key": "value",`) or a key line followed by the value line.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/stats/reportCopy/catalog/en';
const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error('usage: node scripts/remove-chart-copy.mjs "<chiave>" ...');
  process.exit(1);
}

let removed = 0;
for (const file of readdirSync(dir)) {
  const path = `${dir}/${file}`;
  const lines = readFileSync(path, 'utf8').split('\n');
  const before = lines.length;
  for (const key of keys) {
    const head = `  ${JSON.stringify(key)}:`;
    const index = lines.findIndex(line => line.startsWith(head));
    if (index < 0) continue;
    const single = lines[index].trimEnd().endsWith(',');
    lines.splice(index, single ? 1 : 2);
    removed += 1;
  }
  if (lines.length !== before) {
    writeFileSync(path, lines.join('\n'));
    console.log(`${file}: -${before - lines.length} righe`);
  }
}
console.log(`voci rimosse: ${removed}/${keys.length}`);
