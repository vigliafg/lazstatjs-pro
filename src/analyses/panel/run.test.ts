import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPanelOutput } from './run';
import type { PanelParams } from '../../io/project';
import type { ColType, GridData } from '../../grid/types';
import type { AnalysisRunResult } from '../types';

const csv = readFileSync(
  new URL('../../../samples/regression/panel_demo/data.csv', import.meta.url),
  'utf8'
)
  .trim()
  .split(/\r?\n/);
const header = csv[0].split(',').map(value => value.replace(/^"|"$/g, '').trim());
const rows = csv.slice(1).map(line => line.split(',').map(value => value.trim()));

const grid: GridData = {
  cols: header.map(name => ({ name, type: 'num' as ColType })),
  rows,
};

// ID = 0, Time = 1, Y = 2, X1 = 3, X2 = 4.
const params: PanelParams = {
  dep: 2,
  indeps: [3, 4],
  entity: 0,
  time: 1,
  model: 'both',
};

const close = (actual: unknown, expected: number, tolerance = 1e-6) =>
  assert.ok(
    typeof actual === 'number' && Math.abs(actual - expected) < tolerance,
    `${actual} != ${expected} (${tolerance})`
  );

const isFailure = (
  result: AnalysisRunResult
): result is Extract<AnalysisRunResult, { ok: false }> => !result.ok;

const reasonOf = (result: ReturnType<typeof buildPanelOutput>): string => {
  if (isFailure(result)) return result.reason;
  throw new Error('expected the builder to reject the input');
};

const tableOf = (result: ReturnType<typeof buildPanelOutput>, id: string) => {
  if (isFailure(result)) throw new Error(result.reason);
  return result.tables.find(table => table.id === id)?.rows ?? [];
};

