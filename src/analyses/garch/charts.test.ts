import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGarchOutput } from './run';

const values = Array.from({ length: 80 }, (_, index) => {
  const cluster = index % 20 < 10 ? 1.6 : 0.4;
  return 100 + cluster * Math.sin(index / 2);
});

const grid = {
  cols: [{ name: 'Rendimento', type: 'num' as const }],
  rows: values.map(value => [String(value)]),
};

const base = {
  grid,
  params: { variable: 0, horizon: 5 },
  ciLevel: 95,
};

test('GARCH draws the volatility, the residual autocorrelation and a Q-Q plot', () => {
  const result = buildGarchOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.ok(ids.includes('garch-volatility'));
  assert.ok(ids.includes('garch-residual-acf'));
  assert.ok(ids.includes('garch-qq'));
});

test('the GARCH Q-Q plot uses the standardized residuals', () => {
  const result = buildGarchOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'garch-qq');
  assert.ok(chart, 'the Q-Q chart is present');
  if (!chart) return;
  assert.equal(chart.kind, 'qq');
  const points = chart.data.points ?? [];
  assert.equal(points.length, values.length);
  assert.ok(points.every(point => Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y))));
  assert.equal((chart.data.reference ?? []).length, 2);
  assert.ok((chart.data.band ?? []).length > 0, 'the confidence envelope is present');
  assert.match(chart.subtitle ?? '', /Jarque–Bera = \d+\.\d{2} \(p = /);
  assert.match(chart.note ?? '', /compatibili con la normale/);
});
