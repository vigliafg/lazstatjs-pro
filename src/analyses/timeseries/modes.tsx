import { fitHoltWinters, holtWintersTables, holtWintersReport } from '../../stats/timeseries';
import { unitRootTests, unitRootTables, unitRootReport } from '../../stats/timeseries';
import { spectralAnalysis, spectralTables, spectralReport } from '../../stats/timeseries';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { TimeSeriesParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { AnalysisChart, ChartRow } from '../../stats/charts';

interface ModeInput {
  grid: Dataset;
  params: TimeSeriesParams;
  ciLevel: number;
}

export const buildHoltWintersOutput = ({ grid, params, ciLevel }: ModeInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);
  if (values.length < 4) {
    return { ok: false, reason: 'Holt–Winters needs at least four observations' };
  }
  if (params.seasonalModel === 'multiplicative' && values.some(value => value <= 0)) {
    return { ok: false, reason: 'Multiplicative Holt–Winters requires strictly positive values' };
  }
  if (params.seasonalModel && params.period >= 2 && values.length < 2 * params.period) {
    return { ok: false, reason: 'Holt–Winters needs at least two complete seasonal periods' };
  }
  const fit = fitHoltWinters({
    values,
    period: params.period,
    horizon: params.horizon,
    seasonal: params.seasonalModel,
    level: ciLevel,
  });
  if (!fit) return { ok: false, reason: 'Holt–Winters could not be estimated on this series' };

  const tables = holtWintersTables(fit, ciLevel);
  const start = values.length - fit.fitted.length;
  const series: ChartRow[] = [
    ...values.map((value, index) => ({ x: index + 1, y: value, series: copy('Osservato') })),
    ...fit.fitted.map((value, index) => ({ x: start + index + 1, y: value, series: copy('Adattato') })),
    ...fit.forecast.map(point => ({
      x: point.step,
      y: point.mean,
      lo: point.lo,
      hi: point.hi,
      series: copy('Previsione'),
    })),
  ];
  const chart = makeChart({
    id: 'hw-series',
    kind: 'line',
    title: copy('Serie, adattamento e previsione'),
    subtitle: copy('Holt–Winters · {s1} passi · IC {s2}%', { s1: fit.forecast.length, s2: ciLevel }),
    note: copy('La linea adattata segue il livello e la stagionalità stimati; la banda grigia è l’intervallo di previsione.'),
    data: { series },
    fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
    options: { showMarkers: false, showBand: true } as never,
  });
  return {
    ok: true,
    title: copy('Holt–Winters: {s1}', { s1: grid.cols[params.variable]?.name ?? 'Y' }),
    header: copy('{s1} osservazioni · periodo {s2} · orizzonte {s3}', {
      s1: values.length,
      s2: fit.period >= 2 ? fit.period : copy('nessuno'),
      s3: fit.forecast.length,
    }),
    tables,
    report: holtWintersReport(tables, fit, ciLevel),
    charts: [chart],
  };
};

export const buildUnitRootOutput = ({ grid, params, ciLevel }: ModeInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);
  if (values.length < 12) {
    return { ok: false, reason: 'Unit-root tests need at least twelve observations' };
  }
  const result = unitRootTests(values);
  if (!Number.isFinite(result.adf.stat) && !Number.isFinite(result.kpss.level.stat)) {
    return { ok: false, reason: 'The unit-root tests could not be computed on this series' };
  }
  const tables = unitRootTables(result, ciLevel);
  const chart = makeChart({
    id: 'unitroot-series',
    kind: 'line',
    title: copy('Serie analizzata'),
    subtitle: copy('{s1} osservazioni', { s1: values.length }),
    note: copy('Trend e cambi di livello cambiano la lettura dei test: controlla sempre il grafico prima di differenziare.'),
    data: { series: values.map((value, index) => ({ x: index + 1, y: value, series: copy('Osservato') })) },
    fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
    options: { showMarkers: false, showBand: false } as never,
  });
  return {
    ok: true,
    title: copy('Radici unitarie: {s1}', { s1: grid.cols[params.variable]?.name ?? 'Y' }),
    header: copy('{s1} osservazioni · ADF p = {s2} · KPSS p = {s3}', {
      s1: values.length,
      s2: Number.isFinite(result.adf.p) ? result.adf.p.toFixed(3) : '—',
      s3: Number.isFinite(result.kpss.level.p) ? result.kpss.level.p.toFixed(3) : '—',
    }),
    tables,
    report: unitRootReport(tables, result, ciLevel),
    charts: [chart],
  };
};

export const buildSpectralOutput = ({ grid, params }: ModeInput): AnalysisRunResult => {
  const values = numericColumnValues(grid, params.variable);
  if (values.length < 8) {
    return { ok: false, reason: 'Spectral analysis needs at least eight observations' };
  }
  const result = spectralAnalysis(values, 3);
  if (result.points.length === 0) {
    return { ok: false, reason: 'The periodogram could not be computed on this series' };
  }
  const tables = spectralTables(result);
  const series: ChartRow[] = [
    ...result.points.map(point => ({ x: point.frequency, y: point.power, series: copy('Periodogramma') })),
    ...result.smoothed.map(point => ({ x: point.frequency, y: point.power, series: copy('Densità smussata') })),
    ...(result.ar ? result.ar.points.map(point => ({ x: point.frequency, y: point.power, series: copy('Spettro AR') })) : []),
  ];
  const chart = makeChart({
    id: 'spectral-density',
    kind: 'line',
    title: copy('Densità spettrale'),
    subtitle: copy('periodogramma, versione Daniell e spettro AR'),
    note: copy('I picchi indicano le frequenze dominanti: un picco a 1/periodo corrisponde a un ciclo di quel periodo.'),
    data: { series },
    fields: { xLabel: copy('Frequenza'), yLabel: copy('Potenza'), series: copy('Stima') },
    options: { showMarkers: false, showBand: false } as never,
  });
  return {
    ok: true,
    title: copy('Analisi spettrale: {s1}', { s1: grid.cols[params.variable]?.name ?? 'Y' }),
    header: copy('{s1} osservazioni · picco al periodo {s2}', {
      s1: values.length,
      s2: Number.isFinite(result.fisher.period) ? result.fisher.period.toFixed(2) : '—',
    }),
    tables,
    report: spectralReport(tables, result),
    charts: [chart],
  };
};

export type { AnalysisChart };
