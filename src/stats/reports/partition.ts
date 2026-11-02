import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import { tableById } from './shared';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { PartitionModel } from '../analysisResults';

/** Reading report for a regression partition tree. */
export const partitionReport = (
  tables: TableSpec[],
  model: PartitionModel,
  responseName: string,
  variableNames: string[]
): ReportSpec => {
  const top = model.importance.find(entry => entry.reduction > 0);
  const topName = top ? variableNames[top.variable] ?? `X${top.variable + 1}` : '';
  const leaves = tableById(tables, 'partition-leaves')?.rows ?? [];
  const spread = leaves.reduce((max, row) => {
    const mean = Number(row.mean);
    return Number.isFinite(mean) ? Math.max(max, Math.abs(mean)) : max;
  }, 0);
  const tone = model.r2 >= 0.5 ? 'positive' : model.r2 >= 0.2 ? 'caution' : 'neutral';

  return {
    id: 'partition',
    title: copy('Report di lettura — Partition'),
    headline: top
      ? copy('L’albero spiega {s1} della variabilità di {s2}; la variabile più utile è {s3}.', {
          s1: `${(model.r2 * 100).toFixed(1)}%`,
          s2: responseName,
          s3: topName,
        })
      : copy('Nessuna suddivisione migliora la previsione: l’albero resta una sola foglia.'),
    badge: copy('{s1} foglie', { s1: model.leaves.length }),
    tone,
    intro: [
      copy('La partizione divide le osservazioni in gruppi sempre più omogenei rispetto alla risposta, scegliendo a ogni passo la soglia che riduce di più l’errore quadratico.'),
      copy('Le foglie sono i gruppi finali: la loro media è la previsione per ogni osservazione che arriva fin lì.'),
    ],
    sections: [
      {
        heading: copy('Come leggere l’albero'),
        body: [
          copy('Ogni nodo interno mostra la variabile e la soglia: a sinistra vanno i valori inferiori, a destra quelli uguali o superiori. Il percorso dalla radice alla foglia è la regola di classificazione della risposta.'),
        ],
        bullets: model.leaves
          .slice(0, 6)
          .map((leaf, index) =>
            copy('Foglia {s1}: N = {s2}, media = {s3}.', {
              s1: index + 1,
              s2: leaf.n,
              s3: fmtEst(leaf.mean, 3),
            })
          ),
      },
      {
        heading: copy('Qualità della previsione'),
        bullets: [
          copy('R² = {s1}: quota della variabilità della risposta spiegata dalle foglie.', { s1: fmtEst(model.r2, 3) }),
          copy('RMSE = {s1}: errore tipico nella stessa unità della risposta.', { s1: fmtEst(model.rmse, 3) }),
          copy('La differenza tra le medie delle foglie è {s1}; se è piccola rispetto alla scala della risposta l’albero separa poco.', {
            s1: fmtEst(spread, 3),
          }),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('L’albero è esplorativo: cresce sui dati osservati e può cambiare molto con un campione diverso. Non è un test di ipotesi e non dimostra causalità.'),
          copy('Con molte variabili e pochi casi conviene limitare la profondità e controllare la stabilità con una validazione esterna.'),
        ],
      },
    ],
    limitations: [
      copy('Le soglie sono scelte sui dati disponibili: una validazione su un campione separato è il modo più onesto di stimare l’errore fuori campione.'),
    ],
  };
};
