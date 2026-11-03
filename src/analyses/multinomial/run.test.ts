import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMultinomialOutput } from './run';

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * Three ordered groups far enough apart to be recognised, with a few
 * deliberately overlapping points so the maximum-likelihood estimate stays
 * finite (perfect separation would make the kernel refuse to converge).
 */
const rows: string[][] = [
  ...[...range(0, 9), 25].map(x => [String(x), 'A']),
  ...[5, ...range(20, 29), 45].map(x => [String(x), 'B']),
  ...[25, ...range(40, 49)].map(x => [String(x), 'C']),
];

const grid = {
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'cat' as const },
  ],
  rows,
};

const base = { grid, params: { outcome: 1, predictors: [0] }, ciLevel: 95 };

test('multinomial builder returns fit, coefficients, classification, report and charts', () => {
  const result = buildMultinomialOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;

  assert.deepEqual(
    result.tables.map(table => table.id),
    ['multinomial-fit', 'multinomial-coefficients', 'multinomial-classification']
  );
  assert.equal(result.report?.id, 'report-multinomial');

  const chartIds = (result.charts ?? []).map(chart => chart.id);
  assert.ok(chartIds.includes('multinomial-probabilities'));
  assert.ok(chartIds.includes('multinomial-accuracy'));
  assert.ok(chartIds.includes('multinomial-confusion'));

  const fit = result.tables.find(table => table.id === 'multinomial-fit');
  const accuracyRow = fit?.rows.find(row => row.metric === 'Accuratezza complessiva (%)');
  assert.ok(Number(accuracyRow?.value) > 80, 'the model should classify the groups well');

  const referenceRow = fit?.rows.find(row => row.metric === 'Classe di riferimento');
  assert.equal(referenceRow?.value, 'A');

  const coefficientClasses = new Set(
    result.tables
      .find(table => table.id === 'multinomial-coefficients')
      ?.rows.map(row => String(row.class)) ?? []
  );
  assert.deepEqual([...coefficientClasses].sort(), ['B', 'C']);

  const classification = result.tables.find(table => table.id === 'multinomial-classification');
  assert.equal(classification?.rows.length, 3);
  assert.deepEqual(
    classification?.rows.map(row => String(row.class)),
    ['A', 'B', 'C']
  );

  const probabilities = (result.charts ?? []).find(
    chart => chart.id === 'multinomial-probabilities'
  );
  assert.equal(probabilities?.kind, 'bar');
  assert.equal((probabilities?.data.bars ?? []).length, 3);

  const accuracy = (result.charts ?? []).find(chart => chart.id === 'multinomial-accuracy');
  assert.equal(accuracy?.kind, 'bar');
  assert.equal((accuracy?.data.bars ?? []).length, 3);

  const confusion = (result.charts ?? []).find(chart => chart.id === 'multinomial-confusion');
  assert.equal(confusion?.kind, 'heatmap');
  const cells = confusion?.data.cells ?? [];
  assert.equal(cells.length, 9);
  const diagonal = cells
    .filter(cell => cell.x === cell.y)
    .reduce((sum, cell) => sum + Number(cell.value), 0);
  const correct = classification!.rows.reduce((sum, row) => sum + Number(row.correct), 0);
  assert.equal(diagonal, correct);
  assert.equal(
    cells.reduce((sum, cell) => sum + Number(cell.value), 0),
    classification!.rows.reduce((sum, row) => sum + Number(row.n), 0)
  );
});

test('multinomial builder rejects an outcome with fewer than three levels', () => {
  const twoLevels = {
    ...base,
    grid: {
      ...grid,
      rows: rows.map(([x, label]) => [x, label === 'C' ? 'B' : label]),
    },
  };
  const result = buildMultinomialOutput(twoLevels);
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /at least three distinct values/);
});

test('multinomial builder rejects the outcome used as a predictor', () => {
  const result = buildMultinomialOutput({
    ...base,
    params: { outcome: 1, predictors: [1] },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /cannot also be a predictor/);
});

test('multinomial builder rejects too few complete rows', () => {
  const result = buildMultinomialOutput({
    ...base,
    grid: {
      ...grid,
      rows: [
        ['0', 'A'],
        ['1', 'B'],
        ['2', 'C'],
      ],
    },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /Not enough complete rows/);
});

test('multinomial builder rejects a class with no complete row', () => {
  const result = buildMultinomialOutput({
    ...base,
    grid: {
      ...grid,
      rows: [
        ['0', 'A'],
        ['1', 'A'],
        ['2', 'A'],
        ['3', 'B'],
        ['4', 'B'],
        ['5', 'B'],
        ['', 'C'],
        ['', 'C'],
      ],
    },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /Every outcome class/);
});
