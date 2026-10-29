import type { Dataset } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import type { HeavyAnalysisId } from './heavyIds';
import type { HeavyProgressPhase, HeavyRunOutcome, HeavyWorkerMessage } from './protocol';

export interface HeavyRunOptions {
  signal?: AbortSignal;
  onProgress?: (phase: HeavyProgressPhase, progress: number) => void;
  /** Test seam: lets the client run without a real browser Worker. */
  workerFactory?: () => Worker;
}

let requestSeq = 0;

const failure = (message: string): HeavyRunOutcome => ({ status: 'failed', message });

/**
 * Runs one heavy analysis in a dedicated worker.
 *
 * Cancellation terminates the worker: heavy kernels are synchronous, so there
 * is no safe point inside them to interrupt. Progress is reported at the
 * phases the worker controls (start, compute, finish); the UI also shows a
 * live elapsed timer, which is the honest signal while a kernel is running.
 */
export const runHeavyAnalysis = async (
  analysisId: HeavyAnalysisId,
  grid: Dataset,
  params: ProjectParams,
  ciLevel: number,
  options: HeavyRunOptions = {}
): Promise<HeavyRunOutcome> => {
  if (!options.workerFactory && typeof Worker === 'undefined') return { status: 'unavailable' };
  if (options.signal?.aborted) return { status: 'cancelled' };

  const id = ++requestSeq;
  let worker: Worker;
  try {
    worker = options.workerFactory
      ? options.workerFactory()
      : new Worker(new URL('./heavy.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return { status: 'unavailable' };
  }

  return await new Promise<HeavyRunOutcome>(resolve => {
    let settled = false;
    let phase: HeavyProgressPhase = 'starting';
    let progress = 0;

    const cleanup = () => {
      options.signal?.removeEventListener('abort', onAbort);
      worker.terminate();
    };
    const finish = (outcome: HeavyRunOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    };
    const onAbort = () => finish({ status: 'cancelled' });

    worker.onmessage = (event: MessageEvent<HeavyWorkerMessage>) => {
      if (settled) return;
      const message = event.data;
      if (!message || message.id !== id) return;
      if (message.type === 'progress') {
        phase = message.phase;
        progress = message.progress;
        options.onProgress?.(phase, progress);
        return;
      }
      if (message.type === 'result') {
        if ('reason' in message) {
          finish({ status: 'rejected', reason: message.reason });
          return;
        }
        finish({
          status: 'ok',
          tables: message.tables,
          report: message.report,
          charts: message.charts,
          ...(message.header ? { header: message.header } : {}),
          elapsedMs: message.elapsedMs,
        });
      }
    };
    worker.onerror = event => {
      // A worker that cannot even load the bundle is an environment problem;
      // the caller falls back to the synchronous runner and keeps working.
      finish(failure(event.message || 'The analysis worker failed to start'));
    };
    worker.onmessageerror = () => finish(failure('The analysis worker returned invalid data'));

    options.signal?.addEventListener('abort', onAbort, { once: true });
    try {
      worker.postMessage({ type: 'run', id, analysisId, grid, params, ciLevel });
      options.onProgress?.(phase, progress);
    } catch (error) {
      finish(failure(error instanceof Error ? error.message : 'Could not start the analysis worker'));
    }
  });
};
