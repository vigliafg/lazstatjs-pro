import { lmmStats } from '../../stats/kernels/lmm';
import { lmmTables } from '../../stats/tables/lmm';
import { lmmReport } from '../../stats/reports/lmm';
import { copy } from '../../stats/reportCopy';
import { makeChart, qqPoints, qqReference } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { LmmParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface LmmInput {
  grid: Dataset;
  params: LmmParams;
  ciLevel: number;
}

/** Modello lineare misto con intercetta casuale (REML). */
export const buildLmmOutput = ({ grid, params, ciLevel }: LmmInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one fixed predictor' };
  }
  if (params.indeps.includes(params.dep) || params.indeps.includes(params.group)) {
    return { ok: false, reason: 'Outcome and group cannot also be fixed predictors' };
  }
  if (params.dep === params.group) {
    return { ok: false, reason: 'Outcome and group must be different columns' };
  }

  const stats = lmmStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    groupIdx: params.group,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'The mixed model needs at least two groups, complete rows and enough observations',
    };
  }

  const depName = grid.cols[params.dep]?.name ?? 'Y';
  const predNames = params.indeps.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const groupName = grid.cols[params.group]?.name ?? 'Group';
  const tables = lmmTables(stats, depName, predNames, groupName, ciLevel);
  const all = [...stats.observed, ...stats.fitted];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const qq = qqPoints(stats.residuals);
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'lmm-observed-fitted',
      kind: 'scatter',
      title: copy('Osservati vs predetti'),
      subtitle: `${depName} · ${stats.n} osservazioni`,
      note: copy('La diagonale è la corrispondenza perfetta; l’ICC misura quanta variabilità resta tra i gruppi.'),
      data: { points: stats.observed.map((value, index) => ({ x: stats.fitted[index], y: value })), fit: [{ x: min, y: min }, { x: max, y: max }] },
      fields: { xLabel: copy('Valori predetti'), yLabel: depName },
      options: { fit: 'ols', band: 'none' } as never,
    }),
    makeChart({
      id: 'lmm-residual-fitted',
      kind: 'scatter',
      title: copy('Residui vs predetti'),
      subtitle: copy('N = {s1}', { s1: stats.n }),
      note: copy('Residui senza struttura sono coerenti con l’ipotesi di varianza costante.'),
      data: { points: stats.fitted.map((value, index) => ({ x: value, y: stats.residuals[index] })), rules: [{ y: 0 }] },
      fields: { xLabel: copy('Valori predetti'), yLabel: copy('Residui') },
      options: { fit: 'none', band: 'none' } as never,
    }),
    makeChart({
      id: 'lmm-group-means',
      kind: 'bar',
      title: copy('Medie per gruppo'),
      subtitle: `${groupName} · ICC = ${Number.isFinite(stats.icc) ? stats.icc.toFixed(3) : 'n.d.'}`,
      note: copy('La barra è la media osservata del gruppo; l’ICC riassume la quota di varianza tra gruppi.'),
      data: { bars: stats.groupLabels.map((label, index) => ({ category: label, value: stats.groupMeans[index] })) },
      fields: { xLabel: groupName, yLabel: depName },
      options: { valueLabels: true } as never,
    }),
  ];
  if (qq.length > 0) {
    charts.push(
      makeChart({
        id: 'lmm-residual-qq',
        kind: 'qq',
        title: copy('Q-Q dei residui'),
        subtitle: copy('N = {s1}', { s1: stats.n }),
        note: copy('I punti vicini alla diagonale indicano residui compatibili con la normalità.'),
        data: { points: qq, reference: qqReference(qq) },
        fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui osservati') },
      })
    );
  }

  return {
    ok: true,
    title: copy('Modello misto: {s1}', { s1: depName }),
    tables,
    report: lmmReport(stats, predNames, groupName, ciLevel),
    charts,
  };
};
