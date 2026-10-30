import { stratifiedCoxStats } from '../../stats/kernels/stratcox';
import { kaplanMeier } from '../../stats/survival';
import { stratCoxTables } from '../../stats/tables/stratcox';
import { stratCoxReport } from '../../stats/reports/stratcox';
import type { Dataset } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { naturalCompare } from '../../grid/types';
import type { ChartRow } from '../../stats/charts';

export interface StratifiedCoxInput {
  grid: Dataset;
  params: StratifiedCoxParams;
  ciLevel: number;
}

/** Cox stratificato con coefficienti condivisi. */
export const buildStratifiedCoxOutput = ({ grid, params, ciLevel }: StratifiedCoxInput): AnalysisRunResult => {
  if (params.stratum < 0) {
    return { ok: false, reason: 'Select a stratum column' };
  }
  if (params.time === params.event) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }
  if (params.covariates.length === 0) {
    return { ok: false, reason: 'Select at least one covariate' };
  }
  if (params.covariates.includes(params.stratum)) {
    return { ok: false, reason: 'The stratum cannot also be a covariate' };
  }
  if (params.covariates.includes(params.time) || params.covariates.includes(params.event)) {
    return { ok: false, reason: 'Time and event columns cannot be covariates' };
  }

  const time = grid.rows.map(row => Number(row[params.time]));
  const event = grid.rows.map(row => Number(row[params.event]));
  const strata = grid.rows.map(row => String(row[params.stratum] ?? '').trim());
  const covariates = params.covariates.map(index => ({
    name: grid.cols[index]?.name ?? `X${index + 1}`,
    values: grid.rows.map(row => Number(row[index])),
  }));
  const stats = stratifiedCoxStats({ time, event, covariates, strata, level: ciLevel });
  if (!stats) {
    return {
      ok: false,
      reason: 'Stratified Cox needs at least two strata with events and complete numeric covariates',
    };
  }
  const tables = stratCoxTables(stats, ciLevel);
  const curves: ChartRow[] = [];
  const censored: ChartRow[] = [];
  const labels = Array.from(new Set(strata.map(label => label.trim()).filter(Boolean))).sort(naturalCompare);
  labels.forEach(label => {
    const observations = strata.flatMap((stratum, index) =>
      stratum === label && Number.isFinite(time[index]) && time[index] >= 0
        ? [{ time: time[index], event: event[index] === 1 ? 1 : 0 }]
        : []
    );
    if (observations.length === 0) return;
    const km = kaplanMeier(observations.map(item => item.time), observations.map(item => item.event), ciLevel);
    if (km.points.length === 0) return;
    curves.push({ x: 0, y: 1, series: label, lo: 1, hi: 1 });
    km.points.forEach(point => {
      curves.push({ x: point.time, y: point.survival, series: label, lo: point.lo, hi: point.hi });
      if (point.censored > 0) censored.push({ x: point.time, y: point.survival, series: label });
    });
  });
  const maxTime = time.reduce(
    (max, value) => (Number.isFinite(value) && value >= 0 ? Math.max(max, value) : max),
    0
  );
  const riskTimes =
    maxTime > 0
      ? [0, 0.25, 0.5, 0.75, 1].map(fraction => Number((fraction * maxTime).toFixed(4)))
      : [0];
  const riskRows: ChartRow[] = [];
  labels.forEach(label => {
    const indices = strata
      .map((stratum, index) => (stratum === label ? index : -1))
      .filter(index => index >= 0 && Number.isFinite(time[index]) && time[index] >= 0);
    riskTimes.forEach(atTime => {
      riskRows.push({
        time: atTime,
        group: label,
        atRisk: indices.filter(index => time[index] >= atTime).length,
        events: indices.filter(index => event[index] === 1 && time[index] <= atTime).length,
      });
    });
  });

  const forest = makeChart({
    id: 'stratcox-forest',
    kind: 'forest',
    title: copy('Hazard ratio per covariata'),
    subtitle: copy('IC {s1}% · {s2} strati', { s1: ciLevel, s2: stats.strata }),
    note: copy('Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1. I coefficienti sono condivisi tra gli strati.'),
    data: { points: stats.coefficients.map(coefficient => ({ label: coefficient.term, estimate: coefficient.hr, lo: coefficient.lo, hi: coefficient.hi })) },
    fields: { xLabel: copy('Hazard ratio'), yLabel: copy('Covariata') },
    stats: { n: stats.n, events: stats.events },
  });
  const charts = [forest];
  if (curves.length > 0) {
    charts.push(
      makeChart({
        id: 'stratcox-km',
        kind: 'survival',
        title: copy('Kaplan–Meier per strato'),
        subtitle: copy('{s1} strati · IC {s2}%', { s1: labels.length, s2: ciLevel }),
        note: copy('Le curve descrivono la sopravvivenza osservata in ogni strato; il modello Cox condivide le stime delle covariate tra gli strati.'),
        data: { curves, censored },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza'), series: copy('Strato') },
      })
    );
  }
  if (riskRows.length > 0) {
    charts.push(
      makeChart({
        id: 'stratcox-risk',
        kind: 'risk',
        title: copy('Tabella dei soggetti a rischio'),
        subtitle: copy('Soggetti a rischio per gruppo ai tempi selezionati'),
        note: copy('Numero a rischio; tra parentesi gli eventi cumulati.'),
        data: { rows: riskRows },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Strato') },
        options: { showEvents: true } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Cox stratificato'),
    tables,
    report: stratCoxReport(stats, ciLevel),
    charts,
  };
};
