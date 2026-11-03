import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import { tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
interface LocalSummary {
  mode: 'local';
  trend: boolean;
  observationVariance: number;
  levelVariance: number;
  aic: number;
  bic: number;
  points: { level: number; trend: number }[];
  forecast: { mean: number; se: number; lo: number; hi: number }[];
}

interface MarkovSummary {
  mode: 'markov';
  means: [number, number];
  variances: [number, number];
  autoregressive: number;
  transition: [[number, number], [number, number]];
  stationary: [number, number];
  expectedDuration: [number, number];
  classification: number[];
  forecast: { mean: number; se: number }[];
}

type StateSpaceSummary = LocalSummary | MarkovSummary;

export const stateSpaceReport = (tables: TableSpec[], fit: StateSpaceSummary): ReportSpec =>
  fit.mode === 'local' ? localReport(tables, fit) : markovReport(tables, fit);

const localReport = (_tables: TableSpec[], fit: LocalSummary): ReportSpec => {
  const first = fit.forecast[0];
  const last = fit.forecast[fit.forecast.length - 1];
  const trend = fit.points[fit.points.length - 1]?.trend ?? 0;
  return {
    id: 'statespace',
    title: copy('Report di lettura'),
    headline: copy('State-space locale: livello finale {s1}, trend {s2}.', {
      s1: fmtEst(fit.points[fit.points.length - 1]?.level ?? NaN, 3),
      s2: fmtEst(trend, 3),
    }),
    badge: copy('Serie temporali'),
    tone: 'neutral',
    intro: [
      copy('Il modello state-space tratta il livello della serie come uno stato latente che evolve nel tempo: il filtro di Kalman separa il segnale dal rumore di osservazione.'),
      fit.trend
        ? copy('Il modello include un trend stocastico: il livello può cambiare pendenza invece di seguire una retta fissa.')
        : copy('Il modello è a solo livello: la serie è vista come un livello che si sposta casualmente, senza pendenza.'),
    ],
    sections: [
      {
        heading: copy('Segnale e rumore'),
        body: [
          copy('Varianza di osservazione {s1} contro varianza del livello {s2}: {s3}.', {
            s1: fmtEst(fit.observationVariance, 4),
            s2: fmtEst(fit.levelVariance, 4),
            s3:
              fit.observationVariance > fit.levelVariance
                ? copy('gran parte della variabilità è rumore di misura e il livello è relativamente liscio')
                : copy('il livello si muove molto e il rumore di misura è contenuto'),
          }),
          copy('AIC = {s1}, BIC = {s2}: il confronto con un modello a solo livello aiuta a decidere se il trend stocastico serve.', {
            s1: fmtEst(fit.aic, 3),
            s2: fmtEst(fit.bic, 3),
          }),
        ],
      },
      {
        heading: copy('Previsioni'),
        body: [
          copy('La previsione parte da {s1} e arriva a {s2} al passo {s3}.', {
            s1: fmtEst(first?.mean, 3),
            s2: fmtEst(last?.mean, 3),
            s3: fit.forecast.length,
          }),
          copy('L’intervallo al {s1}% passa da {s2} a {s3} di ampiezza: l’incertezza cresce con l’orizzonte.', {
            s1: 95,
            s2: fmtEst((first?.hi ?? NaN) - (first?.lo ?? NaN), 3),
            s3: fmtEst((last?.hi ?? NaN) - (last?.lo ?? NaN), 3),
          }),
        ],
      },
    ],
    limitations: [
      copy('Il modello è lineare e gaussiano: cambi di regime e code spesse non sono rappresentati.'),
      copy('Le varianze sono stimate a massima verosimiglianza e possono finire al bordo (zero) su serie corte.'),
      copy('Il trend stocastico è identificato con difficoltà quando la serie è breve: confronta AIC/BIC con il modello a solo livello.'),
      copy('Le previsioni non includono incertezza sulla stima delle varianze né sulla scelta del modello.'),
    ],
  };
};

const markovReport = (_tables: TableSpec[], fit: MarkovSummary): ReportSpec => {
  const state1 = fit.stationary[0];
  const last = fit.forecast[fit.forecast.length - 1];
  const switches = fit.classification.reduce(
    (count, state, index) => count + (index > 0 && state !== fit.classification[index - 1] ? 1 : 0),
    0
  );
  return {
    id: 'statespace',
    title: copy('Report di lettura'),
    headline: copy('Markov switching: {s1} cambi di regime osservati.', { s1: switches }),
    badge: copy('Serie temporali'),
    tone: 'neutral',
    intro: [
      copy('Il modello ipotizza due regimi con media e varianza proprie: la serie può alternare fasi diverse invece di seguire un unico processo.'),
      copy('Regime 1: media {s1}, varianza {s2}. Regime 2: media {s3}, varianza {s4}.', {
        s1: fmtEst(fit.means[0], 3),
        s2: fmtEst(fit.variances[0], 3),
        s3: fmtEst(fit.means[1], 3),
        s4: fmtEst(fit.variances[1], 3),
      }),
    ],
    sections: [
      {
        heading: copy('Persistenza dei regimi'),
        body: [
          copy('La probabilità di restare nel regime 1 è {s1} e nel regime 2 è {s2}; le durate medie sono {s3} e {s4} passaggi.', {
            s1: fmtEst(fit.transition[0][0], 3),
            s2: fmtEst(fit.transition[1][1], 3),
            s3: fmtEst(fit.expectedDuration[0], 1),
            s4: fmtEst(fit.expectedDuration[1], 1),
          }),
          copy('La distribuzione stazionaria assegna {s1} al regime 1 e {s2} al regime 2.', {
            s1: fmtEst(state1, 3),
            s2: fmtEst(1 - state1, 3),
          }),
          copy('Il coefficiente AR(1) comune è {s1}: valori positivi indicano inerzia dentro ciascun regime.', {
            s1: fmtEst(fit.autoregressive, 3),
          }),
        ],
      },
      {
        heading: copy('Previsione'),
        body: [
          copy('La previsione media a {s1} passi è {s2}, con DS {s3}.', {
            s1: fit.forecast.length,
            s2: fmtEst(last?.mean, 3),
            s3: fmtEst(last?.se, 3),
          }),
          copy('La media prevista è una media ponderata dei due regimi con le probabilità di transizione, non l’appartenenza a un regime certo.'),
        ],
      },
    ],
    limitations: [
      copy('Il numero di regimi è fissato a due: modelli a tre regimi o con transizioni dipendenti da covariariate non sono considerati.'),
      copy('L’identificazione delle etichette dei regimi dipende dai valori iniziali: verifica che la classificazione abbia senso sostantivo.'),
      copy('Le previsioni medie non riportano l’incertezza sulla classificazione dei regimi.'),
      copy('Code spesse e asimmetrie dentro i regimi non sono modellate esplicitamente.'),
    ],
  };
};
