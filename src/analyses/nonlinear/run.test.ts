import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNonlinearOutput } from './run';

/** Curva logistica sintetica: L = 10, k = 1, x0 = 5, senza rumore. */
const logisticGrid = () => ({
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'num' as const },
  ],
  rows: Array.from({ length: 9 }, (_, index) => {
    const x = index + 1;
    const y = 10 / (1 + Math.exp(-(x - 5)));
    return [String(x), String(y)];
  }),
});

const base = {
  grid: logisticGrid(),
  params: { dep: 1, predictor: 0, model: 'logistic' as const },
  ciLevel: 95,
};

test('nonlinear builder fits a logistic curve and exposes tables, report and charts', () => {
  const result = buildNonlinearOutput(base);
  assert.ok(result.ok);
  if (!result.ok) return;

  const tableIds = result.tables.map(table => table.id);
  assert.deepEqual(tableIds, ['nonlinear-parameters', 'nonlinear-fit']);
  assert.equal(result.report?.id, 'report-nonlinear');

  const parameters = result.tables[0].rows.map(row => ({
    name: String(row.parameter),
    estimate: Number(row.estimate),
  }));
  assert.deepEqual(
    parameters.map(row => row.name),
    ['L', 'k', 'x0']
  );
  const estimateOf = (name: string) => parameters.find(row => row.name === name)?.estimate ?? Number.NaN;
  assert.ok(Math.abs(estimateOf('L') - 10) < 0.2, `L = ${estimateOf('L')}`);
  assert.ok(Math.abs(estimateOf('k') - 1) < 0.2, `k = ${estimateOf('k')}`);
  assert.ok(Math.abs(estimateOf('x0') - 5) < 0.2, `x0 = ${estimateOf('x0')}`);
  assert.ok(parameters.every(row => Number.isFinite(row.estimate)));

  const fitRows = result.tables[1].rows;
  const r2 = Number(fitRows.find(row => row.metric === 'R²')?.value);
  assert.ok(Number.isFinite(r2) && r2 > 0.99, `R² = ${r2}`);
  const converged = fitRows.find(row => row.metric === 'Convergenza')?.value;
  assert.equal(converged, 'Sì');

  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(chartIds, ['nonlinear-curve', 'nonlinear-residuals']);

  const curve = (result.charts ?? []).find(chart => chart.id === 'nonlinear-curve');
  assert.equal(curve?.kind, 'scatter');
  assert.equal(curve?.data.points?.length, 9);
  assert.equal(curve?.data.fit?.length, 60);
  assert.deepEqual(curve?.fields.xLabel, 'X');
  assert.deepEqual(curve?.fields.yLabel, 'Y');

  const residuals = (result.charts ?? []).find(chart => chart.id === 'nonlinear-residuals');
  assert.equal(residuals?.kind, 'residual');
  assert.equal(residuals?.data.points?.length, 9);
  assert.ok((residuals?.data.points ?? []).every(point => Number.isFinite(Number(point.y))));
});

test('nonlinear builder rejects equal dependent variable and predictor', () => {
  const result = buildNonlinearOutput({
    ...base,
    params: { ...base.params, dep: 0, predictor: 0 },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /must be different/);
});

test('nonlinear builder requires at least four complete pairs', () => {
  const result = buildNonlinearOutput({
    ...base,
    grid: {
      cols: base.grid.cols,
      rows: [
        ['1', '1'],
        ['2', '2'],
        ['3', '3'],
      ],
    },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /at least 4/);
});

test('nonlinear builder reports a kernel failure instead of a partial fit', () => {
  // Il modello potenza richiede x > 0: lo zero rende la stima impossibile.
  const result = buildNonlinearOutput({
    ...base,
    params: { ...base.params, model: 'power' },
    grid: {
      cols: base.grid.cols,
      rows: [
        ['0', '1'],
        ['1', '2'],
        ['2', '4'],
        ['3', '8'],
        ['4', '16'],
      ],
    },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /did not converge/);
});

test('nonlinear builder rejects a grid without the selected columns', () => {
  const result = buildNonlinearOutput({
    ...base,
    grid: { cols: base.grid.cols, rows: [] },
    params: { ...base.params, predictor: 3 },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /Select a numeric/);
});
