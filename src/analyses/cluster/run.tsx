import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { hierarchicalClusters, partitionClusters, silhouetteByCluster } from '../../stats/kernels/cluster';
import { GUARD_LIMITS, guardDimensions, sampleEvenly } from '../../stats/kernels/guards';
import { clusterTables } from '../../stats/tables/cluster';
import { clusterReport } from '../../stats/reports/cluster';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { ClusterParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ClusterInput {
  grid: Dataset;
  params: ClusterParams;
  ciLevel: number;
}

const MAX_ROWS = 120;

/** Hierarchical clustering with dendrogram, cluster means and profiles. */
export const buildClusterOutput = ({ grid, params }: ClusterInput): AnalysisRunResult => {
  const columns = Array.from(new Set(params.selected));
  if (columns.length < 2) {
    return { ok: false, reason: 'Select at least two numeric variables' };
  }
  const rows = grid.rows
    .map((row, index) => ({
      index,
      values: columns.map(column => parseNum(row[column])),
    }))
    .filter(row => row.values.every(Number.isFinite));
  if (rows.length < 4) {
    return {
      ok: false,
      reason: 'Cluster analysis needs at least four complete rows: all selected variables must be numeric',
    };
  }
  // Clustering is quadratic in the number of rows, so the dendrogram always
  // works on a deterministic sample even when the grid is large. The guard is
  // checked on the sample size, not on the full grid.
  const sample = sampleEvenly(rows, MAX_ROWS);
  const guard = guardDimensions(
    { rows: sample.length, columns: columns.length },
    GUARD_LIMITS.quadratic
  );
  if (guard.ok === false) return { ok: false, reason: guard.message };
  const variableNames = columns.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const k = Math.max(2, Math.min(sample.length, params.clusters || 3));

  const partitioned = params.method === 'kmeans' || params.method === 'kmedians';
  const result =
    params.method === 'kmeans' || params.method === 'kmedians'
      ? partitionClusters({
          data: sample.map(row => row.values),
          k,
          method: params.method,
          standardize: params.standardize,
          variableNames,
        })
      : hierarchicalClusters({
          data: sample.map(row => row.values),
          method: params.method,
          clusters: k,
          standardize: params.standardize,
          variableNames,
        });
  if (!result) {
    return {
      ok: false,
      reason: 'Clusters could not be built: check constant variables and complete rows',
    };
  }

  const rowLabels = sample.map(row => `Riga ${row.index + 1}`);
  const tables = clusterTables({ result, variableNames, rowLabels });
  const profileRows = result.profiles.flatMap((profile, cluster) =>
    profile.map((value, index) => ({
      x: variableNames[index] ?? `V${index + 1}`,
      y: value,
      series: `C${cluster + 1}`,
    }))
  );
  const sizes = Array.from({ length: result.k }, (_, cluster) => ({
    category: `C${cluster + 1}`,
    value: result.assignment.filter(value => value === cluster).length,
  }));
  // The kernel standardises internally with the same n - 1 deviation; the two
  // plots below need those values, so they are recomputed here instead of
  // exposing a second field on ClusterResult.
  const working = (() => {
    if (!params.standardize) return sample.map(row => row.values);
    const width = columns.length;
    const centres = Array.from({ length: width }, (_, column) =>
      sample.reduce((sum, row) => sum + row.values[column], 0) / sample.length
    );
    const deviations = Array.from({ length: width }, (_, column) =>
      Math.sqrt(
        sample.reduce((sum, row) => sum + Math.pow(row.values[column] - centres[column], 2), 0) /
          Math.max(1, sample.length - 1)
      )
    );
    return sample.map(row =>
      row.values.map((value, column) =>
        deviations[column] > 0 ? (value - centres[column]) / deviations[column] : 0
      )
    );
  })();
  const silhouettes = silhouetteByCluster(working, result.assignment, result.k);
  const clusterPoints = working.map((values, index) => ({
    x: values[0],
    y: values[1] ?? 0,
    group: `C${result.assignment[index] + 1}`,
  }));

  const charts: AnalysisChart[] = [
    ...(partitioned
      ? []
      : [
          makeChart({
            id: 'cluster-dendrogram',
            kind: 'dendrogram' as const,
            title: copy('Dendrogramma'),
            subtitle: copy('{s1} osservazioni · {s2} cluster', { s1: sample.length, s2: result.k }),
            note: copy('Ogni linea unisce due gruppi alla distanza a cui sono stati fusi: più in alto è l’unione, più diversi erano i gruppi. Il taglio orizzontale definisce il numero di cluster.'),
            data: {
              links: result.links,
              leaves: result.leaves,
            },
            fields: { xLabel: copy('Osservazioni'), yLabel: copy('Distanza') },
            options: { showLabels: true, showHeights: false } as never,
          }),
        ]),
    makeChart({
      id: 'cluster-profile',
      kind: 'line',
      title: copy('Profili dei cluster'),
      subtitle: copy('Medie standardizzate per variabile'),
      note: copy('Ogni linea è un cluster: i valori sopra zero indicano una media più alta della media generale, quelli sotto zero una media più bassa. Serve a capire quali variabili distinguono i gruppi.'),
      data: { series: profileRows },
      fields: {
        xLabel: copy('Variabile'),
        yLabel: copy('Profilo standardizzato'),
        series: copy('Cluster'),
        xType: 'nominal',
      },
      options: { showMarkers: true, showBand: false } as never,
    }),
    ...(silhouettes.length > 0
      ? [
          makeChart({
            id: 'cluster-silhouette',
            kind: 'bar',
            title: copy('Silhouette media per cluster'),
            subtitle: copy('Valori sopra 0,5 indicano cluster ben separati'),
            note: copy(
              'La silhouette confronta la distanza media dentro il cluster con quella verso il cluster più vicino: valori vicini a 1 indicano gruppi compatti e separati, valori vicini a 0 o negativi indicano confini ambigui.'
            ),
            data: { bars: silhouettes.map((value, cluster) => ({ category: `C${cluster + 1}`, value })) },
            fields: { xLabel: copy('Cluster'), yLabel: copy('Silhouette media') },
            options: { valueLabels: true, referenceLine: 'none' } as never,
          }),
        ]
      : []),
    makeChart({
      id: 'cluster-scatter',
      kind: 'scatter',
      title: copy('Cluster nelle prime due variabili'),
      subtitle: params.standardize ? copy('Variabili standardizzate') : copy('Variabili originali'),
      note: copy(
        'Non è una PCA: gli assi sono le prime due variabili selezionate (standardizzate se richiesto) e il colore è il cluster assegnato. Serve a vedere la separazione, non a ridurre la dimensionalità.'
      ),
      data: { points: clusterPoints },
      fields: { xLabel: variableNames[0], yLabel: variableNames[1] ?? 'V2', series: copy('Cluster') },
      options: { fit: 'none', band: 'none', showPoints: true } as never,
    }),
    makeChart({
      id: 'cluster-sizes',
      kind: 'bar',
      title: copy('Dimensione dei cluster'),
      subtitle: copy('{s1} cluster', { s1: result.k }),
      note: copy('Un cluster molto piccolo può essere un gruppo reale oppure un insieme di casi anomali: va esaminato prima di interpretarlo.'),
      data: { bars: sizes },
      fields: { xLabel: copy('Cluster'), yLabel: copy('Osservazioni') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Analisi cluster'),
    header: copy('{s1} variabili · {s2} osservazioni · legame {s3}', {
      s1: variableNames.length,
      s2: sample.length,
      s3: params.method,
    }),
    tables,
    report: clusterReport(result, variableNames, sample.length),
    charts,
  };
};
