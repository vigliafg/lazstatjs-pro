import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildIvOutput } from './run';
import type { IvParams } from '../../io/project';
import type { GridData } from '../../grid/types';

const csv = readFileSync(new URL('../../../samples/regression/iv_demo/data.csv', import.meta.url), 'utf8')
  .trim()
  .split(/\r?\n/);

const header = csv[0].split(',').map(value => value.replace(/^"|"$/g, '').trim());
const rows = csv.slice(1).map(line => line.split(',').map(value => value.trim()));

const grid: GridData = {
  cols: header.map(name => ({ name, type: 'num' as const })),
  rows,
};

// Y = 0, X = 1 (endogenous), Z1 = 2, Z2 = 3 (excluded instruments), W = 4 (exogenous).
const params: IvParams = {
  dep: 0,
  endog: [1],
  instruments: [2, 3],
  exog: [4],
  robust: false,
};

const tableOf = (result: ReturnType<typeof buildIvOutput>, id: string) => {
  assert.ok(result.ok);
  if (!result.ok) return [];
  return result.tables.find(table => table.id === id)?.rows ?? [];
};

test('IV builder fits the iv_demo sample and exposes tables, report and charts', () => {
  const result = buildIvOutput({ grid, params, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.equal(result.title, 'Variabili strumentali — Y');
  assert.deepEqual(
    result.tables.map(table => table.id),
    ['iv-structural', 'iv-first-stage', 'iv-diagnostics']
  );
  assert.equal(result.report?.id, 'report-iv');

  const structural = tableOf(result, 'iv-structural');
  assert.deepEqual(
    structural.map(row => row.term),
    ['(Intercept)', 'W', 'X']
  );
  const endogenous = structural.find(row => row.term === 'X');
  assert.ok(Math.abs(Number(endogenous?.beta) - 0.656946494386238) < 1e-6, String(endogenous?.beta));
  assert.ok(Number(endogenous?.se) > 0);

  const firstStage = tableOf(result, 'iv-first-stage');
  assert.deepEqual(
    firstStage.map(row => row.term),
    ['Z1', 'Z2']
  );
  assert.ok(Math.abs(Number(firstStage[0].f) - 150.157311002201) < 1e-6, String(firstStage[0].f));
  assert.equal(Number(firstStage[0].df1), 2);
  assert.equal(Number(firstStage[0].df2), 216);
  assert.equal(firstStage[1].f, null);

  const diagnostics = tableOf(result, 'iv-diagnostics');
  const sargan = diagnostics.find(row => row.metric === 'Sargan');
  const hausman = diagnostics.find(row => row.metric === 'Wu–Hausman');
  assert.ok(Math.abs(Number(sargan?.value) - 0.161692763383912) < 1e-4, String(sargan?.value));
  assert.equal(Number(sargan?.df), 1);
  assert.ok(Math.abs(Number(hausman?.value) - 97.0266264365241) < 1e-4, String(hausman?.value));
  assert.equal(String(hausman?.df), '1; 216');

  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    ['iv-observed-fitted', 'iv-residuals', 'iv-first-stage']
  );
  const observed = (result.charts ?? [])[0];
  assert.equal(observed?.kind, 'scatter');
  assert.equal(observed?.data.series?.length, rows.length);
  assert.ok((observed?.data.series ?? []).every(point => Number.isFinite(Number(point.x))));

  const firstStageChart = (result.charts ?? []).find(chart => chart.id === 'iv-first-stage');
  assert.equal(firstStageChart?.kind, 'scatter');
  assert.equal(firstStageChart?.data.series?.length, rows.length * 2);
  assert.deepEqual(
    [...new Set((firstStageChart?.data.series ?? []).map(point => String(point.series)))].sort(),
    ['Z1', 'Z2']
  );
  assert.ok(
    (firstStageChart?.data.series ?? []).every(
      point => Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y))
    )
  );
});

test('robust IV keeps the coefficients and changes the standard errors', () => {
  const homoskedastic = buildIvOutput({ grid, params, ciLevel: 95 });
  const robust = buildIvOutput({ grid, params: { ...params, robust: true }, ciLevel: 95 });
  assert.ok(homoskedastic.ok && robust.ok);
  if (!homoskedastic.ok || !robust.ok) return;

  const structural = (result: typeof homoskedastic) =>
    result.tables.find(table => table.id === 'iv-structural')?.rows ?? [];
  const base = structural(homoskedastic);
  const withRobust = structural(robust);
  base.forEach((row, index) => {
    assert.ok(Math.abs(Number(row.beta) - Number(withRobust[index].beta)) < 1e-12);
    assert.notEqual(Number(row.se), Number(withRobust[index].se));
  });
  assert.match(String(robust.header), /HC1/);
});

test('IV builder rejects invalid column roles and insufficient data', () => {
  const noEndogenous = buildIvOutput({ grid, params: { ...params, endog: [] }, ciLevel: 95 });
  assert.ok('reason' in noEndogenous);
  if ('reason' in noEndogenous) assert.match(noEndogenous.reason, /at least one endogenous/);

  const noInstruments = buildIvOutput({ grid, params: { ...params, instruments: [] }, ciLevel: 95 });
  assert.ok('reason' in noInstruments);
  if ('reason' in noInstruments) assert.match(noInstruments.reason, /at least one excluded instrument/);

  const tooFewInstruments = buildIvOutput({
    grid,
    params: { ...params, endog: [1, 4], instruments: [2] },
    ciLevel: 95,
  });
  assert.ok('reason' in tooFewInstruments);
  if ('reason' in tooFewInstruments) assert.match(tooFewInstruments.reason, /At least as many instruments/);

  const overlapping = buildIvOutput({
    grid,
    params: { ...params, instruments: [1, 2, 3] },
    ciLevel: 95,
  });
  assert.ok('reason' in overlapping);
  if ('reason' in overlapping) assert.match(overlapping.reason, /different columns/);

  const fewRows = buildIvOutput({
    grid: { cols: grid.cols, rows: rows.slice(0, 3) },
    params,
    ciLevel: 95,
  });
  assert.ok('reason' in fewRows);
  if ('reason' in fewRows) assert.match(fewRows.reason, /Insufficient complete rows/);

  const outOfRange = buildIvOutput({ grid, params: { ...params, dep: 99 }, ciLevel: 95 });
  assert.ok('reason' in outOfRange);
  if ('reason' in outOfRange) assert.match(outOfRange.reason, /dependent variable/);
});
