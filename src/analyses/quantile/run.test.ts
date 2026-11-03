import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuantileOutput } from './run';
import type { ColType, GridData } from '../../grid/types';

const cols: { name: string; type: ColType }[] = [
  { name: 'X', type: 'num' },
  { name: 'Y', type: 'num' },
  { name: 'Z', type: 'num' },
];

/** Relazione lineare esatta: Y = 2 + 3X, con Z scorrelato dal residuo. */
const rows: string[][] = Array.from({ length: 12 }, (_, index) => {
  const x = index + 1;
  return [String(x), String(2 + 3 * x), String((index % 4) + 1)];
});

const grid: GridData = { cols, rows };

const params = { dep: 1, indeps: [0], tau: 0.5 };

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} != ${expected} (${tolerance})`
  );

/** Motivo del rifiuto, con un errore esplicito se il builder accetta l'input. */
const reasonOf = (result: ReturnType<typeof buildQuantileOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('quantile builder emits coefficients, fit table, report and both charts', () => {
  const result = buildQuantileOutput({ grid, params });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['quantile-coefficients', 'quantile-fit']
  );
  assert.equal(result.report?.id, 'report-quantile');

  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(chartIds, ['quantile-line', 'quantile-residuals']);

  const coefficients = result.tables[0].rows;
  assert.equal(coefficients.length, 2);
  assert.equal(coefficients[0].predictor, '(Intercept)');
  close(Number(coefficients[0].beta), 2);
  close(Number(coefficients[1].beta), 3);

  const line = (result.charts ?? []).find(chart => chart.id === 'quantile-line');
  assert.equal(line?.kind, 'scatter');
  assert.equal((line?.data.points ?? []).length, 12);
  const fitLine = line?.data.fit ?? [];
  assert.equal(fitLine.length, 2);
  close(Number(fitLine[0].y), 5);
  close(Number(fitLine[1].y), 38);

  const residuals = (result.charts ?? []).find(chart => chart.id === 'quantile-residuals');
  assert.equal(residuals?.kind, 'residual');
  assert.equal((residuals?.data.points ?? []).length, 12);
  assert.equal((residuals?.data.rules ?? []).length, 1);
});

test('the line chart profiles the first predictor when there are several', () => {
  const result = buildQuantileOutput({
    grid,
    params: { dep: 1, indeps: [0, 2], tau: 0.25 },
  });
  assert.ok(result.ok);
  if (!result.ok) return;

  const line = (result.charts ?? []).find(chart => chart.id === 'quantile-line');
  assert.ok(line);
  assert.match(String(line?.subtitle), /media/i);
  assert.match(String(line?.note), /primo predittore/i);
  assert.equal((line?.data.fit ?? []).length, 2);
  assert.equal((result.charts ?? []).filter(chart => chart.id === 'quantile-residuals').length, 1);
});

test('quantile builder rejects a target outside (0, 1)', () => {
  for (const tau of [0, 1, -0.2, 1.2, Number.NaN]) {
    const result = buildQuantileOutput({ grid, params: { ...params, tau } });
    assert.match(reasonOf(result), /between 0 and 1/);
  }
});

test('quantile builder validates the dependent variable and the predictors', () => {
  const selfPredictor = buildQuantileOutput({
    grid,
    params: { ...params, indeps: [0, 1] },
  });
  assert.match(reasonOf(selfPredictor), /cannot also be a predictor/);

  const noPredictors = buildQuantileOutput({ grid, params: { ...params, indeps: [] } });
  assert.match(reasonOf(noPredictors), /at least one predictor/);

  const invalidPredictor = buildQuantileOutput({
    grid,
    params: { ...params, indeps: [9] },
  });
  assert.match(reasonOf(invalidPredictor), /valid predictors/);
});

test('quantile builder rejects too few complete observations', () => {
  const shortGrid: GridData = { cols, rows: rows.slice(0, 3) };
  const result = buildQuantileOutput({ grid: shortGrid, params });
  assert.match(reasonOf(result), /Not enough complete rows/);

  const twoPredictors: GridData = { cols, rows: rows.slice(0, 4) };
  const resultTwo = buildQuantileOutput({
    grid: twoPredictors,
    params: { ...params, indeps: [0, 2] },
  });
  assert.match(reasonOf(resultTwo), /Not enough complete rows/);
});
