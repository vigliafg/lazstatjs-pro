import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalysisOutput } from '../components/AnalysisOutput';
import { copyText } from '../io/clipboard';
import { awaitChartsReady } from '../io/chartReady';
import { exportChartsAsPng } from '../io/chartExport';
import { buildReportFromElement } from '../io/reportExport';

import { saveBytes, saveText } from '../io/writers';
import { capStoredOutputs, extractOutputTitle, nextRunNumber, type StoredOutput } from '../io/outputs';
import { appendChartCopy, fitChartBudget, fitPanelBudget } from '../charts/schema';
import { nonEmptyRowCount } from '../grid/types';
import type { GridData } from '../grid/types';
import type { AnalysisRunResult } from '../analyses/types';
import type { AnalysisChart, ChartOptions, PanelChart } from '../stats/charts';
import type { ChartLinkValue } from '../components/charts/ChartLinkContext';
import { restoredOutputs, type OutputEntry } from '../ui/output/types';
import { analysisLabel } from '../analyses/registry';
import { buildAssistantCard } from '../ui/assistant/card';
import { AssistantReportCard } from '../ui/assistant/AssistantReportCard';
import type { AssistantRunMeta } from '../io/outputs';
import type { Toast } from './useToasts';
import { t, translate, type Locale } from '../i18n';

interface UseOutputConsoleOptions {
  /** Blocchi ripristinati dal progetto/autosave. */
  initial?: StoredOutput[];
  grid: GridData;
  ciLevel: number;
  /** Language of the exported document; the console chrome follows the UI. */
  reportLocale: Locale;
  showToast: (title: string, msg: string, type?: Toast['type']) => void;
  /** Session row state, used to suspend dimming while exporting. */
  link?: Pick<ChartLinkValue, 'setExporting'>;
}

const settled = async (root: ParentNode, showToast: (title: string, msg: string, type?: Toast['type']) => void) => {
  const ready = await awaitChartsReady(root);
  if (!ready.ready || ready.failed > 0) {
    showToast(t('toast.charts'), t('output.chartsPending'), 'error');
    return false;
  }
  return true;
};

/** Cards produced before the last grid/parameter change are marked in the DOM. */
const warnStale = (root: ParentNode, showToast: (title: string, msg: string, type?: Toast['type']) => void) => {
  if (root.querySelector('[data-stale="true"]')) {
    showToast(t('toast.output'), t('output.staleTitle'), 'warn');
  }
};

