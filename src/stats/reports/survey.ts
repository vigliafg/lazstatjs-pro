import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { SurveyResult } from '../w9Results';
import type { ReportSpec } from '../report';

export const surveyReport = (result: SurveyResult): ReportSpec => {
  const main = result.estimates[0];
  const significant = main && main.lo > 0 ? true : main && main.hi < 0 ? true : false;
  return {
    id: 'survey',
    title: copy('Report di lettura — Campione complesso'),
    headline: main
      ? copy('{s1}: {s2} (SE {s3}, IC {s4}–{s5}).', {
          s1: main.label,
          s2: fmtEst(main.estimate, 3),
          s3: fmtEst(main.se, 3),
          s4: fmtEst(main.lo, 3),
          s5: fmtEst(main.hi, 3),
        })
      : copy('Nessuna stima disponibile.'),
    badge: main ? copy('DEFF {s1}', { s1: fmtEst(main.deff, 2) }) : '',
    tone: main && Number.isFinite(main.deff) && main.deff > 2 ? 'caution' : 'neutral',
    intro: [
      copy('Le stime usano i pesi di campionamento e la struttura del disegno: strati, cluster e unità primarie.'),
      copy('La varianza di linearizzazione tratta ogni unità primaria come un’osservazione indipendente dentro il proprio strato.'),
    ],
    sections: [
      {
        heading: copy('Disegno'),
        bullets: [
          copy('Osservazioni: {s1}.', { s1: result.design.n }),
          copy('Strati: {s1}; unità primarie: {s2}.', {
            s1: result.design.strata,
            s2: result.design.psus,
          }),
          copy('Numerosità ponderata: {s1}.', { s1: fmtEst(result.design.weightedN, 1) }),
        ],
      },
      {
        heading: copy('Lettura'),
        body: [
          main
            ? copy('L’effetto disegno è {s1}: valori sopra 1 indicano che il disegno è meno efficiente di un campione casuale semplice.', {
                s1: fmtEst(main.deff, 2),
              })
            : copy('Nessun effetto disegno calcolabile.'),
          copy('I gradi di libertà del disegno determinano il moltiplicatore dell’intervallo: con pochi PSU l’intervallo è più prudente.'),
          significant
            ? copy('L’intervallo non contiene lo zero: la stima è distinta dall’ipotesi nulla al livello scelto.')
            : copy('L’intervallo contiene lo zero: i dati non escludono l’ipotesi nulla al livello scelto.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Il calcolo assume che i pesi siano corretti e che le PSU siano state campionate con probabilità nota.'),
          copy('Pesi molto variabili o strati con una sola PSU rendono la varianza instabile.'),
          copy('La regressione ponderata è descrittiva: non corregge endogeneità né selezione.'),
        ],
      },
    ],
    limitations: [
      copy('Senza il disegno completo (probabilità di inclusione e frazioni di campionamento) le stime restano condizionate ai pesi forniti.'),
    ],
  };
};
