import { useEffect, useRef, useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnalysisReport } from '../components/AnalysisReport';
import { copyText } from '../io/clipboard';
import { exportChartsAsPng } from '../io/chartExport';
import { buildReportFromElement } from '../io/reportExport';
import { buildResultsWorkbookFromElement, XLSX_MIME } from '../io/xlsx';
import { downloadBytes, downloadText } from '../io/writers';
import { capStoredOutputs, extractOutputTitle, type StoredOutput } from '../io/outputs';
import { nonEmptyRowCount } from '../grid/types';
import type { GridData } from '../grid/types';
import type { ReportSpec } from '../stats/report';
import { restoredOutputs, type OutputEntry } from '../ui/OutputConsole';
import type { Toast } from './useToasts';

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
    // Scroll only the output container: scrollIntoView() also scrolls the
    // document/ancestors in some browsers, hiding the main tabs and controls.
    const el = document.getElementById('output-content');
    if (el) el.scrollTop = el.scrollHeight;
  }, [outputs]);

  // Each run pushes a single block: the written report is part of that block,
  // so it always closes the run after every table and chart.
  const pushOutput = (node: ReactNode, report: ReportSpec | null) => {
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
      html,
      node: block,
    };
    setOutputs(prev => capStoredOutputs([...prev, entry]));
  };

  const clearOutput = () => {
    setOutputs([]);
    showToast('Output', 'Output console cleared', 'ok');
  };

  const removeOutput = (index: number) => {
    setOutputs(prev => prev.filter((_, i) => i !== index));
    showToast('Output', 'Result block removed', 'ok');
  };

  const copyOutput = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const ok = await copyText(el.innerText);
    showToast('Output', ok ? 'Output copied to clipboard' : 'Could not copy the output', ok ? 'ok' : 'error');
  };

  const exportChartPngs = async () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const result = await exportChartsAsPng(el, 'lazstats-chart');
    if (result.exported === 0 && result.failed === 0) {
      showToast('Charts', 'No charts in the output console yet', 'warn');
    } else if (result.failed > 0) {
      showToast('Charts', `${result.exported} chart(s) exported, ${result.failed} failed`, 'warn');
    } else {
      showToast('Charts', `${result.exported} chart(s) exported as PNG`, 'ok');
    }
  };

  const exportResultsXlsx = () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    try {
      const bytes = buildResultsWorkbookFromElement(el, grid);
      downloadBytes(bytes, 'lazstats-risultati.xlsx', XLSX_MIME);
      showToast('Export', 'Workbook .xlsx con il dataset e le tabelle dei risultati', 'ok');
    } catch (error) {
      showToast('Export', error instanceof Error ? error.message : 'Could not build the workbook', 'error');
    }
  };

  const exportReportHtml = () => {
    const el = document.getElementById('output-content');
    if (!el) return;
    const html = buildReportFromElement(el, {
      title: 'LazStats JS — Analysis Report',
      generatedAt: new Date().toLocaleString(),
      details: [`${nonEmptyRowCount(grid.rows)} rows`, `${grid.cols.length} columns`, `CI ${ciLevel}%`],
    });
    downloadText(html, 'lazstats-report.html', 'text/html;charset=utf-8');
    showToast('Report', 'Printable report downloaded — open it and print to PDF', 'ok');
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
