import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { multidimensionalScaling } from '../../stats/kernels/mds';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { mdsTables } from '../../stats/tables/mds';
import { mdsReport } from '../../stats/reports/mds';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { MdsParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MdsInput {
  grid: Dataset;
  params: MdsParams;
}

const euclidean = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - (b[index] ?? 0), 2), 0));

export const buildMdsOutput = ({ grid, params }: MdsInput): AnalysisRunResult => {
  const columns = Array.from(new Set(params.selected));
  if (columns.length < 2) return { ok: false, reason: 'Select at least two numeric variables' };
  const rows = grid.rows
    .map((row, index) => ({ index, values: columns.map(column => parseNum(row[column])) }))
    .filter(row => row.values.every(Number.isFinite));
  if (rows.length < 4) return { ok: false, reason: 'MDS needs at least four complete rows' };
  const guard = guardDimensions(
    { rows: rows.length, columns: columns.length },
    GUARD_LIMITS.quadratic
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const dissimilarities = rows.map(row => rows.map(other => euclidean(row.values, other.values)));
  const labels = rows.map(row => `Riga ${row.index + 1}`);
  const result = multidimensionalScaling({
    dissimilarities,
    labels,
    dimensions: params.dimensions,
    metric: params.metric,
  });
  if (!result) return { ok: false, reason: 'MDS could not be computed: check the distance matrix' };

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'mds-map',
      kind: 'scatter',
      title: copy('Mappa MDS'),
      subtitle: copy('{s1} dimensioni · stress {s2}', {
        s1: result.dimensions,
        s2: result.stress.toFixed(3),
      }),
      note: copy('Punti vicini sulla mappa hanno distanze simili nella matrice originale; gli assi non hanno un significato intrinseco.'),
      data: {
        points: result.points.map(point => ({
          x: point.coordinates[0] ?? 0,
          y: point.coordinates[1] ?? 0,
          label: point.label,
        })),
      },
      fields: { xLabel: copy('Dimensione 1'), yLabel: copy('Dimensione 2') },
      options: { pointLabels: true, showFit: false } as never,
    }),
    makeChart({
      id: 'mds-stress',
      kind: 'scree',
      title: copy('Autovalori della soluzione classica'),
      subtitle: copy('Prime {s1} dimensioni', { s1: Math.min(8, result.eigenvalues.length) }),
      note: copy('Autovalori grandi indicano dimensioni che spiegano molta variabilità; oltre le prime due o tre spesso resta rumore.'),
      data: {
        bars: result.eigenvalues
          .filter(value => value > 0)
          .slice(0, 8)
          .map((value, index) => ({ category: `D${index + 1}`, value })),
      },
      fields: { xLabel: copy('Dimensione'), yLabel: copy('Autovalore') },
      options: { showKaiser: false, showValues: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Scaling multidimensionale'),
    header: copy('{s1} variabili · {s2} osservazioni · {s3}', {
      s1: columns.length,
      s2: rows.length,
      s3: params.metric === 'classical' ? copy('classico') : copy('non metrico'),
    }),
    tables: mdsTables(result),
    report: mdsReport(result),
    charts,
  };
};