/** Two frames: one for the state change, one for the re-embedded charts. */
const nextFrames = (): Promise<void> =>
  new Promise(resolve => {
    if (typeof requestAnimationFrame !== 'function') {
      setTimeout(resolve, 0);
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

/**
 * Stato e azioni della console dei risultati.
 *
 * Ogni esecuzione produce un blocco unico (tabelle + prosa + grafici). Lo
 * snapshot HTML conserva tabelle e prosa; i modelli dei grafici sono salvati a
 * parte, così dopo un reload restano renderizzabili e modificabili.
 */
export const useOutputConsole = ({ initial, grid, ciLevel, reportLocale, showToast, link }: UseOutputConsoleOptions) => {
  const reportText = (key: Parameters<typeof translate>[1]): string => translate(reportLocale, key);
  const [outputs, setOutputs] = useState<OutputEntry[]>(() => restoredOutputs(initial));
  // Only used to keep card ids unique within a session.
  const runSeq = useRef(0);

  /**
   * Exports must show the full data, not the current brush or Data Filter
   * dimming. Suspending linking re-embeds the charts without the opacity
   * overlay; `nextFrames` gives React and Vega time to settle before the
   * existing readiness wait takes over.
   */
  const withCleanCharts = async <T,>(run: () => Promise<T>): Promise<T> => {
    link?.setExporting(true);
    await nextFrames();
    try {
      return await run();
    } finally {
      link?.setExporting(false);
    }
  };

  useEffect(() => {
    // Bring the newest block into view from its top: the reader should see the
    // title and tables first, not the tail of the written report.
    const last = outputs[outputs.length - 1];
    if (!last) return;
    const frame = requestAnimationFrame(() => {
      const container = document.getElementById('output-content');
      const target = document.getElementById(`output-block-${last.id}`);
      if (!container || !target) return;
      const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({
        top: Math.max(0, container.scrollTop + offset - 8),
        behavior: 'smooth',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [outputs]);

  // Each run pushes a single block. The HTML snapshot keeps tables and prose
  // only: charts are live models and must not be replaced by a static SVG.
  const pushOutput = (
    result: AnalysisRunResult,
    analysisId?: string,
    meta?: {
      dataRevision?: number;
      datasetId?: string;
      filterSignature?: string;
      params?: unknown;
      paramsSignature?: string;
      ciLevel?: number;
      live?: boolean;
      assistant?: AssistantRunMeta;
    }
  ) => {
    if ('reason' in result) return;
    const title = result.title || (analysisId ? analysisLabel(analysisId) : extractOutputTitle(''));
    const assistantCard =
      meta?.assistant && analysisId ? buildAssistantCard(result, analysisId, meta.assistant) : null;
    const block = (
      <AnalysisOutput
        title={title}
        header={result.header}
        tables={result.tables}
        report={result.report}
        assistantCard={
          assistantCard ? <AssistantReportCard spec={assistantCard} /> : null
        }
        limitationsLabel={reportText('report.limitations')}
      />
    );
    let html = '';
    try {
      html = renderToStaticMarkup(block);
    } catch (error) {
      // A failed snapshot must never lose the run that is on screen.
      console.error('Could not snapshot the output block', error);
    }
    const budget = fitChartBudget(result.charts ?? [], html.length);
    const usedChars =
      html.length + budget.charts.reduce((sum, chart) => sum + JSON.stringify(chart).length, 0);
    const panelBudget = fitPanelBudget(result.panels ?? [], usedChars);
    const entry: OutputEntry = {
      id: `run-${Date.now()}-${runSeq.current++}`,
      title,
      createdAt: new Date().toISOString(),
      ...(analysisId ? { analysisId } : {}),
      ...(meta?.dataRevision !== undefined ? { dataRevision: meta.dataRevision } : {}),
      ...(meta?.datasetId ? { datasetId: meta.datasetId } : {}),
      ...(meta?.filterSignature ? { filterSignature: meta.filterSignature } : {}),
      ...(meta?.params !== undefined ? { params: meta.params } : {}),
      ...(meta?.paramsSignature ? { paramsSignature: meta.paramsSignature } : {}),
      ...(meta?.ciLevel !== undefined ? { ciLevel: meta.ciLevel } : {}),
      ...(meta?.live ? { live: true } : {}),
      ...(meta?.assistant ? { assistant: meta.assistant } : {}),
      html,
      ...(budget.charts.length > 0 ? { charts: budget.charts } : {}),
      ...(budget.overflow > 0 ? { chartOverflow: budget.overflow } : {}),
      ...(budget.omitted > 0 ? { chartOmitted: budget.omitted } : {}),
      ...(panelBudget.panels.length > 0 ? { panels: panelBudget.panels } : {}),
      ...(panelBudget.overflow > 0 ? { panelOverflow: panelBudget.overflow } : {}),
      ...(panelBudget.omitted > 0 ? { panelOmitted: panelBudget.omitted } : {}),
      session: {
        title,
        header: result.header,
        tables: result.tables,
        report: result.report,
        warnings: result.warnings,
        charts: result.charts,
        panels: result.panels,
        callout: result.callout,
        ...(assistantCard ? { assistantCard } : {}),
      },
    };
    setOutputs(prev => {
      // A live run owns one card per analysis: replace it instead of stacking
      // a new result on every keystroke. The logical run keeps its number.
      const previousLive = meta?.live
        ? prev.find(item => item.live && item.analysisId === analysisId)
        : undefined;
      const base = meta?.live
        ? prev.filter(item => !(item.live && item.analysisId === analysisId))
        : prev;
      const numbered: OutputEntry = {
        ...entry,
        runNumber: previousLive?.runNumber ?? nextRunNumber(base),
      };
      return capStoredOutputs([...base, numbered]);
    });
  };

  /** Done in the chart editor: update options without re-running the analysis. */
  const updateOutputChart = (entryId: string, chartId: string, options: ChartOptions) => {
    setOutputs(prev =>
      prev.map(entry => {
        if (entry.id !== entryId) return entry;
        const update = (charts: AnalysisChart[] | undefined) =>
          charts?.map((chart: AnalysisChart) =>
            chart.id === chartId ? { ...chart, options } : chart
          );
        // A panel cannot be edited as a whole, but each of its children keeps
        // the same per-id editor contract as a standalone chart.
        const updatePanels = (panels: PanelChart[] | undefined): PanelChart[] | undefined =>
          panels?.map(panel => ({
            ...panel,
            children: panel.children.map(child =>
              child.id === chartId ? { ...child, options } : child
            ),
          }));
        return {
          ...entry,
          ...(entry.charts ? { charts: update(entry.charts) } : {}),
          ...(entry.panels ? { panels: updatePanels(entry.panels) } : {}),
          ...(entry.session
            ? {
                session: {
                  ...entry.session,
                  ...(entry.session.charts ? { charts: update(entry.session.charts) } : {}),
                  ...(entry.session.panels ? { panels: updatePanels(entry.session.panels) } : {}),
                },
              }
            : {}),
        };
      })
    );
  };

  /**
   * Graph Builder: a chart composed from the current dataset becomes a normal
   * run-report card. It has no analysis id, so Re-run is not offered.
   */
  const pushBuiltChart = (
    chart: AnalysisChart,
    meta?: { dataRevision?: number; datasetId?: string; filterSignature?: string }
  ) => {
    pushOutput(
      {
        ok: true,
        title: t('builder.title'),
        tables: [],
        report: null,
        charts: [chart],
      },
      undefined,
      meta
    );
  };

  /** Chart editor: append a copy of a chart to the same run-report. */
  const insertOutputChart = (entryId: string, chart: AnalysisChart) => {    setOutputs(prev =>
      prev.map(entry => {
        if (entry.id !== entryId) return entry;
        const charts = entry.session?.charts ?? entry.charts ?? [];
        // Repeating "insert" or "compare" must not duplicate an identical card.
        const duplicate = charts.some(
          item =>
            item.kind === chart.kind &&
            item.title === chart.title &&
            JSON.stringify(item.options) === JSON.stringify(chart.options)
        );
        if (duplicate) return entry;
        const next = appendChartCopy(charts, chart);
        if (!next) return entry;
        return {
          ...entry,
          ...(entry.charts ? { charts: next } : {}),
          ...(entry.session ? { session: { ...entry.session, charts: next } } : {}),
        };
      })
    );
  };

  const clearOutput = () => {
    setOutputs([]);
    showToast(t('toast.output'), t('output.cleared'), 'ok');
  };

  const removeOutput = (index: number) => {
    setOutputs(prev => prev.filter((_, i) => i !== index));
    showToast(t('toast.output'), t('output.removed'), 'ok');
  };

  const copyOutput = async () =>
    withCleanCharts(async () => {
      const el = document.getElementById('output-content');
      if (!el) return;
      if (!(await settled(el, showToast))) return;
      warnStale(el, showToast);
      // Keep the analysis text, drop the per-block toolbars from the clipboard.
      const clone = el.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll('button, [data-no-print], [data-no-export]')
        .forEach(node => node.remove());
      clone.querySelectorAll('.hidden').forEach(node => node.classList.remove('hidden'));
      clone.style.position = 'fixed';
      clone.style.left = '-10000px';
      clone.style.top = '0';
      document.body.appendChild(clone);
      const text = clone.innerText;
      clone.remove();
      const ok = await copyText(text);
      showToast(t('toast.output'), ok ? t('output.copied') : t('output.copyFailed'), ok ? 'ok' : 'error');
    });

  const exportChartPngs = async () =>
    withCleanCharts(async () => {
      const el = document.getElementById('output-content');
      if (!el) return;
      if (!(await settled(el, showToast))) return;
      warnStale(el, showToast);
      const result = await exportChartsAsPng(el, 'lazstats-chart');
      if (result.exported === 0 && result.failed === 0 && result.pending === 0) {
        showToast(t('toast.charts'), t('output.noCharts'), 'warn');
      } else if (result.failed > 0 || result.pending > 0) {
        showToast(
          t('toast.charts'),
          `${result.exported} ${t('output.chartsPartial')} ${result.failed + result.pending} ${t('output.failed')}`,
          'warn'
        );
      } else {
        showToast(t('toast.charts'), `${result.exported} ${t('output.chartsExported')}`, 'ok');
      }
    });

  const exportResultsXlsx = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    warnStale(el, showToast);
    try {
      const { buildResultsWorkbookFromElement, XLSX_MIME } = await import('../io/xlsx');
      const bytes = buildResultsWorkbookFromElement(el, grid);
      const result = await saveBytes(bytes, 'lazstats-risultati.xlsx', XLSX_MIME);
      if (!result.canceled) showToast(t('toast.export'), t('output.xlsxReady'), 'ok');
    } catch (error) {
      showToast(t('toast.export'), error instanceof Error ? error.message : t('output.xlsxError'), 'error');
    }
  };

  const exportReportWord = async () =>
    withCleanCharts(async () => {
      const el = document.getElementById('output-content');
      if (!el) return;
      if (!(await settled(el, showToast))) return;
      warnStale(el, showToast);
      const html = buildReportFromElement(el, {
        title: reportText('output.reportTitle'),
        generatedAt: new Date().toLocaleString(reportLocale),
        lang: reportLocale,
        details: [`${nonEmptyRowCount(grid.rows)} ${reportText('output.rows')}`, `${grid.cols.length} ${reportText('output.columns')}`, `${reportText('output.ci')} ${ciLevel}%`],
      });
      const result = await saveText(html, 'lazstats-report.doc', 'application/msword;charset=utf-8');
      if (!result.canceled) showToast(t('toast.report'), t('output.sessionReportReady'), 'ok');
    });

  const exportReportHtml = async () =>
    withCleanCharts(async () => {
      const el = document.getElementById('output-content');
      if (!el) return;
      if (!(await settled(el, showToast))) return;
      warnStale(el, showToast);
      const html = buildReportFromElement(el, {
        title: reportText('output.reportTitle'),
        generatedAt: new Date().toLocaleString(reportLocale),
        lang: reportLocale,
        details: [`${nonEmptyRowCount(grid.rows)} ${reportText('output.rows')}`, `${grid.cols.length} ${reportText('output.columns')}`, `${reportText('output.ci')} ${ciLevel}%`],
      });
      const result = await saveText(html, 'lazstats-report.html', 'text/html;charset=utf-8');
      if (!result.canceled) showToast(t('toast.report'), t('output.sessionReportReady'), 'ok');
    });

  /**
   * Export a single run-report. The card is already the source of truth for the
   * session export, so the same builder is applied to `#output-block-<id>`;
   * other cards can never leak into the file.
   */
  const exportRunReport = async (entryId: string, format: 'html' | 'word') =>
    withCleanCharts(async () => {
      const entry = outputs.find(item => item.id === entryId);
      const el = document.getElementById(`output-block-${entryId}`);
      if (!entry || !el) return;
      if (!(await settled(el, showToast))) return;
      warnStale(el, showToast);
      const analysis = entry.analysisId ? analysisLabel(entry.analysisId) : reportText('output.result');
      const html = buildReportFromElement(el, {
        title: `${reportText('output.runReportTitle')} — ${entry.title}`,
        generatedAt: new Date(entry.createdAt).toLocaleString(reportLocale),
        lang: reportLocale,
        details: [
          analysis,
          `${reportText('output.ci')} ${entry.ciLevel ?? ciLevel}%`,
        ],
      });
      const number = String(
        entry.runNumber ?? outputs.findIndex(item => item.id === entryId) + 1
      ).padStart(2, '0');
      const result =
        format === 'word'
          ? await saveText(html, `lazstats-run-${number}.doc`, 'application/msword;charset=utf-8')
          : await saveText(html, `lazstats-run-${number}.html`, 'text/html;charset=utf-8');
      if (!result.canceled) showToast(t('toast.report'), t('output.runReportReady'), 'ok');
    });

  const exportRunReportHtml = (entryId: string) => void exportRunReport(entryId, 'html');
  const exportRunReportWord = (entryId: string) => void exportRunReport(entryId, 'word');

  return {
    outputs,
    setOutputs,
    pushOutput,
    updateOutputChart,
    insertOutputChart,
    pushBuiltChart,
    clearOutput,
    removeOutput,
    copyOutput,
    exportChartPngs,
    exportResultsXlsx,
    exportReportHtml,
    exportReportWord,
    exportRunReportHtml,
    exportRunReportWord,
  };
};
