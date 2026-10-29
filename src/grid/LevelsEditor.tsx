import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eraser, List, Plus, RefreshCw, Shuffle, Trash2, X } from 'lucide-react';
import type { CategoryLevel, GridData } from './types';
import { columnLevels, distinctColumnValues } from './types';
import { levelsFromColumnValues, recodeColumnValues } from './ops';
import { t } from '../i18n';

/** Compact trigger used next to the selectors in analysis panels. */
export const LEVELS_BUTTON_CLASS =
  'tb-btn flex items-center gap-1 h-[29px] px-2 text-[10px] whitespace-nowrap';

interface Props {
  grid: GridData;
  column: number;
  onLevels: (c: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (c: number, mapping: Record<string, string>) => void;
  /** Button text; defaults to "N levels". */
  label?: string;
  className?: string;
  disabled?: boolean;
  /** Controlled open state for callers that open the editor from a cell. */
  controlledOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger when the caller supplies its own button. */
  showTrigger?: boolean;
}

type Mode = 'levels' | 'recode';

/** One recodable code: target === value means "keep as is". */
interface RecodeRow {
  value: string;
  label: string;
  target: string;
  clear: boolean;
  count: number;
}

const countRows = (grid: GridData, column: number, value: string): number =>
  grid.rows.filter((row) => String(row[column] ?? '').trim() === value).length;

/**
 * Reusable group editor: a trigger button plus the modal, with two modes —
 * declared levels (code, label, order, reference) and value recoding (rename,
 * merge, clear). It is used by the data grid header and by every analysis
 * panel that picks a grouping variable, so groups can be edited without
 * switching tab. Each Apply is a single undo step wherever it is opened.
 */
export const LevelsEditor: React.FC<Props> = ({
  grid,
  column,
  onLevels,
  onRecode,
  label,
  className,
  disabled,
  controlledOpen,
  onOpenChange,
  showTrigger = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const changeOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const [mode, setMode] = useState<Mode>('levels');
  const [draftLevels, setDraftLevels] = useState<CategoryLevel[]>([]);
  const [draftRef, setDraftRef] = useState('');
  const [newLevelValue, setNewLevelValue] = useState('');
  const [newLevelLabel, setNewLevelLabel] = useState('');
  const [recodeRows, setRecodeRows] = useState<RecodeRow[]>([]);

  const col = grid.cols[column];
  const count = col ? columnLevels(col, grid.rows, column).length : 0;

  const openEditor = () => {
    if (!col) return;
    changeOpen(true);
    setMode('levels');
    setDraftLevels(columnLevels(col, grid.rows, column).map((level) => ({ ...level })));
    setDraftRef(col.reference ?? '');
    setNewLevelValue('');
    setNewLevelLabel('');
    setRecodeRows([]);
  };

  const startRecode = () => {
    // Declared levels first (so their labels and order survive), then every
    // other value present in the column, so out-of-list codes are recodable too.
    const declared = columnLevels(col, grid.rows, column);
    const seen = new Set(declared.map((level) => level.value));
    const observed = distinctColumnValues(grid.rows, column)
      .filter((value) => !seen.has(value))
      .map((value) => ({ value, label: value }));
    setRecodeRows(
      [...declared, ...observed].map((level) => ({
        value: level.value,
        label: level.label,
        target: level.value,
        clear: false,
        count: countRows(grid, column, level.value),
      }))
    );
    setMode('recode');
  };

  /** Only the codes that actually change are sent to the pure operation. */
  const recodeMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    recodeRows.forEach((row) => {
      if (row.clear) mapping[row.value] = '';
      else if (row.target.trim() !== row.value) mapping[row.value] = row.target.trim();
    });
    return mapping;
  }, [recodeRows]);

  const preview = useMemo(
    () => (mode === 'recode' ? recodeColumnValues(grid, column, recodeMapping) : null),
    [mode, grid, column, recodeMapping]
  );

  const apply = () => {
    onLevels(column, draftLevels, draftRef || undefined);
    changeOpen(false);
  };

  const applyRecode = () => {
    onRecode(column, recodeMapping);
    changeOpen(false);
  };

  const addLevel = () => {
    const value = newLevelValue.trim();
    if (value === '' || draftLevels.some((level) => level.value === value)) return;
    setDraftLevels((current) => [
      ...current,
      { value, label: newLevelLabel.trim() || value },
    ]);
    setNewLevelValue('');
    setNewLevelLabel('');
  };

  const rescan = () => {
    const declared = new Map(draftLevels.map((level) => [level.value, level]));
    const merged = levelsFromColumnValues(grid, column).map(
      (level) => declared.get(level.value) ?? level
    );
    setDraftLevels(merged);
  };

