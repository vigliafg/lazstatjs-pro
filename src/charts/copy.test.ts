import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chartCopy } from '../stats/reportCopy/catalog/en/charts';
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

const idsOf = (directory: string): string[] => {
  const found = new Set<string>();
  for (const name of readdirSync(directory)) {
    if (name !== 'run.tsx') continue;
    idsInSource(readFileSync(join(directory, name), 'utf8')).forEach(id => found.add(id));
  }
  return [...found];
};

/** Panels carry chart titles/notes too, even though they live outside a runner. */
const panelIds = (): string[] => idsInSource(readFileSync('src/charts/panels.ts', 'utf8'));

const SOURCE_IDS = [
  ...idsOf('src/analyses/regression'),
  ...idsOf('src/analyses/distfit'),
  ...idsOf('src/analyses/agreement'),
  ...idsOf('src/analyses/survival'),
  ...idsOf('src/analyses/samplesize'),
  ...idsOf('src/analyses/nonparamrm'),
  ...idsOf('src/analyses/logistic'),
  ...idsOf('src/analyses/multivariate'),
  ...idsOf('src/analyses/chisquare'),
  ...idsOf('src/analyses/repeatedanova'),
  ...idsOf('src/analyses/factorial'),
  ...idsOf('src/analyses/ancova'),
  ...idsOf('src/analyses/descriptive'),
  ...idsOf('src/analyses/ttest'),
  ...idsOf('src/analyses/anova'),
  ...idsOf('src/analyses/correlation'),
  ...idsOf('src/analyses/cox'),
  ...idsOf('src/analyses/timeseries'),
  ...idsOf('src/analyses/wizard'),
  ...idsOf('src/analyses/mixedanova'),
  ...idsOf('src/analyses/tost'),
  ...idsOf('src/analyses/countreg'),
  ...idsOf('src/analyses/ordinal'),
  ...idsOf('src/analyses/lmm'),
  ...idsOf('src/analyses/gee'),
  ...idsOf('src/analyses/stratcox'),
  ...idsOf('src/analyses/tdcox'),
  ...idsOf('src/analyses/parametric'),
  ...idsOf('src/analyses/contingency'),
  ...idsOf('src/analyses/mi'),
  ...idsOf('src/analyses/resampling'),
  ...idsOf('src/analyses/agreement'),
  ...idsOf('src/analyses/partition'),
  ...idsOf('src/analyses/quality'),
  ...idsOf('src/analyses/cluster'),
  ...idsOf('src/analyses/discriminant'),
  ...idsOf('src/analyses/doe'),
  ...panelIds(),
];

test('every chart copy call has an English translation', () => {
  const missing = SOURCE_IDS.filter(id => !(id in chartCopy));
  assert.deepEqual(missing, [], `missing English chart copy:\n${missing.join('\n')}`);
});

test('chart copy keeps the placeholders aligned and has no unused entry', () => {
  const source = new Set(SOURCE_IDS);
  const orphans = Object.keys(chartCopy).filter(id => !source.has(id));
  assert.deepEqual(orphans, [], `unused chart copy:\n${orphans.join('\n')}`);
  for (const [id, translated] of Object.entries(chartCopy)) {
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
