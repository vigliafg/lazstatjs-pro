import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { PlsResult } from '../kernels/pls';

export interface PlsTableNames {
  dep: string;
  predictors: string[];
}

/**
 * Tabelle della regressione PLS1.
 *
 * I coefficienti sono sulla scala originale dei predittori, con l'intercetta
 * in prima riga. La tabella dei componenti riporta R² incrementale e cumulato,
 * la quota di varianza X e il Q² della validazione incrociata (assente quando
 * le fold sono zero). La tabella VIP chiude con l'importanza delle variabili.
 */
export const plsTables = (result: PlsResult, names: PlsTableNames): TableSpec[] => {
  const coefficientRows = result.coefficients.map((beta, index) => ({
    predictor: index === 0 ? copy('(Intercept)') : names.predictors[index - 1] ?? `X${index}`,
    beta,
  }));

  const componentRows = result.components.map((component, index) => ({
    component: String(index + 1),
    r2: component.r2,
    cumulativeR2: component.cumulativeR2,
    xVariance: component.xVariance,
    q2: result.q2[index],
  }));

  const vipRows = result.vip.map((vip, index) => ({
    predictor: names.predictors[index] ?? `X${index + 1}`,
    vip,
  }));

  return [
    {
      id: 'pls-coefficients',
      title: copy('Coefficienti PLS'),
      subtitle: copy('{s1} · {s2} predittori · {s3} componenti', {
        s1: names.dep,
        s2: result.p,
        s3: result.components.length,
      }),
      columns: [
        { key: 'predictor', label: copy('Predittore'), format: 'text' },
        { key: 'beta', label: copy('Coefficiente'), format: 'dec4' },
      ],
      rows: coefficientRows,
      notes: [
        copy('β è il coefficiente sulla scala originale del predittore, ottenuto dalla combinazione delle componenti latenti.'),
        copy('L’intercetta riporta il valore atteso di Y quando tutti i predittori valgono zero.'),
      ],
    },
    {
      id: 'pls-components',
      title: copy('Componenti latenti'),
      subtitle: copy('{s1} componenti · R² finale = {s2}', {
        s1: result.components.length,
        s2: fmtEst(result.r2, 4),
      }),
      columns: [
        { key: 'component', label: copy('Componente'), format: 'int' },
        { key: 'r2', label: copy('R²'), format: 'dec4' },
        { key: 'cumulativeR2', label: copy('R² cumulato'), format: 'dec4' },
        { key: 'xVariance', label: copy('Varianza X'), format: 'dec4' },
        { key: 'q2', label: copy('Q²'), format: 'dec4' },
      ],
      rows: componentRows,
      notes: [
        copy('R² è la quota di varianza di Y spiegata dalla singola componente; R² cumulato somma le componenti fino a quella riga.'),
        copy('Varianza X è la quota di variabilità dei predittori assorbita dalla componente; un valore piccolo segnala una componente poco informativa.'),
        copy('Q² è la versione in validazione incrociata di R²: valori negativi indicano che il modello predice peggio della media.'),
      ],
    },
    {
      id: 'pls-vip',
      title: copy('Importanza delle variabili (VIP)'),
      subtitle: copy('{s1} predittori · {s2} componenti', {
        s1: result.p,
        s2: result.components.length,
      }),
      columns: [
        { key: 'predictor', label: copy('Predittore'), format: 'text' },
        { key: 'vip', label: copy('VIP'), format: 'dec4' },
      ],
      rows: vipRows,
      notes: [
        copy('VIP misura quanto ogni predittore contribuisce alle componenti che spiegano Y; valori sopra 1 indicano un contributo superiore alla media.'),
        copy('Il VIP non ha un test di significatività: serve a ordinare le variabili, non a decidere automaticamente quali escludere.'),
      ],
    },
  ];
};
