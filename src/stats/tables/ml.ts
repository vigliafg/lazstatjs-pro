import { copy } from '../reportCopy';
import type { MlResult } from '../w9Results';
import type { TableSpec } from '../types';

export const mlTables = (
  result: MlResult,
  variableNames: readonly string[],
  classNames: readonly string[] = []
): TableSpec[] => {
  const fit: TableSpec = {
    id: 'ml-fit',
    title: copy('Prestazioni del modello'),
    subtitle:
      result.task === 'classification'
        ? copy('Misure calcolate sulle classi osservate e predette')
        : copy('Misure calcolate sui dati usati per l’addestramento'),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows:
      result.task === 'classification'
        ? [
            { measure: copy('Accuratezza'), value: result.accuracy },
            { measure: copy('Accuratezza bilanciata'), value: result.balancedAccuracy },
            { measure: copy('Log-loss'), value: result.logLoss },
            { measure: copy('Classi'), value: String(result.classes.length) },
            { measure: copy('Osservazioni'), value: String(result.n) },
            { measure: copy('Predittori'), value: String(result.p) },
            { measure: copy('Alberi'), value: String(result.trees) },
          ]
        : [
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
  if (result.task === 'classification') {
    const confusion: TableSpec = {
      id: 'ml-confusion',
      title: copy('Matrice di confusione'),
      subtitle: copy('Riga: classe osservata; colonna: classe predetta'),
      columns: [
        { key: 'observed', label: copy('Osservata'), align: 'left' },
        ...result.classes.map((label, index) => ({
          key: `c${index}`,
          label,
          format: 'int' as const,
          align: 'right' as const,
        })),
      ],
      rows: result.confusion.map((row, index) => {
        const entry: Record<string, string | number> = {
          observed: result.classes[index] ?? `C${index + 1}`,
        };
        row.forEach((value, column) => {
          entry[`c${column}`] = value;
        });
        return entry;
      }),
    };
    const importance = result.importance.map(item => ({
      variable: variableNames[item.variable] ?? `X${item.variable + 1}`,
      reduction: item.reduction,
      pct: item.pct,
    }));
    return [
      fit,
      confusion,
      {
        id: 'ml-importance',
        title: copy('Importanza delle variabili'),
        subtitle: copy('Media della riduzione di impurità sulle classi'),
        columns: [
          { key: 'variable', label: copy('Variabile'), align: 'left' },
          { key: 'reduction', label: copy('Riduzione'), format: 'dec2', align: 'right' },
          { key: 'pct', label: copy('Quota %'), format: 'dec1', align: 'right' },
        ],
        rows: importance,
      },
    ];
  }
  void classNames;
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
