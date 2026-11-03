import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChoiceOutput } from './run';
import type { ChoiceParams } from '../../io/project';

const base: ChoiceParams = {
  mode: 'maxdiff',
  set: 0,
  alternative: 1,
  chosen: 2,
  best: 2,
  worst: 3,
  attributes: [],
};

const maxdiffGrid = {
  cols: [
    { name: 'Block', type: 'cat' as const },
    { name: 'Item', type: 'cat' as const },
    { name: 'Best', type: 'int' as const },
    { name: 'Worst', type: 'int' as const },
  ],
  rows: [
    ['B1', 'I1', '1', '0'],
    ['B1', 'I2', '0', '1'],
    ['B1', 'I3', '0', '0'],
    ['B2', 'I1', '0', '1'],
    ['B2', 'I2', '1', '0'],
    ['B2', 'I3', '0', '0'],
  ],
};

const choiceGrid = {
  cols: [
    { name: 'Set', type: 'cat' as const },
    { name: 'Alt', type: 'cat' as const },
    { name: 'Attr', type: 'num' as const },
    { name: 'Chosen', type: 'int' as const },
  ],
  rows: [
    ['S1', 'A1', '1', '1'],
    ['S1', 'A2', '2', '0'],
    ['S1', 'A3', '3', '0'],
    ['S2', 'A1', '1', '0'],
    ['S2', 'A2', '3', '1'],
    ['S2', 'A3', '2', '0'],
  ],
};

test('MaxDiff pairs the score bars with the share intervals', () => {
  const result = buildChoiceOutput({ grid: maxdiffGrid, params: base });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), ['choice-maxdiff-scores', 'choice-maxdiff-shares']);
  assert.equal(charts[0]?.kind, 'bar');
  assert.equal(charts[0]?.fields.xLabel, 'Elemento');
  assert.equal(charts[0]?.fields.yLabel, 'Punteggio');
  assert.equal(charts[1]?.kind, 'interval');
  assert.equal(charts[1]?.fields.xLabel, 'Quota %');
  assert.equal(charts[1]?.fields.yLabel, 'Elemento');
});

test('the conditional logit pairs the coefficient forest with the share bars', () => {
  const result = buildChoiceOutput({
    grid: choiceGrid,
    params: { ...base, mode: 'choice', chosen: 3, best: 3, worst: 3, attributes: [2] },
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), ['choice-coefficients', 'choice-shares']);
  assert.equal(charts[0]?.kind, 'forest');
  assert.equal(charts[0]?.fields.xLabel, 'Coefficiente');
  assert.equal(charts[0]?.fields.yLabel, 'Caratteristica');
  assert.equal(charts[1]?.kind, 'bar');
  assert.equal(charts[1]?.fields.xLabel, 'Alternativa');
  assert.equal(charts[1]?.fields.yLabel, 'Quota %');
});
