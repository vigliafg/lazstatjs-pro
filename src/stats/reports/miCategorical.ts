import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { MiStats } from '../mi/types';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

/**
 * Narrative report for the categorical MICE path. The numeric report in
 * `reports/mi.ts` stays unchanged; this one explains pooled proportions and
 * the assumptions/limits that are specific to categorical imputation.
 */
export const miCategoricalReport = (
  tables: TableSpec[],
  stats: MiStats,
  names: string[],
  level: number
): ReportSpec => {
  const variables = stats.categories ?? [];
  const totalMissing = variables.reduce((sum, variable) => sum + variable.missing, 0);
  const maxFmi = variables.reduce(
    (max, variable) =>
      Math.max(max, ...variable.proportions.map(entry => (Number.isFinite(entry.fmi) ? entry.fmi : 0))),
    0
  );
  const rare = variables.flatMap(variable =>
    variable.proportions
      .filter(entry => Number.isFinite(entry.proportion) && entry.proportion < 0.05)
      .map(entry => `${variable.name}: ${entry.category}`)
  );
  const categoryCount = variables.reduce((sum, variable) => sum + variable.categories.length, 0);

  return {
    id: 'mi-categorical',
    title: copy('Report di imputazione multipla categorica'),
    headline: copy('{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.', {
      s1: totalMissing,
      s2: stats.imputations,
      s3: fmtEst(maxFmi, 3),
    }),
    badge: maxFmi > 0.5 ? copy('Molte informazioni mancanti') : copy('Imputazione stabile'),
    tone: maxFmi > 0.5 ? 'caution' : 'neutral',
    intro: [
      copy('Variabili categoriche: {s1}.', { s1: names.join(', ') }),
      copy('Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.', {
        s1: stats.iterations,
      }),
      copy('Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.', {
        s1: categoryCount,
      }),
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          copy('Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.', {
            s1: stats.imputations,
          }),
          copy('Il livello di confidenza delle stime pooled è {s1}%.', { s1: level }),
          copy('Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.'),
          maxFmi > 0.5
            ? copy('Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.')
            : copy('La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.'),
        ],
      },
      {
        heading: 'Assunzione e modello',
        body: [
          copy('Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.'),
          copy('Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.'),
          copy('Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.'),
        ],
      },
      {
        heading: 'Categorie rare',
        body: [
          rare.length > 0
            ? copy('Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.', {
                s1: rare.join(', '),
              })
            : copy('Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.'),
          copy('Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.'),
        ],
      },
    ],
    limitations: [
      copy('L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.'),
      copy('Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.'),
      copy('Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.'),
      copy('Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.'),
      copy('Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.'),
    ],
  };
};
