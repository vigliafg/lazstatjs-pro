import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSurveyOutput } from './run';
import type { SurveyParams } from '../../io/project';

const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'Group', type: 'cat' as const },
    { name: 'Weight', type: 'num' as const },
    { name: 'Stratum', type: 'cat' as const },
    { name: 'PSU', type: 'cat' as const },
  ],
  rows: Array.from({ length: 16 }, (_, index) => [
    String(10 + (index % 4) * 2 + Math.floor(index / 4)),
    index % 2 === 0 ? 'A' : 'B',
    index % 3 === 0 ? '2' : '1',
    index < 8 ? 'S1' : 'S2',
    `P${index % 4}`,
  ]),
};

const params = (overrides: Partial<SurveyParams> = {}): SurveyParams => ({
  mode: 'mean',
  variable: 0,
  category: 1,
  successLevel: '',
  weight: 2,
  strata: 3,
  cluster: 4,
  predictors: [0],
  ...overrides,
});

test('the survey estimate draws the interval and the design effect', () => {
  const result = buildSurveyOutput({ grid, params: params(), ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, ['survey-interval', 'survey-deff']);
  const deff = (result.charts ?? []).find(chart => chart.id === 'survey-deff');
  assert.equal(deff?.kind, 'bar');
  const bars = deff?.data.bars ?? [];
  assert.equal(bars.length, 1);
  assert.ok(Number.isFinite(Number(bars[0]?.value)));
  assert.ok(Number(bars[0]?.value) > 0);
  // The reference line marks DEFF = 1, the simple-random-sample benchmark.
  assert.deepEqual(deff?.data.rules, [{ value: 1 }]);
  assert.match(deff?.note ?? '', /campione casuale semplice/);
});

test('the regression mode keeps its coefficient forest and has no design effect', () => {
  const result = buildSurveyOutput({
    grid,
    params: params({ mode: 'regression', predictors: [2] }),
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual((result.charts ?? []).map(chart => chart.id), ['survey-coefficients']);
  assert.equal((result.charts ?? [])[0]?.kind, 'forest');
});

test('a proportion estimate also reports its design effect', () => {
  const result = buildSurveyOutput({
    grid,
    params: params({ mode: 'proportion', successLevel: 'A' }),
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('survey-interval'));
  assert.ok(ids.includes('survey-deff'));
  const bars = (result.charts ?? []).find(chart => chart.id === 'survey-deff')?.data.bars ?? [];
  assert.ok(bars.length > 0);
  assert.ok(bars.every(bar => Number.isFinite(Number(bar.value))));
});
