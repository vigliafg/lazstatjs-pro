import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { HoltWintersFit } from '../kernels/holtwinters';
import type { UnitRootResult } from '../kernels/unitroot';
import type { SpectralAnalysis } from '../kernels/spectral';

export const holtWintersTables = (fit: HoltWintersFit, level: number): TableSpec[] => {
  const method =
    fit.seasonal === 'none'
      ? copy('Holt lineare (senza stagionalità)')
      : fit.seasonal === 'multiplicative'
        ? copy('Holt–Winters moltiplicativo')
        : copy('Holt–Winters additivo');
  return [
    {
      id: 'hw-model',
      title: copy('Modello Holt–Winters'),
      subtitle: copy('{s1} · periodo {s2}', { s1: method, s2: fit.period >= 2 ? fit.period : copy('nessuno') }),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('Modello'), value: method },
        { metric: copy('α (livello)'), value: fmtEst(fit.alpha, 4) },
        { metric: copy('β (trend)'), value: fmtEst(fit.beta, 4) },
        ...(fit.seasonal === 'none'
          ? []
          : [{ metric: copy('γ (stagionalità)'), value: fmtEst(fit.gamma, 4) }]),
        { metric: copy('Livello finale'), value: fmtEst(fit.level, 4) },
        { metric: copy('Trend finale'), value: fmtEst(fit.trend, 4) },
        { metric: copy('Somma dei quadrati'), value: fmtEst(fit.sse, 4) },
        { metric: copy('Log-verosimiglianza'), value: fmtEst(fit.logLik, 3) },
        { metric: 'AIC', value: fmtEst(fit.aic, 3) },
        { metric: 'BIC', value: fmtEst(fit.bic, 3) },
        { metric: copy('Convergenza'), value: fit.converged ? copy('raggiunta') : copy('non raggiunta') },
      ],
      notes: [
        copy('α aggiorna il livello, β il trend e γ il profilo stagionale: valori alti rendono il modello più reattivo alle ultime osservazioni.'),
        copy('La stagionalità moltiplicativa è adatta quando l’ampiezza delle oscillazioni cresce con il livello della serie.'),
        copy('I parametri sono stimati minimizzando la somma dei quadrati degli errori di previsione a un passo.'),
      ],
    },
    {
      id: 'hw-accuracy',
      title: copy('Accuratezza in campione'),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'dec4' },
      ],
      rows: [
        { metric: copy('RMSE'), value: Math.sqrt(fit.sigma2) },
        { metric: copy('Errore standard residuo'), value: Math.sqrt(fit.sigma2) },
        { metric: copy('Osservazioni usate'), value: fit.fitted.length },
      ],
      notes: [copy('L’RMSE è nella stessa unità della serie: è la scala tipica degli errori di previsione a un passo.')],
    },
    {
      id: 'hw-forecast',
      title: copy('Previsioni Holt–Winters'),
      subtitle: copy('orizzonte {s1} passi · IC {s2}%', { s1: fit.forecast.length, s2: level }),
      columns: [
        { key: 'step', label: copy('Passo'), format: 'int' },
        { key: 'mean', label: copy('Previsione'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'lo', label: copy('Limite basso'), format: 'dec4' },
        { key: 'hi', label: copy('Limite alto'), format: 'dec4' },
      ],
      rows: fit.forecast.map(point => ({ ...point })),
      notes: [
        copy('L’intervallo combina il livello, il trend e il profilo stagionale con l’errore residuo; con orizzonti lunghi l’ampiezza cresce.'),
      ],
    },
  ];
};

