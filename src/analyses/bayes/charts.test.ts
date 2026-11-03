import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBayesOutput } from './run';
import type { BayesParams } from '../../io/project';

const params = (overrides: Partial<BayesParams> = {}): BayesParams => ({
  mode: 'proportion',
  outcome: 0,
  predictors: [],
  group: -1,
  priorMean: 0,
  priorSd: 10,
  iterations: 300,
  burnin: 100,
  chains: 2,
  seed: 20261109,
  ...overrides,
});

const proportionGrid = {
  cols: [{ name: 'Success', type: 'int' as const }],
  rows: Array.from({ length: 20 }, (_, index) => [index % 2 === 0 ? '1' : '0']),
};

const normalGrid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'X', type: 'num' as const },
  ],
  rows: Array.from({ length: 20 }, (_, index) => [String(5 + (index % 5)), String(index % 4)]),
};

test('the proportion mode compares the observed successes with the posterior replicates', () => {
  const result = buildBayesOutput({ grid: proportionGrid, params: params() });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'bayes-ppc');
  assert.ok(chart, 'the posterior predictive check is present');
  if (!chart) return;
  assert.equal(chart.kind, 'line');
  const series = chart.data.series ?? [];
  const curve = series.filter(row => row.series === 'Repliche');
  const observed = series.filter(row => row.series === 'Osservato');
  assert.equal(curve.length, 21);
  assert.equal(observed.length, 2);
  assert.equal(Number(observed[0].x), 10);
  assert.equal(observed[0].y, 0);
  assert.ok(Number(observed[1].y) > 0);
  assert.match(chart.subtitle ?? '', /20 osservazioni/);
  assert.match(chart.note ?? '', /valore osservato/);
});

test('the normal mode compares the observed mean with the posterior replicates', () => {
  const result = buildBayesOutput({ grid: normalGrid, params: params({ mode: 'normal' }) });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'bayes-ppc');
  assert.ok(chart);
  if (!chart) return;
  const series = chart.data.series ?? [];
  const curve = series.filter(row => row.series === 'Repliche');
  const observed = series.filter(row => row.series === 'Osservato');
  assert.equal(curve.length, 121);
  assert.equal(observed.length, 2);
  assert.ok(Math.abs(Number(observed[0].x) - 7) < 1e-9);
  assert.ok(curve.every(row => Number(row.y) >= 0));
});

test('the modes without a likelihood leave the predictive check out', () => {
  const result = buildBayesOutput({
    grid: normalGrid,
    params: params({ mode: 'rate', priorMean: 1 }),
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(!(result.charts ?? []).some(chart => chart.id === 'bayes-ppc'));
});
