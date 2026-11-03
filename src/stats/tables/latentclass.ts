import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { LatentClassResult } from '../latentclass/types';
import type { TableSpec } from '../types';

export const latentClassTables = (result: LatentClassResult): TableSpec[] => {
  const fit: TableSpec = {
    id: 'latentclass-fit',
    title: copy('Adattamento del modello'),
    subtitle: copy('{s1} classi · {s2} osservazioni', { s1: result.classes, s2: result.n }),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('Log-verosimiglianza'), value: fmtEst(result.logLik, 3) },
      { measure: copy('Parametri'), value: String(result.parameters) },
      { measure: 'AIC', value: fmtEst(result.aic, 2) },
      { measure: 'BIC', value: fmtEst(result.bic, 2) },
      { measure: copy('Entropia'), value: fmtEst(result.entropy, 3) },
      { measure: copy('Iterazioni'), value: String(result.iterations) },
    ],
  };
  const proportions: TableSpec = {
    id: 'latentclass-proportions',
    title: copy('Dimensione delle classi'),
    columns: [
      { key: 'class', label: copy('Classe'), align: 'left' },
      { key: 'proportion', label: copy('Proporzione'), format: 'dec3', align: 'right' },
      { key: 'count', label: copy('Assegnati'), format: 'int', align: 'right' },
    ],
    rows: result.proportions.map((value, index) => ({
      class: `C${index + 1}`,
      proportion: value,
      count: result.counts[index] ?? 0,
    })),
  };
  const probabilities: TableSpec = {
    id: 'latentclass-probabilities',
    title: copy('Probabilità di risposta per classe'),
    subtitle: copy('Probabilità condizionate di ogni livello'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'level', label: copy('Livello'), align: 'left' },
      ...Array.from({ length: result.classes }, (_, index) => ({
        key: `c${index}`,
        label: `C${index + 1}`,
        format: 'dec3' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.items.flatMap((item, itemIndex) =>
      item.levels.map((level, levelIndex) => ({
        variable: item.variable,
        level,
        ...Object.fromEntries(
          Array.from({ length: result.classes }, (_, cluster) => [
            `c${cluster}`,
            item.probabilities[cluster]?.[levelIndex] ?? 0,
          ])
        ),
        _item: itemIndex,
      }))
    ),
  };
  const assignment: TableSpec = {
    id: 'latentclass-assignment',
    title: copy('Classificazione dei casi'),
    subtitle: copy('Classe più probabile e probabilità a posteriori'),
    columns: [
      { key: 'row', label: copy('Riga'), format: 'int', align: 'right' },
      { key: 'class', label: copy('Classe'), align: 'left' },
      { key: 'posterior', label: copy('Posteriori'), format: 'dec3', align: 'right' },
    ],
    rows: result.posterior.slice(0, 200).map((row, index) => ({
      row: index + 1,
      class: `C${result.predicted[index] + 1}`,
      posterior: row[result.predicted[index]] ?? 0,
    })),
  };
  return [fit, proportions, probabilities, assignment];
};
