import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chartCopy } from '../stats/reportCopy/catalog/en/charts';
import { placeholdersOf } from '../i18n/format';

/** Chart titles/notes are report content: they need an English source too. */
const MESSAGE = /\bcopy\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;

const idsOf = (directory: string): string[] => {
  const found = new Set<string>();
  for (const name of readdirSync(directory)) {
    if (name !== 'run.tsx') continue;
    const source = readFileSync(join(directory, name), 'utf8');
    for (const match of source.matchAll(MESSAGE)) found.add((match[1] ?? match[2]).replace(/\\'/g, "'"));
  }
  return [...found];
};

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
