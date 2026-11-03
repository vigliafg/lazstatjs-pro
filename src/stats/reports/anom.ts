import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import { describeP } from './shared';

export interface AnomNames {
  dep: string;
  group: string;
}

export const anomReport = (tables: TableSpec[], names: AnomNames, level: number): ReportSpec => {
  const rows = tables.find(table => table.id === 'anom-table')?.rows ?? [];
  const outside = rows.filter(row => String(row.outside) === copy('Sì')).map(row => String(row.group));
  const intro =
    outside.length === 0
      ? copy('Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.')
      : copy('{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.', {
          s1: outside.length,
          s2: outside.join(', '),
        });

  return {
    id: 'report-anom',
    title: copy('Report di lettura — ANOM'),
    headline: intro,
    badge: copy('Confronto'),
    tone: outside.length === 0 ? 'positive' : 'caution',
    intro: [
      copy('L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.'),
      copy('È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          intro,
          copy('Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.', {
            s1: level,
          }),
          copy('Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.'),
        ],
      },
      {
        heading: copy('Cautele'),
        bullets: [
          copy('Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.'),
          copy('L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.'),
          copy('Con molti gruppi e pochi dati per gruppo la potenza resta bassa.'),
        ],
      },
    ],
    limitations: [
      copy('Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.'),
    ],
  };
};
