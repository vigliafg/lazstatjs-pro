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
  emit: (result: AnalysisRunResult) => boolean;
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
  const runAnalysis = (): boolean => {
    const invalid = validateAnalysisColumnRefs(activeAnalysis, params, grid.cols.length);
    if (invalid.length > 0) {
      warn(`Reselect the highlighted variable: ${invalid.slice(0, 2).join(' · ')}`);
      return false;
    }
    const runner = ANALYSIS_RUNNERS[activeAnalysis];
    if (runner) return emit(runner({ grid, params, ciLevel }));
    warn('Analysis type not implemented yet');
    return false;
  };

  return { runAnalysis };
};
