import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSelectionOutput } from './run';
import type { ColType, GridData } from '../../grid/types';
import type { SelectionParams } from '../../io/project';

const cols: { name: string; type: ColType }[] = [
  { name: 'Wage', type: 'num' },
  { name: 'Wage_obs', type: 'num' },
  { name: 'Selected', type: 'num' },
  { name: 'Education', type: 'num' },
  { name: 'Experience', type: 'num' },
  { name: 'Kids', type: 'num' },
];

const noise = (index: number, amplitude = 0.6): number =>
  amplitude *
  (Math.sin(index * 1.7) + 0.5 * Math.cos(index * 0.9) + 0.25 * Math.sin(index * 3.1));

/** Deterministic lower-censored wage plus a correlated 0/1 selection. */
const rows: string[][] = Array.from({ length: 200 }, (_, index) => {
  const education = (index % 20) / 5;
  const experience = ((index * 3) % 17) / 4;
  const kids = index % 3;
  const latent = -3.5 + 1.2 * education + 0.8 * experience + noise(index);
  const wage = Math.max(0, latent);
  const selectionIndex = -0.5 + 0.4 * education + 0.2 * experience - 0.6 * kids + noise(index, 0.8);
  const selected = selectionIndex > 0 ? 1 : 0;
  return [
    String(wage),
    String(selected === 1 ? wage : 0),
    String(selected),
    String(education),
    String(experience),
    String(kids),
  ];
});

const grid: GridData = { cols, rows };

const tobitParams: SelectionParams = {
  mode: 'tobit',
  dep: 0,
  indeps: [3, 4],
  lower: 0,
  upper: null,
  selection: -1,
  selectIndeps: [],
};

