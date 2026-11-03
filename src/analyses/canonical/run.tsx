import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { canonicalCorrelation } from '../../stats/kernels/canonical';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { canonicalTables } from '../../stats/tables/canonical';
import { canonicalReport } from '../../stats/reports/canonical';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { CanonicalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CanonicalInput {
  grid: Dataset;
  params: CanonicalParams;
}

export const buildCanonicalOutput = ({ grid, params }: CanonicalInput): AnalysisRunResult => {
  const xColumns = Array.from(new Set(params.x));
  const yColumns = Array.from(new Set(params.y)).filter(column => !xColumns.includes(column));
  if (xColumns.length < 1 || yColumns.length < 1) {
    return { ok: false, reason: 'Select at least one numeric variable in each block' };
  }
  const rows = grid.rows
    .map(row => ({
      x: xColumns.map(column => parseNum(row[column])),
      y: yColumns.map(column => parseNum(row[column])),
    }))
    .filter(row => row.x.every(Number.isFinite) && row.y.every(Number.isFinite));
  if (rows.length < Math.max(xColumns.length, yColumns.length) + 2) {
    return { ok: false, reason: 'Canonical correlation needs more complete rows than variables' };
  }
  const guard = guardDimensions(
    { rows: rows.length, columns: xColumns.length + yColumns.length },
    GUARD_LIMITS.iterative
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const xNames = xColumns.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const yNames = yColumns.map(index => grid.cols[index]?.name ?? `Y${index + 1}`);
  const result = canonicalCorrelation({
    x: rows.map(row => row.x),
    y: rows.map(row => row.y),
    xNames,
    yNames,
  });
  if (!result) return { ok: false, reason: 'Canonical correlation could not be computed: check collinearity' };

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'canonical-scores',
      kind: 'scatter',
      title: copy('Punteggi canonici'),
      subtitle: copy('Prima funzione: X e Y'),
      note: copy('Ogni punto è un’osservazione: se la correlazione canonica è alta, i due punteggi si dispongono lungo una diagonale.'),
      data: {
        points: result.xScores[0].map((value, index) => ({
          x: value,
          y: result.yScores[0][index] ?? 0,
        })),
      },
      fields: { xLabel: copy('Punteggio canonico X'), yLabel: copy('Punteggio canonico Y') },
      options: { showFit: true, fit: 'ols', showBand: false } as never,
    }),
    makeChart({
      id: 'canonical-loadings',
      kind: 'bar',
      title: copy('Correlazioni di struttura'),
      subtitle: copy('Prima funzione canonica'),
      note: copy('Le barre mostrano quanto ogni variabile è legata al proprio punteggio canonico.'),
      data: {
        bars: [
          ...(result.functions[0]?.xCoefficients ?? []).map(item => ({
            category: item.variable,
            value: item.structure,
            series: 'X',
          })),
          ...(result.functions[0]?.yCoefficients ?? []).map(item => ({
            category: item.variable,
            value: item.structure,
            series: 'Y',
          })),
        ],
      },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Correlazione di struttura') },
      options: { grouping: 'grouped', referenceLine: 'zero' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Correlazione canonica'),
    header: copy('{s1} variabili X · {s2} variabili Y · {s3} osservazioni', {
      s1: xNames.length,
      s2: yNames.length,
      s3: rows.length,
    }),
    tables: canonicalTables(result),
    report: canonicalReport(result),
    charts,
  };
};
