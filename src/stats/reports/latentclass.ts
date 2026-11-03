import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { LatentClassResult } from '../latentclass/types';
import type { ReportSpec } from '../report';

export const latentClassReport = (result: LatentClassResult): ReportSpec => {
  const smallest = Math.min(...result.proportions);
  const separation =
    result.entropy >= 0.8 ? copy('netta') : result.entropy >= 0.6 ? copy('moderata') : copy('debole');
  return {
    id: 'latentclass',
    title: copy('Report di lettura — Classi latenti'),
    headline: copy(
      '{s1} classi latenti; la più piccola raccoglie il {s2}% dei casi e la separazione è {s3}.',
      {
        s1: result.classes,
        s2: fmtEst(smallest * 100, 1),
        s3: separation,
      }
    ),
    badge: copy('{s1} classi', { s1: result.classes }),
    tone: smallest < 0.05 || result.entropy < 0.6 ? 'caution' : 'neutral',
    intro: [
      copy('L’analisi delle classi latenti raggruppa le osservazioni in profili non osservati, stimati dalle risposte alle variabili categoriche.'),
      copy('Ogni classe ha una propria probabilità di rispondere a ciascun livello: classi diverse descrivono modi diversi di rispondere, non livelli diversi di una stessa scala.'),
    ],
    sections: [
      {
        heading: copy('Le classi'),
        bullets: result.proportions.map((value, index) =>
          copy('Classe {s1}: {s2}% dei casi.', {
            s1: index + 1,
            s2: fmtEst(value * 100, 1),
          })
        ),
      },
      {
        heading: copy('Quante classi'),
        body: [
          copy('Confronta AIC e BIC tra modelli con un numero diverso di classi: valori più bassi sono preferibili, ma la scelta deve restare interpretabile.'),
          copy('L’entropia misura quanto le classi sono separate: valori alti indicano assegnazioni più nette.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Le classi sono una rappresentazione utile, non entità necessariamente reali.'),
          copy('Soluzioni con classi molto piccole o entropia bassa vanno interpretate con prudenza.'),
        ],
      },
    ],
    limitations: [
      copy('Il modello assume indipendenza condizionale: dentro ogni classe le risposte sono trattate come indipendenti.'),
    ],
  };
};
