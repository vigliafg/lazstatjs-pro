import type { Dispatch, RefObject, SetStateAction } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CleanPanel } from '../grid/CleanPanel';
import { VariableInspector } from '../grid/VariableInspector';
import { t } from '../i18n';
import { fillRightRange as gridFillRight } from '../grid/fillRight';
import { setRangeValue as gridSetRangeValue } from '../grid/ops';
import { DataGrid } from '../grid/DataGrid';
import { TransformPanel } from '../grid/TransformPanel';
import {
  addColumnEnd as gridAddColumn,
  addRowEnd as gridAddRow,
  clearGrid as gridClear,
  clearRange as gridClearRange,
  coerceGrid as gridCoerce,
  deleteColumn as gridDeleteColumn,
  deleteRow as gridDeleteRow,
  duplicateColumn as gridDuplicateColumn,
  fillDownRange as gridFillDown,
  findInvalid as gridFindInvalid,
  insertColumnAt as gridInsertColumn,
  insertRowAt as gridInsertRow,
  invalidByColumn as gridInvalidByColumn,
  moveColumn as gridMoveColumn,
  newGrid as makeNewGrid,
  parseTsv as parseTsvBlock,
  pasteTsvAt as gridPasteTsv,
  rangeToTsv as gridRangeToTsv,
  renameColumn as gridRenameColumn,
  rowMatches,
  sortByColumn as gridSortByColumn,
  trimTrailingEmptyLines as gridTrimTrailingEmptyLines,
  type RowFilter,
  type RowFilterOp,
} from '../grid/ops';
import type { CategoryLevel, ColType, GridData } from '../grid/types';
import type { ColumnOperation } from '../grid/columnOps';

export interface DataTabProps {
  grid: GridData;
  datasetId: string;
  setGrid: Dispatch<SetStateAction<GridData>>;
  onNewDataset: () => void;
  onInsertColumn: (at: number) => void;
  onDuplicateColumn: (c: number) => void;
  onMoveColumn: (c: number, dir: -1 | 1) => void;
  onDeleteColumn: (c: number) => void;
  onColumnOperation: (next: GridData, operation: ColumnOperation) => void;
  canUndoGrid: boolean;
  canRedoGrid: boolean;
  undoGrid: () => void;
  redoGrid: () => void;
  csvInputRef: RefObject<HTMLInputElement | null>;
  projectInputRef: RefObject<HTMLInputElement | null>;
  exportCsv: () => void;
  importCsv: (file: File) => Promise<void>;
  saveProjectFile: () => void;
  openProjectFile: (file: File) => Promise<void>;
  lastAutosave: string | null;
  showToast: (title: string, msg: string, type?: 'ok' | 'warn' | 'error') => void;
  validation: { ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] };
  setValidation: Dispatch<SetStateAction<{ ran: boolean; issues: { r: number; c: number; value: string; colName: string }[] }>>;
  focusCell: { r: number; c: number; stamp: number } | null;
  setFocusCell: Dispatch<SetStateAction<{ r: number; c: number; stamp: number } | null>>;
  selRange: { r0: number; c0: number; r1: number; c1: number } | null;
  setSelRange: Dispatch<SetStateAction<{ r0: number; c0: number; r1: number; c1: number } | null>>;
  freezeFirstCol: boolean;
  setFreezeFirstCol: Dispatch<SetStateAction<boolean>>;
  showFilter: boolean;
  setShowFilter: Dispatch<SetStateAction<boolean>>;
  showInspector: boolean;
  setShowInspector: Dispatch<SetStateAction<boolean>>;
  focusedColumn: number | null;
  onFocusColumn: (column: number) => void;
  filterAffectsAnalysis: boolean;
  setFilterAffectsAnalysis: Dispatch<SetStateAction<boolean>>;
  inspectorCol: number;
  setInspectorCol: Dispatch<SetStateAction<number>>;
  onColumnMeta: (column: number, patch: { label?: string; description?: string; missing?: string[]; formula?: string }) => void;
  filterCol: number;
  setFilterCol: Dispatch<SetStateAction<number>>;
  filterOp: RowFilterOp;
  setFilterOp: Dispatch<SetStateAction<RowFilterOp>>;
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  filterNeedsValue: boolean;
  activeRowFilter: RowFilter | null;
  visibleRowCount: number;
  showClean: boolean;
  setShowClean: Dispatch<SetStateAction<boolean>>;
  showTransform: boolean;
  setShowTransform: Dispatch<SetStateAction<boolean>>;
  updateCell: (r: number, c: number, value: string) => void;
  updateColType: (c: number, type: ColType) => void;
  updateColumnLevels: (c: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (c: number, mapping: Record<string, string>) => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  addColumn: () => void;
  addRow: () => void;
}

