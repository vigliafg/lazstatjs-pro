import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeSeriesOutput } from './run';

const grid = {
  cols: [{ name: 'Y', type: 'num' as const }],
  rows: Array.from({ length: 12 }, (_, index) => [String(index + 1)]),
};

const base = {
  grid,
  params: {
    variable: 0,
    period: 0,
    horizon: 3,
    differenceMode: 'auto' as const,
    seasonalDifferenceMode: 'auto' as const,
  },
  ciLevel: 95,
};

test('time-series builder returns tables, report and forecast content', () => {
  const result = buildTimeSeriesOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  assert.ok(result.tables.some(spec => spec.id === 'ts-acf'));
});

test('time-series builder validates the series length and period', () => {
  const shortSeries = buildTimeSeriesOutput({
    ...base,
    grid: { ...grid, rows: [['1'], ['2'], ['3'], ['4']] },
  });
  assert.ok('reason' in shortSeries);
  if ('reason' in shortSeries) assert.match(shortSeries.reason, /at least five observations/);

  const invalidPeriod = buildTimeSeriesOutput({ ...base, params: { ...base.params, period: 1 } });
  assert.ok('reason' in invalidPeriod);
  if ('reason' in invalidPeriod) assert.match(invalidPeriod.reason, /seasonal period/);

  const invalidHorizon = buildTimeSeriesOutput({ ...base, params: { ...base.params, horizon: 0 } });
  assert.ok('reason' in invalidHorizon);
  if ('reason' in invalidHorizon) assert.match(invalidHorizon.reason, /forecast horizon/);
});

test('time-series builder rejects non-finite period and horizon', () => {
  for (const period of [Number.NaN, Number.POSITIVE_INFINITY]) {
    const result = buildTimeSeriesOutput({ ...base, params: { ...base.params, period } });
    assert.ok('reason' in result);
    if ('reason' in result) assert.match(result.reason, /seasonal period/);
  }
  for (const horizon of [Number.NaN, Number.POSITIVE_INFINITY]) {
    const result = buildTimeSeriesOutput({ ...base, params: { ...base.params, horizon } });
    assert.ok('reason' in result);
    if ('reason' in result) assert.match(result.reason, /forecast horizon/);
  }
});
