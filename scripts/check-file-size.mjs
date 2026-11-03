import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * Guardrail sulle dimensioni dei file.
 *
 * Il limite è basso di proposito: un file che cresce oltre 700 righe va
 * spezzato oppure aggiunto alle eccezioni con una motivazione. Per le
 * eccezioni vale il valore attuale: non possono crescere in silenzio.
 */
const LIMIT = 700;
const EXCEPTIONS = new Map([
  ['src/stats/kernels/arima.ts', 1304], // kernel numerico compatto
  ['src/App.tsx', 754], // composizione root: preset, salvataggio, temi, comandi desktop e row state L5
  ['src/charts/features.ts', 701], // registro unico dei controlli: una riga in più dopo gli oggetti L4
  ['src/io/project/types.ts', 873], // tipi di tutti i parametri persistiti: un blocco per procedura
  ['src/io/project/parse.ts', 782], // parsing difensivo di tutti i parametri persistiti
  ['src/analyses/params.ts', 778], // normalizzazione/validazione di tutte le procedure
  ['src/analyses/roles.ts', 773], // mappa ruoli/colonne di tutte le procedure
  ['src/stats/reportCopy/catalog/en/charts.ts', 725], // catalogo inglese dei grafici, un blocco per famiglia
]);

const walk = directory =>
  readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const isSource = path =>
  /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path) && !/\.d\.ts$/.test(path);

const files = walk('src').filter(isSource).map(path => relative('.', path).split(sep).join('/'));
const violations = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text === '' ? 0 : text.replace(/\n$/, '').split('\n').length;
  const max = EXCEPTIONS.get(file) ?? LIMIT;
  if (lines > max) {
    const reason = EXCEPTIONS.has(file) ? `eccezione a ${max}` : `limite ${LIMIT}`;
    violations.push(`${file}: ${lines} righe (${reason})`);
  }
}

for (const [file, max] of EXCEPTIONS) {
  if (!files.includes(file)) {
    violations.push(`${file}: eccezione dichiarata ma file assente`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  const lines = text === '' ? 0 : text.replace(/\n$/, '').split('\n').length;
  if (lines < max) {
    violations.push(`${file}: eccezione a ${max} ma il file è sceso a ${lines} righe — abbassala`);
  }
}

if (violations.length > 0) {
  console.error('File troppo grandi o eccezioni non aggiornate:');
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

console.log(`✔ file size: ${files.length} file sotto ${LIMIT} righe (${EXCEPTIONS.size} eccezioni)`);