export const unitRootTables = (result: UnitRootResult, level: number): TableSpec[] => {
  const decisive = (p: number, rejectMessage: string, keepMessage: string): string =>
    !Number.isFinite(p) ? copy('non calcolabile') : p < 1 - level / 100 ? rejectMessage : keepMessage;
  return [
    {
      id: 'unitroot-tests',
      title: copy('Test di radice unitaria e stazionarietà'),
      columns: [
        { key: 'test', label: copy('Test'), format: 'text' },
        { key: 'null', label: copy('Ipotesi nulla'), format: 'text' },
        { key: 'stat', label: copy('Statistica'), format: 'dec3' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'lags', label: copy('Ritardi'), format: 'int' },
        { key: 'cv5', label: copy('Valore critico 5%'), format: 'dec3' },
        { key: 'decision', label: copy('Lettura'), format: 'text' },
      ],
      rows: [
        {
          test: 'ADF',
          null: copy('radice unitaria'),
          stat: result.adf.stat,
          p: result.adf.p,
          lags: result.adf.lags,
          cv5: result.adf.cv5,
          decision: decisive(result.adf.p, copy('radice unitaria rifiutata'), copy('radice unitaria non rifiutata')),
        },
        {
          test: 'KPSS (livello)',
          null: copy('stazionarietà'),
          stat: result.kpss.level.stat,
          p: result.kpss.level.p,
          lags: result.kpss.level.lags,
          cv5: result.kpss.level.cv5,
          decision: decisive(result.kpss.level.p, copy('stazionarietà rifiutata'), copy('stazionarietà non rifiutata')),
        },
        {
          test: 'KPSS (trend)',
          null: copy('stazionarietà attorno a un trend'),
          stat: result.kpss.trend.stat,
          p: result.kpss.trend.p,
          lags: result.kpss.trend.lags,
          cv5: result.kpss.trend.cv5,
          decision: decisive(result.kpss.trend.p, copy('stazionarietà rifiutata'), copy('stazionarietà non rifiutata')),
        },
        {
          test: 'Phillips–Perron',
          null: copy('radice unitaria'),
          stat: result.pp.stat,
          p: result.pp.p,
          lags: result.pp.lags,
          cv5: result.pp.cv5,
          decision: decisive(result.pp.p, copy('radice unitaria rifiutata'), copy('radice unitaria non rifiutata')),
        },
      ],
      notes: [
        copy('ADF e Phillips–Perron hanno come ipotesi nulla la radice unitaria; KPSS ha come ipotesi nulla la stazionarietà.'),
        copy('ADF e PP rifiutano per valori molto negativi; KPSS rifiuta per valori grandi della statistica.'),
        copy('Confermare la conclusione con entrambe le famiglie di test riduce il rischio di scambiare trend e radice unitaria.'),
      ],
    },
  ];
};

export const spectralTables = (result: SpectralAnalysis): TableSpec[] => {
  const tables: TableSpec[] = [
    {
      id: 'spectral-summary',
      title: copy('Sintesi spettrale'),
      subtitle: copy('{s1} osservazioni', { s1: result.n }),
      columns: [
        { key: 'metric', label: copy('Voce'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'text' },
      ],
      rows: [
        { metric: copy('Frequenza di picco'), value: fmtEst(result.fisher.frequency, 4) },
        { metric: copy('Periodo di picco'), value: fmtEst(result.fisher.period, 2) },
        { metric: 'Fisher g', value: fmtEst(result.fisher.g, 4) },
        { metric: copy('p di Fisher'), value: fmtP(result.fisher.p) },
        { metric: copy('Larghezza della finestra Daniell'), value: String(result.span) },
        ...(result.ar
          ? [
              { metric: copy('Ordine AR (Yule–Walker)'), value: String(result.ar.order) },
              { metric: copy('Varianza di previsione AR'), value: fmtEst(result.ar.variance, 4) },
            ]
          : []),
      ],
      notes: [
        copy('Il periodogramma misura quanta varianza della serie cade su ciascuna frequenza.'),
        copy('Fisher g confronta il picco con il resto dello spettro: p piccolo indica una componente periodica dominante.'),
      ],
    },
    {
      id: 'spectral-peaks',
      title: copy('Frequenze dominanti'),
      columns: [
        { key: 'frequency', label: copy('Frequenza'), format: 'dec4' },
        { key: 'period', label: copy('Periodo'), format: 'dec2' },
        { key: 'power', label: copy('Potenza'), format: 'dec3' },
      ],
      rows: result.peaks.map(point => ({ ...point })),
      notes: [copy('Un picco alla frequenza 1/12 corrisponde a un ciclo di 12 osservazioni, tipico dei dati mensili.')],
    },
  ];
  if (result.ar) {
    tables.push({
      id: 'spectral-ar',
      title: copy('Coefficienti del modello AR'),
      subtitle: copy('ordine {s1} scelto con l’AIC', { s1: result.ar.order }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'estimate', label: copy('Coefficiente'), format: 'dec4' },
      ],
      rows: result.ar.coefficients.map((estimate, index) => ({ term: `AR(${index + 1})`, estimate })),
      notes: [copy('Lo spettro AR è la curva teorica del processo autoregressivo stimato: liscia il periodogramma e mostra i picchi principali.')],
    });
  }
  return tables;
};
