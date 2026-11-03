import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ChoiceResult } from '../w9Results';
import type { ReportSpec } from '../report';

export const choiceReport = (result: ChoiceResult): ReportSpec => {
  if (result.mode === 'maxdiff') {
    const top = result.maxdiff[0];
    return {
      id: 'choice-maxdiff',
      title: copy('Report di lettura — MaxDiff'),
      headline: top
        ? copy('L’elemento con il punteggio più alto è “{s1}” ({s2}%).', {
            s1: top.item,
            s2: fmtEst(100 * top.share, 1),
          })
        : copy('Nessun elemento disponibile.'),
      badge: copy('{s1} blocchi', { s1: result.sets }),
      tone: 'neutral',
      intro: [
        copy('MaxDiff chiede di indicare il migliore e il peggiore di ogni blocco: il punteggio è la differenza tra le due frequenze.'),
        copy('La quota di preferenza trasforma i conteggi in una scala confrontabile tra elementi.'),
      ],
      sections: [
        {
          heading: copy('Classifica'),
          bullets: result.maxdiff.slice(0, 5).map(item =>
            copy('{s1}: punteggio {s2}, quota {s3}%.', {
              s1: item.item,
              s2: item.score,
              s3: fmtEst(100 * item.share, 1),
            })
          ),
        },
        {
          heading: copy('Lettura'),
          body: [
            copy('Punteggi vicini indicano elementi non distinguibili con questo numero di blocchi: guarda anche la SE.'),
            copy('La quota non è una probabilità di acquisto: è una preferenza relativa dentro i blocchi mostrati.'),
          ],
        },
        {
          heading: copy('Limiti'),
          body: [
            copy('Il disegno dei blocchi conta: elementi mai confrontati non sono ordinabili con certezza.'),
            copy('Con pochi blocchi le differenze sono instabili; aumenta i blocchi o il numero di rispondenti.'),
          ],
        },
      ],
      limitations: [
        copy('MaxDiff misura preferenze dichiarate in un compito di scelta, non comportamenti reali.'),
      ],
    };
  }
  const main = result.coefficients[0];
  return {
    id: 'choice',
    title: copy('Report di lettura — Scelta discreta'),
    headline: main
      ? copy('Logit condizionale su {s1} set: il coefficiente di “{s2}” è {s3}.', {
          s1: result.sets,
          s2: main.term,
          s3: fmtEst(main.estimate, 3),
        })
      : copy('Nessun coefficiente stimabile.'),
    badge: copy('McFadden R² {s1}', { s1: fmtEst(result.r2, 2) }),
    tone: result.r2 >= 0.1 ? 'positive' : 'neutral',
    intro: [
      copy('Il logit condizionale spiega la scelta dentro ogni set confrontando le caratteristiche delle alternative.'),
      copy('Le caratteristiche che non variano dentro un set non sono identificabili: il modello usa solo la variazione interna.'),
    ],
    sections: [
      {
        heading: copy('Coefficienti'),
        bullets: result.coefficients.map(item =>
          copy('{s1}: {s2} (z {s3}, p {s4}).', {
            s1: item.term,
            s2: fmtEst(item.estimate, 3),
            s3: fmtEst(item.z, 2),
            s4: fmtEst(item.p, 3),
          })
        ),
      },
      {
        heading: copy('Adattamento'),
        body: [
          copy('McFadden R²: {s1}; AIC: {s2}; BIC: {s3}.', {
            s1: fmtEst(result.r2, 3),
            s2: fmtEst(result.aic, 2),
            s3: fmtEst(result.bic, 2),
          }),
          copy('Un coefficiente positivo aumenta la probabilità di scelta dell’alternativa con quella caratteristica.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Il modello assume indipendenza dalle alternative irrilevanti (IIA): se un’opzione nuova cambia le quote in modo non proporzionale, il logit condizionale non basta.'),
          copy('I set devono essere costruiti prima di vedere le scelte e contenere alternative reali.'),
        ],
      },
    ],
    limitations: [
      copy('Le quote previste dipendono dal disegno dei set e dalle caratteristiche incluse.'),
    ],
  };
};
