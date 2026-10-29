import { stratifiedCoxStats } from '../../stats/kernels/stratcox';
import { stratCoxTables } from '../../stats/tables/stratcox';
import { stratCoxReport } from '../../stats/reports/stratcox';
import type { Dataset } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';

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
  return {
    ok: true,
    title: copy('Cox stratificato'),
    tables,
    report: stratCoxReport(stats, ciLevel),
    charts: [forest],
  };
};
