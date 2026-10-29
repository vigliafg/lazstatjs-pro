import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  duplicateColumn,
  insertColumnAt,
  deleteColumn,
  splitColumn,
  splitColumnAll,
  mergeColumns,
  removeEmptyRows,
  setColumnLevels,
  recodeColumnValues,
  insertRowAt,
  deleteRow,
  fillMissing,
  renameColumn,
} from './ops';
import {
  groupColumnIndexes,
  isGroupColumn,
  isMissingCell,
  isMissingCode,
  maskMissingCodes,
  missingCellCount,
  validateValue,
  type ColType,
  type GridData,
} from './types';
import { recalculateFormulas } from './formulas';

const grid = (): GridData => ({
  cols: [
    { id: 'a', name: 'A', type: 'str' },
    { id: 'b', name: 'B', type: 'str' },
  ],
  rows: [
    ['x', 'y'],
    ['', ''],
    ['x', 'z'],
  ],
});

describe('column type validation', () => {
  it('rejects punctuation-only numeric cells and accepts decimal forms', () => {
    const valid: [string, ColType][] = [
      ['12', 'num'],
      ['-12', 'num'],
      ['12.5', 'num'],
      ['12,5', 'num'],
      ['.5', 'num'],
      [',5', 'num'],
      ['12.', 'num'],
      ['12,5', 'dec'],
      ['.5', 'dec'],
    ];
    valid.forEach(([value, type]) => assert.equal(validateValue(value, type), true, `${value} as ${type}`));

    const invalid: [string, ColType][] = [
      ['.', 'num'],
      [',', 'num'],
      ['-', 'num'],
      ['1.2.3', 'num'],
      ['abc', 'num'],
      ['.', 'dec'],
      ['1.0', 'int'],
    ];
    invalid.forEach(([value, type]) => assert.equal(validateValue(value, type), false, `${value} as ${type}`));
    assert.equal(validateValue('', 'num'), true);
  });
});

describe('missing values', () => {
  const missing: GridData = {
    cols: [{ name: 'A', type: 'num', missing: ['-9', 'NA'] }],
    rows: [['2'], ['-9'], ['4'], ['NA'], ['']],
  };

  it('recognises blank cells and declared codes', () => {
    assert.equal(isMissingCode(missing.cols[0], '-9'), true);
    assert.equal(isMissingCode(missing.cols[0], ' -9 '), true);
    assert.equal(isMissingCode(missing.cols[0], '3'), false);
    assert.equal(isMissingCell(missing.cols[0], ''), true);
    assert.equal(isMissingCell(missing.cols[0], 'NA'), true);
    assert.equal(missingCellCount(missing), 3);
  });

  it('masking leaves real values and blanks intact', () => {
    const masked = maskMissingCodes(missing);
    assert.deepEqual(masked.rows.map((row) => row[0]), ['2', '', '4', '', '']);
  });

  it('fillMissing ignores declared codes and fills them too', () => {
    const result = fillMissing(missing, 0, 'mean');
    assert.equal(result.fillWith, '3');
    assert.equal(result.filled, 3);
    assert.deepEqual(result.grid.rows.map((row) => row[0]), ['2', '3', '4', '3', '3']);
  });
});

describe('duplicate column metadata', () => {
  it('copies label, description, levels, reference, missing and formula', () => {
    const g: GridData = {
      cols: [
        {
          id: 'cat-1',
          name: 'Group',
          type: 'cat',
          label: 'Treatment',
          description: 'Arm',
          levels: [{ value: '1', label: 'Control' }, { value: '2', label: 'Treated' }],
          reference: '1',
          missing: ['-9'],
          formula: 'Score + 1',
        },
      ],
      rows: [['1'], ['2']],
    };
    const out = duplicateColumn(g, 0);
    assert.equal(out.cols.length, 2);
    assert.equal(out.cols[1].name, 'Group_copy');
    assert.notEqual(out.cols[1].id, g.cols[0].id);
    assert.equal(out.cols[1].label, 'Treatment');
    assert.equal(out.cols[1].description, 'Arm');
    assert.deepEqual(out.cols[1].levels, g.cols[0].levels);
    assert.notEqual(out.cols[1].levels, g.cols[0].levels);
    assert.equal(out.cols[1].reference, '1');
    assert.deepEqual(out.cols[1].missing, ['-9']);
    assert.equal(out.cols[1].formula, 'Score + 1');
    assert.deepEqual(out.rows.map((row) => row[1]), ['1', '2']);
  });
});

