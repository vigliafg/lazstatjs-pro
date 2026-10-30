import { geeStats } from '../../stats/kernels/gee';
import { geeTables } from '../../stats/tables/gee';
import { geeReport } from '../../stats/reports/gee';
import { copy } from '../../stats/reportCopy';
import { makeChart, qqBand, qqPoints, qqReference } from '../../charts/kits/common';
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
  const clusterResiduals = stats.clusterLabels
    .map(label => {
      const values = stats.rowClusters
        .map((cluster, index) => (cluster === label ? stats.residuals[index] : null))
        .filter((value): value is number => value !== null && Number.isFinite(value));
      if (values.length < 2) return null;
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      const variance =
        values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
      const se = Math.sqrt(variance / values.length);
      return {
        category: label,
        estimate: mean,
        lo: mean - 1.96 * se,
        hi: mean + 1.96 * se,
      };
    })
    .filter((row): row is { category: string; estimate: number; lo: number; hi: number } => row !== null);
  const qq = qqPoints(stats.residuals);
  const qqLine = qqReference(qq);
  const coefficientPoints = stats.coefficients
    .filter(row => row.term !== '(Intercept)' && Number.isFinite(row.or) && Number.isFinite(row.lo) && Number.isFinite(row.hi))
    .map(row => ({ label: row.term, estimate: row.or, lo: row.lo, hi: row.hi }));
  const charts = [
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
  ];
  if (clusterResiduals.length > 0) {
    charts.push(
      makeChart({
        id: 'gee-cluster-residuals',
        kind: 'interval',
        title: copy('Residui medi per cluster'),
        subtitle: copy('IC 95% approssimato · riferimento 0'),
        note: copy('Ogni punto è il residuo medio del cluster: scostamenti sistematici dallo zero indicano cluster mal descritti dal modello marginale.'),
        data: { intervals: clusterResiduals, rules: [{ value: 0 }] },
        fields: { xLabel: copy('Cluster'), yLabel: copy('Residuo medio') },
        options: { sort: 'asc' } as never,
      })
    );
  }
  if (coefficientPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'gee-coefficient-forest',
        kind: 'forest',
        title: copy('Rapporti di incidenza per predittore'),
        subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
        note: copy('Punto: rapporto di incidenza. Segmento: intervallo robusto per cluster; se contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: coefficientPoints },
        fields: { xLabel: copy('Rapporto di incidenza'), yLabel: copy('Predittore') },
        options: { reference: 'one' } as never,
      })
    );
  }
  if (qq.length > 0) {
    charts.push(
      makeChart({
        id: 'gee-residual-qq',
        kind: 'qq',
        title: copy('Q-Q dei residui'),
        subtitle: copy('N = {s1}', { s1: stats.n }),
        note: copy('I punti vicini alla diagonale indicano residui compatibili con la normale.'),
        data: { points: qq, reference: qqLine, band: qqBand(qq, qqLine, ciLevel) },
        fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui osservati') },
        options: { showCI: true } as never,
      })
    );
  }
  const marginalScale = stats.family === 'binomial'
    ? stats.fitted.reduce((sum, value) => sum + value * (1 - value), 0) / Math.max(1, stats.fitted.length)
    : 1;
  const marginalBars = stats.coefficients
    .filter(row => row.term !== '(Intercept)' && Number.isFinite(row.beta))
    .map(row => ({ category: row.term, value: marginalScale * row.beta }));
  if (marginalBars.length > 0) {
    charts.push(
      makeChart({
        id: 'gee-marginal',
        kind: 'bar',
        title: copy('Effetti marginali medi'),
        subtitle: copy('Variazione media della risposta per una unità in più'),
        note: copy('L’effetto marginale medio approssima di quanto cambia la risposta predetta quando il predittore aumenta di una unità, mediando sulle osservazioni.'),
        data: { bars: marginalBars, rules: [{ value: 0 }] },
        fields: { xLabel: copy('Predittore'), yLabel: copy('Effetto marginale') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('GEE: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: geeReport(stats, ciLevel),
    charts,
  };
};
