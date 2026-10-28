import { useState } from 'react';
import { ANALYSIS_IDS } from '../analyses/registry';
import { ANALYSIS_RUNNERS } from '../analyses/runners';
import type { AnalysisRunResult } from '../analyses/types';
import type { GridData } from '../grid/types';
import type { ProjectParams } from '../io/project';

interface UseAnalysisRunOptions {
  activeAnalysis: string;
  grid: GridData;
  params: ProjectParams;
  ciLevel: number;
  /** Unico punto che appende alla console (o mostra il motivo del rifiuto). */
  emit: (result: AnalysisRunResult) => void;
  warn: (message: string) => void;
}

/**
 * Avvio dell'analisi attiva.
 *
 * Le analisi con builder puro girano subito; i pannelli con parametri locali
 * ricevono un nuovo `runSignal` e osservano il cambiamento con `useRunSignal`.
 */
export const useAnalysisRun = ({
  activeAnalysis,
  grid,
  params,
  ciLevel,
  emit,
  warn,
}: UseAnalysisRunOptions) => {
  const [runSignal, setRunSignal] = useState(0);

  const runAnalysis = () => {
    const runner = ANALYSIS_RUNNERS[activeAnalysis];
    if (runner) return emit(runner({ grid, params, ciLevel }));
    if (ANALYSIS_IDS.includes(activeAnalysis)) {
      setRunSignal(n => n + 1);
      return;
    }
    warn('Analysis type not implemented yet');
  };

  return { runAnalysis, runSignal };
};
