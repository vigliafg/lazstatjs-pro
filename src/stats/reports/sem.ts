import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { SemResult } from '../sem/types';
import type { ReportSpec } from '../report';

export const semReport = (result: SemResult): ReportSpec => {
  const fit = result.fit;
  const verdict =
    fit.cfi >= 0.95 && fit.rmsea <= 0.06
      ? copy('buono')
      : fit.cfi >= 0.9 && fit.rmsea <= 0.08
        ? copy('accettabile')
        : copy('da rivedere');
  return {
    id: 'sem',
    title: copy('Report di lettura — SEM / CFA'),
    headline: copy('Adattamento {s1}: CFI {s2}, RMSEA {s3}, χ² {s4} con {s5} df.', {
      s1: verdict,
      s2: fmtEst(fit.cfi, 3),
      s3: fmtEst(fit.rmsea, 3),
      s4: fmtEst(fit.chi2, 2),
      s5: fit.df,
    }),
    badge: copy('CFI {s1}', { s1: fmtEst(fit.cfi, 2) }),
    tone: fit.cfi >= 0.9 ? 'neutral' : 'caution',
    intro: [
      copy('Il modello a equazioni strutturali traduce le ipotesi in un sistema di relazioni tra variabili osservate e fattori latenti.'),
      copy('I carichi dicono quanto ogni variabile riflette il proprio fattore; le relazioni tra fattori dicono come i costrutti si collegano.'),
    ],
    sections: [
      {
        heading: copy('Adattamento del modello'),
        body: [
          copy('χ² confronta la matrice di covarianza riprodotta con quella osservata: un valore piccolo rispetto ai gradi di libertà è favorevole.'),
          copy('CFI e TLI confrontano il modello con quello di indipendenza; RMSEA e SRMR misurano la dimensione media degli scarti.'),
        ],
      },
      {
        heading: copy('Carichi e affidabilità'),
        bullets: result.loadings.slice(0, 8).map(item =>
          copy('{s1} → {s2}: carico {s3}, R² {s4}.', {
            s1: item.factor,
            s2: item.variable,
            s3: fmtEst(item.loading, 3),
            s4: fmtEst(item.r2, 2),
          })
        ),
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Un buon adattamento non dimostra che il modello sia vero: altri modelli possono adattarsi ugualmente bene.'),
          copy('La soluzione dipende dalle ipotesi di identificazione e dalla normalità delle variabili osservate.'),
        ],
      },
    ],
    limitations: [
      copy('Con campioni piccoli gli indici sono instabili e i test di bontà possono essere poco informativi.'),
    ],
  };
};
