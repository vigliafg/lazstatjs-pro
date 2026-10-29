import { timeSeriesReport, timeSeriesTables } from '../../stats/timeseries';
import { arimaAnalysis } from '../../stats/arima';
import { AnalysisOutput } from '../../components/AnalysisOutput';
import { t } from '../../i18n';
import { numericColumnValues } from '../shared/data';
import type { Dataset } from '../../grid/types';
import type { TimeSeriesParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { AnalysisChart } from '../../stats/charts';
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
  const simpleForecastData = [
    { x: values.length, y: values[values.length - 1] },
    ...simpleForecastRows.map(row => ({ x: Number(row.step), y: Number(row.forecast) })),
  ];

  const arimaForecastRows = tables.find(spec => spec.id === 'ts-arima-forecast')?.rows ?? [];
  const arimaModelLabel = String(
    tables
      .find(spec => spec.id === 'ts-arima-model')
      ?.rows.find(row => String(row.metric) === 'Modello')?.value ?? ''
  );
  const arimaForecastData = [
    { x: values.length, y: values[values.length - 1] },
    ...arimaForecastRows.map(row => ({ x: Number(row.step), y: Number(row.forecast) })),
  ];
  const arimaUpper = arimaForecastRows.map(row => ({ x: Number(row.step), y: Number(row.hi) }));
  const arimaLower = arimaForecastRows.map(row => ({ x: Number(row.step), y: Number(row.lo) }));

  const charts: AnalysisChart[] = [
    {
      kind: 'bar',
      id: 'ts-acf-chart',
      title: 'Autocorrelazione',
      subtitle: `banda ±${band.toFixed(3)}`,
      xLabel: t('chart.lag'),
      bars: acfRows.map(row => ({ x: Number(row.lag), y: Number(row.acf), label: String(row.lag) })),
      bands: [
        { y: band, color: '#f87171' },
        { y: -band, color: '#f87171' },
      ],
      note: 'Le barre oltre le linee tratteggiate indicano autocorrelazione non attribuibile al caso.',
    },
  ];

  if (arimaForecastRows.length > 0) {
    charts.push({
      kind: 'line',
      id: 'ts-arima-chart',
      title: 'Previsioni ARIMA / SARIMA',
      subtitle: `${arimaModelLabel} · ${arimaForecastRows.length} passi · IC ${ciLevel}%`,
      xLabel: 't',
      series: [
        { label: 'observed', color: '#4f9cf9', points: seriesData },
        { label: 'upper', color: '#94a3b8', points: arimaUpper, dash: '3,3' },
        { label: 'lower', color: '#94a3b8', points: arimaLower, dash: '3,3' },
        { label: 'forecast', color: '#fbbf24', points: arimaForecastData, dash: '5,4' },
      ],
      markers: [
        { label: 'observed-points', color: '#4f9cf9', points: seriesData, size: 2 },
        { label: 'forecast-points', color: '#fbbf24', points: arimaForecastData.slice(1), size: 2.5 },
      ],
      note: `Blu: valori osservati. Giallo tratteggiato: previsione ARIMA. Grigio tratteggiato: limiti dell’intervallo di previsione al ${ciLevel}%.`,
    });
  }

  if (simpleForecastRows.length > 0) {
    charts.push({
      kind: 'line',
      id: 'ts-simple-chart',
      title: 'Serie e previsioni (modello semplice)',
      subtitle: `${simpleForecastRows.length} passi previsti`,
      xLabel: 't',
      series: [
        { label: 'observed', color: '#4f9cf9', points: seriesData },
        { label: 'simple-forecast', color: '#fbbf24', points: simpleForecastData, dash: '5,4' },
      ],
      markers: [
        { label: 'observed-points', color: '#4f9cf9', points: seriesData, size: 2 },
        { label: 'simple-points', color: '#fbbf24', points: simpleForecastData.slice(1), size: 2.5 },
      ],
      note: 'Blu: valori osservati. Giallo tratteggiato: previsioni del modello semplice con l’RMSE più basso.',
    });
  }

  const header = `Series: ${grid.cols[variable]?.name ?? 'Y'} · ${values.length} observations · period ${period >= 2 ? period : 'none'}`;

  return {
    ok: true,
    tables,
    report: timeSeriesReport(tables, ciLevel),
    charts,
    header,
    node: <AnalysisOutput tables={tables} charts={charts} header={header} />,
  };
};
