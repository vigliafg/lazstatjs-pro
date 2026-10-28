import type { GridData } from '../../grid/types';
import type { LogisticParams } from '../../io/project';

/**
 * Default del pannello per una griglia nuova.
 *
 * Preferisce l'ultima colonna binaria come esito e la prima altra colonna come
 * predittore: è la stessa scelta che faceva il pannello prima di spostare i
 * parametri nell'App. I file `.lzs` ripristinano invece i valori salvati.
 */
export const defaultLogisticParams = (grid: GridData): LogisticParams => {
  let outcome = 0;
  for (let index = grid.cols.length - 1; index >= 0; index--) {
    const levels = new Set(
      grid.rows.map(row => String(row[index] ?? '').trim()).filter(value => value !== '')
    );
    if (levels.size === 2) {
      outcome = index;
      break;
    }
  }
  const predictors = grid.cols
    .map((_, index) => index)
    .filter(index => index !== outcome)
    .slice(0, 1);
  return { outcome, predictors, cutoff: 0.5, penalized: false };
};
