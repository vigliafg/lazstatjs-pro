import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { show } from './shared';
import type { ToleranceInterval } from '../analysisResults';

const percent = (value: number): string => `${show(value * 100, 1)}%`;

export const toleranceReport = (
  interval: ToleranceInterval,
  variableName: string
): ReportSpec => ({
  id: 'report-tolerance',
  title: copy('Report di lettura — Intervallo di tolleranza'),
  headline: copy('{s1}% della popolazione di {s2} è compreso tra {s3} e {s4}, con confidenza {s5}%.', {
    s1: show(interval.proportion * 100, 1),
    s2: variableName,
    s3: show(interval.lo, 3),
    s4: show(interval.hi, 3),
    s5: show(interval.confidence * 100, 1),
  }),
  badge: copy('Intervallo'),
  tone: 'neutral',
  intro: [
    copy('L’intervallo di tolleranza risponde a una domanda diversa dal CI della media: non dove sta la media, ma quale intervallo coprirà una quota della popolazione.'),
    copy('Serve per specifiche, limiti di accettazione e valori di riferimento, dove conta la dispersione individuale e non l’incertezza della stima.'),
  ],
  sections: [
    {
      heading: copy('Risultato'),
      bullets: [
        copy('Media {s1}, deviazione standard {s2}, fattore k = {s3}.', {
          s1: show(interval.mean, 4),
          s2: show(interval.sd, 4),
          s3: show(interval.k, 3),
        }),
        copy('Intervallo: da {s1} a {s2}; copre il {s3}% della popolazione con confidenza {s4}%.', {
          s1: show(interval.lo, 3),
          s2: show(interval.hi, 3),
          s3: percent(interval.proportion),
          s4: percent(interval.confidence),
        }),
        copy('Ampiezza dell’intervallo: {s1}. Si restringe aumentando n o riducendo la confidenza richiesta.', {
          s1: show(interval.hi - interval.lo, 3),
        }),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        copy('La confidenza riguarda la procedura: se ripetessi il campionamento, una quota pari alla confidenza degli intervalli costruiti coprirebbe davvero la proporzione richiesta.'),
        copy('Con pochi casi k è grande: un intervallo di tolleranza al 95/95 su dieci osservazioni è largo oltre tre deviazioni standard per lato.'),
        copy('La copertura osservata nel campione non è la copertura della popolazione: con n piccolo è quasi sempre vicina al 100%.'),
      ],
    },
  ],
  limitations: [
    copy('L’intervallo assume una popolazione normale e osservazioni indipendenti: con distribuzioni asimmetriche va usato un metodo non parametrico.'),
    copy('Non sostituisce un’analisi di capacità: Cp/Cpk confrontano la dispersione con le specifiche, l’intervallo di tolleranza stima dove cadono le unità.'),
    copy('Con campioni molto piccoli l’approssimazione di Howe può differire leggermente dal fattore esatto della t non centrale.'),
  ],
});
