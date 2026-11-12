import { ANALYSIS_RUNNERS } from '../analyses/runners';
import type { AnalysisRunResult } from '../analyses/types';
import type { ChartDefaults, ChartStylePatches } from '../charts/defaults';
import { withChartDefaults, withChartStyles } from '../charts/defaults';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { isReportLocale, withReportLocale, type ReportLocale } from '../stats/reportCopy';
import { isRunnableAnalysis } from './catalog';
import { EngineError } from './errors';
import { validateParams } from './params';

export interface RunAnalysisOptions {
  analysisId: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  reportLocale?: string;
  chartDefaults?: ChartDefaults;
  chartStyles?: ChartStylePatches;
}

export const normalizeReportLocale = (value: string | undefined): ReportLocale =>
  value && isReportLocale(value) ? value : 'it';

export const runAnalysis = (options: RunAnalysisOptions): AnalysisRunResult => {
  const { analysisId, grid, params, ciLevel } = options;
  if (!isRunnableAnalysis(analysisId)) {
    throw new EngineError({
      code: 'E_ANALYSIS',
      kind: 'unknown_analysis',
      stage: 'analysis',
      message: `Unknown or non-runnable analysis: ${analysisId}`,
      details: { analysisId },
    });
  }
  const runner = ANALYSIS_RUNNERS[analysisId];
  if (!runner) {
    throw new EngineError({
      code: 'E_ANALYSIS',
      kind: 'unknown_analysis',
      stage: 'analysis',
      message: `Analysis has no runner: ${analysisId}`,
      details: { analysisId },
    });
  }

  validateParams({ analysisId, params, grid });

  try {
    return withChartStyles(options.chartStyles, () =>
      withChartDefaults(options.chartDefaults, () =>
        withReportLocale(normalizeReportLocale(options.reportLocale), () =>
          runner({ grid, params, ciLevel })
        )
      )
    );
  } catch (error) {
    if (error instanceof EngineError) throw error;
    throw new EngineError({
      code: 'E_INTERNAL',
      kind: 'runner_failure',
      stage: 'execute',
      message: error instanceof Error ? error.message : 'The analysis failed unexpectedly',
      details: { analysisId },
    });
  }
};
