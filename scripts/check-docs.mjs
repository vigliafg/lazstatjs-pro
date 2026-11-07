import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

/**
 * Guardrail sui link della documentazione.
 *
 * Un documento che rimanda a un file spostato o cancellato è un difetto come
 * un test rotto: il lettore arriva nel vuoto e nessuno se ne accorge finché
 * non lo segnala. Questo controllo verifica che ogni link relativo in `docs/`
 * e nei file `.md` della radice risolva a un file esistente e che ogni
 * documento della guida sia raggiungibile dal proprio hub.
 *
 * Non controlla gli URL esterni: la rete non è un contratto del repository.
 */
const SKIP = new Set(['node_modules', 'dist', 'dist-electron', 'release', 'test-results', '.git']);
const LINK = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

const walk = (directory, out = []) => {
  for (const name of readdirSync(directory)) {
    if (SKIP.has(name)) continue;
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (extname(path) === '.md') out.push(path);
  }
  return out;
};

/** I blocchi di codice possono contenere esempi di link: non sono navigabili. */
const stripCode = text => text.replace(/```[\s\S]*?```/g, '');

const linksOf = file => {
  const text = stripCode(readFileSync(file, 'utf8'));
  return [...text.matchAll(LINK)].map(match => match[1]);
};

const isExternal = target => /^(https?:|mailto:|tel:|#|\/\/)/.test(target);

const files = [...walk('docs'), ...readdirSync('.').filter(name => name.endsWith('.md'))];
const broken = [];
let checked = 0;

for (const file of files) {
  for (const target of linksOf(file)) {
    if (isExternal(target)) continue;
    const clean = decodeURIComponent(target.split('#')[0]);
    if (!clean) continue;
    checked += 1;
    const resolved = clean.startsWith('/') ? resolve('.' + clean) : resolve(dirname(file), clean);
    if (!existsSync(resolved)) broken.push(`${relative('.', file)} -> ${target}`);
  }
}

/** Ogni documento della guida deve essere linkato dal proprio hub. */
for (const directory of ['docs/guide', 'docs/guide/en']) {
  const hub = join(directory, 'README.md');
  if (!existsSync(hub)) {
    broken.push(`${hub}: hub mancante`);
    continue;
  }
  const linked = new Set(
    linksOf(hub)
      .filter(target => !isExternal(target))
      .map(target => resolve(directory, decodeURIComponent(target.split('#')[0])))
  );
  for (const name of readdirSync(directory)) {
    if (name === 'README.md' || extname(name) !== '.md') continue;
    const path = resolve(directory, name);
    if (!linked.has(path)) broken.push(`${relative('.', path)}: non linkato da ${hub}`);
  }
}

if (broken.length > 0) {
  console.error('Link della documentazione non validi:');
  for (const item of broken) console.error(`  - ${item}`);
  process.exit(1);
}

console.log(`✔ docs: ${files.length} file, ${checked} link verificati`);
