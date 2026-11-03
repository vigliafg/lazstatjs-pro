import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { CorrespondenceResult } from '../correspondence/types';
import type { ReportSpec } from '../report';

export const correspondenceReport = (result: CorrespondenceResult): ReportSpec => {
  const first = result.axes[0];
  return {
    id: 'correspondence',
    title: copy('Report di lettura — Analisi delle corrispondenze'),
    headline: copy('Il primo asse spiega il {s1}% dell’inerzia; χ² = {s2} con p = {s3}.', {
      s1: fmtEst(first?.inertiaPct ?? 0, 1),
      s2: fmtEst(result.chi2, 2),
      s3: fmtEst(result.p, 3),
    }),
    badge: copy('{s1} assi', { s1: result.axes.length }),
    tone: result.p > 0.05 ? 'caution' : 'neutral',
    intro: [
      copy('L’analisi delle corrispondenze rappresenta le righe e le colonne di una tabella in uno spazio comune: modalità vicine compaiono insieme più spesso di quanto l’indipendenza preveda.'),
      copy('L’inerzia totale è la parte di variabilità della tabella che gli assi provano a spiegare; ogni asse ne cattura una quota.'),
    ],
    sections: [
      {
        heading: copy('Come leggere la mappa'),
        body: [
          copy('Distanza tra una riga e una colonna: attrazione o repulsione rispetto all’indipendenza. Distanza tra due righe (o due colonne): profili simili.'),
          copy('Le masse dicono quanto una modalità pesa; i contributi dicono quanto una modalità costruisce un asse; il cos² dice quanto un asse rappresenta bene quella modalità.'),
        ],
      },
      {
        heading: copy('Quanti assi guardare'),
        body: [
          copy('Di solito si interpretano i primi due assi, se insieme spiegano una quota ragionevole dell’inerzia.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La mappa è una sintesi: non sostituisce l’esame della tabella e dei residui, soprattutto con celle piccole.'),
        ],
      },
    ],
    limitations: [
      copy('L’analisi descrive associazione tra categorie, non un rapporto causale.'),
    ],
  };
};
