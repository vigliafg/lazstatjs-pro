import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { CorrespondenceResult } from '../correspondence/types';
import type { TableSpec } from '../types';

export const correspondenceTables = (result: CorrespondenceResult): TableSpec[] => {
  const inertia: TableSpec = {
    id: 'correspondence-inertia',
    title: copy('Inerzia per asse'),
    subtitle: copy('χ² = {s1} con {s2} gradi di libertà', {
      s1: fmtEst(result.chi2, 2),
      s2: result.df,
    }),
    columns: [
      { key: 'axis', label: copy('Asse'), format: 'int', align: 'right' },
      { key: 'eigenvalue', label: copy('Autovalore'), format: 'dec4', align: 'right' },
      { key: 'inertiaPct', label: copy('Inerzia %'), format: 'dec2', align: 'right' },
      { key: 'cumulativePct', label: copy('Cumulata %'), format: 'dec2', align: 'right' },
    ],
    rows: result.axes.map(axis => ({
      axis: axis.index,
      eigenvalue: axis.eigenvalue,
      inertiaPct: axis.inertiaPct,
      cumulativePct: axis.cumulativePct,
    })),
    notes: [copy('Inerzia totale {s1}', { s1: fmtEst(result.totalInertia, 4) })],
  };

  const coordinates: TableSpec = {
    id: 'correspondence-coordinates',
    title: copy('Coordinate delle modalità'),
    subtitle: copy('Coordinate principali, massa, contributo e cos²'),
    columns: [
      { key: 'set', label: copy('Insieme'), align: 'left' },
      { key: 'label', label: copy('Modalità'), align: 'left' },
      { key: 'axis', label: copy('Asse'), format: 'int', align: 'right' },
      { key: 'coordinate', label: copy('Coordinata'), format: 'dec3', align: 'right' },
      { key: 'mass', label: copy('Massa'), format: 'dec3', align: 'right' },
      { key: 'contribution', label: copy('Contributo'), format: 'dec3', align: 'right' },
      { key: 'cos2', label: copy('Cos²'), format: 'dec3', align: 'right' },
    ],
    rows: [
      ...result.rowCoordinates.flatMap((points, row) =>
        points.map((point, axis) => ({
          set: copy('Riga'),
          label: result.rows[row] ?? point.label,
          axis: axis + 1,
          coordinate: point.coordinate,
          mass: point.mass,
          contribution: point.contribution,
          cos2: point.cos2,
        }))
      ),
      ...result.colCoordinates.flatMap((points, column) =>
        points.map((point, axis) => ({
          set: copy('Colonna'),
          label: result.cols[column] ?? point.label,
          axis: axis + 1,
          coordinate: point.coordinate,
          mass: point.mass,
          contribution: point.contribution,
          cos2: point.cos2,
        }))
      ),
    ],
  };

  const residuals: TableSpec = {
    id: 'correspondence-residuals',
    title: copy('Residui standardizzati'),
    subtitle: copy('(O − E) / √E'),
    columns: [
      { key: 'row', label: copy('Riga'), align: 'left' },
      ...result.cols.map((label, index) => ({
        key: `c${index}`,
        label,
        format: 'dec2' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.residuals.map((row, index) => ({
      row: result.rows[index] ?? `R${index + 1}`,
      ...Object.fromEntries(row.map((value, column) => [`c${column}`, value])),
    })),
  };
  return [inertia, coordinates, residuals];
};
