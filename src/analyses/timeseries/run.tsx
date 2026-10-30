import { timeSeriesReport, timeSeriesTables, acfTable } from '../../stats/timeseries';
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

  const pacfRows = (baseTables.find(spec => spec.id === 'ts-acf')?.rows ?? [])
    .filter(row => Number(row.lag) >= 1)
    .map(row => ({ lag: Number(row.lag), value: Number(row.pacf) }))
    .filter(row => Number.isFinite(row.value));
  if (pacfRows.length > 0) {
    charts.push(
      makeChart({
        id: 'ts-pacf-chart',
        kind: 'acf',
        title: copy('Autocorrelazione parziale'),
        subtitle: copy('Banda ±{s1}', { s1: band.toFixed(3) }),
        note: copy('La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).'),
        data: {
          bars: pacfRows,
          band: [{ value: band }, { value: -band }],
        },
        fields: { xLabel: copy('Lag'), yLabel: copy('Autocorrelazione parziale') },
      })
    );
  }

  const decompositionRows = baseTables.find(spec => spec.id === 'ts-decomposition')?.rows ?? [];
  if (decompositionRows.length > 0) {
    const trendRows: ChartRow[] = [
      ...decompositionRows.map(row => ({ x: Number(row.t), y: Number(row.value), series: copy('Osservato') })),
      ...decompositionRows
        .map(row => ({ x: Number(row.t), y: Number(row.trend), series: copy('Trend') }))
        .filter(row => Number.isFinite(row.y)),
    ];
    charts.push(
      makeChart({
        id: 'ts-decomposition-trend',
        kind: 'line',
        title: copy('Scomposizione: serie e trend'),
        subtitle: copy('Media mobile centrata di periodo {s1}', { s1: period }),
        note: copy('Il trend è la media mobile centrata: le prime e le ultime osservazioni non hanno un valore stimato.'),
        data: { series: trendRows },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Serie') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
    const componentRows: ChartRow[] = decompositionRows.flatMap(row => {
      const t = Number(row.t);
      const rows: ChartRow[] = [];
      if (Number.isFinite(Number(row.seasonal))) {
        rows.push({ x: t, y: Number(row.seasonal), series: copy('Stagionalità') });
      }
      if (Number.isFinite(Number(row.remainder))) {
        rows.push({ x: t, y: Number(row.remainder), series: copy('Residuo') });
      }
      return rows;
    });
    if (componentRows.length > 0) {
      charts.push(
        makeChart({
          id: 'ts-decomposition-components',
          kind: 'line',
          title: copy('Scomposizione: stagionalità e residuo'),
          subtitle: copy('Componenti additivi della serie'),
          note: copy('La stagionalità è il profilo che si ripete ogni periodo; il residuo è ciò che resta dopo trend e stagionalità.'),
          data: { series: componentRows },
          fields: { xLabel: 't', yLabel: copy('Componente'), series: copy('Serie') },
          options: { showMarkers: false, showBand: false } as never,
        })
      );
    }
  }

  if (arima.fit && arima.fit.residuals.length > 4) {
    const residualValues = arima.fit.residuals;
    const maxLag = Math.max(1, Math.min(20, Math.floor(residualValues.length / 2)));
    const residualBand = 1.96 / Math.sqrt(residualValues.length);
    const residualRows = acfTable(residualValues, maxLag)
      .filter(point => point.lag >= 1 && Number.isFinite(point.acf))
      .map(point => ({ lag: point.lag, value: point.acf }));
    if (residualRows.length > 0) {
      charts.push(
        makeChart({
          id: 'ts-residual-acf',
          kind: 'acf',
          title: copy('Autocorrelazione dei residui ARIMA'),
          subtitle: copy('{s1} residui · banda ±{s2}', { s1: residualValues.length, s2: residualBand.toFixed(3) }),
          note: copy('Se i residui sono rumore bianco le barre restano dentro la banda: autocorrelazione residua suggerisce un ordine del modello troppo basso.'),
          data: {
            bars: residualRows,
            band: [{ value: residualBand }, { value: -residualBand }],
          },
          fields: { xLabel: copy('Lag'), yLabel: copy('Autocorrelazione') },
        })
      );
    }
  }

  const modelRows = tables.find(spec => spec.id === 'ts-models')?.rows ?? [];
  const accuracyBars = modelRows.flatMap(row => {
    const model = String(row.model ?? '');
    const bars: ChartRow[] = [];
    if (Number.isFinite(Number(row.rmse))) {
      bars.push({ category: model, value: Number(row.rmse), series: 'RMSE' });
    }
    if (Number.isFinite(Number(row.mae))) {
      bars.push({ category: model, value: Number(row.mae), series: 'MAE' });
    }
    return bars;
  });
  if (accuracyBars.length > 0) {
    charts.push(
      makeChart({
        id: 'ts-model-accuracy',
        kind: 'bar',
        title: copy('Accuratezza dei modelli di previsione'),
        subtitle: copy('Errore su un campione di validazione (ultimo 20% della serie)'),
        note: copy('RMSE e MAE sono nella stessa unità della serie: barre più basse indicano previsioni migliori.'),
        data: { bars: accuracyBars },
        fields: { xLabel: copy('Modello'), yLabel: copy('Errore'), series: copy('Metrica') },
        options: { valueLabels: true, grouping: 'grouped' } as never,
      })
    );
  }

  const n = values.length;
  const spectrum = Array.from({ length: Math.max(1, Math.floor(n / 2)) }, (_, index) => {
    const frequency = (index + 1) / n;
    let real = 0;
    let imaginary = 0;
    values.forEach((value, time) => {
      const angle = 2 * Math.PI * frequency * time;
      real += value * Math.cos(angle);
      imaginary -= value * Math.sin(angle);
    });
    return { x: frequency, y: (2 / n) * (real * real + imaginary * imaginary) };
  }).filter(point => Number.isFinite(point.y));
  if (spectrum.length > 1) {
    charts.push(
      makeChart({
        id: 'ts-spectrum',
        kind: 'line',
        title: copy('Densità spettrale (periodogramma)'),
        subtitle: copy('Frequenze da 1/N a 1/2'),
        note: copy('I picchi indicano le frequenze dominanti: un picco alla frequenza 1/periodo segnala la stagionalità.'),
        data: { series: spectrum.map(point => ({ ...point, series: copy('Periodogramma') })) },
        fields: { xLabel: copy('Frequenza'), yLabel: copy('Potenza'), series: copy('Serie') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }

  const rollingWindow = period >= 2 ? period : Math.max(3, Math.floor(n / 5));
  if (rollingWindow >= 2 && n > rollingWindow) {
    const rollingMean: ChartRow[] = [];
    const rollingSd: ChartRow[] = [];
    for (let index = rollingWindow - 1; index < n; index++) {
      const windowValues = values.slice(index - rollingWindow + 1, index + 1);
      const mean = windowValues.reduce((sum, value) => sum + value, 0) / windowValues.length;
      const variance =
        windowValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        Math.max(1, windowValues.length - 1);
      rollingMean.push({ x: index + 1, y: mean, series: copy('Media mobile') });
      rollingSd.push({ x: index + 1, y: Math.sqrt(variance), series: copy('DS mobile') });
    }
    charts.push(
      makeChart({
        id: 'ts-rolling',
        kind: 'line',
        title: copy('Statistiche mobili'),
        subtitle: copy('Finestra di {s1} osservazioni', { s1: rollingWindow }),
        note: copy('La media mobile evidenzia il trend; la DS mobile mostra se la variabilità cambia nel tempo.'),
        data: { series: [...rollingMean, ...rollingSd] },
        fields: { xLabel: 't', yLabel: copy('Valore'), series: copy('Statistica') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }

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
