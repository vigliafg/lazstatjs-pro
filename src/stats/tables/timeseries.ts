import { fmtEst, fmtP } from '../format';
import { describeP, isDecided } from '../reportKit';
import type { TableSpec } from '../types';
import type { TimeSeriesOptions } from '../timeseries/types';
import {
  acfTable, autocorrelation, centeredMovingAverage, decomposeSeasonal, mean, variance,
  forecastModels, ljungBox, mannKendall, partialAutocorrelation, runsTest, senSlope,
} from '../kernels/timeseries';

// ---------------------------------------------------------------------------
// Tables and report
// ---------------------------------------------------------------------------

export const timeSeriesTables = (options: TimeSeriesOptions): TableSpec[] => {
  const { values, period, horizon } = options;
  const level = options.level ?? 95;
  const n = values.length;
  if (n < 5) return [];
  if (values.some(value => !Number.isFinite(value))) return [];

  const tables: TableSpec[] = [];
  const maxLag = Math.min(12, Math.max(1, Math.floor(n / 4)));
  const acf = acfTable(values, maxLag);
  const trend = mannKendall(values);
  const runs = runsTest(values);
  const ljung = ljungBox(values, maxLag);
  const slope = senSlope(values);
  const sd = Math.sqrt(variance(values));
  const decomposition = period >= 2 ? decomposeSeasonal(values, period) : null;

  tables.push({
    id: 'ts-summary',
    title: 'Sintesi della serie',
    subtitle: `N = ${n}${period >= 2 ? ` · periodo stagionale = ${period}` : ''}`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: [
      { metric: 'Osservazioni', value: String(n) },
      { metric: 'Media', value: fmtEst(mean(values), 4) },
      { metric: 'Deviazione standard', value: fmtEst(sd, 4) },
      { metric: 'Minimo', value: fmtEst(Math.min(...values), 4) },
      { metric: 'Massimo', value: fmtEst(Math.max(...values), 4) },
      { metric: 'Primo valore', value: fmtEst(values[0], 4) },
      { metric: 'Ultimo valore', value: fmtEst(values[n - 1], 4) },
      { metric: 'Variazione totale', value: fmtEst(values[n - 1] - values[0], 4) },
      { metric: 'Pendenza di Sen', value: fmtEst(slope, 4) },
      ...(decomposition
        ? [{ metric: 'Forza della stagionalità', value: fmtEst(decomposition.strength, 3) }]
        : []),
    ],
    notes: ['La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.'],
  });

  const acfRows = acf.map(point => ({
    lag: point.lag,
    acf: point.acf,
    pacf: point.pacf,
    lo: -1.96 / Math.sqrt(n),
    hi: 1.96 / Math.sqrt(n),
  }));

  tables.push({
    id: 'ts-acf',
    title: 'Autocorrelazione e autocorrelazione parziale',
    subtitle: `banda di confidenza ±1,96/√N = ±${fmtEst(1.96 / Math.sqrt(n), 3)}`,
    columns: [
      { key: 'lag', label: 'Lag', format: 'int' },
      { key: 'acf', label: 'ACF', format: 'dec3' },
      { key: 'pacf', label: 'PACF', format: 'dec3' },
      { key: 'lo', label: 'Limite basso', format: 'dec3' },
      { key: 'hi', label: 'Limite alto', format: 'dec3' },
    ],
    rows: acfRows,
    notes: [
      'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.',
      'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).',
    ],
  });

  const mkDecision = isDecided(trend.p, level) ? (trend.s > 0 ? 'trend crescente' : 'trend decrescente') : 'nessun trend monotono';
  tables.push({
    id: 'ts-tests',
    title: 'Test di casualità e trend',
    columns: [
      { key: 'test', label: 'Test', format: 'text' },
      { key: 'statistic', label: 'Statistica', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'decision', label: 'Lettura', format: 'text' },
    ],
    rows: [
      {
        test: 'Mann–Kendall (trend)',
        statistic: trend.z,
        p: trend.p,
        decision: Number.isFinite(trend.p) ? mkDecision : 'non calcolabile',
      },
      {
        test: 'Wald–Wolfowitz (runs)',
        statistic: runs.z,
        p: runs.p,
        decision: Number.isFinite(runs.p) ? (isDecided(runs.p, level) ? 'serie non casuale' : 'compatibile con il caso') : 'non calcolabile',
      },
      {
        test: `Ljung–Box (lag 1–${maxLag})`,
        statistic: ljung.q,
        p: ljung.p,
        decision: Number.isFinite(ljung.p) ? (isDecided(ljung.p, level) ? 'autocorrelazione presente' : 'nessuna autocorrelazione rilevante') : 'non calcolabile',
      },
    ],
    notes: [
      'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.',
      'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.',
      'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.',
    ],
  });

  if (decomposition) {
    tables.push({
      id: 'ts-seasonal',
      title: 'Indici stagionali',
      subtitle: `modello additivo · periodo ${period}`,
      columns: [
        { key: 'position', label: 'Posizione nel ciclo', format: 'int' },
        { key: 'index', label: 'Indice', format: 'dec3' },
      ],
      rows: decomposition.indices.map((value, index) => ({ position: index + 1, index: value })),
      notes: [
        'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.',
        `Forza della stagionalità = ${fmtEst(decomposition.strength, 3)} (0 = nessuna, 1 = stagionalità dominante).`,
      ],
    });

    tables.push({
      id: 'ts-decomposition',
      title: 'Scomposizione',
      subtitle: 'serie = trend + stagionalità + residuo',
      columns: [
        { key: 't', label: 't', format: 'int' },
        { key: 'value', label: 'Serie', format: 'dec3' },
        { key: 'trend', label: 'Trend', format: 'dec3' },
        { key: 'seasonal', label: 'Stagionalità', format: 'dec3' },
        { key: 'remainder', label: 'Residuo', format: 'dec3' },
      ],
      rows: values.map((value, index) => ({
        t: index + 1,
        value,
        trend: decomposition.trend[index],
        seasonal: decomposition.seasonal[index],
        remainder: decomposition.remainder[index],
      })),
      notes: ['Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.'],
    });
  }

  const models = forecastModels(values, period, Math.max(1, Math.min(horizon, 60)));
  if (models.length > 0) {
    tables.push({
      id: 'ts-models',
      title: 'Confronto dei modelli di previsione',
      subtitle: 'errore su un campione di validazione (ultimo 20% della serie)',
      columns: [
        { key: 'model', label: 'Modello', format: 'text' },
        { key: 'rmse', label: 'RMSE', format: 'dec3' },
        { key: 'mae', label: 'MAE', format: 'dec3' },
        { key: 'mape', label: 'MAPE %', format: 'dec2' },
        { key: 'note', label: 'Dettaglio', format: 'text' },
      ],
      rows: models.map(model => ({
        model: model.name,
        rmse: model.rmse,
        mae: model.mae,
        mape: model.mape,
        note: model.note,
      })),
      notes: [
        'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.',
        'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.',
      ],
    });

    tables.push({
      id: 'ts-forecast',
      title: `Previsioni (${models[0].name})`,
      subtitle: `orizzonte ${models[0].forecast.length} passi`,
      columns: [
        { key: 'step', label: 'Passo', format: 'int' },
        { key: 'forecast', label: 'Previsione', format: 'dec3' },
      ],
      rows: models[0].forecast.map((value, index) => ({ step: n + index + 1, forecast: value })),
      notes: [
        'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.',
        'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.',
      ],
    });
  }

  return tables;
};

export const modelQuality = (rmse: number, sd: number): string => {
  if (!Number.isFinite(rmse) || !Number.isFinite(sd) || sd <= 0) return 'non calcolabile';
  const ratio = rmse / sd;
  if (ratio < 0.3) return 'molto buona';
  if (ratio < 0.6) return 'discreta';
  if (ratio < 1) return 'modesta';
  return 'scarsa (peggio della media)';
};
