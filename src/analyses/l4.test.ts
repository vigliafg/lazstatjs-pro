import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../charts/vega/buildSpec';
import { buildPartitionOutput } from './partition/run';
import { buildQualityOutput } from './quality/run';
import { buildClusterOutput } from './cluster/run';
import { buildDiscriminantOutput } from './discriminant/run';
import { buildDoeOutput } from './doe/run';
import { DEFAULT_PARAMS } from '../io/project';
import type { AnalysisRunResult } from './types';
import type { ColType, GridData } from '../grid/types';

const numeric = (names: string[]): { name: string; type: ColType }[] =>
  names.map(name => ({ name, type: 'num' }));

const chartsOf = (result: AnalysisRunResult) => {
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return [];
  const charts = [...(result.charts ?? []), ...(result.panels ?? []).flatMap(panel => panel.children)];
  for (const chart of charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(chart)), chart.id);
  }
  return result.charts ?? [];
};

const partitionGrid: GridData = {
  cols: numeric(['Y', 'A', 'B']),
  rows: Array.from({ length: 24 }, (_, index) => [
    String(index < 12 ? 0 : 10),
    String(index + 1),
    String((index * 7) % 5),
  ]),
};

const qualityGrid: GridData = {
  cols: [
    { name: 'Weight', type: 'num' },
    { name: 'Group', type: 'cat' },
    { name: 'Defect', type: 'cat' },
  ],
  rows: Array.from({ length: 30 }, (_, index) => [
    String(10 + (index % 5) + (index % 3) * 0.2),
    index % 2 === 0 ? 'A' : 'B',
    ['Scratch', 'Dent', 'Scratch', 'Crack'][index % 4],
  ]),
};

const clusterGrid: GridData = {
  cols: numeric(['X', 'Y']),
  rows: [
    ...Array.from({ length: 4 }, (_, index) => [String(index * 0.1), String(index * 0.1)]),
    ...Array.from({ length: 4 }, (_, index) => [String(10 + index * 0.1), String(10 + index * 0.1)]),
  ],
};

const discriminantGrid: GridData = {
  cols: [...numeric(['X', 'Y']), { name: 'G', type: 'cat' }],
  rows: [
    ...Array.from({ length: 8 }, (_, index) => [String(index * 0.1), String((index % 3) * 0.2), 'A']),
    ...Array.from({ length: 8 }, (_, index) => [String(5 + index * 0.1), String(6 + (index % 2) * 0.3), 'B']),
  ],
};

const doeGrid: GridData = {
  cols: numeric(['Y', 'A', 'B']),
  rows: Array.from({ length: 25 }, (_, index) => {
    const a = (index % 5) + 1;
    const b = Math.floor(index / 5) + 1;
    return [String(10 + 2 * a + 3 * b + 0.5 * a * b), String(a), String(b)];
  }),
};

test('partition runner emits the tree, the calibration scatter and importance', () => {
  const charts = chartsOf(
    buildPartitionOutput({
      grid: partitionGrid,
      params: { ...DEFAULT_PARAMS.partition, maxDepth: 3, minSplit: 3 },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.id), [
    'partition-tree',
    'partition-observed',
    'partition-importance',
  ]);
});

test('quality runner emits one chart per mode and the L3 quality panel', () => {
  const control = buildQualityOutput({
    grid: qualityGrid,
    params: { ...DEFAULT_PARAMS.quality, mode: 'control', variable: 0, chart: 'xbar', subgroup: 5 },
    ciLevel: 95,
  });
  const controlCharts = chartsOf(control);
  assert.equal(controlCharts[0].id, 'control-chart');
  assert.ok('ok' in control && control.ok && control.panels?.[0].id === 'panel-quality');

  const capability = chartsOf(
    buildQualityOutput({
      grid: qualityGrid,
      params: { ...DEFAULT_PARAMS.quality, mode: 'capability', variable: 0, lsl: 5, usl: 15, target: 10 },
      ciLevel: 95,
    })
  );
  assert.equal(capability[0].id, 'capab-histogram');

  const pareto = chartsOf(
    buildQualityOutput({
      grid: qualityGrid,
      params: { ...DEFAULT_PARAMS.quality, mode: 'pareto', category: 2 },
      ciLevel: 95,
    })
  );
  assert.equal(pareto[0].id, 'pareto-chart');
  assert.equal(pareto[0].kind, 'pareto');

  const variability = chartsOf(
    buildQualityOutput({
      grid: qualityGrid,
      params: { ...DEFAULT_PARAMS.quality, mode: 'variability', variable: 0, group: 1 },
      ciLevel: 95,
    })
  );
  assert.equal(variability[0].id, 'variab-box');

  const tolerance = chartsOf(
    buildQualityOutput({
      grid: qualityGrid,
      params: { ...DEFAULT_PARAMS.quality, mode: 'tolerance', variable: 0, toleranceP: 0.95 },
      ciLevel: 95,
    })
  );
  assert.equal(tolerance[0].id, 'tolerance-interval');
  assert.equal(tolerance[0].kind, 'interval');

  const cusum = chartsOf(
    buildQualityOutput({
      grid: qualityGrid,
      params: { ...DEFAULT_PARAMS.quality, mode: 'cusum', variable: 0 },
      ciLevel: 95,
    })
  );
  assert.equal(cusum[0].id, 'cusum-chart');
  assert.equal(cusum[0].kind, 'line');
});

test('cluster runner emits dendrogram, profiles and sizes', () => {
  const charts = chartsOf(
    buildClusterOutput({
      grid: clusterGrid,
      params: { ...DEFAULT_PARAMS.cluster, selected: [0, 1], clusters: 2 },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.id), [
    'cluster-dendrogram',
    'cluster-profile',
    'cluster-silhouette',
    'cluster-scatter',
    'cluster-merge-quality',
    'cluster-sizes',
  ]);
  assert.equal(charts[0].kind, 'dendrogram');
});

test('discriminant runner emits canonical, profile and coefficient charts', () => {
  const charts = chartsOf(
    buildDiscriminantOutput({
      grid: discriminantGrid,
      params: { group: 2, predictors: [0, 1] },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.id), [
    'discriminant-canonical',
    'discriminant-profile',
    'discriminant-coefficients',
  ]);
});

test('DOE runner emits surface, contour and coefficients', () => {
  const charts = chartsOf(
    buildDoeOutput({
      grid: doeGrid,
      params: { ...DEFAULT_PARAMS.doe, response: 0, factorA: 1, factorB: 2, model: 'quadratic' },
      ciLevel: 95,
    })
  );
  assert.deepEqual(charts.map(chart => chart.id), [
    'doe-surface',
    'doe-contour',
    'doe-coefficients',
  ]);
  assert.equal(charts[0].kind, 'surface');
  assert.equal((charts[0].options as { display: string }).display, 'mesh');
  assert.equal((charts[1].options as { display: string }).display, 'contour');
});
