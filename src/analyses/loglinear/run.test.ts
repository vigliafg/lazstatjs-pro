import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLoglinearOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';
import { ANALYSIS_CHART_KINDS } from '../../charts/analysisKinds';

const TWO_BY_TWO = {
  rows: ['Treatment', 'Control'],
  cols: ['Improved', 'Unchanged'],
  values: [
    ['42', '18'],
    ['21', '34'],
  ],
  model: 'saturated' as const,
};

test('the builder returns tables, a report and the two allowed charts', () => {
  const result = buildLoglinearOutput({ params: DEFAULT_PARAMS.loglinear, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;

  assert.equal(result.tables.length, 4);
  assert.deepEqual(
    result.tables.map(table => table.id),
    ['loglinear-parameters', 'loglinear-fit', 'loglinear-expected', 'loglinear-residuals']
  );
  assert.ok(result.report);
  assert.deepEqual(
    (result.charts ?? []).map(chart => chart.id),
    ['loglinear-residuals', 'loglinear-observed-expected']
  );
  for (const chart of result.charts ?? []) {
    assert.ok(
      (ANALYSIS_CHART_KINDS.loglinear ?? []).includes(chart.kind),
      `${chart.id}: ${chart.kind} is allowed for loglinear`
    );
  }
});

test('the saturated model reproduces the table with zero residual deviance', () => {
  const result = buildLoglinearOutput({
    params: { ...DEFAULT_PARAMS.loglinear, model: 'saturated' },
    ciLevel: 95,
  });
  assert.ok(result.ok);
  if (!result.ok) return;
  const fitTable = result.tables.find(table => table.id === 'loglinear-fit');
  assert.ok(fitTable);
  assert.equal(Number(fitTable.rows[0].g2), 0);
  assert.equal(Number(fitTable.rows[0].df), 0);
  assert.ok(Number.isNaN(Number(fitTable.rows[0].p)));

  const parameters = result.tables.find(table => table.id === 'loglinear-parameters');
  assert.equal(parameters?.rows.length, 6); // 3 × 2 saturated
});

test('a saturated 2×2 table reports the interaction odds ratio', () => {
  const result = buildLoglinearOutput({ params: TWO_BY_TWO, ciLevel: 95 });
  assert.ok(result.ok);
  if (!result.ok) return;
  const reportText = JSON.stringify(result.report);
  assert.match(reportText, /Odds ratio/);
  assert.match(reportText, /3\.778/);
});

test('degenerate tables are rejected with a clear reason', () => {
  const negative = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      values: [
        ['-1', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in negative);
  if ('reason' in negative) assert.match(negative.reason, /non-negative/);

  const empty = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      values: [
        ['0', '0'],
        ['0', '0'],
        ['0', '0'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in empty);
  if ('reason' in empty) assert.match(empty.reason, /grand total/);

  const emptyRow = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      values: [
        ['0', '0'],
        ['3', '4'],
        ['5', '6'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in emptyRow);
  if ('reason' in emptyRow) assert.match(emptyRow.reason, /at least one observation/);

  const ragged = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      values: [
        ['1', '2'],
        ['3'],
        ['4', '5'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in ragged);
  if ('reason' in ragged) assert.match(ragged.reason, /integer count per column/);

  const invalidCell = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      values: [
        ['', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in invalidCell);

  const oneColumn = buildLoglinearOutput({
    params: {
      ...DEFAULT_PARAMS.loglinear,
      cols: ['Only'],
      values: [['1'], ['2'], ['3']],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in oneColumn);
});

test('the saturated model rejects a zero cell but independence accepts it', () => {
  const params = {
    rows: ['A', 'B'],
    cols: ['x', 'y'],
    values: [
      ['10', '0'],
      ['5', '15'],
    ],
  };

  const independence = buildLoglinearOutput({
    params: { ...params, model: 'independence' },
    ciLevel: 95,
  });
  assert.ok(independence.ok);

  const saturated = buildLoglinearOutput({
    params: { ...params, model: 'saturated' },
    ciLevel: 95,
  });
  assert.ok('reason' in saturated);
  if ('reason' in saturated) assert.match(saturated.reason, /strictly positive/);
});
