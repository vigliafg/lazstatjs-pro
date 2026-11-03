import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { MetaResult } from '../w9Results';
import type { ReportSpec } from '../report';

export const metaReport = (result: MetaResult): ReportSpec => {
  const main = result.random ?? result.fixed;
  const high = result.i2 >= 0.5;
  return {
    id: 'meta',
    title: copy('Report di lettura — Meta-analisi'),
    headline: copy('{s1} studi: effetto pooled {s2} (IC {s3}–{s4}).', {
      s1: result.k,
      s2: fmtEst(main.estimate, 3),
      s3: fmtEst(main.lo, 3),
      s4: fmtEst(main.hi, 3),
    }),
    badge: copy('I² {s1}%', { s1: fmtEst(100 * result.i2, 1) }),
    tone: high ? 'caution' : 'neutral',
    intro: [
      copy('La meta-analisi combina gli effetti dei singoli studi pesandoli per la loro precisione.'),
      copy('Il modello a effetti fissi assume un unico effetto vero; il modello a effetti casuali assume che gli studi stimino effetti diversi attorno a una media.'),
    ],
    sections: [
      {
        heading: copy('Eterogeneità'),
        bullets: [
          copy('Q = {s1} con {s2} gradi di libertà (p {s3}).', {
            s1: fmtEst(result.q, 2),
            s2: result.qDf,
            s3: fmtEst(result.qP, 3),
          }),
          copy('I² = {s1}%; τ² = {s2}.', {
            s1: fmtEst(100 * result.i2, 1),
            s2: fmtEst(result.tau2, 3),
          }),
          high
            ? copy('L’eterogeneità è sostanziale: il modello a effetti casuali è più appropriato e l’effetto medio va letto con cautela.')
            : copy('L’eterogeneità è contenuta: il modello a effetti fissi e quello a effetti casuali danno risultati simili.'),
        ],
      },
      {
        heading: copy('Studi'),
        bullets: result.studies
          .slice()
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 3)
          .map(item =>
            copy('{s1}: effetto {s2}, peso {s3}%.', {
              s1: item.label,
              s2: fmtEst(item.effect, 3),
              s3: fmtEst(item.weight, 1),
            })
          ),
      },
      {
        heading: copy('Bias e limiti'),
        body: [
          result.egger
            ? copy('Test di Egger: intercetta {s1}, p {s2}.', {
                s1: fmtEst(result.egger.intercept, 3),
                s2: fmtEst(result.egger.p, 3),
              })
            : copy('Il test di Egger richiede almeno tre studi.'),
          copy('La meta-analisi eredita i limiti degli studi inclusi: selezione, qualità e misure diverse non si correggono con il pooling.'),
          copy('L’intervallo di previsione, quando disponibile, descrive la variabilità attesa in un nuovo studio.'),
        ],
      },
    ],
    limitations: [
      copy('Con pochi studi le stime di τ² e del bias di pubblicazione sono instabili.'),
    ],
  };
};
