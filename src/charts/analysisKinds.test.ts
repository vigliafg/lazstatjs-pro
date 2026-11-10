import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ANALYSIS_CHART_KINDS, chartKindsFor } from './analysisKinds';
import { CHART_KINDS } from '../stats/charts';
import { ANALYSIS_TABS } from '../analyses/registry';
import { stylesFor } from './styles';

test('every analysis declares valid chart kinds', () => {
  for (const [analysisId, kinds] of Object.entries(ANALYSIS_CHART_KINDS)) {
    assert.ok(analysisId.length > 0);
    assert.equal(new Set(kinds).size, kinds.length, `${analysisId}: duplicate kinds`);
    for (const kind of kinds) {
      assert.ok(CHART_KINDS.includes(kind), `${analysisId}: unknown kind ${kind}`);
    }
  }
  assert.deepEqual(chartKindsFor('unknown-analysis'), []);
});

test('every analysis in the registry has a declared chart-kind list', () => {
  const missing = ANALYSIS_TABS.map(tab => tab.id).filter(id => !(id in ANALYSIS_CHART_KINDS));
  assert.deepEqual(missing, [], `missing chart kinds:\n${missing.join('\n')}`);
});

/** Charts can also be emitted by sub-runners, not just by `run.tsx`. */
const runnerSources = (analysisId: string): string => {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\\.(ts|tsx)$/.test(entry.name) && !/\\.(test|spec)\\.(ts|tsx)$/.test(entry.name)) {
        files.push(path);
      }
    }
  };
  walk(join('src/analyses', analysisId));
  return files.map(file => readFileSync(file, 'utf8')).join('\n');
};

test('the declared kinds cover the literals emitted by each runner', () => {
  for (const [analysisId, kinds] of Object.entries(ANALYSIS_CHART_KINDS)) {
    if (analysisId === 'wizard' || analysisId === 'assistant') continue;
    const source = runnerSources(analysisId);
    const literals = new Set(
      [...source.matchAll(/makeChart\(\{[\s\S]{0,4000}?kind: '([a-z]+)'/g)].map(match => match[1])
    );
    for (const literal of literals) {
      assert.ok(
        kinds.includes(literal as never),
        `${analysisId}: runner emits ${literal} but the setup does not list it`
      );
    }
  }
});

test('procedures with chart styles expose at least one gallery kind', () => {
  // The setup section only appears when a procedure produces a kind with styles.
  const withGallery = Object.entries(ANALYSIS_CHART_KINDS).filter(([, kinds]) =>
    kinds.some(kind => stylesFor(kind).length > 1)
  );
  assert.ok(withGallery.length > 10, 'most procedures should offer a style choice');
});
