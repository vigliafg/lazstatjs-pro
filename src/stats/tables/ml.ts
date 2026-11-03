import { copy } from '../reportCopy';
import type { MlResult } from '../w9Results';
import type { TableSpec } from '../types';

export const mlTables = (result: MlResult, variableNames: readonly string[]): TableSpec[] => {
  const fit: TableSpec = {
    id: 'ml-fit',
    title: copy('Prestazioni del modello'),
    subtitle: copy('Misure calcolate sui dati usati per l’addestramento'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: 'R²', value: result.r2 },
      { measure: 'RMSE', value: result.rmse },
      { measure: 'MAE', value: result.mae },
      { measure: copy('R² out-of-bag'), value: result.oobR2 ?? NaN },
      { measure: copy('RMSE out-of-bag'), value: result.oobRmse ?? NaN },
      { measure: copy('Osservazioni'), value: String(result.n) },
      { measure: copy('Predittori'), value: String(result.p) },
      { measure: copy('Alberi'), value: String(result.trees) },
    ],
  };
  const importance: TableSpec = {
    id: 'ml-importance',
    title: copy('Importanza delle variabili'),
    subtitle: copy('Riduzione di impurità attribuita a ciascun predittore'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'reduction', label: copy('Riduzione'), format: 'dec2', align: 'right' },
      { key: 'pct', label: copy('Quota %'), format: 'dec1', align: 'right' },
    ],
    rows: result.importance.map(item => ({
      variable: variableNames[item.variable] ?? `X${item.variable + 1}`,
      reduction: item.reduction,
      pct: item.pct,
    })),
  };
  const predictions: TableSpec = {
    id: 'ml-predictions',
    title: copy('Predizioni e residui'),
    subtitle: copy('Prime osservazioni in ordine di riga'),
    columns: [
      { key: 'row', label: copy('Riga'), format: 'int', align: 'right' },
      { key: 'predicted', label: copy('Predizione'), format: 'dec3', align: 'right' },
      { key: 'residual', label: copy('Residuo'), format: 'dec3', align: 'right' },
    ],
    rows: result.predictions.slice(0, 30).map((predicted, index) => ({
      row: index + 1,
      predicted,
      residual: result.residuals[index],
    })),
  };
  return [fit, importance, predictions];
};