export const DataTab = ({
  grid,
  datasetId,
  setGrid,
  onNewDataset,
  onInsertColumn,
  onDuplicateColumn,
  onMoveColumn,
  onDeleteColumn,
  onColumnOperation,
  canUndoGrid,
  canRedoGrid,
  undoGrid,
  redoGrid,
  csvInputRef,
  projectInputRef,
  exportCsv,
  importCsv,
  saveProjectFile,
  openProjectFile,
  lastAutosave,
  showToast,
  validation,
  setValidation,
  focusCell,
  setFocusCell,
  selRange,
  setSelRange,
  freezeFirstCol,
  setFreezeFirstCol,
  showFilter,
  setShowFilter,
  showInspector,
  setShowInspector,
  focusedColumn,
  onFocusColumn,
  filterAffectsAnalysis,
  setFilterAffectsAnalysis,
  inspectorCol,
  setInspectorCol,
  onColumnMeta,
  filterCol,
  setFilterCol,
  filterOp,
  setFilterOp,
  filterValue,
  setFilterValue,
  filterNeedsValue,
  activeRowFilter,
  visibleRowCount,
  showClean,
  setShowClean,
  showTransform,
  setShowTransform,
  updateCell,
  updateColType,
  updateColumnLevels,
  updateColumnRecode,
  setActiveTab,
  addColumn,
  addRow,
}: DataTabProps) => (
  <>
<div className="flex-1 flex flex-col overflow-hidden">
  <div role="toolbar" aria-label={t('data.toolbar')} className="bg-surface border-b border-border p-1.5 flex flex-wrap items-center gap-2 shrink-0">
    <div role="group" aria-label={t('data.groupFile')} className="flex flex-wrap items-center gap-2">
    <span className="font-mono text-[10px] text-text3 uppercase tracking-widest px-2">{t('data.file')}:</span>
    <button className="tb-btn" onClick={onNewDataset}>{t('data.new')}</button>
    <button className="tb-btn" onClick={() => csvInputRef.current?.click()}>{t('data.import')}</button>
    <button className="tb-btn" onClick={exportCsv}>{t('data.export')}</button>
    <div className="h-4 w-px bg-border mx-1" />
    <button
      className="tb-btn"
      onClick={saveProjectFile}
      title={t('data.saveHint')}
    >
      {t('data.saveProject')}
    </button>
    <button
      className="tb-btn"
      onClick={() => projectInputRef.current?.click()}
      title={t('data.openHint')}
    >
      {t('data.openProject')}
    </button>
    <input
      ref={projectInputRef}
      type="file"
      accept=".lzs,application/json"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void openProjectFile(file);
        event.target.value = '';
      }}
    />
    {lastAutosave && (
      <span
        className="font-mono text-[9px] text-text3 uppercase tracking-wider"
        title={t('data.autosaveHint')}
      >
        {t('data.autosave')} {lastAutosave}
      </span>
    )}
    </div>
    <div className="h-4 w-px bg-border mx-1" />
    <div role="group" aria-label={t('data.groupEdit')} className="flex flex-wrap items-center gap-2">
    <button className="tb-btn" disabled={!canUndoGrid} onClick={undoGrid} title={`${t('data.undo')} (Ctrl+Z)`}>
      {t('data.undo')}
    </button>
    <button className="tb-btn" disabled={!canRedoGrid} onClick={redoGrid} title={`${t('data.redo')} (Ctrl+Y)`}>
      {t('data.redo')}
    </button>
    </div>
    <input
      ref={csvInputRef}
      type="file"
      accept=".csv,.tsv,.tab,.txt,.json,.psv,.xlsx,.xls,.xlsm,.sav,.dta,text/csv,text/plain,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void importCsv(file);
        event.target.value = '';
      }}
    />
    <div className="h-4 w-px bg-border mx-2" />
    <div role="group" aria-label={t('data.groupTools')} className="flex flex-wrap items-center gap-2">
    <button
      className="tb-btn text-yellow"
      onClick={() => {
        const issues = gridFindInvalid(grid);
        setValidation({ ran: true, issues });
        if (issues.length === 0) showToast(t('toast.validation'), t('data.validOk'), 'ok');
        else showToast(t('toast.validation'), `${issues.length} ${t('data.invalidFound')}`, 'warn');
      }}
    >
      {t('data.validate')}
    </button>
    <button
      className="tb-btn"
      onClick={() => {
        const { grid: next, changed } = gridCoerce(grid);
        if (changed === 0) {
          showToast(t('toast.autoFix'), t('data.nothingToCoerce'), 'ok');
          return;
        }
        setGrid(next);
        setValidation({ ran: false, issues: [] });
        showToast(t('toast.autoFix'), `${changed} ${t('data.cellsCoerced')}`, 'ok');
      }}
    >
      {t('data.autoFix')}
    </button>
    <button className={`tb-btn ${showClean ? 'bg-accent text-white border-accent' : ''}`} onClick={() => setShowClean((v) => !v)}>
      {t('data.clean')}
    </button>
    <button className={`tb-btn ${showTransform ? 'bg-accent text-white border-accent' : ''}`} onClick={() => setShowTransform((v) => !v)}>
      {t('data.transform')}
    </button>
    </div>
    <div className="h-4 w-px bg-border mx-1" />
    <div role="group" aria-label={t('data.groupView')} className="flex flex-wrap items-center gap-2">
    <button
      className={`tb-btn ${freezeFirstCol ? 'bg-accent text-white border-accent' : ''}`}
      onClick={() => setFreezeFirstCol((v) => !v)}
      title={t('data.freezeHint')}
    >
      {t('data.freezeCol')}
    </button>
    <button
      className={`tb-btn ${showInspector ? 'bg-accent text-white border-accent' : ''}`}
      onClick={() => setShowInspector((value) => !value)}
      title={t('data.variablesHint')}
    >
      {t('data.variables')}
    </button>
    <button
      className={`tb-btn ${showFilter ? 'bg-accent text-white border-accent' : ''}`}
      onClick={() => setShowFilter((v) => !v)}
      title={t('data.filterHint')}
    >
      {t('data.filter')}
    </button>
    </div>
  </div>

  {showFilter && (
    <div className="bg-surface border-b border-border px-3 py-1.5 flex flex-wrap items-center gap-2 text-[11px] shrink-0">
      <span className="font-mono text-[9px] text-text3 uppercase tracking-widest">{t('data.rowFilter')}</span>
      <select
        className="bg-surface3 border border-border2 rounded px-1 py-1 text-text"
        value={filterCol}
        onChange={(e) => setFilterCol(Number(e.target.value))}
      >
        {grid.cols.map((c, i) => (
          <option key={i} value={i}>{c.name}</option>
        ))}
      </select>
      <select
        className="bg-surface3 border border-border2 rounded px-1 py-1 text-text"
        value={filterOp}
        onChange={(e) => setFilterOp(e.target.value as RowFilterOp)}
      >
        <option value="contains">{t('data.contains')}</option>
        <option value="equals">=</option>
        <option value="notEquals">≠</option>
        <option value="gt">&gt;</option>
        <option value="gte">≥</option>
        <option value="lt">&lt;</option>
        <option value="lte">≤</option>
        <option value="empty">{t('data.isEmpty')}</option>
        <option value="notEmpty">{t('data.isNotEmpty')}</option>
      </select>
      {filterNeedsValue && (
        <input
          className="bg-surface3 border border-border2 rounded px-2 py-1 w-40 text-text"
          placeholder={t('data.value')}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      )}
      <span className="text-text3 font-mono text-[10px]">
        {visibleRowCount} / {grid.rows.length} {t('data.rowsUnit')}
      </span>
      <button
        className="tb-btn"
        onClick={() => {
          setFilterValue('');
          setFilterOp('contains');
        }}
      >
        {t('data.clearFilter')}
      </button>
      <button
        type="button"
        className={`tb-btn ${filterAffectsAnalysis ? 'bg-accent text-white border-accent' : ''}`}
        onClick={() => setFilterAffectsAnalysis(value => !value)}
        title={t('data.affectsHint')}
      >
        {filterAffectsAnalysis ? t('data.alsoFilter') : t('data.viewOnly')}
      </button>
      <span className="text-text3 text-[10px] italic">
        {filterAffectsAnalysis
          ? `${t('data.analysesUse')} ${visibleRowCount} ${t('data.of')} ${grid.rows.length} ${t('data.rowsUnit')}`
          : t('data.viewOnlyHint')}
      </span>
    </div>
  )}

  {showTransform && (
    <TransformPanel
      grid={grid}
      onApply={(next, msg, kind = 'ok', operation) => {
        if (next !== grid) {
          if (operation) onColumnOperation(next, operation);
          else setGrid(next);
          setValidation({ ran: false, issues: [] });
        }
        showToast(t('toast.transform'), msg, kind);
      }}
    />
  )}

  {showClean && (
    <CleanPanel
      grid={grid}
      onApply={(next, msg) => {
        setGrid(next);
        setValidation({ ran: false, issues: [] });
        showToast(t('toast.clean'), msg, 'ok');
      }}
    />
  )}

  {validation.ran && (
    <div className="bg-surface border-b border-border px-3 py-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono shrink-0">
      {validation.issues.length === 0 ? (
        <span className="text-green">{t('data.validNone')}</span>
      ) : (
        <>
          <span className="text-yellow font-bold">{validation.issues.length} {t('data.invalid')}</span>
          <span className="text-text3">|</span>
          {gridInvalidByColumn(grid)
            .filter((c) => c.count > 0)
            .map((c) => (
              <button
                key={c.col}
                className="tb-btn"
                onClick={() => {
                  const first = validation.issues.find((i) => i.c === c.col);
                  if (first) {
                    // A view filter can hide the invalid row: clear it so the
                    // jump actually lands on the cell that needs fixing.
                    if (
                      activeRowFilter &&
                      !rowMatches(grid, grid.rows[first.r] ?? [], activeRowFilter)
                    ) {
                      setFilterValue('');
                      setShowFilter(false);
                    }
                    setFocusCell({ r: first.r, c: first.c, stamp: Date.now() });
                    setActiveTab('data');
                  }
                }}
              >
                {c.name}: {c.count}
              </button>
            ))}
          <button
            className="tb-btn"
            onClick={() => {
              const first = validation.issues[0];
              if (!first) return;
              if (
                activeRowFilter &&
                !rowMatches(grid, grid.rows[first.r] ?? [], activeRowFilter)
              ) {
                setFilterValue('');
                setShowFilter(false);
              }
              setFocusCell({ r: first.r, c: first.c, stamp: Date.now() });
            }}
          >
            {t('data.jumpFirst')}
          </button>
          <button className="tb-btn" onClick={() => setValidation({ ran: false, issues: [] })}>
            {t('data.dismiss')}
          </button>
        </>
      )}
    </div>
  )}
  
  <div className="flex min-h-0 flex-1">
    <div className={`${showInspector ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col`}>
      <div className="panel-header">
        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
        {t('data.gridView')}
      </div>

  <DataGrid
    grid={grid}
    resetKey={datasetId}
    focusCell={focusCell}
    onCell={updateCell}
    onRenameCol={(c, name) => {
      setGrid((prev) => gridRenameColumn(prev, c, name));
      setValidation((v) => ({ ...v, ran: false }));
    }}
    onColType={updateColType}
    onLevels={updateColumnLevels}
    onRecode={updateColumnRecode}
    onInsertCol={onInsertColumn}
    onDuplicateCol={onDuplicateColumn}
    onMoveCol={onMoveColumn}
    onDeleteCol={(c) => {
      if (grid.cols.length <= 1) {
        showToast(t('toast.columns'), t('data.columnRequired'), 'warn');
        return;
      }
      if (!window.confirm(`${t('data.deleteColumnPrefix')} "${grid.cols[c]?.name}"${t('data.deleteColumnSuffix')}`)) return;
      onDeleteColumn(c);
    }}
    onInsertRow={(at) => setGrid((prev) => gridInsertRow(prev, at))}
    onDeleteRow={(r) => {
      if (grid.rows.length <= 1) {
        showToast(t('toast.rows'), t('data.rowRequired'), 'warn');
        return;
      }
      if (!window.confirm(`${t('data.deleteRowPrefix')} ${r + 1}${t('data.deleteRowSuffix')}`)) return;
      setGrid((prev) => gridDeleteRow(prev, r));
    }}
    onPaste={(r, c, text) => {
      const block = gridTrimTrailingEmptyLines(parseTsvBlock(text));
      if (block.length === 0) return;
      setGrid((prev) => gridPasteTsv(prev, r, c, block));
      showToast(t('toast.paste'), `${block.length}x${Math.max(...block.map((l) => l.length))} ${t('data.cellsPasted')}`, 'ok');
    }}
    onCopyRange={(range) => {
      setSelRange(range);
      const tsv = gridRangeToTsv(grid, range);
      navigator.clipboard?.writeText(tsv).catch(() => undefined);
      showToast(t('toast.copy'), t('data.rangeCopied'), 'ok');
    }}
    onClearRange={(range) => setGrid((prev) => gridClearRange(prev, range))}
    onFillDown={(range) => setGrid((prev) => gridFillDown(prev, range))}
    onFillRight={(range) => setGrid((prev) => gridFillRight(prev, range))}
    onSetRange={(range, value) => setGrid((prev) => gridSetRangeValue(prev, range, value))}
    freezeFirstCol={freezeFirstCol}
    rowFilter={activeRowFilter}
    onSortCol={(col, dir) => {
      setGrid((prev) => gridSortByColumn(prev, col, dir));
      setValidation({ ran: false, issues: [] });
      showToast(t('toast.sort'), `${t('data.sortedBy')} ${grid.cols[col]?.name ?? `${t('data.column').toLowerCase()} ${col + 1}`} (${dir})`, 'ok');
    }}
    onFocusCol={onFocusColumn}
    onInspectCol={(col) => {
      setInspectorCol(col);
      setShowInspector(true);
    }}
  />
  {selRange && (
    <div className="bg-surface border-t border-border px-3 py-1 flex items-center gap-2 text-[10px] font-mono text-text3 shrink-0">
      <span>
        {t('data.selection')}: R{Math.min(selRange.r0, selRange.r1) + 1}-{Math.max(selRange.r0, selRange.r1) + 1} C
        {Math.min(selRange.c0, selRange.c1) + 1}-{Math.max(selRange.c0, selRange.c1) + 1}
      </span>
      <button className="tb-btn" onClick={() => setGrid((prev) => gridFillDown(prev, selRange))}>
        {t('data.fillDown')}
      </button>
      <button className="tb-btn" onClick={() => setGrid((prev) => gridFillRight(prev, selRange))}>
        {t('data.fillRight')}
      </button>
      <button className="tb-btn" onClick={() => setGrid((prev) => gridClearRange(prev, selRange))}>
        {t('data.clearSelection')}
      </button>
      <button
        className="tb-btn"
        onClick={() => {
          navigator.clipboard?.writeText(gridRangeToTsv(grid, selRange)).catch(() => undefined);
          showToast(t('toast.copy'), t('data.rangeCopied'), 'ok');
        }}
      >
        {t('data.copy')}
      </button>
    </div>
  )}
    </div>

    {showInspector && (
      <div className="flex min-h-0 w-full shrink-0 lg:w-[320px]">
        <VariableInspector
          grid={grid}
          column={inspectorCol}
          onSelectColumn={setInspectorCol}
          onRename={(c, name) => {
            setGrid((prev) => gridRenameColumn(prev, c, name));
            setValidation((v) => ({ ...v, ran: false }));
          }}
          onType={updateColType}
          onMeta={onColumnMeta}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          onDuplicate={onDuplicateColumn}
          onDelete={(c) => {
            if (grid.cols.length <= 1) {
              showToast(t('toast.columns'), t('data.columnRequired'), 'warn');
              return;
            }
            if (!window.confirm(`${t('data.deleteColumnPrefix')} "${grid.cols[c]?.name}"${t('data.deleteColumnSuffix')}`)) return;
            onDeleteColumn(c);
            setShowInspector(false);
          }}
          onClose={() => setShowInspector(false)}
        />
      </div>
    )}
  </div>

  <div className="bg-surface border-t border-border p-2 flex gap-2 shrink-0">
    <button className="tb-btn" onClick={addColumn}><Plus className="w-3 h-3 inline mr-1" /> {t('data.addColumn')}</button>
    <button className="tb-btn" onClick={addRow}><Plus className="w-3 h-3 inline mr-1" /> {t('data.addRow')}</button>
    <button
      className="tb-btn text-red/80 hover:bg-red hover:text-white"
      onClick={() => {
        if (!window.confirm(t('data.confirmClear'))) return;
        setGrid((prev) => gridClear(prev));
      }}
    >
      <Trash2 className="w-3 h-3 inline mr-1" /> {t('data.clear')}
    </button>
  </div>
</div>
  </>
);
