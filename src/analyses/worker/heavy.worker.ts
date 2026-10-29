import { HEAVY_RUNNERS } from './heavyRunners';
import type { HeavyRunRequest, HeavyWorkerMessage } from './protocol';

/**
 * Dedicated worker for the heavy analyses.
 *
 * Its output is plain data: tables, report and chart specs. The main thread
 * renders the same `AnalysisOutput` component for worker results and for the
 * synchronous fallback, so the two paths cannot drift apart.
 */

interface WorkerScope {
  onmessage: ((event: MessageEvent<HeavyRunRequest>) => void) | null;
  postMessage: (message: HeavyWorkerMessage) => void;
}

const scope = globalThis as unknown as WorkerScope;

const post = (message: HeavyWorkerMessage) => scope.postMessage(message);

scope.onmessage = event => {
  const request = event.data;
  if (!request || request.type !== 'run') return;
  const runner = HEAVY_RUNNERS[request.analysisId];
  if (!runner) {
    post({
      type: 'result',
      id: request.id,
      ok: false,
      reason: `Analysis ${request.analysisId} is not available in the worker`,
      elapsedMs: 0,
    });
    return;
  }

  const started = performance.now();
  post({ type: 'progress', id: request.id, phase: 'starting', progress: 0.05 });
  try {
    post({ type: 'progress', id: request.id, phase: 'computing', progress: 0.2 });
    const result = runner({
      grid: request.grid,
      params: request.params,
      ciLevel: request.ciLevel,
    });
    post({ type: 'progress', id: request.id, phase: 'finishing', progress: 0.92 });
    const elapsedMs = Math.round(performance.now() - started);
    if ('reason' in result) {
      post({ type: 'result', id: request.id, ok: false, reason: result.reason, elapsedMs });
      return;
    }
    post({
      type: 'result',
      id: request.id,
      ok: true,
      tables: result.tables,
      report: result.report,
      charts: result.charts ?? [],
      ...(result.header ? { header: result.header } : {}),
      elapsedMs,
    });
  } catch (error) {
    post({
      type: 'result',
      id: request.id,
      ok: false,
      reason: error instanceof Error ? error.message : 'The analysis failed in the worker',
      elapsedMs: Math.round(performance.now() - started),
    });
  }
};
