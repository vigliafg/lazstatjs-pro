import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { enReportCopy } from './reportCopy/catalog';
import { copy, getReportLocale, withReportLocale } from './reportCopy';
import { placeholdersOf } from '../i18n/format';

/**
 * Guards of the written output translation.
 *
 * The builders keep the Italian sentence as the message id, so these tests
 * compare the catalog against the real call sites instead of a hand-written
 * list: adding a sentence without its English version fails here.
 */

const MESSAGE = /\bcopy\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;

const unescape = (value: string): string => value.replace(/\\'/g, "'").replace(/\\"/g, '"');

const idsOf = (directory: string): string[] => {
  const found = new Set<string>();
  for (const name of readdirSync(directory)) {
    if (!name.endsWith('.ts') || name.endsWith('.test.ts')) continue;
    const source = readFileSync(join(directory, name), 'utf8');
    for (const match of source.matchAll(MESSAGE)) found.add(unescape(match[1] ?? match[2]));
  }
  return [...found];
};

const SOURCE_IDS = [...idsOf('src/stats/reports'), ...idsOf('src/stats/tables')];

/** Words that only survive in an untranslated Italian sentence. */
const ITALIAN_MARKERS = [
  ' della ',
  ' delle ',
  ' degli ',
  ' nella ',
  ' nelle ',
  ' quindi ',
  ' perché ',
  ' sono ',
  ' anche ',
  ' questo ',
  ' questa ',
  ' viene ',
  ' valore ',
  ' gruppo ',
  ' gruppi ',
  ' misure ',
  ' soglia ',
];

test('the translation catalog covers every sentence of reports and tables', () => {
  const missing = SOURCE_IDS.filter(id => !(id in enReportCopy));
  assert.deepEqual(missing, [], `missing English copy:\n${missing.join('\n')}`);
});

test('the catalog has no extra entry and keeps the placeholders aligned', () => {
  const source = new Set(SOURCE_IDS);
  const orphans = Object.keys(enReportCopy).filter(id => !source.has(id));
  assert.deepEqual(orphans, [], `unused English copy:\n${orphans.join('\n')}`);
  for (const [id, translated] of Object.entries(enReportCopy)) {
    assert.deepEqual(
      placeholdersOf(translated).sort(),
      placeholdersOf(id).sort(),
      `placeholders differ: ${id}`
    );
  }
});

test('no English sentence still reads as Italian', () => {
  const leaked = Object.entries(enReportCopy)
    .filter(([id, translated]) => id !== translated)
    .filter(([, translated]) => {
      const padded = ` ${translated.toLowerCase()} `;
      return ITALIAN_MARKERS.some(marker => padded.includes(marker));
    })
    .map(([id]) => id);
  assert.deepEqual(leaked, [], `untranslated sentences:\n${leaked.join('\n')}`);
});

test('copy() returns the Italian source by default and the translation when asked', () => {
  assert.equal(getReportLocale(), 'it');
  assert.equal(copy('Il test principale'), 'Il test principale');
  const english = withReportLocale('en', () => copy('Il test principale'));
  assert.equal(english, 'The main test');
  assert.equal(getReportLocale(), 'it', 'the language is restored after the run');
  const interpolated = withReportLocale('en', () => copy('Statistica t = {s1} con df = {s2}.', { s1: 2.5, s2: 12 }));
  assert.equal(interpolated, 't statistic = 2.5 with df = 12.');
});

test('an unknown sentence falls back to the Italian source instead of breaking', () => {
  assert.equal(withReportLocale('en', () => copy('Frase non tradotta di prova')), 'Frase non tradotta di prova');
});

test('settings offer exactly the report languages with a complete catalog', async () => {
  const { REPORT_LOCALES } = await import('../i18n/locales');
  const { TRANSLATED_REPORT_LOCALES } = await import('./reportCopy/types');
  for (const locale of REPORT_LOCALES) {
    assert.ok(
      (TRANSLATED_REPORT_LOCALES as readonly string[]).includes(locale),
      `${locale} is selectable but has no complete report catalog`
    );
  }
  for (const locale of TRANSLATED_REPORT_LOCALES) {
    if (locale === 'it') continue;
    assert.ok(REPORT_LOCALES.includes(locale as never), `${locale} is translated but not selectable`);
  }
});
