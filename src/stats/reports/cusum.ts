import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { show } from './shared';
import type { CusumResult } from '../kernels/cusum';

export const cusumReport = (result: CusumResult, variableName: string): ReportSpec => {
  const high = result.firstHigh;
  const low = result.firstLow;
  const signal =
    high !== null && low !== null
      ? copy('Il primo segnale è al punto {s1} verso l’alto e al punto {s2} verso il basso.', {
          s1: high,
          s2: low,
        })
      : high !== null
        ? copy('Il primo segnale è al punto {s1}, verso l’alto.', { s1: high })
        : low !== null
          ? copy('Il primo segnale è al punto {s1}, verso il basso.', { s1: low })
          : copy('Nessun punto supera l’intervallo di decisione: il processo resta sotto controllo.');

  return {
    id: 'report-cusum',
    title: copy('Report di lettura — CUSUM'),
    headline: copy('CUSUM di {s1}: {s2}', { s1: variableName, s2: signal }),
    badge: copy('Controllo'),
    tone: high !== null || low !== null ? 'caution' : 'positive',
    intro: [
      copy('La CUSUM somma gli scostamenti dal target: piccoli spostamenti persistenti si accumulano e superano il limite anche quando nessun punto singolo esce dai limiti di una carta Shewhart.'),
      copy('È la carta giusta per turni, lotti e processi continui, dove conta la deriva lenta e non il singolo valore anomalo.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Target {s1}, σ {s2}; allowance k = {s3}·σ, intervallo h = {s4}·σ (limite {s5}).', {
            s1: show(result.center, 4),
            s2: show(result.sigma, 4),
            s3: show(result.k, 2),
            s4: show(result.h, 2),
            s5: show(result.upper, 3),
          }),
          signal,
          copy('Valore finale di C+: {s1}; di C−: {s2}.', {
            s1: show(result.points[result.points.length - 1]?.cplus ?? Number.NaN, 3),
            s2: show(result.points[result.points.length - 1]?.cminus ?? Number.NaN, 3),
          }),
        ],
      },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('C+ misura quanto il processo è stato sopra il target, C− quanto è stato sotto; i due lati si leggono separatamente.'),
          copy('Dopo un segnale la carta va azzerata o ricalcolata: la somma continua a crescere e non dice più quando è avvenuto il cambiamento.'),
          copy('k = 0,5σ è la scelta classica per uno spostamento di 1σ; h = 4σ dà pochi falsi allarmi, h = 5σ è ancora più prudente.'),
        ],
      },
    ],
    limitations: [
      copy('La CUSUM assume osservazioni indipendenti e in ordine cronologico: con autocorrelazione i falsi allarmi aumentano.'),
      copy('Non stima il punto di cambiamento: per quello servono metodi di change-point o la lettura congiunta con la carta di controllo.'),
      copy('Target e σ devono venire da una fase stabile: usarli da un processo fuori controllo rende il grafico fuorviante.'),
    ],
  };
};
