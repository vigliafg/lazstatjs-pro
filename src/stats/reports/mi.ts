import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { MiStats } from '../mi/types';
import type { TableSpec } from '../types';

export const miReport = (tables: TableSpec[], stats: MiStats, names: string[], level: number): ReportSpec => {
  const totalMissing = stats.variables.reduce((sum, variable) => sum + variable.missing, 0);
  const maxFmi = stats.variables.reduce((max, variable) => Math.max(max, variable.fmi), 0);
  return {
    id: 'mi',
    title: copy('Report di imputazione multipla'),
    headline: copy('{s1} celle imputate con {s2} dataset; FMI massimo {s3}.', { s1: totalMissing, s2: stats.imputations, s3: fmtEst(maxFmi, 3) }),
    badge: maxFmi > 0.5 ? copy('Molte informazioni mancanti') : copy('Imputazione stabile'),
    tone: maxFmi > 0.5 ? 'caution' : 'neutral',
    intro: [
      copy('Variabili: {s1}.', { s1: names.join(', ') }),
      copy('Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.', { s1: stats.iterations }),
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          copy('Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.'),
          maxFmi > 0.5
            ? copy('Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.')
            : copy('La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.'),
          copy('Il livello di confidenza delle stime pooled è {s1}%.', { s1: level }),
          stats.regression
            ? copy('Modello lineare pooled: R² medio = {s1} su {s2} predittori.', { s1: fmtEst(stats.regression.r2, 3), s2: stats.regression.coefficients.length - 1 })
            : copy('Nessun modello di regressione pooled richiesto.'),
        ],
      },
    ],
    limitations: [
      copy('L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.'),
      copy('Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.'),
      copy('Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.'),
    ],
  };
};
