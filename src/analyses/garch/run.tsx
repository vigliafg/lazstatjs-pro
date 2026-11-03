import { fitGarch, garchReport, garchTables } from '../../stats/garch';
import { acfTable } from '../../stats/timeseries';
import { copy } from '../../stats/reportCopy';
import { makeChart, qqBand, qqPoints, qqReference } from '../../charts/kits/common';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { GarchParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface GarchInput {
  grid: Dataset;
  params: GarchParams;
  ciLevel: number;
}

export const buildGarchOutput = ({ grid, params, ciLevel }: GarchInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);
  if (values.length < 30) {
    return { ok: false, reason: 'GARCH needs at least thirty observations' };
  }
  const fit = fitGarch({ values, horizon: params.horizon, level: ciLevel });
  if (!fit) return { ok: false, reason: 'The GARCH model could not be estimated: check that the series has variability' };
  const name = grid.cols[params.variable]?.name ?? 'Y';
  const tables = garchTables(fit);

  const volatilityRows = values.map((value, index) => ({
    x: index + 1,
    y: Math.sqrt(fit.sigma2[index]),
    series: copy('DS condizionale'),
  }));
  const seriesRows = values.map((value, index) => ({ x: index + 1, y: value, series: copy('Serie') }));
  const lags = Math.max(1, Math.min(20, Math.floor(fit.standardized.length / 4)));
  const residualAcf = acfTable(fit.standardized, lags)
    .filter(point => point.lag >= 1 && Number.isFinite(point.acf))
    .map(point => ({ lag: point.lag, value: point.acf }));
  const band = 1.96 / Math.sqrt(fit.standardized.length);
  const qq = qqPoints(fit.standardized);
  const qqLine = qqReference(qq);
  const jarqueBera = Number.isFinite(fit.jarqueBera.stat) ? fit.jarqueBera.stat.toFixed(2) : '—';
  const jarqueBeraP = Number.isFinite(fit.jarqueBera.p) ? fit.jarqueBera.p.toFixed(3) : '—';

  return {
    ok: true,
    title: copy('GARCH(1,1): {s1}', { s1: name }),
    header: copy('{s1} osservazioni · persistenza {s2} · emivita {s3}', {
      s1: fit.n,
      s2: fit.persistence.toFixed(3),
      s3: fit.halfLife.toFixed(1),
    }),
    tables,
    report: garchReport(tables, fit, ciLevel),
    charts: [
      makeChart({
        id: 'garch-volatility',
        kind: 'line',
        title: copy('Serie e volatilità condizionale'),
        subtitle: copy('DS condizionale stimata dal GARCH(1,1)'),
        note: copy('La linea della volatilità mostra i periodi in cui le oscillazioni sono più ampie.'),
        data: { series: [...seriesRows, ...volatilityRows] },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
        options: { showMarkers: false, showBand: false } as never,
      }),
      makeChart({
        id: 'garch-residual-acf',
        kind: 'acf',
        title: copy('Autocorrelazione dei residui standardizzati'),
        subtitle: copy('{s1} residui · banda ±{s2}', {
          s1: fit.standardized.length,
          s2: band.toFixed(3),
        }),
        note: copy('Se il GARCH ha catturato la volatilità, i residui standardizzati non mostrano autocorrelazione residua.'),
        data: {
          bars: residualAcf,
          band: [{ value: band }, { value: -band }],
        },
        fields: { xLabel: copy('Lag'), yLabel: copy('Autocorrelazione') },
      }),
      ...(qq.length > 0
        ? [
            makeChart({
              id: 'garch-qq',
              kind: 'qq' as const,
              title: copy('Q-Q dei residui standardizzati'),
              subtitle: copy('N = {s1} · Jarque–Bera = {s2} (p = {s3})', {
                s1: fit.standardized.length,
                s2: jarqueBera,
                s3: jarqueBeraP,
              }),
              note: copy('I punti vicini alla diagonale indicano residui standardizzati compatibili con la normale; code pesanti o asimmetria segnalano che il GARCH gaussiano non descrive bene le innovazioni.'),
              data: { points: qq, reference: qqLine, band: qqBand(qq, qqLine, ciLevel) },
              fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui standardizzati') },
              options: { showCI: true } as never,
            }),
          ]
        : []),
    ],
  };
};
