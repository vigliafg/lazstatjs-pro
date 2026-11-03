import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { CanonicalResult } from '../canonical/types';
import type { ReportSpec } from '../report';

export const canonicalReport = (result: CanonicalResult): ReportSpec => {
  const first = result.functions[0];
  const r = first?.correlation ?? 0;
  const strength = r >= 0.7 ? copy('forte') : r >= 0.4 ? copy('moderata') : copy('debole');
  return {
    id: 'canonical',
    title: copy('Report di lettura — Correlazione canonica'),
    headline: copy(
      'La prima funzione canonica collega i due blocchi con una correlazione {s1} ({s2}).',
      { s1: fmtEst(r, 3), s2: strength }
    ),
    badge: copy('{s1} funzioni', { s1: result.functions.length }),
    tone: first && first.p < 0.05 ? 'neutral' : 'caution',
    intro: [
      copy('La correlazione canonica cerca le combinazioni lineari di due gruppi di variabili che sono il più possibile correlate tra loro.'),
      copy('Ogni funzione è una coppia di punteggi: i coefficienti dicono come costruirli, le correlazioni di struttura dicono quanto ogni variabile contribuisce.'),
    ],
    sections: [
      {
        heading: copy('Le funzioni trovate'),
        bullets: result.functions.map(fn =>
          copy('Funzione {s1}: r = {s2}, λ di Wilks = {s3}, p = {s4}.', {
            s1: fn.index,
            s2: fmtEst(fn.correlation, 3),
            s3: fmtEst(fn.wilks, 3),
            s4: fmtEst(fn.p, 3),
          })
        ),
      },
      {
        heading: copy('Come leggere i coefficienti'),
        body: [
          copy('Il segno di un coefficiente indica la direzione del legame con il punteggio canonico; il valore assoluto indica il peso, ma con variabili correlate i pesi possono essere instabili.'),
          copy('Le correlazioni di struttura sono spesso più facili da interpretare dei coefficienti: misurano il legame semplice tra una variabile e il punteggio canonico.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Le funzioni canoniche sono combinazioni lineari: relazioni non lineari o gruppi di variabili molto collineari possono produrre coefficienti difficili da leggere.'),
          copy('La significatività della prima funzione non garantisce che le funzioni successive siano interpretabili.'),
        ],
      },
    ],
    limitations: [
      copy('La correlazione canonica descrive associazione, non causalità: l’ordine dei due blocchi è una scelta dell’analista.'),
    ],
  };
};
