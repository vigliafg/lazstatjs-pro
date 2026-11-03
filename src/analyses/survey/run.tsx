import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { surveyAnalysis, type SurveyObservation } from '../../stats/kernels/survey';
import { surveyTables } from '../../stats/tables/survey';
import { surveyReport } from '../../stats/reports/survey';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { SurveyParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface SurveyInput {
  grid: Dataset;
  params: SurveyParams;
  ciLevel: number;
}

export const buildSurveyOutput = ({ grid, params, ciLevel }: SurveyInput): AnalysisRunResult => {
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const categoryName = grid.cols[params.category]?.name ?? 'Category';
  const predictorNames = params.predictors.map(
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  const grouped = new Map<string, number>();
  grid.rows.forEach(row => {
    const value = String(row[params.category] ?? '').trim();
    if (value !== '') grouped.set(value, (grouped.get(value) ?? 0) + 1);
  });
  const successLevel =
    params.successLevel ||
    [...grouped.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ||
    '';
  if (params.mode === 'proportion' && !successLevel) {
    return { ok: false, reason: 'The proportion mode needs a categorical variable with at least one level' };
  }

  const observations: SurveyObservation[] = [];
  grid.rows.forEach(row => {
    // The proportion mode reads the categorical column; the numeric variable
    // is irrelevant there and may even be a text column.
    const value = params.mode === 'proportion' ? 1 : parseNum(row[params.variable]);
    const category = String(row[params.category] ?? '').trim();
    const weight = params.weight >= 0 ? parseNum(row[params.weight]) : 1;
    const predictors = params.predictors.map(index => parseNum(row[index]));
    if (!Number.isFinite(value) || !Number.isFinite(weight) || weight <= 0) return;
    if (params.mode === 'proportion' && category === '') return;
    if (params.mode === 'regression' && predictors.some(item => !Number.isFinite(item))) return;
    observations.push({
      value,
      weight,
      stratum: params.strata >= 0 ? String(row[params.strata] ?? '').trim() || '1' : '1',
      psu: params.cluster >= 0 ? String(row[params.cluster] ?? '').trim() : undefined,
      category: String(row[params.category] ?? '').trim(),
      predictors,
    });
  });
  if (observations.length < 2) {
    return { ok: false, reason: 'The survey design needs at least two complete rows with positive weights' };
  }

  const result = surveyAnalysis(observations, {
    mode: params.mode,
    level: ciLevel,
    successLevel,
    variableName,
    categoryName,
    predictorNames,
  });
  if (!result) {
    return { ok: false, reason: 'The survey estimate could not be computed: check the design columns and the weights' };
  }

  const charts: AnalysisChart[] = [];
  if (result.mode === 'regression') {
    charts.push(
      makeChart({
        id: 'survey-coefficients',
        kind: 'forest',
        title: copy('Coefficienti della regressione ponderata'),
        subtitle: copy('IC {s1}% · errori robusti al disegno', { s1: ciLevel }),
        note: copy('Ogni punto è un coefficiente; il segmento è l’intervallo di confidenza costruito con i gradi di libertà del disegno.'),
        data: {
          points: result.coefficients.map(item => ({
            label: item.term,
            estimate: item.estimate,
            lo: item.estimate - 1.96 * item.se,
            hi: item.estimate + 1.96 * item.se,
          })),
        },
        fields: { xLabel: copy('Coefficiente'), yLabel: copy('Termine') },
        options: { reference: 'zero' } as never,
      })
    );
  } else if (result.estimates[0]) {
    const main = result.estimates[0];
    charts.push(
      makeChart({
        id: 'survey-interval',
        kind: 'interval',
        title: copy('Stima e intervallo di confidenza'),
        subtitle: copy('IC {s1}% con gradi di libertà del disegno', { s1: ciLevel }),
        note: copy('Punto: stima ponderata. Segmento: intervallo di confidenza. Il tratteggio verticale è il valore di riferimento zero per le differenze e uno per i rapporti.'),
        data: {
          intervals: [
            {
              category: main.label,
              estimate: main.estimate,
              lo: main.lo,
              hi: main.hi,
            },
          ],
        },
        fields: { xLabel: copy('Stima'), yLabel: main.label },
      })
    );
  }

  return {
    ok: true,
    title: copy('Campione complesso: {s1}', { s1: variableName }),
    header: copy('{s1} osservazioni · {s2} strati · {s3} PSU · DEFF {s4}', {
      s1: result.design.n,
      s2: result.design.strata,
      s3: result.design.psus,
      s4: Number.isFinite(result.estimates[0]?.deff ?? NaN)
        ? result.estimates[0].deff.toFixed(2)
        : '—',
    }),
    tables: surveyTables(result),
    report: surveyReport(result),
    charts,
  };
};
