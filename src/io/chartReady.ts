/**
 * Vega renders asynchronously: copy/PNG/HTML exports must wait for every chart
 * surface before snapshotting the console.
 */
export interface ChartsReadyResult {
  /** All charts settled (ready or error) before the timeout. */
  ready: boolean;
  total: number;
  readyCount: number;
  failed: number;
  pending: number;
}

const stateOf = (surface: Element): string =>
  surface.getAttribute('data-chart-state') ?? 'loading';

/** Resolve when every `[data-chart-surface]` is ready/error or the timeout expires. */
export const awaitChartsReady = async (
  root: ParentNode,
  options: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<ChartsReadyResult> => {
  const timeoutMs = options.timeoutMs ?? 5000;
  const intervalMs = options.intervalMs ?? 50;
  const surfaces = Array.from(root.querySelectorAll('[data-chart-surface]'));
  const started = Date.now();

  const snapshot = (): ChartsReadyResult => {
    const states = surfaces.map(stateOf);
    const readyCount = states.filter(state => state === 'ready').length;
    const failed = states.filter(state => state === 'error').length;
    const pending = states.filter(state => state === 'loading').length;
    return { ready: pending === 0, total: surfaces.length, readyCount, failed, pending };
  };

  if (surfaces.length === 0) return snapshot();

  while (Date.now() - started < timeoutMs) {
    const result = snapshot();
    if (result.ready) return result;
    await new Promise(resolve => window.setTimeout(resolve, intervalMs));
  }
  return snapshot();
};
