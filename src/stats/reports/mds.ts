import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { MdsResult } from '../mds/types';
import type { ReportSpec } from '../report';

export const mdsReport = (result: MdsResult): ReportSpec => {
  const quality =
    result.stress < 0.05
      ? copy('ottima')
      : result.stress < 0.1
        ? copy('buona')
        : result.stress < 0.2
          ? copy('accettabile')
          : copy('debole');
  return {
    id: 'mds',
    title: copy('Report di lettura — Scaling multidimensionale'),
    headline: copy('Rappresentazione a {s1} dimensioni con stress {s2} ({s3}).', {
      s1: result.dimensions,
      s2: fmtEst(result.stress, 3),
      s3: quality,
    }),
    badge: copy('{s1} punti', { s1: result.points.length }),
    tone: result.stress < 0.1 ? 'neutral' : 'caution',
    intro: [
      copy('Lo scaling multidimensionale dispone le osservazioni in poche dimensioni cercando di conservare le distanze originali.'),
      copy('Lo stress misura quanto le distanze disegnate si discostano dalle dissimilarità: più è basso, più la mappa è fedele.'),
    ],
    sections: [
      {
        heading: copy('La mappa'),
        body: [
          copy('Vicino sulla mappa significa simile; lontano significa diverso. Gli assi non hanno un significato intrinseco: vanno interpretati guardando quali punti stanno agli estremi.'),
        ],
      },
      {
        heading: copy('Quante dimensioni'),
        body: [
          copy('Aggiungere dimensioni riduce lo stress ma rende la mappa più difficile da leggere. La scelta va fatta bilanciando fedeltà e interpretabilità.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La soluzione è determinata a meno di rotazioni e riflessioni: mappe diverse possono rappresentare la stessa struttura.'),
        ],
      },
    ],
    limitations: [
      copy('Con poche osservazioni lo stress tende a essere basso anche per caso: non usarlo come test di bontà assoluta.'),
    ],
  };
};
