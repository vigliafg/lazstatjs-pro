import { fitVar, fitVecm, varReport, varTables } from '../../stats/var';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { VarParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { AnalysisChart, ChartRow } from '../../stats/charts';

export interface VarInput {
  grid: Dataset;
  params: VarParams;
  ciLevel: number;
}

export const buildVarOutput = ({ grid, params, ciLevel }: VarInput): AnalysisRunResult => {
  const selected = params.variables.filter(value => value >= 0 && value < grid.cols.length);
  if (selected.length < 2) {
    return { ok: false, reason: 'Select at least two series for VAR/VECM' };
  }
  if (selected.length > 4) {
    return { ok: false, reason: 'VAR/VECM supports at most four series' };
  }
  const columns = selected.map(index => numericColumnValues(grid, index));
  const rows: number[][] = [];
  const length = Math.min(...columns.map(column => column.length));
  for (let index = 0; index < length; index++) {
    const row = columns.map(column => column[index]);
    if (row.every(value => Number.isFinite(value))) rows.push(row);
  }
  if (rows.length < 20) {
    return { ok: false, reason: 'VAR/VECM needs at least twenty complete observations' };
  }
  const names = selected.map(index => grid.cols[index]?.name ?? `y${index + 1}`);

  if (params.mode === 'vecm') {
    const fit = fitVecm({ data: rows, names, lags: params.lags === 0 ? 'auto' : params.lags, horizon: params.horizon });
    if (!fit) return { ok: false, reason: 'The error-correction model could not be estimated' };
    const tables = varTables(fit, ciLevel);
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'vecm-alpha',
        kind: 'bar',
        title: copy('Velocità di aggiustamento'),
        subtitle: copy('α per equazione · valori negativi correggono lo scostamento'),
        note: copy('Barre più negative indicano una correzione più rapida verso la relazione di lungo periodo.'),
        data: {
          bars: fit.alpha.map(row => ({ category: row.equation, value: row.estimate })),
        },
        fields: { xLabel: copy('Equazione'), yLabel: copy('α') },
        options: { valueLabels: true } as never,
      }),
    ];
    return {
      ok: true,
      title: copy('VECM: {s1}', { s1: names.join(', ') }),
      header: copy('{s1} osservazioni · β = {s2}', {
        s1: rows.length,
        s2: fit.beta.map(row => `${row.estimate.toFixed(3)}·${row.term}`).join(' + '),
      }),
      tables,
      report: varReport(tables, fit, ciLevel),
      charts,
    };
  }

  const fit = fitVar({ data: rows, names, lags: params.lags === 0 ? 'auto' : params.lags, horizon: params.horizon });
  if (!fit) return { ok: false, reason: 'The VAR could not be estimated' };
  const tables = varTables(fit, ciLevel);
  const impulseRows: ChartRow[] = fit.irf.flatMap(impulse =>
    fit.names.flatMap((variable, variableIndex) =>
      fit.names.map((shock, shockIndex) => ({
        x: impulse.horizon,
        y: impulse.responses[variableIndex][shockIndex],
        series: `${shock} → ${variable}`,
      }))
    )
  );
  const lastHorizon = fit.irf[fit.irf.length - 1]?.horizon ?? 0;
  const fevdRows = fit.fevd
    .filter(row => row.horizon === lastHorizon)
    .map(row => ({ category: `${row.shock} → ${row.variable}`, value: row.share }));
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'var-irf-chart',
      kind: 'line',
      title: copy('Risposte impulsive'),
      subtitle: copy('orizzonte 0–{s1} · shock di una DS', { s1: lastHorizon }),
      note: copy('Ogni linea è la risposta di una variabile a uno shock; l’ortogonalizzazione dipende dall’ordine delle serie.'),
      data: { series: impulseRows },
      fields: { xLabel: copy('Orizzonte'), yLabel: copy('Risposta'), series: copy('Shock → risposta') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];
  if (fevdRows.length > 0) {
    charts.push(
      makeChart({
        id: 'var-fevd-chart',
        kind: 'bar',
        title: copy('Scomposizione della varianza'),
        subtitle: copy('quote all’orizzonte {s1}', { s1: lastHorizon }),
        note: copy('Per ogni variabile le quote dei diversi shock sommano a 1.'),
        data: { bars: fevdRows },
        fields: { xLabel: copy('Shock → variabile'), yLabel: copy('Quota') },
        options: { valueLabels: true, grouping: 'stacked' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('VAR({s1}): {s2}', { s1: fit.lags, s2: names.join(', ') }),
    header: copy('{s1} osservazioni · {s2} · AIC {s3}', {
      s1: rows.length,
      s2: fit.stable ? copy('sistema stabile') : copy('sistema instabile'),
      s3: fit.aic.toFixed(2),
    }),
    tables,
    report: varReport(tables, fit, ciLevel),
    charts,
  };
};
