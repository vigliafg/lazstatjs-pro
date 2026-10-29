import { useEffect, useMemo, useState } from 'react';
import { detectFormat, detectHeader, looksLikeJson, type Delimiter, type Detection } from './detect';
import { readDelimitedTable, readJsonTable, type ImportTable } from './readers';
import { COL_TYPES, type ColType } from '../grid/types';
import { t } from '../i18n';
import { loadPrefs, savePrefs } from './prefs';
import { xlsxSheetToTable, type XlsxSheet } from './xlsx';

export type ImportMode = 'overwrite' | 'append-rows' | 'append-cols';

interface Props {
  fileName: string;
  /** Delimited/JSON payload; omitted when the file was an Excel workbook. */
  text?: string;
  /** Worksheets parsed from an .xlsx/.xls file (same pipeline as CSV). */
  sheets?: XlsxSheet[];
  /** Pre-parsed SPSS/Stata table; skips text detection and parsing. */
  binaryTable?: ImportTable;
  gridCols: string[];
  onApply: (table: ImportTable, mode: ImportMode) => void;
  onClose: () => void;
}

const DELIMS: { id: string; label: string; char: Delimiter }[] = [
  { id: 'auto', label: t('io.delimiterAuto'), char: ',' },
  { id: ',', label: t('io.commaSep'), char: ',' },
  { id: ';', label: t('io.semicolon'), char: ';' },
  { id: 'tab', label: t('io.tab'), char: '\t' },
  { id: '|', label: t('io.pipeSep'), char: '|' },
];

