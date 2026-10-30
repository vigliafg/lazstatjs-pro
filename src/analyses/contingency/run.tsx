import { contingencyReport, contingencyTables } from '../../stats/contingency';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { mosaicCells } from '../../charts/kits/categorical';
import { eigenSymmetric } from '../../stats/linalg';
import type { ContingencyParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ContingencyInput {
  params: ContingencyParams;
  ciLevel: number;
}

/** Chi-quadro / Fisher / Monte Carlo su una tabella R×C. */
export const buildContingencyOutput = ({
  params,
  ciLevel,
}: ContingencyInput): AnalysisRunResult => {
  const observed = params.values.map(row => row.map(cell => Number.parseInt(cell, 10) || 0));
  if (observed.some(row => row.some(value => value < 0))) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  if (observed.flat().reduce((sum, value) => sum + value, 0) === 0) {
    return { ok: false, reason: 'The grand total cannot be zero' };
  }

  const tables = contingencyTables({
    observed,
    rowLabels: params.rows,
    colLabels: params.cols,
    level: ciLevel,
    exact: params.exact,
    monteCarlo: params.monteCarlo,
  });

  if (tables.length === 0) {
    return { ok: false, reason: 'Every row and every column needs at least one observation' };
  }

  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = observed[0].map((_, column) =>
    observed.reduce((sum, row) => sum + row[column], 0)
  );
  const total = rowTotals.reduce((sum, value) => sum + value, 0);
  const cells = observed.flatMap((row, i) =>
    row.map((value, j) => {
      const expected = total > 0 ? (rowTotals[i] * colTotals[j]) / total : 0;
      const residual = expected > 0 ? (value - expected) / Math.sqrt(expected) : 0;
      return {
        x: params.cols[j] ?? `C${j + 1}`,
        y: params.rows[i] ?? `R${i + 1}`,
        value: residual,
        label: residual.toFixed(2),
      };
    })
  );

  const mosaic = mosaicCells({
    observed,
    rows: params.rows,
    cols: params.cols,
  });
  const association = mosaic.map(cell => ({
    category: `${cell.row} · ${cell.col}`,
    value: Number(cell.residual),
    series:
      Number(cell.residual) >= 0 ? copy('Sopra l’atteso') : copy('Sotto l’atteso'),
  }));
  const standardized = observed.map((row, i) =>
    row.map((value, j) => {
      const expected = total > 0 ? (rowTotals[i] * colTotals[j]) / total : 0;
      return expected > 0 ? (value - expected) / Math.sqrt(expected) : 0;
    })
  );
  const crossProduct = standardized.map((row, i) =>
    standardized.map((_, k) =>
      row.reduce((sum, value, j) => sum + value * standardized[k][j], 0)
    )
  );
  const eigen = eigenSymmetric(crossProduct);
  const order = eigen.values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2);
  const inertia = eigen.values.reduce((sum, value) => sum + Math.max(0, value), 0);
  const caPoints = [
    ...params.rows.map((label, i) => ({
      x: order[0] ? eigen.vectors[i][order[0].index] * Math.sqrt(Math.max(0, order[0].value)) : 0,
      y: order[1] ? eigen.vectors[i][order[1].index] * Math.sqrt(Math.max(0, order[1].value)) : 0,
      label: `${copy('Riga')}: ${label}`,
    })),
    ...params.cols.map((label, j) => ({
      x: order[0]
        ? standardized.reduce(
            (sum, row, i) => sum + row[j] * eigen.vectors[i][order[0].index],
            0
          )
        : 0,
      y: order[1]
        ? standardized.reduce(
            (sum, row, i) => sum + row[j] * eigen.vectors[i][order[1].index],
            0
          )
        : 0,
      label: `${copy('Colonna')}: ${label}`,
    })),
  ];
  const inertiaBars = order.map((entry, index) => ({
    category: copy('Dimensione {s1}', { s1: index + 1 }),
    value: inertia > 0 ? (Math.max(0, entry.value) / inertia) * 100 : 0,
  }));
  const charts = [
    makeChart({
      id: 'contingency-residuals',
      kind: 'heatmap',
      title: copy('Residui standardizzati'),
      subtitle: copy('Osservato − atteso, diviso per la radice dell’atteso'),
      note: copy('Valori positivi indicano celle più frequenti dell’atteso sotto indipendenza; valori negativi meno frequenti.'),
      data: { cells },
      fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
      options: { showValues: true, diverging: true } as never,
    }),
  ];
  if (mosaic.length > 0) {
    charts.push(
      makeChart({
        id: 'contingency-mosaic',
        kind: 'mosaic',
        title: copy('Mosaico della contingenza'),
        subtitle: copy('Ampiezza per totali di riga, larghezza per distribuzione condizionata'),
        note: copy('L’area di ogni cella è proporzionale alla frequenza; il colore mostra il residuo standardizzato.'),
        data: { cells: mosaic },
        fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
        options: { showValues: true, residualColor: true } as never,
      }),
      makeChart({
        id: 'contingency-association',
        kind: 'bar',
        title: copy('Residui di associazione'),
        subtitle: copy('Barre sopra o sotto lo zero'),
        note: copy('La barra è il residuo standardizzato: sopra lo zero la cella è più frequente dell’atteso, sotto lo zero meno frequente.'),
        data: { bars: association },
        fields: { xLabel: copy('Cella'), yLabel: copy('Residuo standardizzato'), series: copy('Direzione') },
        options: { valueLabels: true, referenceLine: 'zero' } as never,
      }),
      makeChart({
        id: 'contingency-ca',
        kind: 'scatter',
        title: copy('Analisi delle corrispondenze'),
        subtitle: copy('Righe e colonne nelle prime due dimensioni'),
        note: copy('Righe e colonne vicine condividono un profilo simile; la distanza dall’origine misura quanto si discostano dal profilo medio.'),
        data: { points: caPoints },
        fields: { xLabel: copy('Dimensione 1'), yLabel: copy('Dimensione 2') },
        options: { fit: 'none', band: 'none', pointLabels: true } as never,
      }),
      makeChart({
        id: 'contingency-ca-inertia',
        kind: 'bar',
        title: copy('Inerzia spiegata'),
        subtitle: copy('Quota di associazione spiegata da ciascuna dimensione'),
        note: copy('Barre più alte indicano dimensioni che riassumono più associazione tra righe e colonne.'),
        data: { bars: inertiaBars },
        fields: { xLabel: copy('Dimensione'), yLabel: copy('Inerzia (%)') },
        options: { valueLabels: true } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Tabella di contingenza {s1} × {s2}', { s1: observed.length, s2: observed[0]?.length ?? 0 }),
    tables,
    report: contingencyReport(tables, ciLevel),
    charts,
  };
};
