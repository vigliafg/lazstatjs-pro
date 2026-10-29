import { contingencyReport, contingencyTables } from '../../stats/contingency';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { ContingencyParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ContingencyInput {
  params: ContingencyParams;
  ciLevel: number;
}

/** Chi-quadro / Fisher / Monte Carlo su una tabella R×C. */
export const buildContingencyOutput = ({
  params,
  ciLevel,
}: ContingencyInput): AnalysisRunResult => {
  const observed = params.values.map(row => row.map(cell => Number.parseInt(cell, 10) || 0));
  if (observed.some(row => row.some(value => value < 0))) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  if (observed.flat().reduce((sum, value) => sum + value, 0) === 0) {
    return { ok: false, reason: 'The grand total cannot be zero' };
  }

  const tables = contingencyTables({
    observed,
    rowLabels: params.rows,
    colLabels: params.cols,
    level: ciLevel,
    exact: params.exact,
    monteCarlo: params.monteCarlo,
  });

  if (tables.length === 0) {
    return { ok: false, reason: 'Every row and every column needs at least one observation' };
  }

  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = observed[0].map((_, column) =>
    observed.reduce((sum, row) => sum + row[column], 0)
  );
  const total = rowTotals.reduce((sum, value) => sum + value, 0);
  const cells = observed.flatMap((row, i) =>
    row.map((value, j) => {
      const expected = total > 0 ? (rowTotals[i] * colTotals[j]) / total : 0;
      const residual = expected > 0 ? (value - expected) / Math.sqrt(expected) : 0;
      return {
        x: params.cols[j] ?? `C${j + 1}`,
        y: params.rows[i] ?? `R${i + 1}`,
        value: residual,
        label: residual.toFixed(2),
      };
    })
  );

  return {
    ok: true,
    title: copy('Tabella di contingenza {s1} × {s2}', { s1: observed.length, s2: observed[0]?.length ?? 0 }),
    tables,
    report: contingencyReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'contingency-residuals',
        kind: 'heatmap',
        title: copy('Residui standardizzati'),
        subtitle: copy('Osservato − atteso, diviso per la radice dell’atteso'),
        note: copy('Valori positivi indicano celle più frequenti dell’atteso sotto indipendenza; valori negativi meno frequenti.'),
        data: { cells },
        fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
        options: { showValues: true, diverging: true } as never,
      }),
    ],
  };
};