  const moveLevel = (index: number, dir: -1 | 1) => {
    setDraftLevels((current) => {
      const next = [...current];
      const target = index + dir;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const patchRecodeRow = (index: number, patch: Partial<RecodeRow>) => {
    setRecodeRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const missingValues = open
    ? distinctColumnValues(grid.rows, column).some(
        (value) => !draftLevels.some((level) => level.value === value)
      )
    : false;

  return (
    <>
      {showTrigger && (
      <button
        type="button"
        disabled={disabled || !col}
        onClick={openEditor}
        className={
          className ??
          'w-full flex items-center justify-center gap-1 text-[8px] font-mono uppercase tracking-wider text-text3 hover:text-accent hover:bg-white/5 py-0.5 border-t border-border/50 disabled:opacity-40'
        }
        title={`${t('levels.editFor')} ${col?.name ?? t('form.group')}: ${t('levels.editTitle')}`}
        aria-label={`${t('levels.editFor')} ${col?.name ?? t('form.group')}`}
      >
        <List className="w-2.5 h-2.5" />
        {label ?? `${count} ${count === 1 ? t('levels.triggerOne') : t('levels.triggerMany')}`}
      </button>
      )}

      {open && col && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
          onClick={() => changeOpen(false)}
        >
          <div
            className="bg-surface2 border border-border2 rounded-lg shadow-2xl w-full max-w-[600px] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${t('levels.groupLevels')}: ${col.name}`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <List className="w-4 h-4 text-accent2 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-text3">
                    {mode === 'levels' ? t('levels.groupLevels') : t('levels.recodeTitle')}
                  </div>
                  <div className="text-[12px] text-text truncate">{col.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  aria-pressed={mode === 'levels'}
                  className={`tb-btn text-[10px] ${mode === 'levels' ? 'bg-accent/15 border-accent text-accent' : ''}`}
                  onClick={() => setMode('levels')}
                >
                  {t('levels.levels')}
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'recode'}
                  className={`tb-btn flex items-center gap-1 text-[10px] ${mode === 'recode' ? 'bg-accent/15 border-accent text-accent' : ''}`}
                  onClick={startRecode}
                >
                  <Shuffle className="w-3 h-3" /> {t('levels.recodeValues')}
                </button>
                <button
                  type="button"
                  aria-label={t('levels.close')}
                  className="text-text3 hover:text-text p-1"
                  onClick={() => changeOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-auto scrollbar px-4 py-3 space-y-2">
              {mode === 'levels' ? (
                <>
                  <p className="text-[10px] text-text3 leading-relaxed">
                    {t('levels.intro')}
                  </p>

                  {draftLevels.length === 0 && (
                    <p className="text-[11px] text-text3 italic py-2">
                      {t('levels.empty')}
                    </p>
                  )}

                  {draftLevels.map((level, index) => {
                    const rows = grid.rows.filter(
                      (row) => String(row[column] ?? '').trim() === level.value
                    ).length;
                    return (
                      <div key={level.value} className="flex items-center gap-2 border-b border-border/40 pb-1">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label={`${t('levels.moveUp')} ${level.value}`}
                            className="text-text3 hover:text-accent disabled:opacity-30"
                            disabled={index === 0}
                            onClick={() => moveLevel(index, -1)}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            aria-label={`${t('levels.moveDown')} ${level.value}`}
                            className="text-text3 hover:text-accent disabled:opacity-30"
                            disabled={index === draftLevels.length - 1}
                            onClick={() => moveLevel(index, 1)}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="w-[72px] shrink-0 truncate font-mono text-[11px] text-text3" title={level.value}>
                          {level.value}
                        </span>
                        <input
                          aria-label={`${t('levels.labelFor')} ${level.value}`}
                          className="flex-1 min-w-0 bg-surface3 border border-border2 rounded px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
                          value={level.label}
                          onChange={(e) =>
                            setDraftLevels((current) =>
                              current.map((entry, i) => (i === index ? { ...entry, label: e.target.value } : entry))
                            )
                          }
                        />
                        <span className="w-8 text-right text-[10px] text-text3" title={t('levels.rowsWithCode')}>
                          {rows}
                        </span>
                        <label
                          className={`flex items-center gap-1 text-[9px] uppercase tracking-wider cursor-pointer ${
                            draftRef === level.value ? 'text-accent' : 'text-text3'
                          }`}
                          title={t('levels.reference')}
                        >
                          <input
                            type="radio"
                            name="levels-reference"
                            checked={draftRef === level.value}
                            onChange={() => setDraftRef(level.value)}
                          />
                          {t('levels.ref')}
                        </label>
                        <button
                          type="button"
                          aria-label={`${t('levels.remove')} ${level.value}`}
                          className="text-text3 hover:text-red p-1"
                          onClick={() => {
                            setDraftLevels((current) => current.filter((_, i) => i !== index));
                            if (draftRef === level.value) setDraftRef('');
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-end gap-2 pt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-widest text-text3">{t('levels.code')}</span>
                      <input
                        aria-label={t('levels.newLevelCode')}
                        className="w-24 bg-surface3 border border-border2 rounded px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
                        value={newLevelValue}
                        onChange={(e) => setNewLevelValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addLevel(); }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-widest text-text3">{t('levels.label')}</span>
                      <input
                        aria-label={t('levels.newLevelLabel')}
                        className="w-40 bg-surface3 border border-border2 rounded px-2 py-1 text-[11px] text-text outline-none focus:border-accent"
                        value={newLevelLabel}
                        onChange={(e) => setNewLevelLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addLevel(); }}
                      />
                    </div>
                    <button
                      type="button"
                      className="tb-btn flex items-center gap-1"
                      onClick={addLevel}
                      disabled={newLevelValue.trim() === ''}
                    >
                      <Plus className="w-3 h-3" /> {t('levels.add')}
                    </button>
                    <button type="button" className="tb-btn flex items-center gap-1" onClick={rescan}>
                      <RefreshCw className="w-3 h-3" /> {t('levels.readData')}
                    </button>
                  </div>

                  {missingValues && (
                    <p className="text-[10px] text-yellow">
                      {t('levels.notInList')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[10px] text-text3 leading-relaxed">
                    {t('levels.recodeIntro')}
                  </p>

                  {recodeRows.length === 0 && (
                    <p className="text-[11px] text-text3 italic py-2">
                      {t('levels.recodeEmpty')}
                    </p>
                  )}

                  {recodeRows.map((row, index) => (
                    <div key={row.value} className="flex items-center gap-2 border-b border-border/40 pb-1">
                      <span className="w-[72px] shrink-0 truncate font-mono text-[11px] text-text3" title={row.value}>
                        {row.value}
                      </span>
                      <span className="w-[86px] shrink-0 truncate text-[10px] text-text3" title={row.label}>
                        {row.label === row.value ? '—' : row.label}
                      </span>
                      <span className="w-8 text-right text-[10px] text-text3" title={t('levels.rowsWithCode')}>
                        {row.count}
                      </span>
                      <span className="text-text3 text-[11px]">→</span>
                      <input
                        aria-label={`${t('levels.newCodeFor')} ${row.value}`}
                        className={`flex-1 min-w-0 bg-surface3 border rounded px-2 py-1 text-[11px] outline-none focus:border-accent ${
                          row.clear ? 'border-border2 text-text3 line-through' : 'border-border2 text-text'
                        }`}
                        placeholder={row.value}
                        disabled={row.clear}
                        value={row.target}
                        onChange={(e) => patchRecodeRow(index, { target: e.target.value })}
                      />
                      <label
                        className={`flex items-center gap-1 text-[9px] uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                          row.clear ? 'text-yellow' : 'text-text3'
                        }`}
                        title={t('levels.clearHint')}
                      >
                        <input
                          type="checkbox"
                          checked={row.clear}
                          onChange={(e) => patchRecodeRow(index, { clear: e.target.checked })}
                        />
                        <Eraser className="w-3 h-3" /> {t('levels.clear')}
                      </label>
                    </div>
                  ))}

                  {preview && (
                    <p className="text-[10px] text-text3 pt-1" data-recode-preview="">
                      {`${preview.changed} cells change · ${preview.merged} group${
                        preview.merged === 1 ? '' : 's'
                      } merged · ${preview.cleared} cells cleared`}
                      {preview.typeChangedTo ? ` · column type becomes ${preview.typeChangedTo}` : ''}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <button type="button" className="tb-btn" onClick={() => changeOpen(false)}>
                {t('levels.cancel')}
              </button>
              {mode === 'levels' ? (
                <button type="button" className="tb-btn bg-accent text-white border-accent" onClick={apply}>
                  {t('levels.applyLevels')}
                </button>
              ) : (
                <>
                  <button type="button" className="tb-btn" onClick={() => setMode('levels')}>
                    {t('levels.back')}
                  </button>
                  <button
                    type="button"
                    className="tb-btn bg-accent text-white border-accent"
                    disabled={Object.keys(recodeMapping).length === 0}
                    onClick={applyRecode}
                  >
                    {t('levels.applyRecode')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
