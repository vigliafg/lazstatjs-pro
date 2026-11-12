import { isHeavyAnalysis } from '../../analyses/worker/heavyIds';
import type { AnalysisRunResult } from '../../analyses/types';
import { runAnalysis, type RunAnalysisOptions } from '../run';
import {
  closeWorkerPool,
  DEFAULT_TIMEOUT_MS,
  resolveWorkerCount,
  runInWorkerPool,
  WorkerUnavailableError,
} from './pool';

export interface WorkerRunOptions {
  workers?: string | number;
  timeoutMs?: number;
}

export const runAnalysisWithWorkers = async (
  options: RunAnalysisOptions,
  workerOptions: WorkerRunOptions = {}
): Promise<AnalysisRunResult> => {
  const workers = resolveWorkerCount(workerOptions.workers);
  if (workers === 0 || !isHeavyAnalysis(options.analysisId)) {
    return runAnalysis(options);
  }
  try {
    return await runInWorkerPool(
      options,
      workers,
      workerOptions.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );
  } catch (error) {
    // A runtime without worker support must not make an analysis unavailable.
    if (error instanceof WorkerUnavailableError) return runAnalysis(options);
    throw error;
  }
};

export { closeWorkerPool, resolveWorkerCount, DEFAULT_TIMEOUT_MS };