describe('split column', () => {
  it('keeps the original id, creates a new id and drops the formula', () => {
    const g: GridData = {
      cols: [{ id: 'left', name: 'Pair', type: 'str', formula: 'A + B', label: 'Pair label' }],
      rows: [['x;y']],
    };
    const out = splitColumn(g, 0, ';');
    assert.equal(out.cols.length, 2);
    assert.equal(out.cols[0].id, 'left');
    assert.equal(out.cols[0].name, 'Pair');
    assert.equal(out.cols[0].label, 'Pair label');
    assert.equal(out.cols[0].formula, undefined);
    assert.notEqual(out.cols[1].id, 'left');
    assert.equal(out.rows[0][0], 'x');
    assert.equal(out.rows[0][1], 'y');
  });

  it('splits only at the first separator and tolerates a missing one', () => {
    const out = splitColumn(grid(), 0, ';');
    assert.equal(out.rows[0][0], 'x');
    assert.equal(out.rows[0][1], '');
    const multi = splitColumn({ cols: [{ name: 'A', type: 'str' }], rows: [['a;b;c']] }, 0, ';');
    assert.equal(multi.rows[0][0], 'a');
    assert.equal(multi.rows[0][1], 'b;c');
  });

  it('does nothing for an invalid index or empty separator', () => {
    const g = grid();
    assert.equal(splitColumn(g, -1, ';'), g);
    assert.equal(splitColumn(g, 9, ';'), g);
    assert.equal(splitColumn(g, 0, ''), g);
  });
});

describe('merge columns', () => {
  it('creates text, clears categorical metadata and keeps the low id', () => {
    const g: GridData = {
      cols: [
        { id: 'low', name: 'A', type: 'int', levels: [{ value: '1', label: 'one' }], reference: '1', missing: ['-9'], formula: 'A + 1', label: 'Old' },
        { id: 'high', name: 'B', type: 'int' },
      ],
      rows: [['1', '2'], ['', '3'], ['4', '']],
    };
    const out = mergeColumns(g, 0, 1, '_', 'AB');
    assert.equal(out.cols.length, 1);
    assert.equal(out.cols[0].id, 'low');
    assert.equal(out.cols[0].name, 'AB');
    assert.equal(out.cols[0].type, 'str');
    assert.equal(out.cols[0].formula, undefined);
    assert.equal(out.cols[0].levels, undefined);
    assert.equal(out.cols[0].reference, undefined);
    assert.equal(out.cols[0].missing, undefined);
    assert.equal(out.cols[0].label, undefined);
    assert.deepEqual(out.rows.map((row) => row[0]), ['1_2', '3', '4']);
  });

  it('accepts inverted indexes and refuses equal or out-of-range indexes', () => {
    const g = grid();
    const out = mergeColumns(g, 1, 0, '-');
    assert.equal(out.cols.length, 1);
    assert.equal(out.rows[0][0], 'x-y');
    assert.equal(mergeColumns(g, 0, 0, '_'), g);
    assert.equal(mergeColumns(g, 0, 9, '_'), g);
  });

  it('clears formulas in other columns that referenced a merged source', () => {
    const g: GridData = {
      cols: [
        { name: 'A', type: 'num' },
        { name: 'B', type: 'num' },
        { name: 'C', type: 'num', formula: 'A + B' },
      ],
      rows: [['1', '2', '3']],
    };
    const out = mergeColumns(g, 0, 1, '_');
    assert.equal(out.cols[1].name, 'C');
    assert.equal(out.cols[1].formula, undefined);
    assert.equal(out.cols[1].type, 'num');
  });

  it('does not leave a separator for empty cells', () => {
    const out = mergeColumns({ cols: [{ name: 'A', type: 'str' }, { name: 'B', type: 'str' }], rows: [['', '']] }, 0, 1, '_');
    assert.equal(out.rows[0][0], '');
  });
});

