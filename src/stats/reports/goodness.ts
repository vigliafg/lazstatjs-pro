import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show } from './shared';
import type { GofResult } from '../analysisResults';

export const goodnessReport = (result: GofResult, variableName: string, level: number): ReportSpec => {
  const top = result.observed.reduce(
    (best, count, index) => (count > result.observed[best] ? index : best),
    0
  );
  return {
    id: 'report-goodness',
    title: copy('Report di lettura — Bontà di adattamento'),
    headline: copy('{s1} categorie in {s2}: χ² = {s3}, p = {s4}.', {
      s1: result.labels.length,
      s2: variableName,
      s3: show(result.chi2, 3),
      s4: describeP(result.p),
    }),
    badge: copy('Confronto'),
    tone: isDecided(result.p, level) ? 'caution' : 'positive',
    intro: [
      copy('Il test confronta le frequenze osservate con le proporzioni attese: verifica se le categorie sono distribuite come previsto.'),
      copy('Serve per controllare se una categoria domina, non per stimare la sua proporzione: per quello usa l’intervallo di Wilson.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Totale {s1}; categoria più frequente: “{s2}” con {s3} casi.', {
            s1: result.total,
            s2: result.labels[top],
            s3: result.observed[top],
          }),
          copy('χ² = {s1}, df = {s2}, p = {s3}.', {
            s1: show(result.chi2, 3),
            s2: result.df,
            s3: describeP(result.p),
          }),
          copy('Proporzioni attese: {s1}.', {
            s1: result.proportions.map(value => show(value, 3)).join(' · '),
          }),
        ],
      },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Il χ² confronta (osservato − atteso)²/atteso sommato su tutte le categorie.'),
          copy('Con molte categorie e pochi casi il test diventa fragile: raggruppa le categorie rare.'),
          copy('Un p piccolo indica che la distribuzione osservata si discosta da quella attesa; non dice quale categoria pesa di più.'),
        ],
      },
    ],
    limitations: [
      copy('Le osservazioni devono essere indipendenti e ogni caso deve cadere in una sola categoria.'),
      copy('Le attese dovrebbero essere almeno 5 per categoria: sotto questa soglia il χ² è inaffidabile.'),
      copy('Con proporzioni stimate dai dati il test perde gradi di libertà: qui le proporzioni sono fissate a priori.'),
    ],
  };
};
