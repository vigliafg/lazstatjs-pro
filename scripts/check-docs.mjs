import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

/**
 * Guardrail sui link della documentazione.
 *
 * Un documento che rimanda a un file spostato, a una sezione rinominata o a un
 * documento non raggiungibile dal suo hub è un difetto come un test rotto: il
 * lettore arriva nel vuoto e nessuno se ne accorge finché non lo segnala.
 *
 * Il controllo risolve ogni link relativo in `docs/` e nei file `.md` della
 * radice, verifica che il file esista, che l'eventuale anchor corrisponda a un
 * titolo (o a un id HTML esplicito) e che ogni documento della guida sia
 * linkato dal proprio hub. Gli URL esterni non sono controllati: la rete non è
 * un contratto del repository.
 */
const SKIP = new Set(['node_modules', 'dist', 'dist-electron', 'release', 'test-results', '.git']);
const LINK = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HEADING = /^#{1,6}\s+(.+?)\s*#*\s*$/gm;
const EXPLICIT_ID = /<a\s+(?:id|name)="([^"]+)"/gi;

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

/** Stessa regola di GitHub: minuscole, punteggiatura via, spazi in trattini. */
const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

const anchorCache = new Map();

/** Anchor disponibili in un documento, con i suffissi -1, -2 dei duplicati. */
const anchorsOf = file => {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const text = stripCode(readFileSync(file, 'utf8'));
  const seen = new Map();
  const anchors = new Set();
  for (const match of text.matchAll(HEADING)) {
    const base = slugify(match[1]);
    if (!base) continue;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  for (const match of text.matchAll(EXPLICIT_ID)) anchors.add(match[1]);
  anchorCache.set(file, anchors);
  return anchors;
};

const isExternal = target => /^(https?:|mailto:|tel:|\/\/)/.test(target);

const files = [...walk('docs'), ...readdirSync('.').filter(name => name.endsWith('.md'))];
const broken = [];
let checked = 0;
let anchorsChecked = 0;

for (const file of files) {
  for (const target of linksOf(file)) {
    if (isExternal(target)) continue;
    const [rawPath, rawAnchor] = target.split('#');
    const anchor = rawAnchor ? decodeURIComponent(rawAnchor) : '';
    const clean = decodeURIComponent(rawPath);
    if (!clean && !anchor) continue;
    checked += 1;
    const resolved = clean
      ? clean.startsWith('/')
        ? resolve('.' + clean)
        : resolve(dirname(file), clean)
      : file;
    if (clean && !existsSync(resolved)) {
      broken.push(`${relative('.', file)} -> ${target}`);
      continue;
    }
    if (!anchor || extname(resolved) !== '.md') continue;
    anchorsChecked += 1;
    if (!anchorsOf(resolved).has(anchor)) {
      broken.push(`${relative('.', file)} -> ${target} (anchor inesistente)`);
    }
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

console.log(`✔ docs: ${files.length} file, ${checked} link verificati (${anchorsChecked} con anchor)`);
