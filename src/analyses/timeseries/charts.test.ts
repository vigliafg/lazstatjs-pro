import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeSeriesOutput } from './run';
import { linearTrendLine } from './modes';

const column = (values: number[]) => ({
  cols: [{ name: 'Y', type: 'num' as const }],
  rows: values.map(value => [String(value)]),
});

const params = {
  variable: 0,
  period: 0,
  horizon: 4,
  differenceMode: 'auto' as const,
  seasonalDifferenceMode: 'auto' as const,
  mode: 'holtwinters' as const,
  seasonalModel: 'additive' as const,
  xregVariable: -1,
};

test('the linear trend line passes the endpoints and ignores empty series', () => {
  assert.deepEqual(linearTrendLine([1, 3]), [
    { x: 1, y: 1 },
    { x: 2, y: 3 },
  ]);
  assert.deepEqual(linearTrendLine([5]), []);
  const flat = linearTrendLine([2, 2, 2]);
  assert.equal(flat[0].y, 2);
  assert.equal(flat[1].y, 2);
});

test('Holt-Winters draws observed, fitted and forecast with a band', () => {
  const values = Array.from({ length: 24 }, (_, index) => 20 + index * 0.5 + [0, 4, 0, -4][index % 4]);
  const result = buildTimeSeriesOutput({
    grid: column(values),
    params: { ...params, period: 4, horizon: 4 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'hw-series');
  assert.ok(chart, 'the Holt-Winters chart is present');
  if (!chart) return;
  assert.equal(chart.kind, 'line');
  const series = chart.data.series ?? [];
  const names = new Set(series.map(row => String(row.series)));
  assert.deepEqual([...names].sort(), ['Adattato', 'Osservato', 'Previsione'].sort());
  const forecast = series.filter(row => row.series === 'Previsione');
  assert.equal(forecast.length, 4);
  assert.ok(forecast.every(row => Number(row.hi) > Number(row.lo)), 'each forecast carries an interval');
  assert.ok(
    forecast.every(row => Number(row.x) > values.length),
    'the forecast starts after the last observation'
  );
  assert.ok((chart.data.markers ?? []).length === values.length, 'the observations are marked');
});

test('the unit-root chart shows the series with its linear trend and the ADF statistic', () => {
  const values = Array.from({ length: 30 }, (_, index) => 10 + index * 0.8 + (index % 3));
  const result = buildTimeSeriesOutput({
    grid: column(values),
    params: { ...params, mode: 'unitroot' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'unitroot-series');
  assert.ok(chart, 'the unit-root chart is present');
  if (!chart) return;
  const trend = (chart.data.series ?? []).filter(row => row.series === 'Trend lineare');
  assert.equal(trend.length, 2);
  assert.equal(Number(trend[0].x), 1);
  assert.equal(Number(trend[1].x), values.length);
  assert.ok(Number(trend[1].y) > Number(trend[0].y), 'a rising series has a rising trend');
  assert.match(chart.note ?? '', /ADF = -?\d\.\d{3}/);
});

test('the spectral chart explains the dominant peak', () => {
  const values = Array.from({ length: 48 }, (_, index) => 50 + 10 * Math.sin((2 * Math.PI * index) / 12));
  const result = buildTimeSeriesOutput({
    grid: column(values),
    params: { ...params, mode: 'spectral' },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'spectral-density');
  assert.ok(chart, 'the spectral chart is present');
  if (!chart) return;
  const names = new Set((chart.data.series ?? []).map(row => String(row.series)));
  assert.ok(names.has('Periodogramma'));
  assert.ok(names.has('Densità smussata'));
  assert.match(chart.note ?? '', /periodo 12\.00 osservazioni/);
  assert.match(chart.note ?? '', /Fisher g = \d\.\d{3}/);
});
