import type { AnalysisRunResult } from './types';
import type { GridData } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { buildDescriptiveOutput } from './descriptive/run';
import { buildTTestOutput } from './ttest/run';
import { buildAnovaOutput } from './anova/run';
import { buildRegressionOutput } from './regression/run';
import { buildCorrelationOutput } from './correlation/run';
import { buildChiSquareOutput } from './chisquare/run';

export interface AnalysisRunContext {
  grid: GridData;
  params: ProjectParams;
  ciLevel: number;
}

/**
 * Registro dei builder puri (primo passo di `AnalysisSpec`).
 *
 * Le sei analisi legacy sono già funzioni `(dati, parametri) -> risultato`:
 * qui ricevono un contesto unico invece di sei chiamate con firme diverse.
 * I 13 pannelli con `forwardRef` restano fuori finché non vengono convertiti.
 */
export const ANALYSIS_RUNNERS: Record<string, (ctx: AnalysisRunContext) => AnalysisRunResult> = {
  descriptive: ({ grid, params, ciLevel }) =>
    buildDescriptiveOutput({
      rows: grid.rows,
      columnNames: grid.cols.map(col => col.name),
      indices: params.descVars,
      level: ciLevel,
    }),
  ttest: ({ grid, params, ciLevel }) =>
    buildTTestOutput({ grid, ttestParams: params.ttest, ciLevel }),
  anova: ({ grid, params, ciLevel }) =>
    buildAnovaOutput({ grid, anovaParams: params.anova, ciLevel }),
  regression: ({ grid, params, ciLevel }) =>
    buildRegressionOutput({ grid, regParams: params.reg, ciLevel }),
  correlation: ({ grid, params, ciLevel }) =>
    buildCorrelationOutput({ grid, corrParams: params.corr, ciLevel }),
  chisquare: ({ grid, params, ciLevel }) =>
    buildChiSquareOutput({ grid, chisqParams: params.chisq, ciLevel }),
};
