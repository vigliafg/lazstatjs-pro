import { fmtEst } from '../format';
import type { ReportSpec } from '../report';
import type { MiStats } from '../mi/types';
import type { TableSpec } from '../types';

export const miReport = (tables: TableSpec[], stats: MiStats, names: string[], level: number): ReportSpec => {
  const totalMissing = stats.variables.reduce((sum, variable) => sum + variable.missing, 0);
  const maxFmi = stats.variables.reduce((max, variable) => Math.max(max, variable.fmi), 0);
  return {
    id: 'mi',
    title: 'Report di imputazione multipla',
    headline: `${totalMissing} celle imputate con ${stats.imputations} dataset; FMI massimo ${fmtEst(maxFmi, 3)}.`,
    badge: maxFmi > 0.5 ? 'Molte informazioni mancanti' : 'Imputazione stabile',
    tone: maxFmi > 0.5 ? 'caution' : 'neutral',
    intro: [
      `Variabili: ${names.join(', ')}.`,
      `Modello di imputazione: regressione lineare a catene, ${stats.iterations} iterazioni per dataset.`,
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.',
          maxFmi > 0.5
            ? 'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.'
            : 'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.',
          `Il livello di confidenza delle stime pooled è ${level}%.`,
          stats.regression
            ? `Modello lineare pooled: R² medio = ${fmtEst(stats.regression.r2, 3)} su ${stats.regression.coefficients.length - 1} predittori.`
            : 'Nessun modello di regressione pooled richiesto.',
        ],
      },
    ],
    limitations: [
      'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.',
      'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.',
      'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.',
    ],
  };
};