export function ImportWizard({ fileName, text = '', sheets, binaryTable, gridCols, onApply, onClose }: Props) {
  const isWorkbook = (sheets?.length ?? 0) > 0;
  const isBinary = Boolean(binaryTable);
  const prefs = useMemo(() => loadPrefs(), []);
  const [sheetIndex, setSheetIndex] = useState(0);
  const sheet = isWorkbook ? sheets?.[Math.min(sheetIndex, (sheets?.length ?? 1) - 1)] : undefined;

  const detection: Detection = useMemo(() => {
    if (binaryTable) {
      return {
        delimiter: ',',
        delimiterScores: { ',': 0, ';': 0, '\t': 0, '|': 0 },
        hasHeader: true,
        headerConfidence: 1,
        hadBOM: false,
        decimalComma: false,
        previewRows: Math.min(binaryTable.rows.length, 10),
      };
    }
    if (sheet) {
      const header = detectHeader(sheet.rows.slice(0, 10));
      return {
        delimiter: ',',
        delimiterScores: { ',': 0, ';': 0, '\t': 0, '|': 0 },
        hasHeader: header.hasHeader,
        headerConfidence: header.confidence,
        hadBOM: false,
        decimalComma: false,
        previewRows: Math.min(sheet.rows.length, 10),
      };
    }
    return detectFormat(fileName, text);
  }, [binaryTable, sheet, fileName, text]);
  const isJson = useMemo(
    () => !isWorkbook && !isBinary && (looksLikeJson(text) || fileName.toLowerCase().endsWith('.json')),
    [isWorkbook, isBinary, text, fileName]
  );
  const [delimId, setDelimId] = useState<string>(() =>
    prefs.delimiter === '\t' ? 'tab' : ['auto', ',', ';', 'tab', '|'].includes(prefs.delimiter) ? prefs.delimiter : 'auto'
  );
  const [hasHeader, setHasHeader] = useState<boolean>(isWorkbook ? true : prefs.hasHeader);
  const [decimalComma, setDecimalComma] = useState<boolean>(detection.decimalComma);
  const [mode, setMode] = useState<ImportMode>('overwrite');
  const [overrides, setOverrides] = useState<Record<number, ColType>>({});

  // Re-sync header/decimal defaults only when a *different* file or sheet
  // arrives while the wizard is open; at first open the persisted prefs win.
  const firstFile = useMemo(
    () => `${fileName}\0${text.length}\0${sheets?.map((item) => item.name).join('|') ?? ''}`,
    []
  );
  useEffect(() => {
    if (`${fileName}\0${text.length}\0${sheets?.map((item) => item.name).join('|') ?? ''}` === firstFile) return;
    setDecimalComma(detection.decimalComma);
    setHasHeader(detection.hasHeader);
  }, [fileName, text, sheets, detection, firstFile]);

  // A sheet switch changes the columns, so per-column type overrides must not
  // leak from the previous sheet.
  const switchSheet = (index: number) => {
    setSheetIndex(index);
    setOverrides({});
    const next = sheets?.[index];
    if (next) setHasHeader(detectHeader(next.rows.slice(0, 10)).hasHeader);
  };

  const effDelim: Delimiter = delimId === 'auto' ? detection.delimiter : (DELIMS.find((d) => d.id === delimId)?.char ?? detection.delimiter);

  const parsed: { table: ImportTable | null; error: string | null } = useMemo(() => {
    try {
      if (binaryTable) {
        return {
          table: {
            ...binaryTable,
            types: binaryTable.names.map((_, i) => overrides[i] ?? binaryTable.types[i]),
          },
          error: null,
        };
      }
      if (sheet) {
        return { table: xlsxSheetToTable(sheet, { hasHeader, decimalComma, typeOverrides: overrides }), error: null };
      }
      if (isJson) return { table: readJsonTable(text, { decimalComma, typeOverrides: overrides }), error: null };
      return { table: readDelimitedTable(text, { delimiter: effDelim, hasHeader, decimalComma, typeOverrides: overrides }), error: null };
    } catch (e) {
      return { table: null, error: e instanceof Error ? e.message : t('io.cannotParse') };
    }
  }, [binaryTable, sheet, isJson, text, effDelim, hasHeader, decimalComma, overrides]);
  const { table, error } = parsed;

  const preview = table ? table.rows.slice(0, 10) : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-surface border border-border2 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t('io.importTitle')}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-accent2 font-mono text-[12px] font-bold uppercase tracking-widest">{t('io.importTitle')}</h2>
            <p className="text-[11px] text-text3 font-mono truncate max-w-[500px]">
              {fileName}
              {isWorkbook && <span> · {sheets?.length} sheet{sheets && sheets.length > 1 ? 's' : ''}</span>}
              {isBinary && <span> · {binaryTable?.source === 'spss' ? 'SPSS .sav' : 'Stata .dta'}</span>}
            </p>
          </div>
          <button className="tb-btn" onClick={onClose}>{t('io.close')}</button>
        </div>

        <div className="px-4 py-3 border-b border-border flex flex-wrap gap-4 items-end text-[11px]">
          {isWorkbook && (
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-text3 font-mono uppercase">{t('io.worksheet')}</span>
              <select
                className="bg-surface3 border border-border2 rounded px-2 py-1 text-text"
                value={sheetIndex}
                onChange={(e) => switchSheet(parseInt(e.target.value, 10))}
              >
                {sheets?.map((item, index) => (
                  <option key={`${item.name}-${index}`} value={index}>
                    {item.name} ({item.rows.length} {t('data.rowsUnit')})
                  </option>
                ))}
              </select>
            </label>
          )}
          {!isJson && !isWorkbook && !isBinary && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-text3 font-mono uppercase">{t('io.delimiter')} {delimId === 'auto' && <span className="text-accent">({t('io.detected')}: {detection.delimiter === '\t' ? t('io.tab') : detection.delimiter})</span>}</span>
                <select className="bg-surface3 border border-border2 rounded px-2 py-1 text-text" value={delimId} onChange={(e) => setDelimId(e.target.value)}>
                  {DELIMS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-text3 font-mono uppercase">{t('io.header')}</span>
                <select className="bg-surface3 border border-border2 rounded px-2 py-1 text-text" value={hasHeader ? 'yes' : 'no'} onChange={(e) => setHasHeader(e.target.value === 'yes')}>
                  <option value="yes">{t('io.firstRowHeader')} ({Math.round(detection.headerConfidence * 100)}%)</option>
                  <option value="no">{t('io.noHeader')}</option>
                </select>
              </label>
            </>
          )}
          {isWorkbook && (
            <label className="flex flex-col gap-1">
              <span className="text-[10px] text-text3 font-mono uppercase">{t('io.header')}</span>
              <select className="bg-surface3 border border-border2 rounded px-2 py-1 text-text" value={hasHeader ? 'yes' : 'no'} onChange={(e) => setHasHeader(e.target.value === 'yes')}>
                <option value="yes">{t('io.firstRowHeader')}</option>
                <option value="no">{t('io.noHeader')}</option>
              </select>
            </label>
          )}
          {!isBinary && (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-text3 font-mono uppercase">{t('io.decimals')}</span>
            <select className="bg-surface3 border border-border2 rounded px-2 py-1 text-text" value={decimalComma ? 'comma' : 'dot'} onChange={(e) => setDecimalComma(e.target.value === 'comma')}>
              <option value="dot">{t('io.dot')}</option>
              <option value="comma">{t('io.comma')}</option>
            </select>
          </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-text3 font-mono uppercase">{t('io.applyAs')}</span>
            <select className="bg-surface3 border border-border2 rounded px-2 py-1 text-text" value={mode} onChange={(e) => setMode(e.target.value as ImportMode)}>
              <option value="overwrite">{t('io.overwrite')}</option>
              <option value="append-rows">{t('io.appendRows')} ({gridCols.length} {t('data.column').toLowerCase()})</option>
              <option value="append-cols">{t('io.mergeCols')}</option>
            </select>
          </label>
        </div>

        {isBinary && (
          <div className="border-b border-border bg-accent/5 px-4 py-2 text-[10px] leading-relaxed text-text3">
            {t('io.binaryPreserved')}
          </div>
        )}

        {error ? (
          <div className="px-4 py-6 text-center text-red text-[12px] font-mono">{error}</div>
        ) : table ? (
          <>
            <div className="px-4 py-2 text-[10px] font-mono text-text3 border-b border-border">
              {sheet && <span className="text-accent2">{sheet.name} · </span>}
              {table.rows.length} {t('output.rows')} x {table.names.length} {t('output.columns')}
              {table.skippedEmpty > 0 && <span> · {table.skippedEmpty} {t('io.emptySkipped')}</span>}
              {table.renamedDupes > 0 && <span> · {table.renamedDupes} {t('io.dupHeaders')}</span>}
              {detection.hadBOM && <span> · {t('io.bomStripped')}</span>}
            </div>
            <div className="flex-1 overflow-auto scrollbar px-4 py-2">
              <table className="w-full border-collapse font-mono text-[11px]">
                <thead className="sticky top-0">
                  <tr className="bg-surface2">
                    {table.names.map((n, i) => (
                      <th key={i} className="border border-border p-1">
                        <div className="text-accent2">{n}</div>
                        <select
                          className="mt-1 w-full bg-surface3 border border-border2 text-text2 text-[10px] rounded px-1 py-0.5"
                          value={overrides[i] ?? table.types[i]}
                          onChange={(e) => setOverrides((o) => ({ ...o, [i]: e.target.value as ColType }))}
                        >
                          {COL_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label} — {t.full}</option>
                          ))}
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, r) => (
                    <tr key={r} className="hover:bg-white/5">
                      {table.names.map((_, c) => (
                        <td key={c} className="border border-border px-2 py-0.5 text-text2 max-w-[160px] truncate" title={row[c] ?? ''}>
                          {row[c] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.rows.length > 10 && <p className="text-[10px] text-text3 font-mono py-1">…{t('io.showingFirst')} {table.rows.length}</p>}
            </div>
          </>
        ) : null}

        <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
          <button className="tb-btn" onClick={onClose}>{t('io.cancel')}</button>
          <button
            className="tb-btn bg-accent text-white border-accent disabled:opacity-40"
            disabled={!table}
            onClick={() => {
              if (!table) return;
              const prefs = loadPrefs();
              savePrefs({
                ...prefs,
                delimiter: delimId,
                hasHeader,
                decimalSeparator: decimalComma ? ',' : '.',
              });
              onApply({ ...table, types: table.names.map((_, i) => overrides[i] ?? table.types[i]) }, mode);
            }}
          >
            {t('io.importAction')} {table ? `${table.rows.length} ${t('data.rowsUnit')}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
