import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildPlsOutput } from './run';
import { readDelimitedTable } from '../../io/readers';
import type { GridData } from '../../grid/types';

/** mtcars sample used by the reference fixtures and the R-09 plan row. */
const table = readDelimitedTable(
  readFileSync(fileURLToPath(new URL('../../../samples/regression/mtcars/data.csv', import.meta.url)), 'utf8'),
  { delimiter: ',', hasHeader: true }
);

const grid: GridData = {
  cols: table.names.map((name, index) => ({ name, type: table.types[index] })),
  rows: table.rows,
};

const column = (name: string): number => {
  const index = table.names.indexOf(name);
  assert.ok(index >= 0, `missing column ${name}`);
  return index;
};

const params = {
  dep: column('mpg'),
  indeps: [column('wt'), column('hp'), column('disp'), column('qsec')],
  components: 2,
  cvFolds: 5,
};

/** Reason of a rejected output, or an explicit error when the builder accepts. */
const reasonOf = (result: ReturnType<typeof buildPlsOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('PLS builder emits coefficients, components, VIP, report and charts on mtcars', () => {
  const result = buildPlsOutput({ grid, params, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['pls-coefficients', 'pls-components', 'pls-vip']
  );
  assert.equal(result.report?.id, 'report-pls');

  const coefficients = result.tables[0].rows;
  assert.equal(coefficients.length, 5);
  assert.equal(coefficients[0].predictor, '(Intercept)');
  assert.equal(coefficients[1].predictor, 'wt');
  assert.ok(coefficients.every(row => Number.isFinite(Number(row.beta))));

  const components = result.tables[1].rows;
  assert.equal(components.length, 2);
  assert.ok(components.every(row => Number.isFinite(Number(row.r2))));
  assert.ok(components.every(row => Number.isFinite(Number(row.cumulativeR2))));
  assert.ok(components.every(row => Number.isFinite(Number(row.q2))));

  const vip = result.tables[2].rows;
  assert.equal(vip.length, 4);
  assert.deepEqual(
    vip.map(row => row.predictor),
    ['wt', 'hp', 'disp', 'qsec']
  );
  assert.ok(vip.every(row => Number.isFinite(Number(row.vip))));

  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.equal(chartIds.length, 3);
  assert.deepEqual(chartIds, ['pls-observed-fitted', 'pls-cumulative-r2', 'pls-loadings']);

  const observedFitted = (result.charts ?? []).find(chart => chart.id === 'pls-observed-fitted');
  assert.equal(observedFitted?.kind, 'scatter');
  assert.equal((observedFitted?.data.points ?? []).length, 32);
  assert.equal((observedFitted?.data.fit ?? []).length, 2);

  const cumulative = (result.charts ?? []).find(chart => chart.id === 'pls-cumulative-r2');
  assert.equal(cumulative?.kind, 'line');
  assert.equal((cumulative?.data.series ?? []).length, 2);

  const loadings = (result.charts ?? []).find(chart => chart.id === 'pls-loadings');
  assert.equal(loadings?.kind, 'heatmap');
  const cells = loadings?.data.cells ?? [];
  assert.equal(cells.length, params.indeps.length * params.components);
  assert.ok(cells.every(cell => Number.isFinite(Number(cell.value))));
  assert.deepEqual(
    [...new Set(cells.map(cell => String(cell.x)))],
    ['C1', 'C2']
  );
});

test('PLS builder disables Q² when cvFolds is zero', () => {
  const result = buildPlsOutput({ grid, params: { ...params, cvFolds: 0 }, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;
  const components = result.tables[1].rows;
  assert.ok(components.every(row => Number.isNaN(Number(row.q2))));
});

test('PLS builder validates dependent variable and predictors', () => {
  const noPredictors = buildPlsOutput({
    grid,
    params: { ...params, indeps: [] },
    ciLevel: 95,
  });
  assert.match(reasonOf(noPredictors), /at least one predictor/);

  const selfPredictor = buildPlsOutput({
    grid,
    params: { ...params, indeps: [params.dep, params.indeps[0]] },
    ciLevel: 95,
  });
  assert.match(reasonOf(selfPredictor), /cannot also be a predictor/);

  const invalidPredictor = buildPlsOutput({
    grid,
    params: { ...params, indeps: [999] },
    ciLevel: 95,
  });
  assert.match(reasonOf(invalidPredictor), /valid predictors/);
});

test('PLS builder rejects components outside 1..p and invalid folds', () => {
  for (const components of [0, -1, params.indeps.length + 1, 1.5, Number.NaN]) {
    const result = buildPlsOutput({
      grid,
      params: { ...params, components },
      ciLevel: 95,
    });
    assert.match(reasonOf(result), /components must be/);
  }

  for (const cvFolds of [-1, 11, 2.5, Number.NaN]) {
    const result = buildPlsOutput({
      grid,
      params: { ...params, cvFolds },
      ciLevel: 95,
    });
    assert.match(reasonOf(result), /Cross-validation folds/);
  }
});

test('PLS builder rejects too few complete rows', () => {
  const shortGrid: GridData = { cols: grid.cols, rows: grid.rows.slice(0, 2) };
  const result = buildPlsOutput({ grid: shortGrid, params, ciLevel: 95 });
  assert.match(reasonOf(result), /Not enough complete rows/);

  // Four components require at least five complete rows.
  const fourRowGrid: GridData = { cols: grid.cols, rows: grid.rows.slice(0, 4) };
  const fourComponents = buildPlsOutput({
    grid: fourRowGrid,
    params: { ...params, components: 4 },
    ciLevel: 95,
  });
  assert.match(reasonOf(fourComponents), /Not enough complete rows/);
});
