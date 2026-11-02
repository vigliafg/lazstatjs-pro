import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { ReportSpec } from '../report';
import type { ClusterResult } from '../analysisResults';

/** Reading report for hierarchical clustering. */
export const clusterReport = (
  result: ClusterResult,
  variableNames: string[],
  rowCount: number
): ReportSpec => {
  const sizes = Array.from({ length: result.k }, (_, cluster) =>
    result.assignment.filter(value => value === cluster).length
  );
  const smallest = sizes.length > 0 ? Math.min(...sizes) : 0;
  return {
    id: 'cluster',
    title: copy('Report di lettura — Analisi cluster'),
    headline: copy('{s1} cluster su {s2} osservazioni; il più piccolo contiene {s3} casi.', {
      s1: result.k,
      s2: rowCount,
      s3: smallest,
    }),
    badge: copy('{s1} cluster', { s1: result.k }),
    tone: smallest < 3 ? 'caution' : 'neutral',
    intro: [
      copy('Il clustering raggruppa le osservazioni in base alla loro somiglianza su più variabili: non esiste un gruppo “vero” da scoprire, ma una struttura utile da descrivere.'),
      copy('Il dendrogramma mostra l’ordine delle fusioni: più alta è l’unione, più diversi erano i gruppi che si sono uniti.'),
    ],
    sections: [
      {
        heading: copy('La struttura trovata'),
        bullets: sizes.map((size, cluster) =>
          copy('Cluster {s1}: {s2} osservazioni.', { s1: cluster + 1, s2: size })
        ),
      },
      {
        heading: copy('Come leggere i profili'),
        body: [
          copy('Le medie standardizzate dei cluster mostrano quali variabili distinguono un gruppo dagli altri: valori sopra zero indicano una media più alta della media generale, valori sotto zero una media più bassa.'),
        ],
        bullets: result.profiles.slice(0, 4).map((profile, cluster) => {
          const strongest = profile
            .map((value, index) => ({ value, name: variableNames[index] ?? `V${index + 1}` }))
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
          return strongest
            ? copy('Cluster {s1}: variabile più caratterizzante {s2} ({s3}).', {
                s1: cluster + 1,
                s2: strongest.name,
                s3: fmtEst(strongest.value, 2),
              })
            : copy('Cluster {s1}: profilo piatto.', { s1: cluster + 1 });
        }),
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Il numero di cluster è una scelta dell’analista: tagli diversi del dendrogramma producono gruppi diversi e ugualmente validi.'),
          copy('Le distanze dipendono dalla scala delle variabili: con unità diverse conviene standardizzare, come fa questa analisi quando l’opzione è attiva.'),
        ],
      },
    ],
    limitations: [
      copy('Il clustering non è un test di ipotesi: non c’è un p-value che stabilisca se i gruppi esistono. La stabilità va valutata su campioni o metodi diversi.'),
    ],
  };
};
