import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { PartitionModel } from '../kernels/partition';

export interface PartitionTablesOptions {
  model: PartitionModel;
  responseName: string;
  variableNames: string[];
}

/** Summary, split list, leaf report and variable importance. */
export const partitionTables = ({
  model,
  responseName,
  variableNames,
}: PartitionTablesOptions): TableSpec[] => {
  const summary: TableSpec = {
    id: 'partition-summary',
    title: copy('Sintesi dell’albero'),
    subtitle: copy('{s1} · {s2} osservazioni', { s1: responseName, s2: model.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('Foglie'), value: model.leaves.length },
      { metric: copy('Profondità massima'), value: model.depth },
      { metric: copy('R²'), value: fmtEst(model.r2, 3) },
      { metric: copy('RMSE'), value: fmtEst(model.rmse, 3) },
      { metric: copy('Errore assoluto medio'), value: fmtEst(model.mae, 3) },
    ],
  };

  const splits: TableSpec = {
    id: 'partition-splits',
    title: copy('Regole di suddivisione'),
    subtitle: copy('{s1} nodi interni', { s1: model.splits.length }),
    columns: [
      { key: 'depth', label: copy('Livello'), format: 'int', align: 'right' },
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'threshold', label: copy('Soglia'), format: 'dec3', align: 'right' },
      { key: 'n', label: copy('N'), format: 'int', align: 'right' },
      { key: 'improvement', label: copy('Riduzione SSE'), format: 'dec3', align: 'right' },
    ],
    rows: model.splits.map(split => ({
      depth: split.depth + 1,
      variable: variableNames[split.variable] ?? `X${split.variable + 1}`,
      threshold: split.threshold,
      n: split.n,
      improvement: split.improvement,
    })),
  };

  const leaves: TableSpec = {
    id: 'partition-leaves',
    title: copy('Report delle foglie'),
    subtitle: copy('{s1} foglie', { s1: model.leaves.length }),
    columns: [
      { key: 'leaf', label: copy('Foglia'), format: 'int', align: 'right' },
      { key: 'n', label: copy('N'), format: 'int', align: 'right' },
      { key: 'mean', label: copy('Media'), format: 'dec3', align: 'right' },
      { key: 'sd', label: copy('Deviazione standard'), format: 'dec3', align: 'right' },
      { key: 'min', label: copy('Minimo'), format: 'dec3', align: 'right' },
      { key: 'max', label: copy('Massimo'), format: 'dec3', align: 'right' },
    ],
    rows: model.leaves.map((leaf, index) => ({
      leaf: index + 1,
      n: leaf.n,
      mean: leaf.mean,
      sd: leaf.sd,
      min: leaf.min,
      max: leaf.max,
    })),
  };

  const importance: TableSpec = {
    id: 'partition-importance',
    title: copy('Importanza delle variabili'),
    subtitle: copy('Quota della riduzione totale della varianza'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'reduction', label: copy('Riduzione SSE'), format: 'dec3', align: 'right' },
      { key: 'pct', label: copy('Quota (%)'), format: 'dec1', align: 'right' },
    ],
    rows: model.importance.map(entry => ({
      variable: variableNames[entry.variable] ?? `X${entry.variable + 1}`,
      reduction: entry.reduction,
      pct: entry.pct,
    })),
  };

  return [summary, splits, leaves, importance];
};
