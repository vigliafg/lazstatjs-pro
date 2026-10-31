import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalysisOutput } from '../components/AnalysisOutput';
import { copyText } from '../io/clipboard';
import { awaitChartsReady } from '../io/chartReady';
import { exportChartsAsPng } from '../io/chartExport';
import { buildReportFromElement } from '../io/reportExport';

import { saveBytes, saveText } from '../io/writers';
import { capStoredOutputs, extractOutputTitle, nextRunNumber, type StoredOutput } from '../io/outputs';
import { fitChartBudget } from '../charts/schema';
import { nonEmptyRowCount } from '../grid/types';
import type { GridData } from '../grid/types';
import type { AnalysisRunResult } from '../analyses/types';
import type { AnalysisChart, ChartOptions } from '../stats/charts';
import { restoredOutputs, type OutputEntry } from '../ui/output/types';
import { analysisLabel } from '../analyses/registry';
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

/**
 * Stato e azioni della console dei risultati.
 *
 * Ogni esecuzione produce un blocco unico (tabelle + prosa + grafici). Lo
 * snapshot HTML conserva tabelle e prosa; i modelli dei grafici sono salvati a
 * parte, così dopo un reload restano renderizzabili e modificabili.
 */
export const useOutputConsole = ({ initial, grid, ciLevel, reportLocale, showToast }: UseOutputConsoleOptions) => {
  const reportText = (key: Parameters<typeof translate>[1]): string => translate(reportLocale, key);
  const [outputs, setOutputs] = useState<OutputEntry[]>(() => restoredOutputs(initial));
  // Only used to keep card ids unique within a session.
  const runSeq = useRef(0);

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
    }
  ) => {
    if ('reason' in result) return;
    const title = result.title || (analysisId ? analysisLabel(analysisId) : extractOutputTitle(''));
    const block = (
      <AnalysisOutput
        title={title}
        header={result.header}
        tables={result.tables}
        report={result.report}
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
      html,
      ...(budget.charts.length > 0 ? { charts: budget.charts } : {}),
      ...(budget.overflow > 0 ? { chartOverflow: budget.overflow } : {}),
      ...(budget.omitted > 0 ? { chartOmitted: budget.omitted } : {}),
      session: {
        title,
        header: result.header,
        tables: result.tables,
        report: result.report,
        warnings: result.warnings,
        charts: result.charts,
        callout: result.callout,
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
        return {
          ...entry,
          ...(entry.charts ? { charts: update(entry.charts) } : {}),
          ...(entry.session
            ? { session: { ...entry.session, charts: update(entry.session.charts) } }
            : {}),
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

  const copyOutput = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    if (!(await settled(el, showToast))) return;
    warnStale(el, showToast);
    // Keep the analysis text, drop the per-block toolbars from the clipboard.
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button, [data-no-print]').forEach(node => node.remove());
    clone.querySelectorAll('.hidden').forEach(node => node.classList.remove('hidden'));
    clone.style.position = 'fixed';
    clone.style.left = '-10000px';
    clone.style.top = '0';
    document.body.appendChild(clone);
    const text = clone.innerText;
    clone.remove();
    const ok = await copyText(text);
    showToast(t('toast.output'), ok ? t('output.copied') : t('output.copyFailed'), ok ? 'ok' : 'error');
  };

  const exportChartPngs = async () => {
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
  };

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

  const exportReportWord = async () => {
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
  };

  const exportReportHtml = async () => {
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
  };

  /**
   * Export a single run-report. The card is already the source of truth for the
   * session export, so the same builder is applied to `#output-block-<id>`;
   * other cards can never leak into the file.
   */
  const exportRunReport = async (entryId: string, format: 'html' | 'word') => {
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
  };

  const exportRunReportHtml = (entryId: string) => void exportRunReport(entryId, 'html');
  const exportRunReportWord = (entryId: string) => void exportRunReport(entryId, 'word');

  return {
    outputs,
    setOutputs,
    pushOutput,
    updateOutputChart,
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
