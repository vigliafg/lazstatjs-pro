import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { bayesAnalysis } from '../../stats/kernels/bayes';
import { GUARD_LIMITS, guardDimensions } from '../../stats/kernels/guards';
import { bayesTables } from '../../stats/tables/bayes';
import { bayesReport } from '../../stats/reports/bayes';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { BayesParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

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
  grid.rows.forEach(row => {
    const value = parseNum(row[params.outcome]);
    const values = params.predictors.map(index => parseNum(row[index]));
    if (!Number.isFinite(value)) return;
    if (params.mode === 'regression' && values.some(item => !Number.isFinite(item))) return;
    if (params.mode === 'proportion' && value !== 0 && value !== 1) return;
    if (params.mode === 'rate' && value < 0) return;
    y.push(value);
    x.push(values);
  });
  if (y.length < 3) {
    return { ok: false, reason: 'Bayesian estimation needs at least three complete rows' };
  }
  if (params.mode === 'regression' && params.predictors.length === 0) {
    return { ok: false, reason: 'The regression mode needs at least one predictor' };
  }
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
