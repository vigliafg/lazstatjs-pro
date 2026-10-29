import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { loadPrefs, savePrefs, type IoPreferences } from '../io/prefs';
import { looksLikeJson } from '../io/detect';
import { readDelimitedTable } from '../io/readers';
import type { XlsxSheet } from '../io/xlsx';
import type { ImportMode } from '../io/ImportWizard';
import type { ImportTable } from '../io/readers';
import type { GridData } from '../grid/types';
import { createColumnId } from '../grid/types';
import type { Toast } from './useToasts';
import { t } from '../i18n';

export interface PendingImport {
  fileName: string;
  text?: string;
  sheets?: XlsxSheet[];
}

interface UseImportExportOptions {
  initialPrefs?: IoPreferences;
  setGrid: Dispatch<SetStateAction<GridData>>;
  replaceDataset: (grid: GridData) => void;
  setValidation: (value: { ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] }) => void;
  setActiveTab: (tab: 'data' | 'analysis' | 'settings' | 'help') => void;
  showToast: (title: string, msg: string, type?: Toast['type']) => void;
}

/**
 * Import/export dei dati e preferenze IO.
 *
 * Il wizard e il dialogo di export restano componenti: qui vive solo lo stato
 * e la logica (lettura CSV/XLSX, combinazione delle colonne, preferenze).
 */
export const useImportExport = ({
  initialPrefs,
  setGrid,
  replaceDataset,
  setValidation,
  setActiveTab,
  showToast,
}: UseImportExportOptions) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [ioPrefs, setIoPrefs] = useState(() => initialPrefs ?? loadPrefs());

  const applyImportTable = (table: ImportTable, mode: ImportMode) => {
    if (mode === 'overwrite') {
      replaceDataset({
        cols: table.names.map((name, i) => ({ id: createColumnId(), name, type: table.types[i] ?? 'str' })),
        rows: table.rows.map((row) => [...row]),
      } as GridData);
      showToast(t('toast.import'), `${table.rows.length} ${t('import.done')} ${table.names.length} ${t('import.columns')}`, 'ok');
    } else if (mode === 'append-rows') {
      // Compute inside the updater: the wizard may have been open while
      // the grid changed, so the render-closure `grid` can be stale.
      setGrid((prev) => {
        const width = prev.cols.length;
        const mapped = table.rows.map((row) => {
          // Align by position when widths match, else by name overlap.
          if (table.names.length === width) return row.slice(0, width).concat(new Array(Math.max(0, width - row.length)).fill(''));
          return prev.cols.map((c) => {
            const idx = table.names.findIndex((n) => n.toLowerCase() === c.name.toLowerCase());
            return idx >= 0 ? row[idx] ?? '' : '';
          });
        });
        return { cols: prev.cols, rows: [...prev.rows, ...mapped] };
      });
      showToast(t('toast.import'), `${table.rows.length} ${t('import.appended')}`, 'ok');
    } else {
      // Merge columns: add missing names, fill matched columns row-wise.
      setGrid((prev) => {
        const existing = new Map<string, number>(
          prev.cols.map((c, i) => [c.name.toLowerCase(), i] as [string, number])
        );
        const colMap: number[] = [];
        const cols = [...prev.cols];
        table.names.forEach((n, ti) => {
          const at = existing.get(n.toLowerCase());
          if (at !== undefined) {
            colMap[ti] = at;
          } else {
            colMap[ti] = cols.length;
            cols.push({ id: createColumnId(), name: n, type: table.types[ti] ?? 'str' });
          }
        });
        const rows = prev.rows.map((r, ri) => {
          const copy = [...r];
          while (copy.length < cols.length) copy.push('');
          // Fill only rows covered by the source; never cycle (cycling
          // would duplicate source rows over unrelated grid data).
          if (ri >= table.rows.length) return copy;
          const src = table.rows[ri] ?? [];
          table.names.forEach((_, ti) => {
            const dest = colMap[ti];
            const val = src[ti] ?? '';
            if (val !== '') copy[dest] = val;
          });
          return copy;
        });
        // Extra source rows beyond grid length extend the grid.
        for (let ri = prev.rows.length; ri < table.rows.length; ri += 1) {
          const fresh = new Array(cols.length).fill('');
          table.names.forEach((_, ti) => {
            fresh[colMap[ti]] = table.rows[ri][ti] ?? '';
          });
          rows.push(fresh);
        }
        return { cols, rows };
      });
      showToast(t('toast.import'), `${table.names.length} ${t('import.merged')}`, 'ok');
    }
    setPendingImport(null);
    setValidation({ ran: false, issues: [] });
    setActiveTab('data');
  };

  const importCsv = async (file: File) => {
    try {
      const lower = file.name.toLowerCase();
      // Excel workbooks are binary: parse every sheet, then reuse the wizard
      // and the CSV type-inference pipeline on the chosen sheet.
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.xlsm')) {
        const { readXlsxSheets } = await import('../io/xlsx');
        if (file.size > 25_000_000) throw new Error('The workbook is too large (max 25 MB)');
        const sheets = readXlsxSheets(await file.arrayBuffer());
        setPendingImport({ fileName: file.name, sheets });
        return;
      }
      const text = await file.text();
      if (!text.trim()) {
        showToast(t('toast.import'), t('import.empty'), 'warn');
        return;
      }
      // Fast path: small plain CSV goes straight in; anything ambiguous
      // (JSON, semicolons, pipes, tabs) opens the wizard.
      const prefs = loadPrefs();
      const json = looksLikeJson(text) || file.name.toLowerCase().endsWith('.json');
      const tricky = json || /[;\t|]/.test(text.slice(0, 2000));
      if (!tricky && text.length < 200000) {
        const prefDelim = prefs.delimiter === 'tab' || prefs.delimiter === '\t'
          ? '\t'
          : ([';', '|', ','].includes(prefs.delimiter) ? prefs.delimiter : ',');
        const table = readDelimitedTable(text, {
          delimiter: prefDelim,
          hasHeader: prefs.hasHeader,
          decimalComma: prefs.decimalSeparator === ',',
        });
        applyImportTable(table, 'overwrite');
        return;
      }
      setPendingImport({ fileName: file.name, text: text.slice(0, 2000000) });
    } catch (error) {
      console.error(error);
      showToast(t('toast.import'), error instanceof Error ? error.message : t('import.readError'), 'error');
    }
  };

  return {
    csvInputRef,
    pendingImport,
    setPendingImport,
    showExport,
    setShowExport,
    ioPrefs,
    setIoPrefs,
    applyImportTable,
    importCsv,
    exportCsv: () => setShowExport(true),
  };
};