describe('split all', () => {
  it('creates one column per part and keeps the first in the original column', () => {
    const g: GridData = {
      cols: [{ id: 'x', name: 'Path', type: 'str', formula: 'A + B' }],
      rows: [['a;b;c'], ['d;e'], ['f']],
    };
    const out = splitColumnAll(g, 0, ';');
    assert.equal(out.cols.length, 3);
    assert.equal(out.cols[0].id, 'x');
    assert.equal(out.cols[0].formula, undefined);
    assert.deepEqual(out.rows[0].slice(0, 3), ['a', 'b', 'c']);
    assert.deepEqual(out.rows[1].slice(0, 3), ['d', 'e', '']);
    assert.deepEqual(out.rows[2].slice(0, 3), ['f', '', '']);
  });

  it('is a no-op when the separator never occurs', () => {
    const g = grid();
    assert.equal(splitColumnAll(g, 0, ';'), g);
    assert.equal(splitColumnAll(g, 0, ''), g);
    assert.equal(splitColumnAll(g, 9, ';'), g);
  });
});

describe('structural row and column edits', () => {
  it('insert column names are unique and positions clamp', () => {
    const g = grid();
    assert.equal(insertColumnAt(g, 0).cols[0].name, 'Var3');
    assert.equal(insertColumnAt(g, 99).cols.length, 3);
    assert.equal(insertColumnAt(g, 99).cols[2].name, 'Var3');
    const twice = insertColumnAt(insertColumnAt(g, 2), 3);
    assert.equal(new Set(twice.cols.map((col) => col.name)).size, twice.cols.length);
  });

  it('delete column clears formulas that referenced it', () => {
    const g: GridData = {
      cols: [
        { name: 'A', type: 'num' },
        { name: 'B', type: 'num', formula: 'A * 2' },
        { name: 'C', type: 'num', formula: 'B + 1' },
      ],
      rows: [['1', '2', '3']],
    };
    const out = deleteColumn(g, 0);
    assert.equal(out.cols[0].formula, undefined);
    assert.equal(out.cols[1].formula, 'B + 1');
  });

  it('delete column refuses to leave an empty grid and ignores invalid indexes', () => {
    const one: GridData = { cols: [{ name: 'A', type: 'str' }], rows: [['a']] };
    assert.equal(deleteColumn(one, 0), one);
    const g = grid();
    assert.equal(deleteColumn(g, 0).cols.length, 1);
    assert.equal(deleteColumn(g, 9).cols.length, 2);
  });

  it('insert/delete rows preserve width and guards', () => {
    const g = grid();
    const inserted = insertRowAt(g, 1);
    assert.equal(inserted.rows.length, 4);
    assert.deepEqual(inserted.rows[1], ['', '']);
    assert.deepEqual(insertRowAt(g, 99).rows[3], ['', '']);
    assert.equal(insertRowAt(g, -5).rows[0][0], '');
    assert.equal(deleteRow(g, 0).rows.length, 2);
    const one: GridData = { cols: [{ name: 'A', type: 'str' }], rows: [['a']] };
    assert.equal(deleteRow(one, 0), one);
    assert.equal(deleteRow(g, 99), g);
  });

  it('renaming keeps formula references and uniqueness', () => {
    const g: GridData = {
      cols: [{ name: 'A', type: 'num' }, { name: 'B', type: 'num', formula: 'A * 2' }],
      rows: [['1', '2']],
    };
    const renamed = renameColumn(g, 0, 'Score');
    assert.equal(renamed.cols[1].formula, 'Score * 2');
    assert.equal(recalculateFormulas(renamed).rows[0][1], '2');
    assert.equal(renameColumn(g, 1, 'A').cols[1].name, 'A_2');
  });

  it('structural merge drops the formula instead of letting recalculation overwrite it', () => {
    const g: GridData = {
      cols: [
        { name: 'A', type: 'num', formula: 'B + 1' },
        { name: 'B', type: 'num' },
      ],
      rows: [['3', '2']],
    };
    const merged = mergeColumns(g, 0, 1, '_');
    assert.equal(merged.cols[0].formula, undefined);
    assert.equal(recalculateFormulas(merged).rows[0][0], '3_2');
  });
});

