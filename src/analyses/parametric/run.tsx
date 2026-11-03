import { parametricSurvivalStats } from '../../stats/kernels/parametric';
import { parametricTables } from '../../stats/tables/parametric';
import { parametricReport } from '../../stats/reports/parametric';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { jStat } from '../../stats/jstat';
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
    upperIdx: params.upperVariable ?? -1,
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
  const distribution = stats.distribution;
  const gompertzRate = Math.exp(stats.mu);
  const gompertzGrowth = stats.sigma;
  const survivalAt = (eta: number, time: number): number => {
    if (distribution === 'gompertz') {
      const growth = (gompertzRate / gompertzGrowth) * (Math.exp(gompertzGrowth * time) - 1);
      return Math.exp(-growth);
    }
    const z = (Math.log(time) - eta) / stats.sigma;
    if (distribution === 'weibull' || distribution === 'exponential') {
      return Math.exp(-Math.exp(Math.min(50, z)));
    }
    if (distribution === 'lognormal') {
      return Math.max(0, 1 - jStat.normal.cdf(z, 0, 1));
    }
    return 1 / (1 + Math.exp(Math.min(50, z)));
  };
  const hazardAt = (eta: number, time: number): number => {
    if (distribution === 'gompertz') {
      return gompertzRate * Math.exp(gompertzGrowth * time + eta);
    }
    const z = (Math.log(time) - eta) / stats.sigma;
    if (distribution === 'weibull' || distribution === 'exponential') {
      return (1 / (stats.sigma * time)) * Math.exp(Math.min(50, z));
    }
    if (distribution === 'lognormal') {
      const density = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
      return density / Math.max(1e-12, stats.sigma * time * survivalAt(eta, time));
    }
    const survival = 1 / (1 + Math.exp(Math.min(50, z)));
    return Math.exp(Math.min(50, z)) / Math.max(1e-12, stats.sigma * time) * survival;
  };
  const curveKind = (kind: 'survival' | 'hazard' | 'cumhazard' | 'density'): ChartRow[] =>
    profiles.flatMap(profile => {
      const values = predictorMeans.map((mean, column) => (column === 0 ? profile : mean));
      const eta = stats.mu + stats.coefficients.reduce((sum, coefficient, column) => sum + coefficient.beta * values[column], 0);
      const label = `${predNames[0]} = ${profile.toFixed(3)}`;
      return gridPoints.map(time => {
        const survival = survivalAt(eta, time);
        const hazard = hazardAt(eta, time);
        const value =
          kind === 'survival'
            ? survival
            : kind === 'hazard'
              ? hazard
              : kind === 'density'
                ? hazard * survival
                : -Math.log(Math.max(1e-12, survival));
        return { x: time, y: value, series: label };
      });
    });
  const survivalCurves = curveKind('survival');
  const hazardCurves = curveKind('hazard');
  const cumulativeCurves = curveKind('cumhazard');
  const densityCurves = curveKind('density');
  const coefficientPoints = stats.coefficients.map(row => ({
    label: row.term,
    estimate: row.timeRatio,
    lo: row.lo,
    hi: row.hi,
  }));
  const medianAt = (eta: number): number => {
    if (distribution === 'gompertz') {
      return Math.log(1 + (gompertzGrowth / Math.max(1e-12, gompertzRate)) * Math.log(2)) / gompertzGrowth;
    }
    if (distribution === 'lognormal' || distribution === 'loglogistic') {
      return Math.exp(eta);
    }
    return Math.exp(eta + stats.sigma * Math.log(Math.log(2)));
  };
  const medianRows = profiles.map(profile => {
    const values = predictorMeans.map((mean, column) => (column === 0 ? profile : mean));
    const eta = stats.mu + stats.coefficients.reduce((sum, coefficient, column) => sum + coefficient.beta * values[column], 0);
    return { category: `${predNames[0]} = ${profile.toFixed(3)}`, value: medianAt(eta) };
  });
  const meanEta = stats.mu + stats.coefficients.reduce(
    (sum, coefficient, column) => sum + coefficient.beta * (predictorMeans[column] ?? 0),
    0
  );
  const sortedTimes = complete.map(entry => entry.time).sort((a, b) => a - b);
  const theoreticalQuantile = (p: number): number => {
    if (distribution === 'gompertz') {
      const value = 1 - (gompertzGrowth / Math.max(1e-12, gompertzRate)) * Math.log(1 - p);
      return Math.log(Math.max(1e-12, value)) / gompertzGrowth;
    }
    if (distribution === 'lognormal') {
      return Math.exp(meanEta + stats.sigma * jStat.normal.inv(p, 0, 1));
    }
    if (distribution === 'loglogistic') {
      return Math.exp(meanEta + stats.sigma * Math.log(p / Math.max(1e-12, 1 - p)));
    }
    return Math.exp(meanEta + stats.sigma * Math.log(-Math.log(1 - p)));
  };
  const qq = sortedTimes.map((time, index) => {
    const p = (index + 1 - 0.375) / (sortedTimes.length + 0.25);
    return { x: theoreticalQuantile(p), y: time };
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
      // The parametric curve is analytic, so it is not stepped like KM; the
      // median markers and censoring options still follow the `jmp-km` reading.
      options: { step: false, showCI: false, showCensoring: false, showMedian: true } as never,
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
    makeChart({
      id: 'parametric-density',
      kind: 'line',
      title: copy('Densità dei tempi per profilo'),
      subtitle: copy('{s1} · profili a media ± 1 DS del primo predittore', { s1: stats.distribution }),
      note: copy('La densità è hazard × sopravvivenza: mostra dove si concentrano i tempi all’evento per ciascun profilo.'),
      data: { series: densityCurves },
      fields: { xLabel: copy('Tempo'), yLabel: copy('Densità'), series: copy('Profilo') },
      options: { showBand: false } as never,
    }),
  ];
  if (coefficientPoints.length > 0) {
    const ph = stats.parameterization === 'ph';
    charts.push(
      makeChart({
        id: 'parametric-coefficients',
        kind: 'forest',
        title: ph ? copy('Hazard ratio per predittore') : copy('Rapporti dei tempi per predittore'),
        subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
        note: ph
          ? copy('Punto: hazard ratio del modello di Gompertz. Valori sopra 1 aumentano il rischio istantaneo; se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.')
          : copy('Punto: rapporto dei tempi (time ratio). Valori sopra 1 allungano il tempo all’evento; se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: coefficientPoints },
        fields: { xLabel: ph ? copy('Hazard ratio') : copy('Rapporto dei tempi'), yLabel: copy('Predittore') },
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
  if (qq.length > 2) {
    const minQq = Math.min(...qq.flatMap(point => [point.x, point.y]));
    const maxQq = Math.max(...qq.flatMap(point => [point.x, point.y]));
    charts.push(
      makeChart({
        id: 'parametric-qq',
        kind: 'qq',
        title: copy('Q-Q della distribuzione parametrica'),
        subtitle: copy('{s1} · profilo medio', { s1: stats.distribution }),
        note: copy('I punti vicini alla diagonale indicano che i tempi osservati seguono la distribuzione fittata; deviazioni alle estremità segnalano code mal descritte.'),
        data: { points: qq, reference: [{ x: minQq, y: minQq }, { x: maxQq, y: maxQq }] },
        fields: { xLabel: copy('Tempi teorici'), yLabel: copy('Tempi osservati') },
        options: { showReference: true, qqAxis: 'z' } as never,
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
