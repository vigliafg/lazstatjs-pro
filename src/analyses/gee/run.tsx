import { geeStats } from '../../stats/kernels/gee';
import { geeTables } from '../../stats/tables/gee';
import { geeReport } from '../../stats/reports/gee';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { GeeParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface GeeInput {
  grid: Dataset;
  params: GeeParams;
  ciLevel: number;
}

/** GEE con errori standard robusti per cluster. */
export const buildGeeOutput = ({ grid, params, ciLevel }: GeeInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep) || params.indeps.includes(params.cluster)) {
    return { ok: false, reason: 'Outcome and cluster cannot also be predictors' };
  }
  if (params.dep === params.cluster) {
    return { ok: false, reason: 'Outcome and cluster must be different columns' };
  }
  const stats = geeStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    clusterIdx: params.cluster,
    family: params.family,
    correlation: params.correlation,
    level: ciLevel,
  });
  if (!stats) {
    return { ok: false, reason: 'GEE needs at least two clusters and complete rows' };
  }
  const tables = geeTables(stats, ciLevel);
  const all = [...stats.observed, ...stats.fitted];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const clusterMeans = stats.clusterLabels.map(label => {
    const indexes = stats.rowClusters
      .map((cluster, index) => (cluster === label ? index : -1))
      .filter(index => index >= 0);
    const mean = (values: number[]) =>
      indexes.reduce((sum, index) => sum + values[index], 0) / Math.max(1, indexes.length);
    return { category: label, observed: mean(stats.observed), fitted: mean(stats.fitted) };
  });
  return {
    ok: true,
    title: copy('GEE: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: geeReport(stats, ciLevel),
    charts: [
      makeChart({
        id: 'gee-observed-fitted',
        kind: 'scatter',
        title: copy('Osservati vs predetti'),
        subtitle: `${stats.clusters} cluster · N = ${stats.n}`,
        note: copy('La diagonale è la corrispondenza perfetta; i punti sono le osservazioni complete.'),
        data: { points: stats.observed.map((value, index) => ({ x: stats.fitted[index], y: value })), fit: [{ x: min, y: min }, { x: max, y: max }] },
        fields: { xLabel: copy('Valori predetti'), yLabel: copy('Valori osservati') },
        options: { fit: 'ols', band: 'none' } as never,
      }),
      makeChart({
        id: 'gee-cluster-means',
        kind: 'bar',
        title: copy('Medie osservate e predette per cluster'),
        subtitle: copy('{s1} cluster', { s1: stats.clusters }),
        note: copy('Le due barre confrontano la media osservata e quella predetta dal modello marginale in ogni cluster.'),
        data: {
          bars: clusterMeans.flatMap(item => [
            { category: item.category, value: item.observed, series: copy('Osservato') },
            { category: item.category, value: item.fitted, series: copy('Predetto') },
          ]),
        },
        fields: { xLabel: copy('Cluster'), yLabel: copy('Media'), series: copy('Serie') },
        options: { valueLabels: true, grouping: 'grouped' } as never,
      }),
    ],
  };
};
