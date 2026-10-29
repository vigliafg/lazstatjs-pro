import { timeSeriesReport, timeSeriesTables } from '../../stats/timeseries';
import { arimaAnalysis } from '../../stats/arima';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { TimeSeriesParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { AnalysisChart, ChartRow } from '../../stats/charts';
import { isFiniteNumber } from '../shared/numbers';

export interface TimeSeriesInput {
  grid: Dataset;
  params: TimeSeriesParams;
  ciLevel: number;
}

/** ARIMA/SARIMA, modelli semplici e grafici della serie temporale. */
export const buildTimeSeriesOutput = ({
  grid,
  params,
  ciLevel,
}: TimeSeriesInput): AnalysisRunResult => {
  const { variable, period, horizon, differenceMode, seasonalDifferenceMode } = params;

  const values = numericColumnValues(grid, variable);

  if (values.length < 5) {
    return {
      ok: false,
      reason: 'Select a numeric column with at least five observations in time order',
    };
  }
  if (!isFiniteNumber(period) || period < 0 || period === 1) {
    return { ok: false, reason: 'The seasonal period must be 0 (none) or at least 2' };
  }
  if (!isFiniteNumber(horizon) || horizon < 1) {
    return { ok: false, reason: 'The forecast horizon must be at least 1' };
  }

  const steps = Math.max(1, Math.min(horizon, 60));
  const arima = arimaAnalysis({
    values,
    period,
    horizon: steps,
    level: ciLevel,
    d: differenceMode === 'auto' ? 'auto' : Number(differenceMode),
    D: seasonalDifferenceMode === 'auto' ? 'auto' : Number(seasonalDifferenceMode),
  });

  const baseTables = timeSeriesTables({ values, period, horizon: steps, level: ciLevel });
  if (baseTables.length === 0) {
    return { ok: false, reason: 'The series is too short for this analysis' };
  }

  // The ARIMA point forecasts supersede the simple-model forecast table.
  const tables = arima.fit
    ? [...baseTables.filter(spec => spec.id !== 'ts-forecast'), ...arima.tables]
    : baseTables;

  const acfRows = (baseTables.find(spec => spec.id === 'ts-acf')?.rows ?? []).filter(
    row => Number(row.lag) >= 1
  );
  const band = Number(acfRows[0]?.hi ?? 0);

  const simpleForecastRows = baseTables.find(spec => spec.id === 'ts-forecast')?.rows ?? [];
  const seriesData = values.map((value, index) => ({ x: index + 1, y: value }));

  const arimaForecastRows = tables.find(spec => spec.id === 'ts-arima-forecast')?.rows ?? [];
  const arimaModelLabel = String(
    tables
      .find(spec => spec.id === 'ts-arima-model')
      ?.rows.find(row => String(row.metric) === 'Modello')?.value ?? ''
  );

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'ts-acf-chart',
      kind: 'acf',
      title: copy('Autocorrelazione'),
      subtitle: copy('Banda ±{s1}', { s1: band.toFixed(3) }),
      note: copy('Le barre oltre le linee tratteggiate indicano autocorrelazione non attribuibile al caso.'),
      data: {
        bars: acfRows.map(row => ({ lag: Number(row.lag), value: Number(row.acf) })),
        band: [{ value: band }, { value: -band }],
      },
      fields: { xLabel: copy('Lag'), yLabel: copy('Autocorrelazione') },
    }),
  ];

  if (arimaForecastRows.length > 0) {
    const arimaRows: ChartRow[] = [
      ...seriesData.map(point => ({ x: point.x, y: point.y, series: copy('Osservato') })),
      ...arimaForecastRows.map(row => ({
        x: values.length + Number(row.step),
        y: Number(row.forecast),
        lo: Number(row.lo),
        hi: Number(row.hi),
        series: copy('Previsione'),
      })),
    ];
    charts.push(
      makeChart({
        id: 'ts-arima-chart',
        kind: 'line',
        title: copy('Previsioni ARIMA / SARIMA'),
        subtitle: `${arimaModelLabel} · ${arimaForecastRows.length} ${copy('passi')} · IC ${ciLevel}%`,
        note: copy('Blu: valori osservati. Giallo tratteggiato: previsione ARIMA. Grigio: intervallo di previsione.'),
        data: {
          series: arimaRows,
          markers: [
            ...seriesData.map(point => ({ x: point.x, y: point.y, series: copy('Osservato') })),
            ...arimaForecastRows.map(row => ({ x: values.length + Number(row.step), y: Number(row.forecast), series: copy('Previsione') })),
          ],
        },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
        options: { showMarkers: true, showBand: true } as never,
      })
    );
  }

  if (simpleForecastRows.length > 0) {
    const simpleRows: ChartRow[] = [
      ...seriesData.map(point => ({ x: point.x, y: point.y, series: copy('Osservato') })),
      ...simpleForecastRows.map(row => ({ x: values.length + Number(row.step), y: Number(row.forecast), series: copy('Previsione') })),
    ];
    charts.push(
      makeChart({
        id: 'ts-simple-chart',
        kind: 'line',
        title: copy('Serie e previsioni (modello semplice)'),
        subtitle: copy('{s1} passi previsti', { s1: simpleForecastRows.length }),
        note: copy('Blu: valori osservati. Giallo: previsioni del modello semplice con l’RMSE più basso.'),
        data: {
          series: simpleRows,
          markers: seriesData.map(point => ({ x: point.x, y: point.y, series: copy('Osservato') })),
        },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
        options: { showMarkers: true, showBand: false } as never,
      })
    );
  }

  const header = `Series: ${grid.cols[variable]?.name ?? 'Y'} · ${values.length} observations · period ${period >= 2 ? period : 'none'}`;

  return {
    ok: true,
    title: copy('Serie temporale: {s1}', { s1: grid.cols[variable]?.name ?? 'Y' }),
    tables,
    report: timeSeriesReport(tables, ciLevel),
    charts,
    header,
  };
};
