import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { LocalStateSpaceFit, MarkovStateSpaceFit, StateSpaceFit } from '../kernels/statespace';

export const stateSpaceTables = (fit: StateSpaceFit): TableSpec[] =>
  fit.mode === 'local' ? localTables(fit) : markovTables(fit);

const localTables = (fit: LocalStateSpaceFit): TableSpec[] => [
  {
    id: 'ss-model',
    title: copy('Modello state-space locale'),
    subtitle: copy('{s1} osservazioni · {s2}', {
      s1: fit.n,
      s2: fit.trend ? copy('livello + trend stocastico') : copy('solo livello'),
    }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Varianza di osservazione'), value: fmtEst(fit.observationVariance, 5) },
      { metric: copy('Varianza del livello'), value: fmtEst(fit.levelVariance, 5) },
      { metric: copy('Varianza del trend'), value: fmtEst(fit.trendVariance, 5) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
      { metric: 'AIC', value: fmtEst(fit.aic, 3) },
      { metric: 'BIC', value: fmtEst(fit.bic, 3) },
      { metric: copy('Convergenza'), value: fit.converged ? copy('raggiunta') : copy('non raggiunta') },
    ],
    notes: [
      copy('La varianza di osservazione misura il rumore attorno allo stato latente; le varianze di livello e trend governano quanto rapidamente il livello e la pendenza cambiano.'),
      copy('Il filtro di Kalman aggiorna lo stato osservazione per osservazione; lo smoother usa anche il futuro per stimare il livello storico.'),
    ],
  },
  {
    id: 'ss-states',
    title: copy('Stati filtrati e smussati'),
    columns: [
      { key: 't', label: 't', format: 'int' },
      { key: 'observed', label: copy('Osservato'), format: 'dec4' },
      { key: 'filtered', label: copy('Livello filtrato'), format: 'dec4' },
      { key: 'level', label: copy('Livello smussato'), format: 'dec4' },
      { key: 'trend', label: copy('Trend smussato'), format: 'dec4' },
      { key: 'residual', label: copy('Residuo'), format: 'dec4' },
    ],
    rows: fit.points.map(point => ({
      t: point.t,
      observed: point.observed,
      filtered: point.filteredLevel,
      level: point.level,
      trend: point.trend,
      residual: point.residual,
    })),
    notes: [
      copy('Il livello filtrato usa solo il passato; il livello smussato usa tutta la serie ed è quello da leggere per la ricostruzione storica.'),
    ],
  },
  {
    id: 'ss-forecast',
    title: copy('Previsioni'),
    columns: [
      { key: 'step', label: copy('Passo'), format: 'int' },
      { key: 'mean', label: copy('Previsione'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('Limite basso'), format: 'dec4' },
      { key: 'hi', label: copy('Limite alto'), format: 'dec4' },
    ],
    rows: fit.forecast.map(point => ({ ...point })),
    notes: [copy('L’incertezza cresce con l’orizzonte perché livello e trend accumulano innovazioni.')],
  },
];

const markovTables = (fit: MarkovStateSpaceFit): TableSpec[] => [
  {
    id: 'ss-model',
    title: copy('Modello Markov switching a 2 regimi'),
    subtitle: copy('{s1} osservazioni · AR(1) con medie e varianze per regime', { s1: fit.n }),
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('Media regime 1'), value: fmtEst(fit.means[0], 4) },
      { metric: copy('Media regime 2'), value: fmtEst(fit.means[1], 4) },
      { metric: copy('Varianza regime 1'), value: fmtEst(fit.variances[0], 4) },
      { metric: copy('Varianza regime 2'), value: fmtEst(fit.variances[1], 4) },
      { metric: copy('Coefficiente AR(1)'), value: fmtEst(fit.autoregressive, 4) },
      { metric: copy('Durata media regime 1'), value: fmtEst(fit.expectedDuration[0], 2) },
      { metric: copy('Durata media regime 2'), value: fmtEst(fit.expectedDuration[1], 2) },
      { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
      { metric: 'AIC', value: fmtEst(fit.aic, 3) },
      { metric: 'BIC', value: fmtEst(fit.bic, 3) },
      { metric: copy('Convergenza'), value: fit.converged ? copy('raggiunta') : copy('non raggiunta') },
    ],
    notes: [
      copy('Ogni regime ha una media e una varianza proprie; la catena di Markov governa la probabilità di restare nel regime o passare all’altro.'),
      copy('La durata media di un regime è 1/(1−p) passaggi.'),
    ],
  },
  {
    id: 'ss-transition',
    title: copy('Matrice di transizione'),
    columns: [
      { key: 'from', label: copy('Da'), format: 'text' },
      { key: 'to', label: copy('A'), format: 'text' },
      { key: 'probability', label: copy('Probabilità'), format: 'dec4' },
    ],
    rows: [
      { from: copy('Regime 1'), to: copy('Regime 1'), probability: fit.transition[0][0] },
      { from: copy('Regime 1'), to: copy('Regime 2'), probability: fit.transition[0][1] },
      { from: copy('Regime 2'), to: copy('Regime 1'), probability: fit.transition[1][0] },
      { from: copy('Regime 2'), to: copy('Regime 2'), probability: fit.transition[1][1] },
    ],
    notes: [copy('Le righe sommano a 1: ogni riga è la distribuzione del regime al passo successivo.')],
  },
  {
    id: 'ss-probabilities',
    title: copy('Probabilità smussate dei regimi'),
    columns: [
      { key: 't', label: 't', format: 'int' },
      { key: 'regime1', label: copy('Regime 1'), format: 'dec4' },
      { key: 'regime2', label: copy('Regime 2'), format: 'dec4' },
      { key: 'classified', label: copy('Regime assegnato'), format: 'int' },
    ],
    rows: fit.smoothed.map((probabilities, index) => ({
      t: index + 2,
      regime1: probabilities[0],
      regime2: probabilities[1],
      classified: fit.classification[index] + 1,
    })),
    notes: [copy('Le probabilità smussate usano tutta la serie; il regime assegnato è quello con probabilità maggiore.')],
  },
  {
    id: 'ss-forecast',
    title: copy('Previsioni'),
    columns: [
      { key: 'step', label: copy('Passo'), format: 'int' },
      { key: 'mean', label: copy('Previsione'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('Limite basso'), format: 'dec4' },
      { key: 'hi', label: copy('Limite alto'), format: 'dec4' },
    ],
    rows: fit.forecast.map(point => ({ ...point })),
    notes: [copy('La previsione media integra le probabilità dei regimi e la dinamica AR(1).')],
  },
];
