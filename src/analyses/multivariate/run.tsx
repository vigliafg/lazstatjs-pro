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
    return {
      ok: true,
      title: copy('Analisi fattoriale esplorativa'),
      tables,
      report: efaReport(tables, result),
      charts: [],
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
  return {
    ok: true,
    title: copy('Alpha di Cronbach'),
    tables,
    report: alphaReport(tables, result),
    charts: [],
  };
};
