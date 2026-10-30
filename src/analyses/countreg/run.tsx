import { countRegressionStats } from '../../stats/kernels/countreg';
import { countTables } from '../../stats/tables/countreg';
import { countReport } from '../../stats/reports/countreg';
import { copy } from '../../stats/reportCopy';
import { makeChart, qqBand, qqPoints, qqReference } from '../../charts/kits/common';
import { jStat } from '../../stats/jstat';
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
  const qq = qqPoints(stats.residuals);
  const qqLine = qqReference(qq);
  const irrPoints = stats.coefficients
    .filter(row => row.term !== '(Intercept)' && Number.isFinite(row.irr) && Number.isFinite(row.irrLo) && Number.isFinite(row.irrHi))
    .map(row => ({ label: row.term, estimate: row.irr, lo: row.irrLo, hi: row.irrHi }));
  const charts = [
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
  ];
  if (qq.length > 0) {
    charts.push(
      makeChart({
        id: 'count-residual-qq',
        kind: 'qq',
        title: copy('Q-Q dei residui'),
        subtitle: copy('N = {s1}', { s1: stats.n }),
        note: copy('I punti vicini alla diagonale indicano residui compatibili con la normale; code pesanti suggeriscono sovradispersione o outlier.'),
        data: { points: qq, reference: qqLine, band: qqBand(qq, qqLine, ciLevel) },
        fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui osservati') },
        options: { showCI: true } as never,
      })
    );
  }
  if (irrPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'count-irr-forest',
        kind: 'forest',
        title: copy('Rapporti di incidenza per predittore'),
        subtitle: copy('IC {s1}% · riferimento IRR = 1', { s1: ciLevel }),
        note: copy('Punto: rapporto di incidenza. Segmento: intervallo di confidenza; se contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: irrPoints },
        fields: { xLabel: copy('Rapporto di incidenza'), yLabel: copy('Predittore') },
        options: { reference: 'one' } as never,
      })
    );
  }
  if (Number.isFinite(stats.dispersion)) {
    charts.push(
      makeChart({
        id: 'count-dispersion',
        kind: 'bar',
        title: copy('Dispersione di Pearson'),
        subtitle: copy('Pearson χ² / df'),
        note: copy('Valori vicini a 1 indicano dispersione coerente con la famiglia scelta; valori molto sopra 1 suggeriscono sovradispersione.'),
        data: {
          bars: [{ category: stats.family === 'poisson' ? copy('Poisson') : copy('Binomiale negativa'), value: stats.dispersion }],
          rules: [{ value: 1 }],
        },
        fields: { xLabel: copy('Famiglia'), yLabel: copy('Dispersione') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      })
    );
  }
  const maxCount = Math.min(15, Math.max(0, ...stats.observed));
  const theta = stats.theta ?? 0;
  const logPmf = (k: number, mu: number): number => {
    if (!(mu > 0)) return k === 0 ? 0 : -Infinity;
    if (stats.family === 'poisson') {
      return -mu + k * Math.log(mu) - jStat.gammaln(k + 1);
    }
    if (!(theta > 0)) return -Infinity;
    return (
      jStat.gammaln(k + theta) -
      jStat.gammaln(theta) -
      jStat.gammaln(k + 1) +
      theta * Math.log(theta / (theta + mu)) +
      k * Math.log(mu / (theta + mu))
    );
  };
  const rootogramBars = Array.from({ length: maxCount + 1 }, (_, k) => {
    const observed = stats.observed.filter(value => value === k).length;
    const expected = stats.fitted.reduce((sum, mu) => sum + Math.exp(logPmf(k, mu)), 0);
    return [
      { category: String(k), value: observed, series: copy('Osservato') },
      { category: String(k), value: expected, series: copy('Atteso') },
    ];
  }).flat();
  if (rootogramBars.length > 0) {
    charts.push(
      makeChart({
        id: 'count-rootogram',
        kind: 'bar',
        title: copy('Rootogramma dei conteggi'),
        subtitle: copy('Frequenze osservate e attese per conteggio'),
        note: copy('Confronta quante osservazioni hanno ciascun conteggio con quante ne prevede il modello: barre molto diverse segnalano un fit scarso nelle code o nello zero.'),
        data: { bars: rootogramBars },
        fields: { xLabel: copy('Conteggio'), yLabel: copy('Frequenza'), series: copy('Serie') },
        options: { valueLabels: false, grouping: 'grouped' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Regressione per conteggi: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: countReport(tables, stats, ciLevel),
    charts,
  };
};
