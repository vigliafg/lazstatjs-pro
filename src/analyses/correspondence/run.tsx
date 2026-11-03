import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { correspondenceAnalysis } from '../../stats/kernels/correspondence';
import { correspondenceTables } from '../../stats/tables/correspondence';
import { correspondenceReport } from '../../stats/reports/correspondence';
import type { AnalysisChart } from '../../stats/charts';
import type { CorrespondenceParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CorrespondenceInput {
  params: CorrespondenceParams;
}

const parseTable = (params: CorrespondenceParams): number[][] | null => {
  if (params.rows.length < 2 || params.cols.length < 2) return null;
  if (params.values.length !== params.rows.length) return null;
  const table: number[][] = [];
  for (const row of params.values) {
    if (row.length !== params.cols.length) return null;
    const parsed = row.map(cell => Number.parseFloat(String(cell).replace(',', '.')));
    if (parsed.some(value => !Number.isFinite(value) || value < 0)) return null;
    table.push(parsed);
  }
  return table;
};

export const buildCorrespondenceOutput = ({ params }: CorrespondenceInput): AnalysisRunResult => {
  const table = parseTable(params);
  if (!table) return { ok: false, reason: 'Enter a complete table of non-negative counts' };
  const result = correspondenceAnalysis({
    observed: table,
    rowLabels: params.rows,
    colLabels: params.cols,
  });
  if (!result) return { ok: false, reason: 'Correspondence analysis needs non-empty rows and columns' };

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'correspondence-biplot',
      kind: 'scatter',
      title: copy('Mappa delle corrispondenze'),
      subtitle: copy('Primi due assi'),
      note: copy('Righe e colonne vicine si attraggono; lontane si respingono rispetto all’indipendenza.'),
      data: {
        points: [
          ...result.rowPrincipal.map((coordinates, index) => ({
            x: coordinates[0] ?? 0,
            y: coordinates[1] ?? 0,
            label: result.rows[index] ?? `R${index + 1}`,
            series: copy('Righe'),
          })),
          ...result.colPrincipal.map((coordinates, index) => ({
            x: coordinates[0] ?? 0,
            y: coordinates[1] ?? 0,
            label: result.cols[index] ?? `C${index + 1}`,
            series: copy('Colonne'),
          })),
        ],
      },
      fields: { xLabel: copy('Asse 1'), yLabel: copy('Asse 2') },
      options: { showLabels: true, showFit: false } as never,
    }),
    makeChart({
      id: 'correspondence-residual-heatmap',
      kind: 'heatmap',
      title: copy('Residui standardizzati'),
      subtitle: copy('(O − E) / √E'),
      note: copy('Residui grandi in valore assoluto indicano celle che si allontanano dall’indipendenza.'),
      data: {
        cells: result.residuals.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => ({
            x: result.cols[columnIndex] ?? `C${columnIndex + 1}`,
            y: result.rows[rowIndex] ?? `R${rowIndex + 1}`,
            value,
            label: value.toFixed(2),
          }))
        ),
      },
      fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
      options: { showValues: true, diverging: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Analisi delle corrispondenze'),
    header: copy('{s1} righe · {s2} colonne · inerzia {s3}', {
      s1: result.rows.length,
      s2: result.cols.length,
      s3: result.totalInertia.toFixed(3),
    }),
    tables: correspondenceTables(result),
    report: correspondenceReport(result),
    charts,
  };
};
