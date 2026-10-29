/**
 * Checks one translation wave before a locale is declared active.
 *
 * Usage: `node --import tsx scripts/check-locale.mjs <locale>`
 * Example: `node --import tsx scripts/check-locale.mjs fr`
 *
 * The script imports the catalog of the locale directly, so it works before the
 * locale is registered in `ACTIVE_LOCALES`/`REPORT_LOCALES`. It fails (exit 1)
 * on missing keys, missing help pages or missing report sentences, and prints
 * untranslated-looking strings as a review list without failing on them.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const locale = process.argv[2];
if (!locale) {
  console.error('usage: node --import tsx scripts/check-locale.mjs <locale>');
  process.exit(1);
}

const problems = [];
const notes = [];

const fail = message => problems.push(message);

const placeholders = text => [...new Set([...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]))].sort();

const samePlaceholders = (a, b) => JSON.stringify(placeholders(a)) === JSON.stringify(placeholders(b));

// ---------------------------------------------------------------------------
// Interface catalog
// ---------------------------------------------------------------------------
const AREAS = ['shell', 'form', 'data', 'analysis', 'output', 'meta'];
const base = join('src/i18n/catalog', locale);

if (!existsSync(base)) {
  fail(`missing interface catalog: ${base}`);
} else {
  const { enMessages } = await import('../src/i18n/catalog/en/index.ts');
  let catalog = {};
  for (const area of AREAS) {
    const path = join(base, `${area}.ts`);
    if (!existsSync(path)) {
      fail(`missing catalog area: ${path}`);
      continue;
    }
    const module = await import(`../${path}`);
    const messages = Object.values(module)[0];
    if (!messages || typeof messages !== 'object') {
      fail(`no exported object in ${path}`);
      continue;
    }
    catalog = { ...catalog, ...messages };
  }
  const keys = Object.keys(enMessages);
  const missing = keys.filter(key => !catalog[key]?.trim());
  for (const key of missing) fail(`ui: missing key ${key}`);
  for (const key of Object.keys(catalog)) {
    if (!(key in enMessages)) fail(`ui: unknown key ${key}`);
  }
  for (const key of keys) {
    if (catalog[key] && !samePlaceholders(catalog[key], enMessages[key])) {
      fail(`ui: placeholders differ for ${key}`);
    }
  }
  notes.push(`ui: ${keys.length - missing.length}/${keys.length} keys translated`);
  const identical = keys.filter(key => catalog[key] === enMessages[key]).length;
  notes.push(`ui: ${identical} strings identical to English (review acronyms and symbols)`);
}

// ---------------------------------------------------------------------------
// Help book
// ---------------------------------------------------------------------------
const helpPath = `src/help/content/${locale}/book.ts`;
if (!existsSync(helpPath)) {
  fail(`missing help book: ${helpPath}`);
} else {
  const { enBook } = await import('../src/help/content/en/book.ts');
  const book = Object.values(await import(`../${helpPath}`))[0];
  const ids = new Set(book.topics.map(topic => topic.id));
  for (const topic of enBook.topics) {
    if (!ids.has(topic.id)) fail(`help: missing page ${topic.id}`);
  }
  if (book.topics.length !== enBook.topics.length) {
    fail(`help: ${book.topics.length} pages, expected ${enBook.topics.length}`);
  }
  for (const topic of book.topics) {
    if (!topic.tutorial?.steps?.length) fail(`help: empty tutorial in ${topic.id}`);
    if (!topic.advanced?.whenToUse?.length) fail(`help: empty advanced section in ${topic.id}`);
  }
  notes.push(`help: ${book.topics.length} pages`);
}

// ---------------------------------------------------------------------------
// Report and table prose
// ---------------------------------------------------------------------------
/** Msgids really used by the builders (the reference for every wave). */
const sourceIds = () => {
  const ids = new Set();
  for (const directory of ['src/stats/reports', 'src/stats/tables']) {
    for (const name of readdirSync(directory)) {
      if (!name.endsWith('.ts') || name.endsWith('.test.ts')) continue;
      const source = readFileSync(join(directory, name), 'utf8');
      for (const match of source.matchAll(/\bcopy\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")/g)) {
        ids.add((match[1] ?? match[2]).replace(/\\'/g, "'"));
      }
    }
  }
  return [...ids];
};

const reportBase = `src/stats/reportCopy/catalog/${locale}`;
if (!existsSync(reportBase)) {
  fail(`missing report catalog: ${reportBase}`);
} else {
  const merged = await import('../src/stats/reportCopy/catalog/index.ts');
  const { enReportCopy } = merged;
  // English lives in the merged index; every other wave ships its own folder.
  const own = existsSync(`${reportBase}/index.ts`) ? await import(`../${reportBase}/index.ts`) : null;
  const translated = locale === 'en'
    ? { ...enReportCopy }
    : { ...(own ? Object.values(own)[0] ?? {} : {}) };
  if (locale !== 'en' && Object.keys(translated).length === 0) {
    for (const name of readdirSync(reportBase)) {
      if (!name.endsWith('.ts') || name === 'index.ts') continue;
      const module = await import(`../${reportBase}/${name}`);
      Object.assign(translated, Object.values(module)[0] ?? {});
    }
  }
  const ids = sourceIds();
  const missing = ids.filter(id => !translated[id]);
  for (const id of missing.slice(0, 40)) fail(`report: missing copy ${JSON.stringify(id.slice(0, 90))}`);
  if (missing.length > 40) fail(`report: …and ${missing.length - 40} more missing`);
  for (const [id, value] of Object.entries(translated)) {
    if (!enReportCopy[id]) fail(`report: unknown msgid ${JSON.stringify(String(id).slice(0, 90))}`);
    else if (!samePlaceholders(value, id)) fail(`report: placeholders differ for ${JSON.stringify(id.slice(0, 90))}`);
  }
  notes.push(`report: ${ids.length - missing.length}/${ids.length} sentences translated`);
}

// ---------------------------------------------------------------------------

for (const note of notes) console.log(`· ${note}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s) for "${locale}":`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`\n${locale}: translation wave complete.`);
