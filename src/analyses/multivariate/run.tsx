import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import {
  alphaReport,
  alphaTables,
  cronbachAlpha,
  efaReport,
  efaTables,
  exploratoryFactorAnalysis,
  pcaReport,
  pcaTables,
  principalComponents,
} from '../../stats/multivariate';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { MultivariateParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { completeNumericRows } from '../shared/data';

export interface MultivariateInput {
  grid: Dataset;
  params: MultivariateParams;
  ciLevel: number;
}

/** PCA o alpha di Cronbach: tabelle, grafici e report. */
export const buildMultivariateOutput = ({
  grid,
  params,
  ciLevel,
}: MultivariateInput): AnalysisRunResult => {
  const { mode, standardize, selected, factors, rotation } = params;
  const columns = selected.filter(index => isNumericColumn(grid, index));
  const minimum = mode === 'efa' ? 3 : 2;
  if (columns.length < minimum) {
    return {
      ok: false,
      reason:
        mode === 'pca'
          ? 'Select at least two numeric variables'
          : mode === 'efa'
            ? 'Select at least three numeric variables for EFA'
            : 'Select at least two numeric items of the scale',
    };
  }

  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  // Complete-case analysis: PCA and alpha both need every selected value.
  const data = completeNumericRows(grid, columns);

  if (data.length < 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every selected variable must be numeric and present',
    };
  }

  if (mode === 'efa') {
    const result = exploratoryFactorAnalysis({
      data,
      variables: names,
      standardize,
      factors,
      rotation,
    });
    if (!result) {
      return {
        ok: false,
        reason: 'The factor solution could not be estimated: check constant variables and complete rows',
      };
    }
    const tables = efaTables(result, names);
    const factorCount = Math.min(result.factors, result.loadings[0]?.length ?? 0);
    const loadingCells = names.flatMap((name, row) =>
      Array.from({ length: factorCount }, (_, column) => ({
        x: `F${column + 1}`,
        y: name,
        value: result.loadings[row]?.[column] ?? 0,
        label: (result.loadings[row]?.[column] ?? 0).toFixed(2),
      }))
    );
    const parallelSeries = [
      ...result.eigenvalues.map((value, index) => ({
        x: index + 1,
        y: value,
        series: copy('Autovalori osservati'),
      })),
      ...result.parallelThreshold.map((value, index) => ({
        x: index + 1,
        y: value,
        series: copy('Soglia casuale'),
      })),
    ];
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'efa-loadings',
        kind: 'heatmap',
        title: copy('Carichi fattoriali'),
        subtitle: copy('{s1} fattori', { s1: factorCount }),
        note: copy('Carichi alti sulla stessa colonna indicano item che misurano la stessa dimensione; il colore mostra segno e intensità.'),
        data: { cells: loadingCells },
        fields: { xLabel: copy('Fattore'), yLabel: copy('Variabile') },
        options: { showValues: true, diverging: true } as never,
      }),
      makeChart({
        id: 'efa-parallel',
        kind: 'line',
        title: copy('Analisi parallela'),
        subtitle: copy('Autovalori osservati vs soglia generata'),
        note: copy('Una componente è trattenuta quando il suo autovalore supera la soglia casuale; la linea mostra il confronto direttamente.'),
        data: { series: parallelSeries },
        fields: { xLabel: copy('Componente'), yLabel: copy('Autovalore'), series: copy('Serie') },
        options: { showMarkers: true, showBand: false } as never,
      }),
      makeChart({
        id: 'efa-variance',
        kind: 'bar',
        title: copy('Varianza spiegata dai fattori'),
        subtitle: copy('{s1} fattori', { s1: factorCount }),
        note: copy('Le barre sommano la quota di varianza spiegata da ogni fattore dopo la rotazione.'),
        data: {
          bars: result.variancePct.slice(0, factorCount).map((value, index) => ({
            category: `F${index + 1}`,
            value,
          })),
        },
        fields: { xLabel: copy('Fattore'), yLabel: copy('Varianza spiegata (%)') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      }),
      makeChart({
        id: 'efa-communalities',
        kind: 'bar',
        title: copy('Comunalità'),
        subtitle: copy('Quota di varianza spiegata per variabile'),
        note: copy('Una comunalità bassa indica che il fattore comune spiega poco di quella variabile; valori alti indicano una buona rappresentazione.'),
        data: {
          bars: names.map((name, index) => ({
            category: name,
            value: result.communalities[index] ?? 0,
          })),
        },
        fields: { xLabel: copy('Variabile'), yLabel: copy('Comunalità') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      }),
    ];
    return {
      ok: true,
      title: copy('Analisi fattoriale esplorativa'),
      tables,
      report: efaReport(tables, result),
      charts,
    };
  }

  if (mode === 'pca') {
    const result = principalComponents(data, names, standardize);
    if (!result) {
      return {
        ok: false,
        reason: 'The components could not be computed: check constant variables and complete rows',
      };
    }
    const tables = pcaTables(result);
    const scree = result.eigenvalues.map((value, index) => ({
      category: `PC${index + 1}`,
      value: result.variancePct[index],
    }));
    const scoreData = result.scores.map((scores, index) => ({
      x: scores[0],
      y: scores[1] ?? 0,
      label: `Riga ${index + 1}`,
    }));
    const kaiser = 100 / Math.max(1, result.eigenvalues.length);
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'pca-scree',
        kind: 'scree',
        title: copy('Scree plot — varianza spiegata'),
        subtitle: copy('{s1} componenti trattenute', { s1: result.retained }),
        note: copy('Le barre sono la percentuale di varianza spiegata da ogni componente.'),
        data: { bars: scree, rules: [{ value: kaiser }] },
        fields: { xLabel: copy('Componente'), yLabel: copy('Varianza spiegata (%)') },
        options: { valueLabels: true } as never,
      }),
      makeChart({
        id: 'pca-score',
        kind: 'score',
        title: copy('Punteggi dei componenti'),
        subtitle: 'PC1 × PC2',
        note: copy('Ogni punto è un caso proiettato sulle due prime componenti.'),
        data: { points: scoreData },
        fields: { xLabel: 'PC1', yLabel: 'PC2' },
      }),
    ];
    const componentCount = Math.min(result.loadings[0]?.length ?? 0, 6);
    const loadingCells = names.flatMap((name, row) =>
      Array.from({ length: componentCount }, (_, column) => ({
        x: `PC${column + 1}`,
        y: name,
        value: result.loadings[row]?.[column] ?? 0,
        label: (result.loadings[row]?.[column] ?? 0).toFixed(2),
      }))
    );
    charts.push(
      makeChart({
        id: 'pca-loadings',
        kind: 'heatmap',
        title: copy('Carichi delle componenti'),
        subtitle: copy('{s1} componenti', { s1: componentCount }),
        note: copy('Un carico alto indica che la variabile contribuisce soprattutto a quella componente; il colore mostra segno e intensità.'),
        data: { cells: loadingCells },
        fields: { xLabel: copy('Componente'), yLabel: copy('Variabile') },
        options: { showValues: true, diverging: true } as never,
      })
    );
    const scoreMax = Math.max(
      1,
      ...scoreData.flatMap(point => [Math.abs(point.x), Math.abs(point.y)])
    );
    const loadingMax = Math.max(
      1e-9,
      ...result.loadings.flatMap(row => [Math.abs(row[0] ?? 0), Math.abs(row[1] ?? 0)])
    );
    const vectorScale = (scoreMax * 0.8) / loadingMax;
    const vectors = names.map((name, row) => ({
      x: 0,
      y: 0,
      x2: (result.loadings[row]?.[0] ?? 0) * vectorScale,
      y2: (result.loadings[row]?.[1] ?? 0) * vectorScale,
      label: name,
    }));
    charts.push(
      makeChart({
        id: 'pca-biplot',
        kind: 'score',
        title: copy('Biplot delle componenti'),
        subtitle: 'PC1 × PC2',
        note: copy('I punti sono i casi; le frecce sono i vettori delle variabili. Frecce vicine indicano variabili correlate, frecce opposte variabili inversamente correlate.'),
        data: { points: scoreData, vectors },
        fields: { xLabel: 'PC1', yLabel: 'PC2' },
        options: { showVectors: true } as never,
      })
    );

    return {
      ok: true,
      title: copy('Analisi delle componenti principali'),
      tables,
      report: pcaReport(tables, result, ciLevel),
      charts,
    };
  }

  const result = cronbachAlpha(data, names);
  if (!result) {
    return {
      ok: false,
      reason: 'Cronbach alpha could not be computed: check constant items and complete rows',
    };
  }
  const tables = alphaTables(result);
  const correlationCells = names.flatMap((name, row) =>
    names.map((columnName, column) => ({
      x: columnName,
      y: name,
      value: result.correlations[row]?.[column] ?? 0,
      label: (result.correlations[row]?.[column] ?? 0).toFixed(2),
    }))
  );
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'alpha-items',
      kind: 'bar',
      title: copy('Correlazioni item-totale'),
      subtitle: copy('Alpha = {s1}', { s1: result.alpha.toFixed(3) }),
      note: copy('La correlazione item-totale misura quanto ogni item è coerente con il punteggio complessivo; valori bassi suggeriscono un item poco omogeneo.'),
      data: {
        bars: result.items.map(item => ({ category: item.item, value: item.itemTotal })),
      },
      fields: { xLabel: copy('Item'), yLabel: copy('Correlazione item-totale') },
      options: { valueLabels: true, referenceLine: 'none' } as never,
    }),
    makeChart({
      id: 'alpha-correlations',
      kind: 'heatmap',
      title: copy('Correlazioni tra item'),
      subtitle: copy('Matrice delle correlazioni tra gli item della scala'),
      note: copy('Correlazioni alte e omogenee tra gli item sostengono l’ipotesi di una dimensione comune; valori negativi o molto diversi vanno esaminati.'),
      data: { cells: correlationCells },
      fields: { xLabel: copy('Item'), yLabel: copy('Item') },
      options: { showValues: true, diverging: true } as never,
    }),
  ];
  // `alphaIfDeleted` is undefined for a two-item scale and for a constant
  // rest score: without a finite value the chart would render empty bars.
  const deleted = result.items.filter(item => Number.isFinite(item.alphaIfDeleted));
  if (deleted.length > 0) {
    charts.splice(
      1,
      0,
      makeChart({
        id: 'alpha-if-deleted',
        kind: 'bar',
        title: copy('Alpha se l’item è eliminato'),
        subtitle: copy('Alpha = {s1}', { s1: result.alpha.toFixed(3) }),
        note: copy('La linea tratteggiata è l’alpha totale: una barra sopra la linea indica che eliminare quell’item aumenterebbe l’affidabilità.'),
        data: {
          bars: deleted.map(item => ({ category: item.item, value: item.alphaIfDeleted })),
          rules: [{ value: result.alpha }],
        },
        fields: { xLabel: copy('Item'), yLabel: copy('Alpha senza l’item') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Alpha di Cronbach'),
    tables,
    report: alphaReport(tables, result),
    charts,
  };
};
