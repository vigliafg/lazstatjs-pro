import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';

/** Valori numerici di una colonna, ignorando celle vuote o non numeriche. */
export const numericColumnValues = (grid: GridData, index: number): number[] =>
  grid.rows.map(row => parseNum(row[index])).filter(value => Number.isFinite(value));

/** Righe complete per le colonne richieste: ogni cella è un numero finito. */
export const completeNumericRows = (grid: GridData, indexes: number[]): number[][] =>
  grid.rows
    .map(row => indexes.map(index => parseNum(row[index])))
    .filter(values => values.every(value => Number.isFinite(value)));
