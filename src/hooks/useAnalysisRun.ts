import { ANALYSIS_RUNNERS } from '../analyses/runners';
import { validateAnalysisColumnRefs } from '../analyses/params';
import type { AnalysisRunResult } from '../analyses/types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';

interface UseAnalysisRunOptions {
  activeAnalysis: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  /** Unico punto che appende alla console (o mostra il motivo del rifiuto). */
  emit: (result: AnalysisRunResult, analysisId: string, paramsUsed: ProjectParams) => boolean;
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
  const run = (analysisId: string, paramsUsed: ProjectParams): boolean => {
    const invalid = validateAnalysisColumnRefs(analysisId, paramsUsed, grid.cols.length);
    if (invalid.length > 0) {
      warn(`Reselect the highlighted variable: ${invalid.slice(0, 2).join(' · ')}`);
      return false;
    }
    const runner = ANALYSIS_RUNNERS[analysisId];
    if (runner) return emit(runner({ grid, params: paramsUsed, ciLevel }), analysisId, paramsUsed);
    warn('Analysis type not implemented yet');
    return false;
  };

  const runAnalysis = (): boolean => run(activeAnalysis, params);

  /** Re-run a stored card with its own parameters, without touching state. */
  const runAnalysisWith = (analysisId: string, paramsUsed: ProjectParams): boolean =>
    run(analysisId, paramsUsed);

  return { runAnalysis, runAnalysisWith };
};
