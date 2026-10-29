import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
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
    title: copy('Sintesi della serie'),
    subtitle: copy('N = {s1}{s2}', { s1: n, s2: period >= 2 ? copy(' · periodo stagionale = {s1}', { s1: period }) : '' }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Osservazioni'), value: String(n) },
      { metric: copy('Media'), value: fmtEst(mean(values), 4) },
      { metric: copy('Deviazione standard'), value: fmtEst(sd, 4) },
      { metric: copy('Minimo'), value: fmtEst(Math.min(...values), 4) },
      { metric: copy('Massimo'), value: fmtEst(Math.max(...values), 4) },
      { metric: copy('Primo valore'), value: fmtEst(values[0], 4) },
      { metric: copy('Ultimo valore'), value: fmtEst(values[n - 1], 4) },
      { metric: copy('Variazione totale'), value: fmtEst(values[n - 1] - values[0], 4) },
      { metric: copy('Pendenza di Sen'), value: fmtEst(slope, 4) },
      ...(decomposition
        ? [{ metric: copy('Forza della stagionalità'), value: fmtEst(decomposition.strength, 3) }]
        : []),
    ],
    notes: [copy('La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.')],
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
    title: copy('Autocorrelazione e autocorrelazione parziale'),
    subtitle: copy('banda di confidenza ±1,96/√N = ±{s1}', { s1: fmtEst(1.96 / Math.sqrt(n), 3) }),
    columns: [
      { key: 'lag', label: copy('Lag'), format: 'int' },
      { key: 'acf', label: copy('ACF'), format: 'dec3' },
      { key: 'pacf', label: copy('PACF'), format: 'dec3' },
      { key: 'lo', label: copy('Limite basso'), format: 'dec3' },
      { key: 'hi', label: copy('Limite alto'), format: 'dec3' },
    ],
    rows: acfRows,
    notes: [
      copy('Barre oltre la banda indicano autocorrelazione non spiegata dal caso.'),
      copy('La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).'),
    ],
  });

  const mkDecision = isDecided(trend.p, level) ? (trend.s > 0 ? copy('trend crescente') : copy('trend decrescente')) : copy('nessun trend monotono');
  tables.push({
    id: 'ts-tests',
    title: copy('Test di casualità e trend'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'statistic', label: copy('Statistica'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'decision', label: copy('Lettura'), format: 'text' },
    ],
    rows: [
      {
        test: copy('Mann–Kendall (trend)'),
        statistic: trend.z,
        p: trend.p,
        decision: Number.isFinite(trend.p) ? mkDecision : copy('non calcolabile'),
      },
      {
        test: copy('Wald–Wolfowitz (runs)'),
        statistic: runs.z,
        p: runs.p,
        decision: Number.isFinite(runs.p) ? (isDecided(runs.p, level) ? copy('serie non casuale') : copy('compatibile con il caso')) : copy('non calcolabile'),
      },
      {
        test: copy('Ljung–Box (lag 1–{s1})', { s1: maxLag }),
        statistic: ljung.q,
        p: ljung.p,
        decision: Number.isFinite(ljung.p) ? (isDecided(ljung.p, level) ? copy('autocorrelazione presente') : copy('nessuna autocorrelazione rilevante')) : copy('non calcolabile'),
      },
    ],
    notes: [
      copy('Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.'),
      copy('Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.'),
      copy('Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.'),
    ],
  });

  if (decomposition) {
    tables.push({
      id: 'ts-seasonal',
      title: copy('Indici stagionali'),
      subtitle: copy('modello additivo · periodo {s1}', { s1: period }),
      columns: [
        { key: 'position', label: copy('Posizione nel ciclo'), format: 'int' },
        { key: 'index', label: copy('Indice'), format: 'dec3' },
      ],
      rows: decomposition.indices.map((value, index) => ({ position: index + 1, index: value })),
      notes: [
        copy('Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.'),
        copy('Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).', { s1: fmtEst(decomposition.strength, 3) }),
      ],
    });

    tables.push({
      id: 'ts-decomposition',
      title: copy('Scomposizione'),
      subtitle: copy('serie = trend + stagionalità + residuo'),
      columns: [
        { key: 't', label: copy('t'), format: 'int' },
        { key: 'value', label: copy('Serie'), format: 'dec3' },
        { key: 'trend', label: copy('Trend'), format: 'dec3' },
        { key: 'seasonal', label: copy('Stagionalità'), format: 'dec3' },
        { key: 'remainder', label: copy('Residuo'), format: 'dec3' },
      ],
      rows: values.map((value, index) => ({
        t: index + 1,
        value,
        trend: decomposition.trend[index],
        seasonal: decomposition.seasonal[index],
        remainder: decomposition.remainder[index],
      })),
      notes: [copy('Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.')],
    });
  }

  const models = forecastModels(values, period, Math.max(1, Math.min(horizon, 60)));
  if (models.length > 0) {
    tables.push({
      id: 'ts-models',
      title: copy('Confronto dei modelli di previsione'),
      subtitle: copy('errore su un campione di validazione (ultimo 20% della serie)'),
      columns: [
        { key: 'model', label: copy('Modello'), format: 'text' },
        { key: 'rmse', label: copy('RMSE'), format: 'dec3' },
        { key: 'mae', label: copy('MAE'), format: 'dec3' },
        { key: 'mape', label: copy('MAPE %'), format: 'dec2' },
        { key: 'note', label: copy('Dettaglio'), format: 'text' },
      ],
      rows: models.map(model => ({
        model: model.name,
        rmse: model.rmse,
        mae: model.mae,
        mape: model.mape,
        note: model.note,
      })),
      notes: [
        copy('RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.'),
        copy('Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.'),
      ],
    });

    tables.push({
      id: 'ts-forecast',
      title: copy('Previsioni ({s1})', { s1: models[0].name }),
      subtitle: copy('orizzonte {s1} passi', { s1: models[0].forecast.length }),
      columns: [
        { key: 'step', label: copy('Passo'), format: 'int' },
        { key: 'forecast', label: copy('Previsione'), format: 'dec3' },
      ],
      rows: models[0].forecast.map((value, index) => ({ step: n + index + 1, forecast: value })),
      notes: [
        copy('Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.'),
        copy('Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.'),
      ],
    });
  }

  return tables;
};

export const modelQuality = (rmse: number, sd: number): string => {
  if (!Number.isFinite(rmse) || !Number.isFinite(sd) || sd <= 0) return copy('non calcolabile');
  const ratio = rmse / sd;
  if (ratio < 0.3) return copy('molto buona');
  if (ratio < 0.6) return 'discreta';
  if (ratio < 1) return 'modesta';
  return copy('scarsa (peggio della media)');
};
