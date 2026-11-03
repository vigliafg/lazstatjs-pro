import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { semAnalysis } from '../../stats/kernels/sem';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { semTables } from '../../stats/tables/sem';
import { semReport } from '../../stats/reports/sem';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { SemParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface SemInput {
  grid: Dataset;
  params: SemParams;
}

export const buildSemOutput = ({ grid, params }: SemInput): AnalysisRunResult => {
  const columns = Array.from(new Set(params.selected));
  if (columns.length < 3) return { ok: false, reason: 'Select at least three numeric indicators' };
  if (params.groups.length !== columns.length) {
    return { ok: false, reason: 'Assign every selected indicator to a factor' };
  }
  const rows = grid.rows
    .map(row => columns.map(column => parseNum(row[column])))
    .filter(row => row.every(Number.isFinite));
  if (rows.length < columns.length + 2) {
    return { ok: false, reason: 'SEM needs more complete rows than indicators' };
  }
  const guard = guardDimensions(
    { rows: rows.length, columns: columns.length, groups: params.factors },
    GUARD_LIMITS.iterative
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const variableNames = columns.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const factorNames = Array.from({ length: params.factors }, (_, index) => `F${index + 1}`);
  const result = semAnalysis({
    data: rows,
    variableNames,
    groups: params.groups,
    factorNames,
    structural: params.structural,
  });
  if (!result) {
    return {
      ok: false,
      reason: 'SEM could not be fitted: each factor needs at least two indicators and the covariance matrix must be positive definite',
    };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'sem-loadings',
      kind: 'bar',
      title: copy('Carichi fattoriali'),
      subtitle: copy('Soluzione standardizzata'),
      note: copy('Barre più alte indicano variabili che riflettono meglio il proprio fattore.'),
      data: {
        bars: result.loadings.map(item => ({
          category: item.variable,
          value: item.loading,
          series: item.factor,
        })),
      },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Carico') },
      options: { grouping: 'grouped', referenceLine: 'zero' } as never,
    }),
    makeChart({
      id: 'sem-residuals',
      kind: 'heatmap',
      title: copy('Residui di covarianza'),
      subtitle: copy('Osservata − riprodotta'),
      note: copy('Valori vicini a zero indicano che il modello riproduce bene la covarianza tra quelle variabili.'),
      data: {
        cells: result.residuals.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => ({
            x: result.variables[columnIndex] ?? `V${columnIndex + 1}`,
            y: result.variables[rowIndex] ?? `V${rowIndex + 1}`,
            value,
            label: value.toFixed(2),
          }))
        ),
      },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Variabile') },
      options: { showValues: true, diverging: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('SEM / CFA'),
    header: copy('{s1} indicatori · {s2} fattori · {s3} osservazioni', {
      s1: columns.length,
      s2: params.factors,
      s3: rows.length,
    }),
    tables: semTables(result),
    report: semReport(result),
    charts,
  };
};