test('panel builder fits the panel_demo sample and exposes tables, report and charts', () => {
  const result = buildPanelOutput({ grid, params, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.equal(result.title, 'Modelli panel — Y');
  assert.deepEqual(
    result.tables.map(table => table.id),
    ['panel-fe', 'panel-re', 'panel-variance', 'panel-hausman', 'panel-fit']
  );
  assert.equal(result.report?.id, 'report-panel');
  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    ['panel-observed-fitted', 'panel-entity-effects', 'panel-fe-re']
  );

  const fe = tableOf(result, 'panel-fe');
  assert.deepEqual(
    fe.map(row => row.term),
    ['X1', 'X2']
  );
  close(fe[0].beta, 0.7547247894554506);
  close(fe[1].beta, -0.4021281835623205);
  close(fe[0].se, 0.02931730399885767);
  close(fe[1].se, 0.04254621213730119);
  close(fe[0].seClassic, 0.02974769463061761);

  const re = tableOf(result, 'panel-re');
  assert.deepEqual(
    re.map(row => row.term),
    ['(Intercept)', 'X1', 'X2']
  );
  close(re[0].beta, 1.060329305417623);
  close(re[1].beta, 0.7930220851121615);
  close(re[2].beta, -0.39521139186051674);
  close(re[1].se, 0.03576122570049131);
  close(re[1].seCluster, 0.0278427068240983);

  const variance = tableOf(result, 'panel-variance');
  assert.match(String(variance[0].value), /0\.3718/);
  assert.match(String(variance[1].value), /0\.2406/);
  assert.match(String(variance[2].value), /0\.6341/);

  const hausman = tableOf(result, 'panel-hausman');
  close(hausman[0].statistic, 3.73881544513206);
  assert.equal(Number(hausman[0].df), 2);
  assert.match(String(hausman[0].verdict), /non definita positiva/);

  const fit = tableOf(result, 'panel-fit');
  const metric = (name: string) => fit.find(row => row.metric === name)?.value;
  assert.equal(metric('Osservazioni'), '300');
  assert.equal(metric('Entità'), '30');
  assert.equal(metric('Periodi'), '10');
  assert.equal(metric('Panel bilanciato'), 'sì');
  assert.match(String(metric('R² within (FE)')), /0\.7526/);

  const observed = (result.charts ?? [])[0];
  assert.equal(observed.kind, 'scatter');
  assert.equal(observed.data.series?.length, rows.length);

  const effects = (result.charts ?? [])[1];
  assert.equal(effects.kind, 'bar');
  assert.equal(effects.data.bars?.length, 30);

  const comparison = (result.charts ?? [])[2];
  assert.equal(comparison.kind, 'bar');
  assert.equal(comparison.data.bars?.length, 4);
});

test('panel builder returns only the requested model', () => {
  const fixed = buildPanelOutput({ grid, params: { ...params, model: 'fe' }, ciLevel: 95 });
  assert.ok(fixed.ok);
  if (!fixed.ok) return;
  assert.deepEqual(
    fixed.tables.map(table => table.id),
    ['panel-fe', 'panel-variance', 'panel-fit']
  );
  assert.deepEqual(
    (fixed.charts ?? []).map(chart => chart.id),
    ['panel-observed-fitted', 'panel-entity-effects']
  );
  assert.match(String(fixed.header), /effetti fissi/);

  const random = buildPanelOutput({ grid, params: { ...params, model: 're' }, ciLevel: 90 });
  assert.ok(random.ok);
  if (!random.ok) return;
  assert.deepEqual(
    random.tables.map(table => table.id),
    ['panel-re', 'panel-variance', 'panel-fit']
  );
  // Without the FE fit the entity effects are the implied alpha_i of the RE
  // model, still one bar per entity.
  assert.equal((random.charts ?? [])[1].data.bars?.length, 30);
  assert.match(String(random.header), /effetti casuali/);
});

test('panel builder maps the confidence level into the intervals', () => {
  const narrow = buildPanelOutput({ grid, params, ciLevel: 90 });
  const wide = buildPanelOutput({ grid, params, ciLevel: 99 });
  assert.ok(narrow.ok && wide.ok);
  if (!narrow.ok || !wide.ok) return;
  const first = tableOf(narrow, 'panel-fe')[0];
  const second = tableOf(wide, 'panel-fe')[0];
  close(first.beta, Number(second.beta), 1e-12);
  assert.ok(Number(second.ciHi) - Number(second.ciLo) > Number(first.ciHi) - Number(first.ciLo));
});

test('panel builder validates the column roles', () => {
  assert.match(reasonOf(buildPanelOutput({ grid, params: { ...params, dep: 99 }, ciLevel: 95 })), /dependent variable/);
  assert.match(
    reasonOf(buildPanelOutput({ grid, params: { ...params, indeps: [] }, ciLevel: 95 })),
    /at least one predictor/
  );
  assert.match(
    reasonOf(buildPanelOutput({ grid, params: { ...params, indeps: [9] }, ciLevel: 95 })),
    /valid predictors/
  );
  assert.match(
    reasonOf(buildPanelOutput({ grid, params: { ...params, entity: 99 }, ciLevel: 95 })),
    /valid entity column/
  );
  assert.match(
    reasonOf(buildPanelOutput({ grid, params: { ...params, time: -1 }, ciLevel: 95 })),
    /valid time column/
  );
  assert.match(
    reasonOf(buildPanelOutput({ grid, params: { ...params, model: 'ols' as never }, ciLevel: 95 })),
    /valid panel model/
  );

  // Overlapping roles: entity and dependent variable on the same column.
  const overlap = buildPanelOutput({ grid, params: { ...params, entity: 2 }, ciLevel: 95 });
  assert.match(reasonOf(overlap), /different columns/);

  // A predictor that is also the time index.
  const timeOverlap = buildPanelOutput({ grid, params: { ...params, indeps: [1, 3] }, ciLevel: 95 });
  assert.match(reasonOf(timeOverlap), /different columns/);
});

test('panel builder rejects data without a usable panel structure', () => {
  const tooFew = buildPanelOutput({
    grid: { cols: grid.cols, rows: rows.slice(0, 3) },
    params,
    ciLevel: 95,
  });
  assert.match(reasonOf(tooFew), /Not enough complete rows/);

  // One entity only.
  const singleEntity = buildPanelOutput({
    grid: { cols: grid.cols, rows: rows.map(row => ['1', ...row.slice(1)]) },
    params,
    ciLevel: 95,
  });
  assert.match(reasonOf(singleEntity), /could not be estimated/);

  // Duplicated entity–period cells.
  const duplicate = buildPanelOutput({
    grid: { cols: grid.cols, rows: rows.map((row, index) => (index === 1 ? [row[0], '1', ...row.slice(2)] : row)) },
    params,
    ciLevel: 95,
  });
  assert.match(reasonOf(duplicate), /could not be estimated/);

  // Collinear predictors.
  const collinear = buildPanelOutput({
    grid: {
      cols: grid.cols,
      rows: rows.map(row => [row[0], row[1], row[2], row[3], row[3]]),
    },
    params,
    ciLevel: 95,
  });
  assert.match(reasonOf(collinear), /could not be estimated/);

  // Missing values in the response: the incomplete rows are dropped and, with
  // only one row left, the panel cannot be estimated.
  const sparse = buildPanelOutput({
    grid: { cols: grid.cols, rows: rows.map((row, index) => (index === 0 ? [row[0], row[1], ''] : row)) },
    params,
    ciLevel: 95,
  });
  assert.ok(sparse.ok);
});
