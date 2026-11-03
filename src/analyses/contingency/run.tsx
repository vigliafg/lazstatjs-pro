import {
  cochranArmitageTrend,
  exactContingency,
  mantelHaenszel,
} from '../../stats/kernels/contingency';
import {
  contingencyReport,
  contingencyTables,
  contingencyExactReport,
  contingencyMantelHaenszelReport,
  contingencyTrendReport,
  exactTables,
  mantelHaenszelTables,
  trendTables,
} from '../../stats/contingency';
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

const parseCount = (value: string | undefined): number =>
  Number.parseInt(value ?? '0', 10) || 0;

const parseTable = (values: string[][]): number[][] =>
  values.map(row => row.map(cell => parseCount(cell)));

const hasNegative = (observed: number[][]): boolean =>
  observed.some(row => row.some(value => value < 0));

/** Chi-quadro / Fisher / Monte Carlo su una tabella R×C. */
const buildChi2Output = ({ params, ciLevel }: ContingencyInput): AnalysisRunResult => {
  const observed = parseTable(params.values);
  if (hasNegative(observed)) {
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

const buildMantelHaenszelOutput = ({ params, ciLevel }: ContingencyInput): AnalysisRunResult => {
  const strata = params.strata.map((stratum, index) => ({
    label: stratum.label?.trim() || `${copy('Strato')} ${index + 1}`,
    observed: [0, 1].map(row =>
      [0, 1].map(column => parseCount(stratum.values[row]?.[column]))
    ),
  }));
  if (strata.some(stratum => hasNegative(stratum.observed))) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }

  const result = mantelHaenszel(strata, { correct: true, level: ciLevel });
  if (!result) {
    return { ok: false, reason: 'At least one stratum needs a positive total' };
  }

  const tables = mantelHaenszelTables(result, ciLevel);
  const points = result.strata.map(stratum => ({
    label: stratum.label,
    estimate: stratum.logOddsRatio,
    lo: stratum.lo,
    hi: stratum.hi,
  }));
  points.push({
    label: copy('MH pooled'),
    estimate: result.logOddsRatio,
    lo: result.lo,
    hi: result.hi,
  });

  const chart = makeChart({
    id: 'contingency-mh-forest',
    kind: 'forest',
    title: copy('Log odds ratio per strato'),
    subtitle: copy('{s1} strati · IC {s2}%', { s1: result.usedStrata, s2: ciLevel }),
    note: copy('Punto: log-OR dello strato o pooled. Segmento: intervallo di confidenza. Linea tratteggiata: log-OR = 0, cioè nessuna associazione.'),
    data: { points },
    fields: { xLabel: copy('Log odds ratio'), yLabel: copy('Strato') },
    options: { logScale: false, reference: 'zero', sort: 'none' } as never,
  });

  return {
    ok: true,
    title: copy('Mantel–Haenszel · {s1} strati', { s1: result.usedStrata }),
    tables,
    report: contingencyMantelHaenszelReport(tables, ciLevel),
    charts: [chart],
  };
};

const buildTrendOutput = ({ params, ciLevel }: ContingencyInput): AnalysisRunResult => {
  // The trend editor works on the first two columns only: extra columns of the
  // main table are ignored instead of rejecting an otherwise valid R×2 setup.
  const observed = parseTable(params.values).map(row => row.slice(0, 2));
  if (hasNegative(observed)) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  if (observed.length < 2 || observed[0]?.length !== 2) {
    return { ok: false, reason: 'The trend test needs an R×2 table' };
  }
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  if (rowTotals.some(total => total <= 0)) {
    return { ok: false, reason: 'Every row needs at least one observation' };
  }
  const scores =
    params.scores.length === observed.length
      ? params.scores.map(Number)
      : observed.map((_, index) => index + 1);
  if (scores.some(value => !Number.isFinite(value))) {
    return { ok: false, reason: 'Every row needs a finite trend score' };
  }

  const result = cochranArmitageTrend(observed, scores);
  if (!result) {
    return { ok: false, reason: 'The trend test needs an R×2 table and one score per row' };
  }

  const tables = trendTables(result, params.rows, params.cols);
  const series = result.rows
    .map((row, index) => ({
      x: result.scores[index],
      y: row.proportion,
      series: copy('Proporzione'),
    }))
    .sort((a, b) => a.x - b.x);

  const chart = makeChart({
    id: 'contingency-trend-line',
    kind: 'line',
    title: copy('Proporzione per punteggio'),
    subtitle: copy('{s1} righe ordinate per punteggio', { s1: observed.length }),
    note: copy(
      'Ogni punto è la proporzione della prima colonna sul totale di riga; la linea collega i punteggi in ordine crescente. Qui non c’è una banda di confidenza: il test di Cochran–Armitage verifica il trend con una statistica complessiva e non stima l’incertezza di ogni riga.'
    ),
    data: { series },
    fields: { xLabel: copy('Punteggio'), yLabel: copy('Proporzione'), series: copy('Serie') },
    options: { showMarkers: true, step: false, showBand: false } as never,
  });

  return {
    ok: true,
    title: copy('Trend di Cochran–Armitage · {s1} × 2', { s1: observed.length }),
    tables,
    report: contingencyTrendReport(tables, ciLevel),
    charts: [chart],
  };
};

const buildExactOutput = ({ params, ciLevel }: ContingencyInput): AnalysisRunResult => {
  const observed = parseTable(params.values);
  if (hasNegative(observed)) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  if (observed.flat().reduce((sum, value) => sum + value, 0) === 0) {
    return { ok: false, reason: 'The grand total cannot be zero' };
  }
  if (observed.length < 2 || (observed[0]?.length ?? 0) < 2) {
    return { ok: false, reason: 'The exact test needs at least a 2×2 table' };
  }
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = observed[0].map((_, column) =>
    observed.reduce((sum, row) => sum + row[column], 0)
  );
  if (rowTotals.some(total => total <= 0) || colTotals.some(total => total <= 0)) {
    return { ok: false, reason: 'Every row and every column needs at least one observation' };
  }

  const result = exactContingency(observed, {
    simulations: 10000,
    seed: 20240517,
    budget: 200000,
  });
  if (result.method === 'unavailable') {
    return { ok: false, reason: result.reason ?? 'The exact p-value is not available' };
  }

  const tables = exactTables(result, observed.length, observed[0].length, ciLevel);
  const total = rowTotals.reduce((sum, value) => sum + value, 0);
  const cells = observed.flatMap((row, i) =>
    row.map((value, j) => {
      const expected = (rowTotals[i] * colTotals[j]) / total;
      const residual = expected > 0 ? (value - expected) / Math.sqrt(expected) : 0;
      return {
        x: params.cols[j] ?? `C${j + 1}`,
        y: params.rows[i] ?? `R${i + 1}`,
        value: residual,
        label: residual.toFixed(2),
      };
    })
  );

  const expectedBars = observed.flatMap((row, i) =>
    row.flatMap((value, j) => {
      const expected = (rowTotals[i] * colTotals[j]) / total;
      const cell = `${params.rows[i] ?? `R${i + 1}`} · ${params.cols[j] ?? `C${j + 1}`}`;
      return [
        { category: cell, value, series: copy('Osservato') },
        { category: cell, value: expected, series: copy('Atteso') },
      ];
    })
  );

  const chart = makeChart({
    id: 'contingency-exact-residuals',
    kind: 'heatmap',
    title: copy('Residui standardizzati (test esatto)'),
    subtitle: copy('Osservato − atteso, diviso per la radice dell’atteso'),
    note: copy('Il colore mostra quali celle si discostano di più dall’indipendenza; il test esatto misura quanto l’intera tabella è compatibile con i margini osservati.'),
    data: { cells },
    fields: { xLabel: copy('Colonna'), yLabel: copy('Riga') },
    options: { showValues: true, diverging: true } as never,
  });

  return {
    ok: true,
    title: copy('Test esatto {s1} × {s2}', { s1: observed.length, s2: observed[0].length }),
    tables,
    report: contingencyExactReport(tables, ciLevel),
    charts: [
      chart,
      makeChart({
        id: 'exact-observed-expected',
        kind: 'bar',
        title: copy('Osservati vs attesi (test esatto)'),
        subtitle: copy('{s1} celle · {s2} osservazioni', {
          s1: observed.length * (observed[0]?.length ?? 0),
          s2: total,
        }),
        note: copy(
          'Le barre affiancate confrontano ogni cella con la frequenza attesa sotto indipendenza: gli scarti grandi sono quelli che pesano nel p-value esatto. Il test esatto non usa l’approssimazione χ², quindi il grafico va letto insieme alla tabella dei residui.'
        ),
        data: { bars: expectedBars },
        fields: { xLabel: copy('Cella'), yLabel: copy('Frequenza'), series: copy('Tipo') },
        options: { grouping: 'grouped', valueLabels: true } as never,
      }),
    ],
  };
};

/** Contingency runner: Pearson χ² (default), Mantel–Haenszel, trend or exact. */
export const buildContingencyOutput = (input: ContingencyInput): AnalysisRunResult => {
  switch (input.params.mode) {
    case 'mantelHaenszel':
      return buildMantelHaenszelOutput(input);
    case 'trend':
      return buildTrendOutput(input);
    case 'exact':
      return buildExactOutput(input);
    default:
      return buildChi2Output(input);
  }
};
