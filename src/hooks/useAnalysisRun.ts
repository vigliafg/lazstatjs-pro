
import { validateAnalysisColumnRefs } from '../analyses/params';
import type { AnalysisRunResult } from '../analyses/types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { t } from '../i18n';

interface UseAnalysisRunOptions {
  activeAnalysis: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  /** Unico punto che appende alla console (o mostra il motivo del rifiuto). */
  emit: (
    result: AnalysisRunResult,
    analysisId: string,
    paramsUsed: ProjectParams,
    options?: { live?: boolean; ciLevel?: number }
  ) => boolean;
  warn: (message: string) => void;
}

/**
 * Avvio dell'analisi attiva.
 *
 * Tutte le analisi hanno un builder puro nel registro: non servono più
 * segnali o handle imperativi per raggiungere i pannelli.
 */
export const useAnalysisRun = ({
  activeAnalysis,
  grid,
  params,
  ciLevel,
  emit,
  warn,
}: UseAnalysisRunOptions) => {
  const run = async (
    analysisId: string,
    paramsUsed: ProjectParams,
    options?: { live?: boolean; ciLevel?: number }
  ): Promise<boolean> => {
    const level = options?.ciLevel ?? ciLevel;
    const invalid = validateAnalysisColumnRefs(analysisId, paramsUsed, grid.cols.length);
    if (invalid.length > 0) {
      warn(`${t('analysis.reselectPrefix')} ${invalid.slice(0, 2).join(' · ')}`);
      return false;
    }
    // The runners (and the statistics/victory code they need) load on first
    // run: the workspace itself stays small.
    const { ANALYSIS_RUNNERS } = await import('../analyses/runners');
    const runner = ANALYSIS_RUNNERS[analysisId];
    if (runner) {
      return emit(
        runner({ grid, params: paramsUsed, ciLevel: level }),
        analysisId,
        paramsUsed,
        { ...options, ciLevel: level }
      );
    }
    warn(t('analysis.notImplemented'));
    return false;
  };

  const runAnalysis = (): Promise<boolean> => run(activeAnalysis, params);

  /** Re-run a stored card with its own parameters and confidence level. */
  const runAnalysisWith = (
    analysisId: string,
    paramsUsed: ProjectParams,
    level = ciLevel
  ): Promise<boolean> => run(analysisId, paramsUsed, { ciLevel: level });

  /** Live run: replaces the previous live card instead of appending. */
  const runAnalysisLive = (): Promise<boolean> => run(activeAnalysis, params, { live: true });

  return { runAnalysis, runAnalysisWith, runAnalysisLive };
};