describe('grouping variables and levels', () => {
  it('recognises categorical, boolean and small integer codes', () => {
    const g: GridData = {
      cols: [
        { name: 'cat', type: 'cat' },
        { name: 'bool', type: 'bol' },
        { name: 'int3', type: 'int' },
        { name: 'int1', type: 'int' },
        { name: 'id', type: 'id' },
        { name: 'text12', type: 'str' },
      ],
      rows: [
        ['a', '1', '1', '1', '1', 'a'],
        ['b', '0', '2', '1', '2', 'b'],
        ['a', '1', '3', '1', '3', 'c'],
      ],
    };
    assert.equal(isGroupColumn(g, 0), true);
    assert.equal(isGroupColumn(g, 1), true);
    assert.equal(isGroupColumn(g, 2), true);
    assert.equal(isGroupColumn(g, 3), false);
    assert.equal(isGroupColumn(g, 4), false);
    assert.equal(isGroupColumn(g, 5), true);
    assert.deepEqual(groupColumnIndexes(g), [0, 1, 2, 5]);
  });

  it('declared levels keep a single-code column selectable', () => {
    const g = setColumnLevels(
      { cols: [{ name: 'G', type: 'int' }], rows: [['1'], ['1']] },
      0,
      [{ value: '1', label: 'Only' }]
    );
    assert.equal(isGroupColumn(g, 0), true);
  });

  it('recode drops a persistent formula instead of being overwritten later', () => {
    const g: GridData = {
      cols: [{ name: 'G', type: 'num', formula: 'A + 1' }],
      rows: [['1'], ['2']],
    };
    const out = recodeColumnValues(g, 0, { '1': '9' });
    assert.equal(out.formulaDropped, true);
    assert.equal(out.grid.cols[0].formula, undefined);
    assert.equal(out.grid.rows[0][0], '9');
  });

  it('recode updates levels, reference and switches to cat when values become text', () => {
    const g: GridData = {
      cols: [{
        name: 'G',
        type: 'int',
        levels: [{ value: '1', label: 'Control' }, { value: '2', label: 'Treated' }],
        reference: '1',
      }],
      rows: [['1'], ['2'], ['2']],
    };
    const out = recodeColumnValues(g, 0, { '1': 'Control', '2': 'Control' });
    assert.equal(out.changed, 3);
    assert.equal(out.merged, 1);
    assert.equal(out.grid.cols[0].type, 'cat');
    assert.equal(out.grid.cols[0].reference, 'Control');
    assert.deepEqual(out.grid.rows.map((row) => row[0]), ['Control', 'Control', 'Control']);
  });
});


describe('empty rows and missing codes', () => {
  it('drops rows made only of blanks or declared missing codes', () => {
    const g: GridData = {
      cols: [{ name: 'A', type: 'num', missing: ['-9'] }, { name: 'B', type: 'str', missing: ['NA'] }],
      rows: [['', ''], ['-9', 'NA'], ['1', ''], ['', 'x']],
    };
    const out = removeEmptyRows(g);
    assert.equal(out.removed, 2);
    assert.deepEqual(out.grid.rows, [['1', ''], ['', 'x']]);
  });
});
