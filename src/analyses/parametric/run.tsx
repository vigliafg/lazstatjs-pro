import { parametricSurvivalStats } from '../../stats/kernels/parametric';
import { parametricTables } from '../../stats/tables/parametric';
import { parametricReport } from '../../stats/reports/parametric';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { ChartRow } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { ParametricSurvivalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ParametricInput {
  grid: Dataset;
  params: ParametricSurvivalParams;
  ciLevel: number;
}

/** Sopravvivenza parametrica Weibull/esponenziale (AFT). */
export const buildParametricOutput = ({ grid, params, ciLevel }: ParametricInput): AnalysisRunResult => {
  if (params.time === params.event) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }
  if (params.predictors.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.predictors.includes(params.time) || params.predictors.includes(params.event)) {
    return { ok: false, reason: 'Time and event cannot also be predictors' };
  }
  const stats = parametricSurvivalStats({
    rows: grid.rows,
    timeIdx: params.time,
    eventIdx: params.event,
    indepIdxs: params.predictors,
    distribution: params.distribution,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Parametric survival needs positive times, a binary event and enough complete rows',
    };
  }
  const predNames = params.predictors.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = parametricTables(stats, ciLevel);

  const complete = grid.rows
    .map(row => ({
      time: parseNum(row[params.time]),
      xs: params.predictors.map(index => parseNum(row[index])),
    }))
    .filter(entry => entry.time > 0 && entry.xs.every(value => Number.isFinite(value)));
  const predictorMeans = params.predictors.map((_, column) =>
    complete.reduce((sum, entry) => sum + entry.xs[column], 0) / Math.max(1, complete.length)
  );
  const firstValues = complete.map(entry => entry.xs[0]);
  const firstMean = predictorMeans[0] ?? 0;
  const firstSd = firstValues.length > 1
    ? Math.sqrt(firstValues.reduce((sum, value) => sum + Math.pow(value - firstMean, 2), 0) / (firstValues.length - 1))
    : 0;
  const profiles = firstSd > 0
    ? [firstMean - firstSd, firstMean, firstMean + firstSd]
    : [firstMean];
  const times = complete.map(entry => entry.time);
  const minTime = times.length ? Math.max(1e-6, Math.min(...times)) : 1;
  const maxTime = times.length ? Math.max(...times) : 1;
  const upper = maxTime > minTime ? maxTime * 1.5 : Math.max(2, maxTime * 2);
  const gridPoints = Array.from({ length: 80 }, (_, index) => minTime + ((upper - minTime) * index) / 79);
  const curveKind = (kind: 'survival' | 'hazard' | 'cumhazard'): ChartRow[] =>
    profiles.flatMap(profile => {
      const values = predictorMeans.map((mean, column) => (column === 0 ? profile : mean));
      const eta = stats.mu + stats.coefficients.reduce((sum, coefficient, column) => sum + coefficient.beta * values[column], 0);
      const label = `${predNames[0]} = ${profile.toFixed(3)}`;
      return gridPoints.map(time => {
        const z = (Math.log(time) - eta) / stats.sigma;
        const survival = Math.exp(-Math.exp(Math.min(50, z)));
        const hazard = (1 / (stats.sigma * time)) * Math.exp(Math.min(50, z));
        const value = kind === 'survival' ? survival : kind === 'hazard' ? hazard : -Math.log(Math.max(1e-12, survival));
        return { x: time, y: value, series: label };
      });
    });
  const survivalCurves = curveKind('survival');
  const hazardCurves = curveKind('hazard');
  const cumulativeCurves = curveKind('cumhazard');
  const coefficientPoints = stats.coefficients.map(row => ({
    label: row.term,
    estimate: row.timeRatio,
    lo: row.lo,
    hi: row.hi,
  }));
  const medianRows = profiles.map(profile => {
    const values = predictorMeans.map((mean, column) => (column === 0 ? profile : mean));
    const eta = stats.mu + stats.coefficients.reduce((sum, coefficient, column) => sum + coefficient.beta * values[column], 0);
    const median = Math.exp(eta + stats.sigma * Math.log(Math.log(2)));
    return { category: `${predNames[0]} = ${profile.toFixed(3)}`, value: median };
  });
  const charts = [
    makeChart({
      id: 'parametric-survival',
      kind: 'survival',
      title: copy('Curve di sopravvivenza per profilo'),
      subtitle: copy('{s1} · profili a media ± 1 DS del primo predittore', { s1: stats.distribution }),
      note: copy('Le altre covariate sono tenute al loro valore medio; le curve mostrano come cambia la sopravvivenza al variare del primo predittore.'),
      data: { curves: survivalCurves },
      fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza'), series: copy('Profilo') },
      options: { showCI: false, showCensoring: false, step: false } as never,
    }),
    makeChart({
      id: 'parametric-hazard',
      kind: 'line',
      title: copy('Hazard per profilo'),
      subtitle: copy('{s1} · profili a media ± 1 DS del primo predittore', { s1: stats.distribution }),
      note: copy('Il rischio istantaneo è calcolato dalla stessa distribuzione parametrica; le altre covariate restano alla media.'),
      data: { series: hazardCurves },
      fields: { xLabel: copy('Tempo'), yLabel: copy('Hazard'), series: copy('Profilo') },
      options: { showBand: false } as never,
    }),
    makeChart({
      id: 'parametric-cumhazard',
      kind: 'line',
      title: copy('Hazard cumulativo per profilo'),
      subtitle: copy('{s1} · profili a media ± 1 DS del primo predittore', { s1: stats.distribution }),
      note: copy('L’hazard cumulativo è −log S(t): riassume il rischio accumulato fino a ciascun tempo.'),
      data: { series: cumulativeCurves },
      fields: { xLabel: copy('Tempo'), yLabel: copy('Hazard cumulativo'), series: copy('Profilo') },
      options: { showBand: false } as never,
    }),
  ];
  if (coefficientPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'parametric-coefficients',
        kind: 'forest',
        title: copy('Rapporti dei tempi per predittore'),
        subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
        note: copy('Punto: rapporto dei tempi (time ratio). Valori sopra 1 allungano il tempo all’evento; se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: coefficientPoints },
        fields: { xLabel: copy('Rapporto dei tempi'), yLabel: copy('Predittore') },
        options: { reference: 'one' } as never,
      })
    );
  }
  if (medianRows.length > 0) {
    charts.push(
      makeChart({
        id: 'parametric-median',
        kind: 'bar',
        title: copy('Sopravvivenza mediana per profilo'),
        subtitle: copy('Tempo in cui S(t) = 0,5'),
        note: copy('La mediana è calcolata dalla distribuzione parametrica: barre più alte indicano un evento atteso più tardi.'),
        data: { bars: medianRows },
        fields: { xLabel: copy('Profilo'), yLabel: copy('Tempo mediano') },
        options: { valueLabels: true } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Sopravvivenza parametrica: {s1}', { s1: grid.cols[params.time]?.name ?? 'T' }),
    tables,
    report: parametricReport(stats, predNames, ciLevel),
    charts,
  };
};
