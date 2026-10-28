import { ANALYSIS_RUNNERS } from '../analyses/runners';
import type { AnalysisRunResult } from '../analyses/types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';

interface UseAnalysisRunOptions {
  activeAnalysis: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  /** Unico punto che appende alla console (o mostra il motivo del rifiuto). */
  emit: (result: AnalysisRunResult) => void;
  warn: (message: string) => void;
}

/**
 * Avvio dell'analisi attiva.
 *
 * Tutte le 19 analisi hanno un builder puro nel registro: non servono più
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
  const runAnalysis = () => {
    const runner = ANALYSIS_RUNNERS[activeAnalysis];
    if (runner) return emit(runner({ grid, params, ciLevel }));
    warn('Analysis type not implemented yet');
  };

  return { runAnalysis };
};
