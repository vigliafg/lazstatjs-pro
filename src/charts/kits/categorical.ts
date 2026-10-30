import type { ChartRow } from '../../stats/charts';

export interface MosaicInput {
  observed: number[][];
  rows: string[];
  cols: string[];
}

/**
 * Mosaic coordinates: row heights follow row totals, cell widths follow the
 * conditional distribution inside each row. Coordinates live in [0, 1] so the
 * renderer can share one scale across tables of different sizes.
 */
export const mosaicCells = ({ observed, rows, cols }: MosaicInput): ChartRow[] => {
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = cols.map((_, column) =>
    observed.reduce((sum, row) => sum + (row[column] ?? 0), 0)
  );
  const total = rowTotals.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) return [];
  const cells: ChartRow[] = [];
  let rowOffset = 0;
  observed.forEach((row, rowIndex) => {
    const rowTotal = rowTotals[rowIndex];
    let colOffset = 0;
    row.forEach((value, columnIndex) => {
      const expected = rowTotal > 0 ? (rowTotal * colTotals[columnIndex]) / total : 0;
      const residual = expected > 0 ? (value - expected) / Math.sqrt(expected) : 0;
      const x0 = rowTotal > 0 ? colOffset / rowTotal : 0;
      const x1 = rowTotal > 0 ? (colOffset + value) / rowTotal : 0;
      const y0 = 1 - (rowOffset + rowTotal) / total;
      const y1 = 1 - rowOffset / total;
      cells.push({
        row: rows[rowIndex] ?? `R${rowIndex + 1}`,
        col: cols[columnIndex] ?? `C${columnIndex + 1}`,
        value,
        expected,
        residual,
        x0,
        x1,
        y0,
        y1,
        label: String(value),
      });
      colOffset += value;
    });
    rowOffset += rowTotal;
  });
  return cells;
};
