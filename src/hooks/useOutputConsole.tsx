import { useEffect, useRef, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalysisReport } from '../components/AnalysisReport';
import { copyText } from '../io/clipboard';
import { exportChartsAsPng } from '../io/chartExport';
import { buildReportFromElement } from '../io/reportExport';

import { downloadBytes, downloadText } from '../io/writers';
import { capStoredOutputs, extractOutputTitle, type StoredOutput } from '../io/outputs';
import { nonEmptyRowCount } from '../grid/types';
import type { GridData } from '../grid/types';
import type { ReportSpec } from '../stats/report';
import { restoredOutputs, type OutputEntry } from '../ui/OutputConsole';
import type { Toast } from './useToasts';
import { t } from '../i18n';

interface UseOutputConsoleOptions {
  /** Blocchi ripristinati dal progetto/autosave. */
  initial?: StoredOutput[];
  grid: GridData;
  ciLevel: number;
  showToast: (title: string, msg: string, type?: Toast['type']) => void;
}

/**
 * Stato e azioni della console dei risultati.
 *
 * Ogni esecuzione produce un blocco unico (tabelle + grafici + report) e uno
 * snapshot HTML statico, così la console sopravvive a reload e file `.lzs`.
 * Gli export lavorano sul DOM già renderizzato: nessun ricalcolo.
 */
export const useOutputConsole = ({ initial, grid, ciLevel, showToast }: UseOutputConsoleOptions) => {
  const [outputs, setOutputs] = useState<OutputEntry[]>(() => restoredOutputs(initial));
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

  // Each run pushes a single block: the written report is part of that block,
  // so it always closes the run after every table and chart.
  const pushOutput = (
    node: ReactNode,
    report: ReportSpec | null,
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
    const block = (
      <>
        {node}
        {report && <AnalysisReport spec={report} />}
      </>
    );
    let html = '';
    try {
      html = renderToStaticMarkup(block);
    } catch (error) {
      // A failed snapshot must never lose the run that is on screen.
      console.error('Could not snapshot the output block', error);
    }
    const entry: OutputEntry = {
      id: `run-${Date.now()}-${runSeq.current++}`,
      title: html ? extractOutputTitle(html) : 'Analysis output',
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
      node: block,
    };
    setOutputs(prev => {
      // A live run owns one card per analysis: replace it instead of stacking
      // a new result on every keystroke.
      const base = meta?.live
        ? prev.filter(item => !(item.live && item.analysisId === analysisId))
        : prev;
      return capStoredOutputs([...base, entry]);
    });
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
    const result = await exportChartsAsPng(el, 'lazstats-chart');
    if (result.exported === 0 && result.failed === 0) {
      showToast(t('toast.charts'), t('output.noCharts'), 'warn');
    } else if (result.failed > 0) {
      showToast(t('toast.charts'), `${result.exported} ${t('output.chartsPartial')} ${result.failed} ${t('output.failed')}`, 'warn');
    } else {
      showToast(t('toast.charts'), `${result.exported} ${t('output.chartsExported')}`, 'ok');
    }
  };

  const exportResultsXlsx = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    try {
      const { buildResultsWorkbookFromElement, XLSX_MIME } = await import('../io/xlsx');
      const bytes = buildResultsWorkbookFromElement(el, grid);
      downloadBytes(bytes, 'lazstats-risultati.xlsx', XLSX_MIME);
      showToast(t('toast.export'), t('output.xlsxReady'), 'ok');
    } catch (error) {
      showToast(t('toast.export'), error instanceof Error ? error.message : t('output.xlsxError'), 'error');
    }
  };

  const exportReportHtml = () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const html = buildReportFromElement(el, {
      title: t('output.reportTitle'),
      generatedAt: new Date().toLocaleString(),
      details: [`${nonEmptyRowCount(grid.rows)} ${t('output.rows')}`, `${grid.cols.length} ${t('output.columns')}`, `${t('output.ci')} ${ciLevel}%`],
    });
    downloadText(html, 'lazstats-report.html', 'text/html;charset=utf-8');
    showToast(t('toast.report'), t('output.reportReady'), 'ok');
  };

  return {
    outputs,
    setOutputs,
    pushOutput,
    clearOutput,
    removeOutput,
    copyOutput,
    exportChartPngs,
    exportResultsXlsx,
    exportReportHtml,
  };
};
