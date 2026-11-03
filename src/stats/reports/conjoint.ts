import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ConjointResult } from '../conjoint/types';
import type { ReportSpec } from '../report';

export const conjointReport = (result: ConjointResult): ReportSpec => {
  const top = [...result.attributes].sort((a, b) => b.importance - a.importance)[0];
  const best = [...result.levels].sort((a, b) => b.utility - a.utility)[0];
  return {
    id: 'conjoint',
    title: copy('Report di lettura — Analisi congiunta'),
    headline: top
      ? copy('L’attributo più importante è {s1} ({s2}%); il livello preferito è {s3}.', {
          s1: top.attribute,
          s2: fmtEst(top.importance, 1),
          s3: best ? `${best.attribute}: ${best.level}` : '—',
        })
      : copy('Nessun attributo disponibile.'),
    badge: copy('R² {s1}', { s1: fmtEst(result.r2, 2) }),
    tone: result.r2 >= 0.3 ? 'neutral' : 'caution',
    intro: [
      copy('L’analisi congiunta scompone la valutazione di un profilo nelle utilità dei singoli livelli: permette di capire quali caratteristiche pesano di più.'),
      copy('Le utilità sono relative all’interno di ogni attributo: quella del livello di riferimento è meno la somma delle altre.'),
    ],
    sections: [
      {
        heading: copy('Preferenze'),
        bullets: result.attributes.map(item =>
          copy('{s1}: importanza {s2}%.', {
            s1: item.attribute,
            s2: fmtEst(item.importance, 1),
          })
        ),
      },
      {
        heading: copy('Come leggere le utilità'),
        body: [
          copy('La differenza tra il livello con utilità più alta e quello con utilità più bassa è l’ampiezza dell’attributo; l’importanza è la sua quota sul totale delle ampiezze.'),
          copy('Utilità positive indicano livelli preferiti rispetto alla media dell’attributo, quelle negative livelli meno preferiti.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Il modello è additivo: non stima interazioni tra attributi.'),
          copy('Le valutazioni dipendono dai profili mostrati e dalla scala di risposta usata.'),
        ],
      },
    ],
    limitations: [
      copy('L’analisi congiunta descrive preferenze dichiarate, non scelte reali di acquisto.'),
    ],
  };
};
