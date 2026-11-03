import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContingencyOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project/types';

const params = {
  ...DEFAULT_PARAMS.contingency,
  values: [
    ['10', '5'],
    ['3', '12'],
  ],
  rows: ['Esposto', 'Non esposto'],
  cols: ['Evento', 'Nessun evento'],
};

test('the exact mode pairs observed and expected frequencies per cell', () => {
  const result = buildContingencyOutput({
    params: { ...params, mode: 'exact' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('exact-observed-expected'));
  assert.ok(ids.includes('contingency-exact-residuals'));

  const chart = result.charts!.find(candidate => candidate.id === 'exact-observed-expected');
  assert.equal(chart?.kind, 'bar');
  const bars = chart?.data.bars ?? [];
  assert.equal(bars.length, 8);
  const observed = bars.filter(bar => bar.series === 'Osservato').map(bar => Number(bar.value));
  const expected = bars.filter(bar => bar.series === 'Atteso').map(bar => Number(bar.value));
  assert.deepEqual(observed, [10, 5, 3, 12]);
  // Expected values under independence for this table are 6.5, 8.5, 6.5, 8.5.
  assert.deepEqual(expected, [6.5, 8.5, 6.5, 8.5]);
  const categories = [...new Set(bars.map(bar => String(bar.category)))];
  assert.equal(categories.length, 4);
});

test('the trend chart documents the missing confidence band', () => {
  const result = buildContingencyOutput({
    params: {
      ...params,
      mode: 'trend',
      values: [
        ['2', '18'],
        ['6', '14'],
        ['12', '8'],
      ],
      rows: ['Basso', 'Medio', 'Alto'],
      cols: ['Sì', 'No'],
      scores: ['1', '2', '3'],
    },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const trend = result.charts!.find(chart => chart.id === 'contingency-trend-line');
  assert.ok(trend);
  assert.match(String(trend?.note), /non c’è una banda di confidenza/);
  assert.equal((trend?.data.series ?? []).length, 3);
});
