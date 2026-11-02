import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { hierarchicalClusters } from '../../stats/kernels/cluster';
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

  const result = hierarchicalClusters({
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

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'cluster-dendrogram',
      kind: 'dendrogram',
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
