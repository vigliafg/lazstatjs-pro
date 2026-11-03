import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { ClusterResult } from '../kernels/cluster';

export interface ClusterTablesOptions {
  result: ClusterResult;
  variableNames: string[];
  rowLabels: string[];
}

/** Merge sequence, cluster means and membership. */
export const clusterTables = ({
  result,
  variableNames,
  rowLabels,
}: ClusterTablesOptions): TableSpec[] => {
  const merges: TableSpec = {
    id: 'cluster-merges',
    title: copy('Sequenza di fusione'),
    subtitle: copy('{s1} passi', { s1: result.merges.length }),
    columns: [
      { key: 'step', label: copy('Passo'), format: 'int', align: 'right' },
      { key: 'left', label: copy('Gruppo sinistro'), align: 'left' },
      { key: 'right', label: copy('Gruppo destro'), align: 'left' },
      { key: 'height', label: copy('Distanza'), format: 'dec3', align: 'right' },
      { key: 'size', label: copy('Dimensione'), format: 'int', align: 'right' },
    ],
    rows: result.merges.map((merge, index) => ({
      step: index + 1,
      left: merge.left < rowLabels.length ? rowLabels[merge.left] : `C${merge.left + 1}`,
      right: merge.right < rowLabels.length ? rowLabels[merge.right] : `C${merge.right + 1}`,
      height: merge.height,
      size: merge.size,
    })),
  };

  const partition: TableSpec | null = result.method
    ? {
        id: 'cluster-fit',
        title: copy('Qualità della partizione'),
        subtitle: copy('{s1} cluster', { s1: result.k }),
        columns: [
          { key: 'measure', label: copy('Misura'), align: 'left' },
          { key: 'value', label: copy('Valore'), format: 'dec3', align: 'right' },
        ],
        rows: [
          {
            measure: result.method === 'kmeans' ? copy('Somma dei quadrati entro i cluster') : copy('Scostamento assoluto entro i cluster'),
            value: result.objective ?? 0,
          },
          { measure: copy('Silhouette media'), value: result.silhouette ?? 0 },
          { measure: copy('Iterazioni'), value: result.iterations ?? 0 },
        ],
      }
    : null;

  const means: TableSpec = {
    id: 'cluster-means',
    title: copy('Medie dei cluster'),
    subtitle: copy('{s1} cluster', { s1: result.k }),
    columns: [
      { key: 'cluster', label: copy('Cluster'), align: 'left' },
      { key: 'n', label: copy('N'), format: 'int', align: 'right' },
      ...variableNames.map((name, index) => ({
        key: `v${index}`,
        label: name,
        format: 'dec3' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.centers.map((center, cluster) => ({
      cluster: `C${cluster + 1}`,
      n: result.assignment.filter(value => value === cluster).length,
      ...Object.fromEntries(center.map((value, index) => [`v${index}`, value])),
    })),
  };

  const membership: TableSpec = {
    id: 'cluster-membership',
    title: copy('Assegnazione dei casi'),
    subtitle: copy('{s1} osservazioni', { s1: result.assignment.length }),
    columns: [
      { key: 'row', label: copy('Riga'), align: 'left' },
      { key: 'cluster', label: copy('Cluster'), align: 'left' },
    ],
    rows: result.assignment.map((cluster, index) => ({
      row: rowLabels[index] ?? `Riga ${index + 1}`,
      cluster: `C${cluster + 1}`,
    })),
  };

  return partition ? [means, partition, membership] : [means, merges, membership];
};

export const clusterDistanceSummary = (result: ClusterResult): string =>
  copy('Distanza massima {s1}', { s1: fmtEst(Math.max(0, ...result.heights), 3) });
