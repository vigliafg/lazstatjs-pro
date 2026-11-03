import { copy } from '../../stats/reportCopy';
import { loglinearFit } from '../../stats/kernels/loglinear';
import { loglinearTables } from '../../stats/tables/loglinear';
import { loglinearReport } from '../../stats/reports/loglinear';
import { makeChart } from '../../charts/kits/common';
import type { LoglinearParams } from '../../io/project';
import type { LoglinearStats } from '../../stats/loglinear/types';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface LoglinearInput {
  params: LoglinearParams;
  ciLevel: number;
}

/** Parse the table editor into integer counts; `null` when a cell is invalid. */
const parseCounts = (params: LoglinearParams): number[][] | null => {
  if (params.rows.length < 2 || params.cols.length < 2) return null;
  if (params.values.length !== params.rows.length) return null;
  if (params.values.some(row => row.length !== params.cols.length)) return null;
  const observed: number[][] = [];
  for (const row of params.values) {
    const parsed: number[] = [];
    for (const cell of row) {
      const value = Number.parseInt(String(cell).trim(), 10);
      if (!Number.isInteger(value)) return null;
      parsed.push(value);
    }
    observed.push(parsed);
  }
  return observed;
};

const buildCharts = (stats: LoglinearStats): AnalysisChart[] => {
  const residualCells = stats.cellsTable.map(cell => ({
    x: cell.col,
    y: cell.row,
    value: cell.residual,
    label: Number.isFinite(cell.residual) ? cell.residual.toFixed(2) : '—',
  }));

  const bars = stats.cellsTable.flatMap(cell => [
    {
      category: `${cell.row} · ${cell.col}`,
      value: cell.observed,
      series: copy('Osservato'),
    },
    {
      category: `${cell.row} · ${cell.col}`,
      value: cell.expected,
      series: copy('Atteso'),
    },
  ]);

  return [
    makeChart({
      id: 'loglinear-residuals',
      kind: 'heatmap',
      title: copy('Residui standardizzati'),
      subtitle: copy('(O − E) / √E per ogni cella'),
      note: copy(
        'Valori positivi indicano celle più frequenti dell’atteso del modello; valori negativi meno frequenti. Con il modello saturo i residui sono nulli per costruzione.'
      ),
      data: { cells: residualCells },
      fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
      options: { showValues: true, diverging: true } as never,
    }),
    makeChart({
      id: 'loglinear-observed-expected',
      kind: 'bar',
      title: copy('Osservato e atteso per cella'),
      subtitle: copy('Confronto tra conteggi osservati e attesi'),
      note: copy(
        'Barre vicine indicano che il modello riproduce bene la cella; scarti sistematici in una riga o colonna suggeriscono che l’effetto mancante è proprio lì.'
      ),
      data: { bars },
      fields: { xLabel: copy('Cella'), yLabel: copy('Conteggio'), series: copy('Serie') },
      options: { grouping: 'grouped', valueLabels: false } as never,
    }),
  ];
};

/** Poisson log-linear model on an R×C table edited in the form. */
export const buildLoglinearOutput = ({ params, ciLevel }: LoglinearInput): AnalysisRunResult => {
  if (params.rows.length < 2 || params.cols.length < 2) {
    return { ok: false, reason: 'The table needs at least two rows and two columns' };
  }
  const observed = parseCounts(params);
  if (!observed) {
    return {
      ok: false,
      reason: 'Every row needs one integer count per column (empty cells are not allowed)',
    };
  }
  if (observed.some(row => row.some(value => value < 0))) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  const total = observed.reduce((sum, row) => sum + row.reduce((inner, value) => inner + value, 0), 0);
  if (total === 0) {
    return { ok: false, reason: 'The grand total cannot be zero' };
  }
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = observed[0].map((_, column) =>
    observed.reduce((sum, row) => sum + row[column], 0)
  );
  if (rowTotals.some(value => value === 0) || colTotals.some(value => value === 0)) {
    return {
      ok: false,
      reason: 'Every row and every column needs at least one observation',
    };
  }
  if (params.model === 'saturated' && observed.some(row => row.some(value => value === 0))) {
    return {
      ok: false,
      reason:
        'The saturated model needs strictly positive counts: a zero cell has no finite estimate. Use the independence model or pool categories.',
    };
  }

  const stats = loglinearFit({
    observed,
    rowLabels: params.rows,
    colLabels: params.cols,
    model: params.model,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason:
        'The model could not be estimated: check for constant rows or columns or a singular design',
    };
  }

  return {
    ok: true,
    title: copy('Modello log-lineare {s1} × {s2}', {
      s1: params.rows.length,
      s2: params.cols.length,
    }),
    tables: loglinearTables(stats, ciLevel),
    report: loglinearReport(stats, ciLevel),
    charts: buildCharts(stats),
  };
};
