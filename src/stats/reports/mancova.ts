import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP, isDecided } from './shared';

export const mancovaReport = (
  tables: TableSpec[],
  groupName: string,
  covariateNames: string[],
  level: number
): ReportSpec => {
  const multivariate = tables.find(table => table.id === 'mancova-multivariate')?.rows[0] ?? {};
  const univariate = tables.find(table => table.id === 'mancova-univariate')?.rows ?? [];
  const significant = univariate.filter(row => isDecided(Number(row.p), level));
  const p = Number(multivariate.p ?? NaN);

  return {
    id: 'report-mancova',
    title: copy('Report di lettura — MANCOVA'),
    headline: copy(
      'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.',
      {
        s1: groupName,
        s2: univariate.length,
        s3: covariateNames.join(', ') || copy('nessuna covariata'),
        s4: Number(multivariate.lambda ?? NaN).toFixed(4),
        s5: describeP(p),
      }
    ),
    badge: copy('Confronto'),
    tone: isDecided(p, level) ? 'caution' : 'positive',
    intro: [
      copy('La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.'),
      copy('Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.', {
            s1: Number(multivariate.lambda ?? NaN).toFixed(4),
            s2: Number(multivariate.f ?? NaN).toFixed(3),
            s3: String(multivariate.df1 ?? '—'),
            s4: String(multivariate.df2 ?? '—'),
            s5: describeP(p),
          }),
          copy('{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.', {
            s1: significant.length,
            s2: univariate.length,
          }),
          ...univariate.map(row =>
            copy('{s1}: F = {s2}, p = {s3}.', {
              s1: String(row.variable),
              s2: Number(row.f ?? NaN).toFixed(3),
              s3: describeP(Number(row.p ?? NaN)),
            })
          ),
        ],
      },
      {
        heading: copy('Come leggerlo'),
        bullets: [
          copy('Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.'),
          copy('Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.'),
          copy('Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.'),
          copy('Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.'),
      copy('Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.'),
    ],
  };
};
