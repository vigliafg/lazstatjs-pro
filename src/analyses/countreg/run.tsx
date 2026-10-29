import { countRegressionStats } from '../../stats/kernels/countreg';
import { countTables } from '../../stats/tables/countreg';
import { countReport } from '../../stats/reports/countreg';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { CountParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CountInput {
  grid: Dataset;
  params: CountParams;
  ciLevel: number;
}

/** Regressione di Poisson o binomiale negativa per conteggi. */
export const buildCountOutput = ({ grid, params, ciLevel }: CountInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }
  const stats = countRegressionStats({
    family: params.family,
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps.filter(index => index !== params.dep),
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Count regression needs non-negative counts and enough complete rows',
    };
  }

  const tables = countTables(stats, ciLevel);
  const observedFitted = stats.observed.map((value, index) => ({ x: stats.fitted[index], y: value }));
  const residuals = stats.fitted.map((value, index) => ({ x: value, y: stats.residuals[index] }));
  const all = [...stats.observed, ...stats.fitted];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  return {
    ok: true,
    title: copy('Regressione per conteggi: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: countReport(tables, stats, ciLevel),
    charts: [
      makeChart({
        id: 'count-observed-fitted',
        kind: 'scatter',
        title: copy('Osservati vs predetti'),
        subtitle: copy('N = {s1} · famiglia {s2}', { s1: stats.n, s2: stats.family }),
        note: copy('La diagonale è la corrispondenza perfetta tra conteggi osservati e predetti.'),
        data: { points: observedFitted, fit: [{ x: min, y: min }, { x: max, y: max }] },
        fields: { xLabel: copy('Valori predetti'), yLabel: copy('Valori osservati') },
        options: { fit: 'ols', band: 'none' } as never,
      }),
      makeChart({
        id: 'count-residual-fitted',
        kind: 'scatter',
        title: copy('Residui vs predetti'),
        subtitle: copy('N = {s1}', { s1: stats.n }),
        note: copy('Una nuvola senza struttura è coerente con il modello; pattern sistematici suggeriscono un legame mal specificato.'),
        data: { points: residuals, rules: [{ y: 0 }] },
        fields: { xLabel: copy('Valori predetti'), yLabel: copy('Residui') },
        options: { fit: 'none', band: 'none' } as never,
      }),
    ],
  };
};
