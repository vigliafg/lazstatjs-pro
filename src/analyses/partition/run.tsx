import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { layoutPartitionTree, partitionModel } from '../../stats/kernels/partition';
import { partitionTables } from '../../stats/tables/partition';
import { partitionReport } from '../../stats/reports/partition';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { PartitionParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface PartitionInput {
  grid: Dataset;
  params: PartitionParams;
  ciLevel: number;
}

const truncate = (value: string, max = 26): string =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

/** Regression partition (CART) with tree diagram, leaf report and importance. */
export const buildPartitionOutput = ({
  grid,
  params,
}: PartitionInput): AnalysisRunResult => {
  const { response, predictors, maxDepth, minSplit } = params;
  if (predictors.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (predictors.includes(response)) {
    return { ok: false, reason: 'The response cannot also be a predictor' };
  }

  const unique = Array.from(new Set(predictors));
  const rows = grid.rows
    .map(row => ({
      y: parseNum(row[response]),
      x: unique.map(index => parseNum(row[index])),
    }))
    .filter(row => Number.isFinite(row.y) && row.x.every(Number.isFinite));
  if (rows.length < 8) {
    return {
      ok: false,
      reason: 'Partition needs at least eight complete rows: response and predictors must be numeric',
    };
  }

  const model = partitionModel({
    y: rows.map(row => row.y),
    x: rows.map(row => row.x),
    maxDepth,
    minSplit,
  });
  if (!model) {
    return {
      ok: false,
      reason: 'The tree could not be grown: check constant predictors and complete rows',
    };
  }

  const responseName = grid.cols[response]?.name ?? 'Y';
  const variableNames = unique.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = partitionTables({ model, responseName, variableNames });
  const tree = layoutPartitionTree(model, variableNames);
  const actual = rows.map(row => row.y);
  const min = Math.min(...actual);
  const max = Math.max(...actual);

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'partition-tree',
      kind: 'tree',
      title: copy('Albero di partizione'),
      subtitle: copy('{s1} foglie · R² = {s2}', { s1: model.leaves.length, s2: model.r2.toFixed(3) }),
      note: copy('Ogni riquadro è una regola: a sinistra i valori sotto la soglia, a destra quelli uguali o superiori. Le foglie mostrano la media prevista e il numero di osservazioni.'),
      data: {
        nodes: tree.nodes.map(node => ({
          x: node.x,
          y: node.y,
          label: truncate(node.label),
          value: node.value,
          n: node.n,
          depth: node.depth,
          terminal: node.terminal ? 1 : 0,
        })),
        links: tree.links,
      },
      fields: { xLabel: copy('Nodo'), yLabel: copy('Profondità') },
      options: { showValues: true, showLeaves: true } as never,
    }),
    makeChart({
      id: 'partition-observed',
      kind: 'scatter',
      title: copy('Osservati vs previsti'),
      subtitle: copy('R² = {s1} · RMSE = {s2}', { s1: model.r2.toFixed(3), s2: model.rmse.toFixed(3) }),
      note: copy('I punti vicini alla diagonale sono previsioni accurate; la dispersione verticale è l’errore che l’albero non riesce a spiegare.'),
      data: {
        points: rows.map((row, index) => ({ x: row.y, y: model.predictions[index] })),
        fit: [
          { x: min, y: min },
          { x: max, y: max },
        ],
      },
      fields: { xLabel: copy('Osservato'), yLabel: copy('Previsto') },
      options: { fit: 'none', band: 'none', pointOpacity: 0.55 } as never,
    }),
    makeChart({
      id: 'partition-importance',
      kind: 'bar',
      title: copy('Importanza delle variabili'),
      subtitle: copy('Quota della riduzione totale della varianza'),
      note: copy('La barra somma la riduzione di errore ottenuta da ogni variabile in tutti i nodi in cui è stata usata: non è un coefficiente e non ha segno.'),
      data: {
        bars: model.importance.map(entry => ({
          category: variableNames[entry.variable] ?? `X${entry.variable + 1}`,
          value: entry.pct,
        })),
      },
      fields: { xLabel: copy('Variabile'), yLabel: copy('Importanza (%)') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Partition — albero di regressione'),
    header: copy('Risposta: {s1} · {s2} predittori', { s1: responseName, s2: unique.length }),
    tables,
    report: partitionReport(tables, model, responseName, variableNames),
    charts,
  };
};
