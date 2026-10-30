import { useRef, useState } from 'react';
import { validateAnalysisColumnRefs } from '../analyses/params';
import type { AnalysisRunResult } from '../analyses/types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { t, type Locale } from '../i18n';
import { isReportLocale, withReportLocale, type ReportLocale } from '../stats/reportCopy';
import { isHeavyAnalysis } from '../analyses/worker/heavyIds';
import { runHeavyAnalysis } from '../analyses/worker/client';
import type { HeavyProgressPhase } from '../analyses/worker/protocol';
import { withChartDefaults, type ChartDefaults } from '../charts/defaults';
import { filterChartsByGroups, type ChartOutputGroup } from '../charts/outputs';

interface UseAnalysisRunOptions {
  activeAnalysis: string;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  /** Language of the written report, forwarded to the sync runner and the worker. */
  reportLocale: Locale;
  /** Defaults for charts produced by new runs (not applied to existing cards). */
  chartDefaults: ChartDefaults;
  /** Optional chart groups hidden for each procedure. */
  hiddenChartGroups: Record<string, ChartOutputGroup[]>;
  /** Unico punto che appende alla console (o mostra il motivo del rifiuto). */
  emit: (
    result: AnalysisRunResult,
    analysisId: string,
    paramsUsed: ProjectParams,
    options?: { live?: boolean; ciLevel?: number; isCurrent?: () => boolean }
  ) => boolean | Promise<boolean>;
  warn: (message: string) => void;
}

/**
 * Avvio dell'analisi attiva.
 *
 * Le procedure costose passano da un Web Worker e restituiscono un payload
 * serializzabile; le procedure veloci restano sul percorso sincrono. Se il
 * browser non può creare il worker, si torna al runner sincrono senza perdere
 * il risultato.
 */
export const useAnalysisRun = ({
  activeAnalysis,
  grid,
  params,
  ciLevel,
  reportLocale,
  chartDefaults,
  hiddenChartGroups,
  emit,
  warn,
}: UseAnalysisRunOptions) => {
  const [running, setRunning] = useState<string | null>(null);
  const [phase, setPhase] = useState<HeavyProgressPhase>('starting');
  const abortRef = useRef<AbortController | null>(null);
  const runSeq = useRef(0);

  const clearRunning = () => {
    abortRef.current = null;
    setRunning(null);
  };

  const finishRun = (token: number) => {
    if (runSeq.current === token) clearRunning();
  };

  const runSync = async (
    analysisId: string,
    paramsUsed: ProjectParams,
    level: number,
    locale: ReportLocale
  ): Promise<AnalysisRunResult | null> => {
    // The runners (and the statistics code they need) load on first run: the
    // workspace itself stays small.
    const { ANALYSIS_RUNNERS } = await import('../analyses/runners');
    const runner = ANALYSIS_RUNNERS[analysisId];
    return runner
      ? withChartDefaults(chartDefaults, () =>
          withReportLocale(locale, () => runner({ grid, params: paramsUsed, ciLevel: level }))
        )
      : null;
  };

  const run = async (
    analysisId: string,
    paramsUsed: ProjectParams,
    options?: { live?: boolean; ciLevel?: number; isCurrent?: () => boolean }
  ): Promise<boolean> => {
    const level = options?.ciLevel ?? ciLevel;
    const locale: ReportLocale = isReportLocale(reportLocale) ? reportLocale : 'it';
    const invalid = validateAnalysisColumnRefs(analysisId, paramsUsed, grid.cols.length);
    if (invalid.length > 0) {
      warn(`${t('analysis.reselectPrefix')} ${invalid.slice(0, 2).join(' · ')}`);
      return false;
    }
    const token = ++runSeq.current;
    abortRef.current?.abort();
    clearRunning();

    let controller: AbortController | undefined;
    if (isHeavyAnalysis(analysisId)) {
      controller = new AbortController();
      abortRef.current = controller;
      setRunning(analysisId);
      setPhase('starting');
      const outcome = await runHeavyAnalysis(analysisId, grid, paramsUsed, level, {
        signal: controller.signal,
        reportLocale: locale,
        chartDefaults,
        onProgress: nextPhase => setPhase(nextPhase),
      });
      if (outcome.status === 'cancelled') {
        finishRun(token);
        return false;
      }
      if (outcome.status === 'rejected') {
        finishRun(token);
        warn(outcome.reason);
        return false;
      }
      if (outcome.status === 'ok') {
        finishRun(token);
        if (options?.isCurrent && !options.isCurrent()) return false;
        return await emit(
          {
            ok: true,
            ...(outcome.title ? { title: outcome.title } : {}),
            tables: outcome.tables,
            report: outcome.report,
            charts: filterChartsByGroups(
              analysisId,
              outcome.charts,
              hiddenChartGroups[analysisId]
            ),
            ...(outcome.header ? { header: outcome.header } : {}),
            ...(outcome.warnings ? { warnings: outcome.warnings } : {}),
            ...(outcome.callout ? { callout: outcome.callout } : {}),
          },
          analysisId,
          paramsUsed,
          { ...options, ciLevel: level }
        );
      }
      if (outcome.status === 'failed') {
        // A worker that cannot load must not make the analysis unavailable.
        console.warn('Heavy analysis worker failed; using the main thread', outcome.message);
      }
      // 'unavailable' and 'failed' fall through to the synchronous runner.
    }

    try {
      const result = await runSync(analysisId, paramsUsed, level, locale);
      if (controller?.signal.aborted) {
        finishRun(token);
        return false;
      }
      finishRun(token);
      if (!result) {
        warn(t('analysis.notImplemented'));
        return false;
      }
      // A stale live run may finish after a newer one: never publish it.
      if (options?.isCurrent && !options.isCurrent()) return false;
      const filtered =
        'ok' in result && result.ok
          ? {
              ...result,
              charts: filterChartsByGroups(
                analysisId,
                result.charts,
                hiddenChartGroups[analysisId]
              ),
            }
          : result;
      return await emit(filtered, analysisId, paramsUsed, { ...options, ciLevel: level });
    } catch (error) {
      if (runSeq.current === token) {
        finishRun(token);
        warn(error instanceof Error ? error.message : t('analysis.notImplemented'));
      }
      return false;
    }
  };

  const cancelAnalysis = () => {
    runSeq.current += 1;
    abortRef.current?.abort();
    clearRunning();
  };

  const runAnalysis = (): Promise<boolean> => run(activeAnalysis, params);

  /** Re-run a stored card with its own parameters and confidence level. */
  const runAnalysisWith = (
    analysisId: string,
    paramsUsed: ProjectParams,
    level = ciLevel
  ): Promise<boolean> => run(analysisId, paramsUsed, { ciLevel: level });

  /** Live run: replaces the previous live card instead of appending. */
  const runAnalysisLive = (isCurrent?: () => boolean): Promise<boolean> =>
    run(activeAnalysis, params, { live: true, isCurrent });

  return {
    runAnalysis,
    runAnalysisWith,
    runAnalysisLive,
    cancelAnalysis,
    analysisRunning: running !== null,
    runningAnalysisId: running,
    analysisPhase: phase,
  };
};
