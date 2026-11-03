import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { enChartCopy } from '../stats/reportCopy/catalog/charts';
import { enReportCopy } from '../stats/reportCopy/catalog';
import { l4ChartCopy as enL4ChartCopy } from '../stats/reportCopy/catalog/en/charts-l4';
import { l4ChartCopy as deL4ChartCopy } from '../stats/reportCopy/catalog/de/charts-l4';
import { l4ChartCopy as esL4ChartCopy } from '../stats/reportCopy/catalog/es/charts-l4';
import { l4ChartCopy as frL4ChartCopy } from '../stats/reportCopy/catalog/fr/charts-l4';
import { l4ChartCopy as ptPTL4ChartCopy } from '../stats/reportCopy/catalog/pt-PT/charts-l4';
import { copy, withReportLocale } from '../stats/reportCopy';
import { placeholdersOf } from '../i18n/format';

/** Chart titles/notes are report content: they need an English source too. */
const MESSAGE = /\bcopy\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;

const idsInSource = (source: string): string[] => {
  const found = new Set<string>();
  for (const match of source.matchAll(MESSAGE)) {
    found.add((match[1] ?? match[2]).replace(/\\'/g, "'"));
  }
  return [...found];
};

/** Every non-test module under an analysis directory: sub-runners carry copy too. */
const analysisFiles = (): string[] => {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) {
        files.push(path);
      }
    }
  };
  walk('src/analyses');
  return files;
};

/** Panels carry chart titles/notes too, even though they live outside a runner. */
const panelIds = (): string[] => idsInSource(readFileSync('src/charts/panels.ts', 'utf8'));

/** `copy()` resolves chart copy first, then the English report catalog. */
const hasEnglish = (id: string): boolean => id in enChartCopy || id in enReportCopy;

const SOURCE_IDS = [
  ...new Set([
    ...analysisFiles().flatMap(file => idsInSource(readFileSync(file, 'utf8'))),
    ...panelIds(),
  ]),
];

test('every chart copy call has an English translation', () => {
  const missing = SOURCE_IDS.filter(id => !hasEnglish(id));
  assert.deepEqual(missing, [], `missing English chart copy:\n${missing.join('\n')}`);
});

test('chart copy keeps the placeholders aligned and has no unused entry', () => {
  const source = new Set(SOURCE_IDS);
  const orphans = Object.keys(enChartCopy).filter(id => !source.has(id));
  assert.deepEqual(orphans, [], `unused chart copy:\n${orphans.join('\n')}`);
  for (const [id, translated] of Object.entries(enChartCopy)) {
    assert.deepEqual(placeholdersOf(translated).sort(), placeholdersOf(id).sort(), `placeholders differ: ${id}`);
  }
});

test('the L4 chart copy is complete in every translated report locale', () => {
  const expected = Object.keys(enL4ChartCopy).sort();
  const locales = {
    fr: frL4ChartCopy,
    es: esL4ChartCopy,
    de: deL4ChartCopy,
    'pt-PT': ptPTL4ChartCopy,
  } as const;
  for (const [locale, catalog] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(catalog).sort(), expected, `${locale}: L4 chart keys differ`);
    for (const [id, translated] of Object.entries(catalog)) {
      assert.ok(translated.trim().length > 0, `${locale}: empty L4 chart copy for ${id}`);
      assert.deepEqual(
        placeholdersOf(translated).sort(),
        placeholdersOf(id).sort(),
        `${locale}: placeholders differ for ${id}`
      );
    }
  }
});

test('chart copy reads the locale catalog for L4 titles', () => {
  const italian = 'Carta di controllo — {s1}';
  assert.equal(withReportLocale('fr', () => copy(italian, { s1: 'Y' })), 'Carte de contrôle — Y');
  assert.equal(withReportLocale('es', () => copy(italian, { s1: 'Y' })), 'Gráfico de control — Y');
  assert.equal(withReportLocale('de', () => copy(italian, { s1: 'Y' })), 'Regelkarte — Y');
  assert.equal(withReportLocale('pt-PT', () => copy(italian, { s1: 'Y' })), 'Carta de controlo — Y');
});
