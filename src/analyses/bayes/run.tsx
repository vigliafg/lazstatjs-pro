import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { bayesAnalysis, type BayesResult } from '../../stats/kernels/bayes';
import { jStat } from '../../stats/jstat';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { bayesTables } from '../../stats/tables/bayes';
import { bayesReport } from '../../stats/reports/bayes';
import type { AnalysisChart, ChartRow } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { BayesParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

/** Binomial pmf built iteratively: no factorials, stable for the usual n. */
const binomialPmf = (n: number, p: number): number[] => {
  const pmf = new Array<number>(n + 1).fill(0);
  if (!(p > 0)) {
    pmf[0] = 1;
    return pmf;
  }
  if (p >= 1) {
    pmf[n] = 1;
    return pmf;
  }
  let value = Math.pow(1 - p, n);
  const ratio = p / (1 - p);
  for (let k = 0; k <= n; k += 1) {
    pmf[k] = value;
    value = value * ratio * ((n - k) / (k + 1));
  }
  return pmf;
};

interface PredictiveCheck {
  curve: ChartRow[];
  observedRows: ChartRow[];
  xLabel: string;
  subtitle: string;
}

/**
 * Posterior predictive check of one summary statistic: the posterior draws
 * simulate the sampling distribution and the observed value is compared with
 * it. Only the normal and proportion likelihoods are covered; the other modes
 * would need replicate datasets that the kernel does not expose.
 */
export const posteriorPredictiveCheck = (
  result: BayesResult,
  y: number[]
): PredictiveCheck | null => {
  const draws = result.samples[0] ?? [];
  if (draws.length === 0 || y.length === 0) return null;
  const stride = Math.max(1, Math.ceil(draws.length / 400));
  const used = draws.filter((_, index) => index % stride === 0);
  if (used.length === 0) return null;
  const observedRowsFor = (statistic: number, top: number): ChartRow[] => [
    { x: statistic, y: 0, series: copy('Osservato') },
    { x: statistic, y: top, series: copy('Osservato') },
  ];
  if (result.mode === 'proportion') {
    const n = y.length;
    const observed = y.reduce((sum, value) => sum + value, 0);
    const pmf = new Array<number>(n + 1).fill(0);
    used.forEach(theta => {
      if (!(theta >= 0) || theta > 1) return;
      binomialPmf(n, theta).forEach((value, k) => {
        pmf[k] += value;
      });
    });
    const curve: ChartRow[] = pmf.map((value, k) => ({
      x: k,
      y: value / used.length,
      series: copy('Repliche'),
    }));
    const top = Math.max(...curve.map(row => Number(row.y)));
    return {
      curve,
      observedRows: observedRowsFor(observed, top),
      xLabel: copy('Numero di successi'),
      subtitle: copy('Repliche posteriori dei successi · {s1} osservazioni', { s1: n }),
    };
  }
  if (result.mode === 'normal') {
    const sigma = result.sigma?.mean ?? NaN;
    if (!(sigma > 0)) return null;
    const n = y.length;
    const observed = y.reduce((sum, value) => sum + value, 0) / n;
    const se = sigma / Math.sqrt(n);
    const values = used.filter(value => Number.isFinite(value));
    if (values.length === 0) return null;
    const min = Math.min(...values) - 4 * se;
    const max = Math.max(...values) + 4 * se;
    const points = 121;
    const curve: ChartRow[] = Array.from({ length: points }, (_, index) => {
      const x = min + ((max - min) * index) / (points - 1);
      const density =
        values.reduce((sum, mu) => sum + jStat.normal.pdf(x, mu, se), 0) / values.length;
      return { x, y: density, series: copy('Repliche') };
    });
    const top = Math.max(...curve.map(row => Number(row.y)));
    return {
      curve,
      observedRows: observedRowsFor(observed, top),
      xLabel: copy('Media'),
      subtitle: copy('Repliche posteriori della media · {s1} osservazioni', { s1: n }),
    };
  }
  return null;
};

export interface BayesInput {
  grid: Dataset;
  params: BayesParams;
}

export const buildBayesOutput = ({ grid, params }: BayesInput): AnalysisRunResult => {
  const outcomeName = grid.cols[params.outcome]?.name ?? 'Y';
  const predictorNames = params.predictors.map(
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  const y: number[] = [];
  const x: number[][] = [];
  const rawGroups: string[] = [];
  grid.rows.forEach(row => {
    const value = parseNum(row[params.outcome]);
    const values = params.predictors.map(index => parseNum(row[index]));
    if (!Number.isFinite(value)) return;
    if (params.mode === 'regression' && values.some(item => !Number.isFinite(item))) return;
    if (params.mode === 'proportion' && value !== 0 && value !== 1) return;
    if (params.mode === 'rate' && value < 0) return;
    if (params.mode === 'hierarchical') {
      const group = String(row[params.group] ?? '').trim();
      if (group === '') return;
      rawGroups.push(group);
    }
    y.push(value);
    x.push(values);
  });
  if (y.length < 3) {
    return { ok: false, reason: 'Bayesian estimation needs at least three complete rows' };
  }
  if (params.mode === 'regression' && params.predictors.length === 0) {
    return { ok: false, reason: 'The regression mode needs at least one predictor' };
  }
  if (params.mode === 'hierarchical' && params.group < 0) {
    return { ok: false, reason: 'The hierarchical model needs a grouping column' };
  }
  const groupNames = params.mode === 'hierarchical'
    ? [...new Set(rawGroups)].sort((a, b) => a.localeCompare(b))
    : [];
  if (params.mode === 'hierarchical' && groupNames.length < 2) {
    return { ok: false, reason: 'The hierarchical model needs at least two groups' };
  }
  const groupCodes = groupNames.length
    ? rawGroups.map(label => groupNames.indexOf(label))
    : [];
  const guard = guardDimensions(
    { rows: y.length, columns: params.predictors.length + 1 },
    GUARD_LIMITS.linear
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };

  const result = bayesAnalysis(y, x, {
    mode: params.mode,
    priorMean: params.priorMean,
    priorSd: params.priorSd,
    iterations: params.iterations,
    burnin: params.burnin,
    chains: params.chains,
    seed: params.seed,
    variableNames: predictorNames,
    groupCodes,
    groupNames,
  });
  if (!result) {
    return { ok: false, reason: 'The posterior could not be sampled: check the data and the prior settings' };
  }

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'bayes-posterior-density',
      kind: 'histogram',
      title: copy('Distribuzione a posteriori: {s1}', { s1: result.parameters[0]?.term ?? 'θ' }),
      subtitle: copy('{s1} valori dopo il burn-in', { s1: result.draws }),
      note: copy('L’istogramma mostra la forma della posteriori: media, mediana e HDI riassumono centro e ampiezza.'),
      data: {
        values: (result.samples[0] ?? []).map(value => ({ value })),
      },
      fields: { xLabel: result.parameters[0]?.term ?? 'θ', yLabel: copy('Densità') },
      options: { bins: 40 } as never,
    }),
    makeChart({
      id: 'bayes-interval',
      kind: 'interval',
      title: copy('Intervalli a posteriori'),
      subtitle: copy('Media e HDI al 95%'),
      note: copy('Il punto è la media a posteriori; il segmento è l’intervallo credibile più denso. Un intervallo che esclude lo zero indica una direzione credibile dell’effetto.'),
      data: {
        intervals: result.parameters.map(item => ({
          category: item.term,
          estimate: item.mean,
          lo: item.hdiLo,
          hi: item.hdiHi,
        })),
      },
      fields: { xLabel: copy('Valore'), yLabel: copy('Parametro') },
    }),
  ];
  if (result.mode === 'hierarchical' && result.groups.length > 0) {
    charts.push(
      makeChart({
        id: 'bayes-groups',
        kind: 'interval',
        title: copy('Medie dei gruppi'),
        subtitle: copy('Media a posteriori e HDI al 95%'),
        note: copy('Le medie dei gruppi sono stimate con uno shrinkage verso la media generale: i gruppi piccoli si avvicinano di più a μ.'),
        data: {
          intervals: result.groups.map(group => ({
            category: group.label,
            estimate: group.mean,
            lo: group.hdiLo,
            hi: group.hdiHi,
          })),
        },
        fields: { xLabel: copy('Valore'), yLabel: copy('Gruppo') },
      })
    );
  }
  if (result.mode === 'regression' && result.parameters.length >= 2) {
    const first = result.samples[0] ?? [];
    const second = result.samples[1] ?? [];
    const step = Math.max(1, Math.ceil(first.length / 800));
    charts.push(
      makeChart({
        id: 'bayes-joint',
        kind: 'scatter',
        title: copy('Posteriori congiunte'),
        subtitle: copy('Intercetta e primo predittore'),
        note: copy('La nuvola mostra la correlazione a posteriori tra i due parametri; una forma allungata indica che i dati non separano bene i due effetti.'),
        data: {
          points: first
            .map((value, index) => ({ x: value, y: second[index] ?? NaN }))
            .filter((point, index) => index % step === 0 && Number.isFinite(point.y)),
        },
        fields: { xLabel: result.parameters[0].term, yLabel: result.parameters[1].term },
        options: { fit: 'none', band: 'none', pointOpacity: 0.4 } as never,
      })
    );
  }

  const predictive = posteriorPredictiveCheck(result, y);
  if (predictive) {
    charts.push(
      makeChart({
        id: 'bayes-ppc',
        kind: 'line',
        title: copy('Controllo predittivo a posteriori'),
        subtitle: predictive.subtitle,
        note: copy('La curva è la distribuzione predittiva a posteriori della statistica (per la normale con la DS a posteriori media); la linea verticale è il valore osservato: se cade nelle code, il modello non riproduce bene i dati.'),
        data: { series: [...predictive.curve, ...predictive.observedRows] },
        fields: { xLabel: predictive.xLabel, yLabel: copy('Densità'), series: copy('Serie') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Analisi bayesiana: {s1}', { s1: outcomeName }),
    header: copy('{s1} osservazioni · {s2} catene · Rhat {s3}', {
      s1: result.n,
      s2: result.chains,
      s3: result.rhatMax.toFixed(3),
    }),
    tables: bayesTables(result),
    report: bayesReport(result),
    charts,
  };
};
