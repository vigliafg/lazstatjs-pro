import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import { isDecided, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export const competingReport = (tables: TableSpec[], level: number): ReportSpec => {
  const coefficients = tableById(tables, 'competing-coefficients')?.rows ?? [];
  const summary = tableById(tables, 'competing-summary')?.rows ?? [];
  const value = (metric: string): number =>
    Number(summary.find(row => String(row.metric) === metric)?.raw ?? NaN);
  const n = value(copy('Osservazioni'));
  const events = value(copy('Eventi della causa'));
  const competing = value(copy('Eventi competitivi'));
  const cifFinal = value(copy('Incidenza cumulativa finale'));
  const strongest = coefficients
    .slice()
    .sort((left, right) => Math.abs(Number(right.z ?? 0)) - Math.abs(Number(left.z ?? 0)))[0];
  const significant = strongest ? isDecided(Number(strongest.p), level) : false;

  return {
    id: 'competing',
    title: copy('Report di lettura — Rischi competitivi'),
    headline: copy('Incidenza cumulativa finale {s1} su {s2} osservazioni e {s3} eventi della causa.', {
      s1: fmtEst(cifFinal, 3),
      s2: n,
      s3: events,
    }),
    badge: copy('Fine–Gray'),
    tone: 'neutral',
    intro: [
      copy('Nei rischi competitivi un soggetto può uscire per più cause diverse: la causa scelta e le altre cause competono per lo stesso tempo.'),
      copy('Qui ci sono {s1} eventi della causa di interesse e {s2} eventi competitivi: trattare le cause competitive come censure semplici sovrastima l’incidenza della causa scelta.', { s1: events, s2: competing }),
    ],
    sections: [
      {
        heading: copy('Cosa stimiamo'),
        body: [
          copy('Il modello di Fine–Gray stima l’effetto delle covariati sul rischio di sottodistribuzione, cioè sul rischio di osservare la causa scelta tenendo conto delle cause competitive.'),
          strongest
            ? copy('La covariata con effetto più netto è {s1}: sHR = {s2} (p = {s3}) — {s4}.', {
                s1: String(strongest.term),
                s2: fmtEst(Number(strongest.hr), 3),
                s3: fmtP(Number(strongest.p)),
                s4: significant
                  ? copy('l’associazione è compatibile con un effetto reale.')
                  : copy('non c’è evidenza sufficiente di un effetto.'),
              })
            : copy('Nessuna covariata nel modello.'),
          copy('L’incidenza cumulativa finale è {s1}: entro l’ultimo tempo osservato circa il {s2}% dei soggetti ha avuto la causa scelta.', {
            s1: fmtEst(cifFinal, 3),
            s2: fmtEst(cifFinal * 100, 1),
          }),
        ],
      },
      {
        heading: copy('Come leggere il risultato'),
        body: [
          copy('L’incidenza cumulativa (CIF) è la probabilità di aver avuto l’evento entro un tempo, in un mondo in cui esistono le altre cause.'),
          copy('La curva di Kaplan–Meier della causa scelta tratta le cause competitive come censure: non è la CIF e tende a sovrastimare la probabilità reale.'),
          copy('Un sHR maggiore di 1 indica una maggiore incidenza cumulativa della causa, non necessariamente un rischio istantaneo maggiore a parità di cause competitive.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Censura non informativa e cause definite in modo esaustivo e mutuamente esclusivo.'),
          copy('Il modello di Fine–Gray assume proporzionalità del rischio di sottodistribuzione.'),
          copy('Con pochi eventi per covariata le stime sono instabili.'),
          copy('La scelta della causa di interesse va dichiarata prima di guardare i risultati.'),
        ],
      },
    ],
    limitations: [
      copy('Il modello è semi-parametrico: non impone una forma al rischio di base.'),
      copy('Non stima l’effetto sulla causa-specifica; per quello serve un Cox cause-specific.'),
      copy('Le cause competitive sono trattate come un unico insieme, non separate una per una.'),
    ],
  };
};
