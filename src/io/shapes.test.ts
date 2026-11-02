import test from 'node:test';
import assert from 'node:assert/strict';
import {
  documentTermMatrix,
  longToWide,
  matrixFromGrid,
  startStopIntervals,
  tokenize,
  wideToLong,
} from './shapes';

const wide = {
  names: ['Subject', 'Group', 'Before', 'After'],
  rows: [
    ['S1', 'A', '10', '12'],
    ['S2', 'A', '11', ''],
    ['S3', 'B', '9', '10'],
  ],
};

test('wideToLong keeps identifiers and skips missing cells', () => {
  const long = wideToLong(wide, { idColumns: [0, 1], valueColumns: [2, 3] });
  assert.deepEqual(long.names, ['Subject', 'Group', 'Variable', 'Value']);
  assert.deepEqual(long.rows, [
    ['S1', 'A', 'Before', '10'],
    ['S1', 'A', 'After', '12'],
    ['S2', 'A', 'Before', '11'],
    ['S3', 'B', 'Before', '9'],
    ['S3', 'B', 'After', '10'],
  ]);

  const kept = wideToLong(wide, { idColumns: [0], valueColumns: [2, 3], skipMissing: false });
  assert.equal(kept.rows.length, 6);
  assert.deepEqual(kept.rows[3], ['S2', 'After', '']);
});

test('wideToLong rejects ambiguous configurations', () => {
  assert.throws(() => wideToLong(wide, { idColumns: [], valueColumns: [] }), /at least one value column/);
  assert.throws(
    () => wideToLong(wide, { idColumns: [0], valueColumns: [0] }),
    /both id and value/
  );
  assert.throws(
    () => wideToLong(wide, { idColumns: [9], valueColumns: [2] }),
    /out of range/
  );
  assert.throws(
    () => wideToLong(wide, { idColumns: [0], valueColumns: [2], variableName: 'Subject' }),
    /duplicated output column name/
  );
});

test('longToWide pivots on the first-seen key order and fills gaps', () => {
  const long = {
    names: ['Subject', 'Visit', 'Score'],
    rows: [
      ['S1', 'T1', '10'],
      ['S1', 'T2', '12'],
      ['S2', 'T1', '11'],
      ['S2', 'T2', '13'],
      ['S3', 'T1', '9'],
    ],
  };
  const result = longToWide(long, { idColumns: [0], keyColumn: 1, valueColumn: 2 });
  assert.deepEqual(result.names, ['Subject', 'T1', 'T2']);
  assert.deepEqual(result.rows, [
    ['S1', '10', '12'],
    ['S2', '11', '13'],
    ['S3', '9', ''],
  ]);
});

test('longToWide refuses duplicated id/key pairs and empty keys', () => {
  const duplicate = {
    names: ['Subject', 'Visit', 'Score'],
    rows: [
      ['S1', 'T1', '10'],
      ['S1', 'T1', '12'],
    ],
  };
  assert.throws(
    () => longToWide(duplicate, { idColumns: [0], keyColumn: 1, valueColumn: 2 }),
    /duplicate id\/key at row 2/
  );
  const emptyKey = { names: ['Subject', 'Visit', 'Score'], rows: [['S1', '', '10']] };
  assert.throws(
    () => longToWide(emptyKey, { idColumns: [0], keyColumn: 1, valueColumn: 2 }),
    /empty key at row 1/
  );
  assert.throws(
    () => longToWide(duplicate, { idColumns: [0], keyColumn: 0, valueColumn: 2 }),
    /must be distinct/
  );
});

test('startStopIntervals keeps valid intervals and reports skipped rows', () => {
  const table = {
    names: ['Start', 'Stop', 'Event', 'X'],
    rows: [
      ['0', '5', '1', '2'],
      ['5', '10', '0', '2'],
      ['3', '3', '1', '1'],
      ['10', '12', '2', '1'],
      ['', '20', '1', '1'],
      ['20', '25', '1', '3'],
    ],
  };
  const result = startStopIntervals(table, { startColumn: 0, stopColumn: 1, eventColumn: 2 });
  assert.equal(result.skipped, 3);
  assert.deepEqual(result.intervals, [
    { row: 0, start: 0, stop: 5, event: 1 },
    { row: 1, start: 5, stop: 10, event: 0 },
    { row: 5, start: 20, stop: 25, event: 1 },
  ]);

  const withoutEvent = startStopIntervals(table, { startColumn: 0, stopColumn: 1 });
  assert.equal(withoutEvent.intervals[0].event, 1);
});

test('matrixFromGrid validates numeric matrices, square and symmetric input', () => {
  const table = {
    names: ['A', 'B', 'C'],
    rows: [
      ['1', '0.5', '-0.25'],
      ['0.5', '1', '0.1'],
      ['-0.25', '0.1', '1'],
    ],
  };
  const matrix = matrixFromGrid(table, { columns: [0, 1, 2], requireSquare: true, requireSymmetric: true });
  assert.deepEqual(matrix?.labels, ['A', 'B', 'C']);
  assert.deepEqual(matrix?.values, [
    [1, 0.5, -0.25],
    [0.5, 1, 0.1],
    [-0.25, 0.1, 1],
  ]);

  const asymmetric = matrixFromGrid(
    { names: table.names, rows: [['1', '0.5', '0'], ['0.4', '1', '0'], ['0', '0', '1']] },
    { columns: [0, 1, 2], requireSymmetric: true }
  );
  assert.equal(asymmetric, null);

  const nonNumeric = matrixFromGrid(
    { names: table.names, rows: [['1', 'x', '0'], ['0', '1', '0'], ['0', '0', '1']] },
    { columns: [0, 1, 2] }
  );
  assert.equal(nonNumeric, null);

  const rectangular = matrixFromGrid(
    { names: ['A', 'B'], rows: [['1', '2'], ['3', '4'], ['5', '6']] },
    { columns: [0, 1], requireSquare: true }
  );
  assert.equal(rectangular, null);

  // Blank rows are ignored, blank cells inside a row are not.
  const withBlank = matrixFromGrid(
    { names: ['A', 'B'], rows: [['1', '2'], ['', ''], ['3', '4']] },
    { columns: [0, 1] }
  );
  assert.deepEqual(withBlank?.values, [
    [1, 2],
    [3, 4],
  ]);
});

test('tokenize lower-cases and splits on punctuation and accents', () => {
  assert.deepEqual(tokenize('Perché, davvero? Sì: 2 volte!'), [
    'perché',
    'davvero',
    'sì',
    'volte',
  ]);
  assert.deepEqual(tokenize('A b c', { minLength: 1 }), ['a', 'b', 'c']);
});

test('documentTermMatrix builds a deterministic vocabulary and counts', () => {
  const result = documentTermMatrix([
    { id: 'd1', text: 'red green red' },
    { id: 'd2', text: 'green blue' },
    { id: 'd3', text: 'blue blue' },
  ]);
  assert.deepEqual(result.documentIds, ['d1', 'd2', 'd3']);
  // blue and green both appear three times → alphabetical; red twice.
  assert.deepEqual(result.terms, ['blue', 'green', 'red']);
  assert.deepEqual(result.counts, [
    [0, 1, 2],
    [1, 1, 0],
    [2, 0, 0],
  ]);

  const top = documentTermMatrix(
    [
      { id: 'd1', text: 'alpha alpha beta' },
      { id: 'd2', text: 'alpha gamma' },
    ],
    { maxTerms: 2 }
  );
  assert.deepEqual(top.terms, ['alpha', 'beta']);
  assert.deepEqual(top.counts, [
    [2, 1],
    [1, 0],
  ]);
});