const heckmanParams: SelectionParams = {
  mode: 'heckman',
  dep: 1,
  indeps: [3, 4],
  lower: 0,
  upper: null,
  selection: 2,
  selectIndeps: [3, 4, 5],
};

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected} (${tolerance})`);

/** Reason for a rejected input, with an explicit error if the builder accepts it. */
const reasonOf = (result: ReturnType<typeof buildSelectionOutput>): string => {
  if ('reason' in result) return result.reason;
  throw new Error('expected the builder to reject the input');
};

test('the Tobit builder emits coefficients, variance, diagnostics, fit and two charts', () => {
  const result = buildSelectionOutput({ grid, params: tobitParams, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['tobit-outcome', 'tobit-variance', 'tobit-diagnostics', 'tobit-fit']
  );
  assert.equal(result.report?.id, 'report-tobit');
  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    ['tobit-observed-fitted', 'tobit-latent-observed']
  );

  const outcome = result.tables[0].rows;
  assert.equal(outcome.length, 3);
  assert.equal(outcome[0].term, '(Intercept)');
  assert.deepEqual(
    outcome.slice(1).map(row => row.term),
    ['Education', 'Experience']
  );
  // Latent coefficients are recovered away from the censoring boundary.
  close(Number(outcome[0].beta), -3.5, 0.5);
  assert.ok(Number(outcome[0].se) > 0);
  assert.ok(Number(outcome[0].p) >= 0 && Number(outcome[0].p) <= 1);

  const diagnostics = result.tables[2].rows;
  assert.ok(diagnostics.some(row => row.metric === 'Censurati a sinistra' && Number(row.value) > 0));

  const latentChart = (result.charts ?? []).find(chart => chart.id === 'tobit-latent-observed');
  assert.equal(latentChart?.kind, 'scatter');
  assert.equal((latentChart?.data.points ?? []).length, 200);
  assert.equal((latentChart?.data.rules ?? []).length, 1);
  assert.equal(Number((latentChart?.data.rules ?? [])[0].y), 0);

  const observedChart = (result.charts ?? []).find(chart => chart.id === 'tobit-observed-fitted');
  assert.equal((observedChart?.data.points ?? []).length, 200);
});

test('the Tobit builder supports an upper censoring limit', () => {
  // The wage column is left-censored at zero, so upper censoring needs its own
  // capped response.
  const cappedRows = Array.from({ length: 120 }, (_, index) => {
    const x = (index % 20) / 5;
    const latent = -0.5 + 1.5 * x + noise(index, 0.5);
    return [String(Math.min(2, latent)), String(x)];
  });
  const cappedGrid: GridData = {
    cols: [
      { name: 'Capped', type: 'num' },
      { name: 'X', type: 'num' },
    ],
    rows: cappedRows,
  };
  const result = buildSelectionOutput({
    grid: cappedGrid,
    params: { ...tobitParams, dep: 0, indeps: [1], lower: -10, upper: 2 },
    ciLevel: 90,
  });
  assert.ok(result.ok);
  if (!result.ok) return;
  const chart = (result.charts ?? []).find(item => item.id === 'tobit-latent-observed');
  assert.equal((chart?.data.rules ?? []).length, 2);
  const diagnostics = result.tables[2].rows;
  assert.ok(
    diagnostics.some(row => row.metric === 'Censurati a destra' && Number(row.value) > 0)
  );
});

test('the Heckman builder emits both equations, the variance table and the IMR chart', () => {
  const result = buildSelectionOutput({ grid, params: heckmanParams, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    [
      'heckman-outcome',
      'heckman-selection',
      'heckman-variance',
      'heckman-diagnostics',
      'heckman-fit',
    ]
  );
  assert.equal(result.report?.id, 'report-heckman');
  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    ['heckman-observed-fitted', 'heckman-imr']
  );

  const outcome = result.tables[0].rows;
  assert.equal(outcome.length, 4);
  assert.equal(outcome[0].term, '(Intercept)');
  assert.equal(outcome[3].term, 'IMR (λ)');
  assert.ok(Number(outcome[3].se) > 0);

  const selection = result.tables[1].rows;
  assert.equal(selection.length, 4);
  assert.deepEqual(
    selection.slice(1).map(row => row.term),
    ['Education', 'Experience', 'Kids']
  );

  const selectedCount = rows.filter(row => row[2] === '1').length;
  const diagnostics = result.tables[3].rows;
  const selectedRow = diagnostics.find(row => row.metric === 'Selezionati');
  assert.equal(Number(selectedRow?.value), selectedCount);
  assert.ok(selectedCount > 0 && selectedCount < rows.length);

  const imrChart = (result.charts ?? []).find(chart => chart.id === 'heckman-imr');
  assert.equal(imrChart?.kind, 'histogram');
  assert.equal((imrChart?.data.values ?? []).length, selectedCount);

  const fittedChart = (result.charts ?? []).find(chart => chart.id === 'heckman-observed-fitted');
  assert.equal((fittedChart?.data.points ?? []).length, selectedCount);

  // Kids enters the selection but not the outcome, so the exclusion warning
  // must not fire.
  assert.equal(result.warnings?.length ?? 0, 0);
});

test('the Heckman builder warns when no selection predictor is excluded', () => {
  const result = buildSelectionOutput({
    grid,
    params: { ...heckmanParams, selectIndeps: [3, 4] },
    ciLevel: 95,
  });
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.equal(result.warnings?.length, 1);
  assert.match(String(result.warnings?.[0]), /escluso/i);
});

test('the builder rejects a non-binary selection indicator', () => {
  const brokenRows = rows.map((row, index) => {
    if (index !== 0) return row;
    const copy = [...row];
    copy[2] = '2';
    return copy;
  });
  const result = buildSelectionOutput({
    grid: { cols, rows: brokenRows },
    params: heckmanParams,
    ciLevel: 95,
  });
  assert.match(reasonOf(result), /only 0 and 1/);
});

test('the builder rejects a selection indicator with no selected or no excluded rows', () => {
  const allSelected = rows.map(row => {
    const copy = [...row];
    copy[2] = '1';
    return copy;
  });
  const noSelected = rows.map(row => {
    const copy = [...row];
    copy[2] = '0';
    copy[1] = '0';
    return copy;
  });
  assert.match(
    reasonOf(buildSelectionOutput({ grid: { cols, rows: allSelected }, params: heckmanParams, ciLevel: 95 })),
    /could not be estimated/i
  );
  assert.match(
    reasonOf(buildSelectionOutput({ grid: { cols, rows: noSelected }, params: heckmanParams, ciLevel: 95 })),
    /could not be estimated/i
  );
});

test('the builder rejects inconsistent censoring limits', () => {
  assert.match(
    reasonOf(
      buildSelectionOutput({ grid, params: { ...tobitParams, lower: 5, upper: 5 }, ciLevel: 95 })
    ),
    /greater than the lower/
  );
  assert.match(
    reasonOf(
      buildSelectionOutput({ grid, params: { ...tobitParams, lower: 5, upper: 4 }, ciLevel: 95 })
    ),
    /greater than the lower/
  );
  assert.match(
    reasonOf(
      buildSelectionOutput({ grid, params: { ...tobitParams, lower: Number.NaN }, ciLevel: 95 })
    ),
    /finite number/
  );
});

test('the builder validates the column roles', () => {
  assert.match(
    reasonOf(buildSelectionOutput({ grid, params: { ...tobitParams, indeps: [] }, ciLevel: 95 })),
    /at least one predictor/
  );
  assert.match(
    reasonOf(buildSelectionOutput({ grid, params: { ...tobitParams, indeps: [0, 3] }, ciLevel: 95 })),
    /cannot also be a predictor/
  );
  assert.match(
    reasonOf(buildSelectionOutput({ grid, params: { ...tobitParams, indeps: [9] }, ciLevel: 95 })),
    /valid predictors/
  );
  assert.match(
    reasonOf(
      buildSelectionOutput({ grid, params: { ...heckmanParams, selectIndeps: [] }, ciLevel: 95 })
    ),
    /selection predictor/
  );
  assert.match(
    reasonOf(
      buildSelectionOutput({ grid, params: { ...heckmanParams, selection: 3 }, ciLevel: 95 })
    ),
    /separate 0\/1 column/
  );
});
