import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import type { CategoryLevel, ColType, GridData } from './types';
import { COL_TYPES, columnLabel, columnLevels, isGroupColumn, levelLabel, validateValue } from './types';
import { rowMatches, type RowFilter } from './ops';
import { ROW_HEIGHT, visibleWindow } from './virtual';
import { t } from '../i18n';
import { LevelsEditor } from './LevelsEditor';

interface Props {
  grid: GridData;
  onCell: (r: number, c: number, val: string) => void;
  onRenameCol: (c: number, name: string) => void;
  onColType: (c: number, type: ColType) => void;
  onLevels: (c: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (c: number, mapping: Record<string, string>) => void;
  onInsertCol: (at: number) => void;
  onDuplicateCol: (c: number) => void;
  onMoveCol: (c: number, dir: -1 | 1) => void;
  onDeleteCol: (c: number) => void;
  onInsertRow: (at: number) => void;
  onDeleteRow: (r: number) => void;
  onPaste: (r: number, c: number, text: string) => void;
  onCopyRange: (range: { r0: number; c0: number; r1: number; c1: number }) => void;
  onClearRange: (range: { r0: number; c0: number; r1: number; c1: number }) => void;
  onFillDown: (range: { r0: number; c0: number; r1: number; c1: number }) => void;
  onFillRight: (range: { r0: number; c0: number; r1: number; c1: number }) => void;
  onSetRange: (range: { r0: number; c0: number; r1: number; c1: number }, value: string) => void;
  onSortCol?: (col: number, dir: 'asc' | 'desc') => void;
  onInspectCol?: (col: number) => void;
  onFocusCol?: (col: number) => void;
  rowFilter?: RowFilter | null;
  freezeFirstCol?: boolean;
  focusCell?: { r: number; c: number; stamp: number } | null;
  /** Change this key to clear the selection after a dataset replacement. */
  resetKey?: string;
}

export function DataGrid(props: Props) {
  const { grid, freezeFirstCol } = props;
  const visibleRows = useMemo(
    () =>
      grid.rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => rowMatches(grid, row, props.rowFilter ?? null)),
    [grid, props.rowFilter]
  );
  const [editingCol, setEditingCol] = useState<number | null>(null);
  const [draftName, setDraftName] = useState('');
  const [menu, setMenu] = useState<{ kind: 'col' | 'row'; index: number; x: number; y: number } | null>(null);
  const [anchor, setAnchor] = useState<{ r: number; c: number } | null>(null);
  const [sel, setSel] = useState<{ r0: number; c0: number; r1: number; c1: number } | null>(null);
  const [fillDrag, setFillDrag] = useState<{
    start: { r0: number; c0: number; r1: number; c1: number };
    target: { r: number; c: number };
  } | null>(null);
  const [levelEditorCell, setLevelEditorCell] = useState<{ r: number; c: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(600);
  // Only visible rows are mounted: with 5000 rows the previous table created
  // 5000 inputs per column and every keystroke re-rendered all of them.
  const win = visibleWindow(visibleRows.length, scrollTop, viewportH);
  const windowRows = visibleRows.slice(win.start, win.end);
  const menuRef = useRef<HTMLDivElement>(null);

  // Drag the small handle at the bottom-right corner of a selection to copy
  // the top/left edge across the rows/columns it covers.
  useEffect(() => {
    if (!fillDrag) return;
    const finish = () => {
      const { start, target } = fillDrag;
      const down = target.r - start.r1;
      const right = target.c - start.c1;
      if (down > 0 || (down >= 0 && right > 0)) {
        if (down >= right) {
          props.onFillDown({ r0: start.r0, c0: start.c0, r1: target.r, c1: start.c1 });
        } else {
          props.onFillRight({ r0: start.r0, c0: start.c0, r1: start.r1, c1: target.c });
        }
      }
      setFillDrag(null);
    };
    window.addEventListener('mouseup', finish);
    return () => window.removeEventListener('mouseup', finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillDrag]);

  const inSel = (r: number, c: number): boolean => {
    if (!sel) return false;
    const r0 = Math.min(sel.r0, sel.r1);
    const r1 = Math.max(sel.r0, sel.r1);
    const c0 = Math.min(sel.c0, sel.c1);
    const c1 = Math.max(sel.c0, sel.c1);
    return r >= r0 && r <= r1 && c >= c0 && c <= c1;
  };

  useEffect(() => {
    setAnchor(null);
    setSel(null);
    setFillDrag(null);
    setEditingCol(null);
    setMenu(null);
    setLevelEditorCell(null);
  }, [props.resetKey]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    // Delay so the same right-click that opened the menu does not close it.
    const t = setTimeout(() => window.addEventListener('click', close), 0);
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportH(el.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep the focused cell mounted before focusing it (validation jumps and
  // "Jump to first" can target a row outside the current window).
  useEffect(() => {
    if (!props.focusCell) return;
    const position = visibleRows.findIndex(item => item.index === props.focusCell?.r);
    const el = scrollRef.current;
    if (position >= 0 && el) {
      const top = position * ROW_HEIGHT;
      if (top < el.scrollTop || top + ROW_HEIGHT > el.scrollTop + el.clientHeight) {
        el.scrollTop = top;
        setScrollTop(top);
      }
    }
    const frame = requestAnimationFrame(() => {
      const cell = document.querySelector<HTMLElement>(
        `[data-cell="${props.focusCell?.r}-${props.focusCell?.c}"]`
      );
      cell?.focus();
      cell?.scrollIntoView({ block: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
    // `visibleRows` is derived from the grid and the filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focusCell]);

  // Deleting rows or applying a filter can leave the scroll position past the
  // new end; pull it back so the table never shows a blank viewport.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(0, visibleRows.length * ROW_HEIGHT - el.clientHeight);
    if (el.scrollTop > max) {
      el.scrollTop = max;
      setScrollTop(max);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleRows.length]);

  /**
   * When a multi-cell selection is active, Tab from its bottom-right cell
   * moves focus to the fill handle instead of skipping it. The handle is the
   * next focusable element and keeps the normal Tab order afterwards.
   */
  const focusFillHandle = (
    event: React.KeyboardEvent<HTMLElement>,
    row: number,
    column: number
  ): boolean => {
    if (!sel || (sel.r0 === sel.r1 && sel.c0 === sel.c1)) return false;
    if (Math.max(sel.r0, sel.r1) !== row || Math.max(sel.c0, sel.c1) !== column) return false;
    const handle = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
      '[data-fill-handle]'
    );
    if (!handle) return false;
    handle.focus();
    return true;
  };

  const commitRename = (c: number) => {
    if (draftName.trim() && draftName.trim() !== grid.cols[c].name) props.onRenameCol(c, draftName);
    setEditingCol(null);
  };

  const moveTo = (rIdx: number, cIdx: number, dr: number, dc: number, shift: boolean) => {
    let nr = rIdx;
    if (dr !== 0) {
      const pos = visibleRows.findIndex((entry) => entry.index === rIdx);
      const next = Math.max(0, Math.min(visibleRows.length - 1, pos + dr));
      nr = visibleRows[next]?.index ?? rIdx;
    }
    const nc = Math.max(0, Math.min(grid.cols.length - 1, cIdx + dc));
    if (shift && anchor) {
      setSel({ r0: anchor.r, c0: anchor.c, r1: nr, c1: nc });
    } else {
      setAnchor({ r: nr, c: nc });
      setSel({ r0: nr, c0: nc, r1: nr, c1: nc });
    }
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus();
    });
  };

  const openMenu = (e: React.MouseEvent, kind: 'col' | 'row', index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ kind, index, x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto scrollbar"
        onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
      >
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-surface2">
              <th scope="col" className={`w-10 border border-border p-1 text-text3 ${freezeFirstCol ? 'sticky left-0 z-30 bg-surface2' : ''}`}>#</th>
              {grid.cols.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`group border border-border p-1 text-accent2 min-w-[100px] cursor-context-menu select-none ${
                    freezeFirstCol && i === 0 ? 'sticky left-10 z-20 bg-surface2' : ''
                  }`}
                  title={`${t('grid.menuRename')}: ${col.name}`}
                  onDoubleClick={() => {
                    setEditingCol(i);
                    setDraftName(col.name);
                  }}
                  onContextMenu={(e) => openMenu(e, 'col', i)}
                >
                  {editingCol === i ? (
                    <input
                      autoFocus
                      aria-label={`${t('grid.menuRename')}: ${col.name}`}
                      maxLength={64}
                      className="w-full bg-surface3 border border-accent rounded px-1 py-0.5 text-text outline-none text-center"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onFocus={(e) => e.currentTarget.select()}
                      onBlur={() => commitRename(i)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(i);
                        if (e.key === 'Escape') setEditingCol(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <span className="truncate">{col.name}</span>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-text3 hover:text-accent transition-opacity"
                        title={`${t('grid.renameTitle')} "${col.name}"`}
                        aria-label={`${t('grid.renameAria')} ${col.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCol(i);
                          setDraftName(col.name);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </th>
              ))}
            </tr>
            <tr className="bg-surface2/80 backdrop-blur">
              <th
                scope="col"
                className={`border border-border text-[8px] text-text3 uppercase p-1 ${freezeFirstCol ? 'sticky left-0 z-30 bg-surface2' : ''}`}
                title={
                  t('grid.typeHint') + '\n' +
                  COL_TYPES.map((item) => `${item.label} = ${item.full}`).join('\n')
                }
              >
                {t('inspector.type')}
              </th>
              {grid.cols.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`border border-border p-0 ${
                    freezeFirstCol && i === 0 ? 'sticky left-10 z-20 bg-surface2' : ''
                  }`}
                >
                  <div className="relative">
                    <select
                      aria-label={`${t('inspector.type')}: ${col.name}`}
                      title={COL_TYPES.find((t) => t.id === col.type)?.full ?? col.type}
                      className="w-full bg-transparent border-none text-accent2 text-[10px] font-semibold py-1 pl-1 pr-5 outline-none appearance-none text-center cursor-pointer hover:bg-white/5"
                      value={col.type}
                      onChange={(e) => props.onColType(i, e.target.value as ColType)}
                    >
                      {COL_TYPES.map((t) => (
                        <option key={t.id} value={t.id} title={t.full}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-text3" />
                  </div>
                  {(col.type === 'cat' || isGroupColumn(grid, i)) && (
                    <LevelsEditor
                      grid={grid}
                      column={i}
                      onLevels={props.onLevels}
                      onRecode={props.onRecode}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={grid.cols.length + 1}
                  className="border border-border p-4 text-center text-text3 italic"
                >
                  {t('data.noRowsMatch')}
                </td>
              </tr>
            )}
            {win.padTop > 0 && (
              <tr aria-hidden="true" style={{ height: win.padTop }}>
                <td colSpan={grid.cols.length + 1} className="p-0 border-0" />
              </tr>
            )}
            {windowRows.map(({ row, index: rIdx }) => (
              <tr key={rIdx} style={{ height: ROW_HEIGHT }} className="hover:bg-white/5 transition-colors">
                <th
                  scope="row"
                  className={`border border-border text-center font-normal text-text3 bg-surface2/30 cursor-context-menu select-none ${
                    freezeFirstCol ? 'sticky left-0 z-10 bg-surface2' : ''
                  }`}
                  title={t('grid.rowMenu')}
                  onContextMenu={(e) => openMenu(e, 'row', rIdx)}
                >
                  {rIdx + 1}
                </th>
                {row.map((cell, cIdx) => {
                  const col = grid.cols[cIdx];
                  const isValid = validateValue(cell, col?.type ?? 'str');
                  const selected = inSel(rIdx, cIdx);
                  const isCat = col?.type === 'cat';
                  const catLevels = isCat ? columnLevels(col, grid.rows, cIdx) : [];
                  const rawCell = String(cell ?? '');
                  const extraLevel = isCat && rawCell !== '' && !catLevels.some((level) => level.value === rawCell);
                  return (
                    <td
                      key={cIdx}
                      data-selected={selected || undefined}
                      onMouseEnter={() => {
                        if (fillDrag) setFillDrag({ ...fillDrag, target: { r: rIdx, c: cIdx } });
                      }}
                      className={`border border-border p-0 relative ${
                        selected ? 'outline outline-1 outline-accent' : ''
                      } ${
                        freezeFirstCol && cIdx === 0 ? 'sticky left-10 z-10 bg-bg' : ''
                      }`}
                    >
                      {isCat ? (
                        <div className="relative h-full">
                        <select
                          data-cell={`${rIdx}-${cIdx}`}
                          aria-label={`${col ? columnLabel(col) : t('form.group')} ${t('grid.rowLabel')} ${rIdx + 1}`}
                          title={extraLevel ? `${rawCell} ${t('grid.notInLevels')}` : undefined}
                          className={`w-full h-full bg-transparent border-none pl-2 pr-6 py-1 text-text outline-none focus:bg-accent/10 transition-colors cursor-pointer ${extraLevel ? 'italic text-yellow' : ''} ${selected ? 'bg-accent/10' : ''}`}
                          value={rawCell}
                          onFocus={(e) => {
                            props.onFocusCol?.(cIdx);
                            const ae = e.relatedTarget as HTMLElement | null;
                            if (ae?.dataset?.cell) return;
                            setAnchor({ r: rIdx, c: cIdx });
                            setSel({ r0: rIdx, c0: cIdx, r1: rIdx, c1: cIdx });
                          }}
                          onClick={(e) => {
                            if (e.shiftKey && anchor) {
                              setSel({ r0: anchor.r, c0: anchor.c, r1: rIdx, c1: cIdx });
                            } else {
                              setAnchor({ r: rIdx, c: cIdx });
                              setSel({ r0: rIdx, c0: cIdx, r1: rIdx, c1: cIdx });
                            }
                          }}
                          onChange={(e) => {
                            const multi = sel && (sel.r0 !== sel.r1 || sel.c0 !== sel.c1);
                            if (multi && inSel(rIdx, cIdx)) props.onSetRange(sel, e.target.value);
                            else props.onCell(rIdx, cIdx, e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); moveTo(rIdx, cIdx, e.shiftKey ? -1 : 1, 0, e.shiftKey); }
                            else if (e.key === 'Tab') {
                              e.preventDefault();
                              if (!e.shiftKey && focusFillHandle(e, rIdx, cIdx)) return;
                              moveTo(rIdx, cIdx, 0, e.shiftKey ? -1 : 1, e.shiftKey);
                            }
                            else if (e.key === 'Escape') { e.currentTarget.blur(); }
                          }}
                          onPaste={(e) => {
                            const text = e.clipboardData.getData('text');
                            if (text.includes('\t') || text.includes('\n')) {
                              e.preventDefault();
                              props.onPaste(rIdx, cIdx, text);
                            } else if (text.trim() !== '') {
                              e.preventDefault();
                              props.onCell(rIdx, cIdx, text.trim());
                            }
                          }}
                        >
                          <option value="">—</option>
                          {catLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                          {extraLevel && <option value={rawCell}>{rawCell} {t('grid.notInList')}</option>}
                        </select>
                        <button
                          type="button"
                          data-add-level={cIdx}
                          aria-label={`${t('grid.addLevel')}: ${col ? columnLabel(col) : t('form.group')}`}
                          title={t('grid.addLevel')}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1 text-[10px] text-text3 hover:bg-border hover:text-accent"
                          onMouseDown={event => event.stopPropagation()}
                          onClick={event => {
                            event.stopPropagation();
                            setLevelEditorCell({ r: rIdx, c: cIdx });
                          }}
                        >
                          +
                        </button>
                        {levelEditorCell?.r === rIdx && levelEditorCell.c === cIdx && (
                          <LevelsEditor
                            grid={grid}
                            column={cIdx}
                            onLevels={props.onLevels}
                            onRecode={props.onRecode}
                            controlledOpen
                            showTrigger={false}
                            onOpenChange={open => {
                              if (open) return;
                              setLevelEditorCell(null);
                              requestAnimationFrame(() => {
                                document
                                  .querySelector<HTMLElement>(`[data-cell="${rIdx}-${cIdx}"]`)
                                  ?.focus();
                              });
                            }}
                          />
                        )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          data-cell={`${rIdx}-${cIdx}`}
                          aria-label={`${col ? columnLabel(col) : t('form.group')} ${t('grid.rowLabel')} ${rIdx + 1}`}
                          className={`w-full h-full bg-transparent border-none px-2 py-1 text-text outline-none focus:bg-accent/10 transition-colors ${!isValid ? 'cell-invalid' : ''} ${selected ? 'bg-accent/10' : ''}`}
                          value={cell}
                          onFocus={(e) => {
                            // Programmatic focus from keyboard nav already set the
                            // anchor/selection; do not collapse a shift-selection.
                            props.onFocusCol?.(cIdx);
                            const ae = e.relatedTarget as HTMLElement | null;
                            if (ae?.dataset?.cell) return;
                            setAnchor({ r: rIdx, c: cIdx });
                            setSel({ r0: rIdx, c0: cIdx, r1: rIdx, c1: cIdx });
                          }}
                          onClick={(e) => {
                            if (e.shiftKey && anchor) {
                              setSel({ r0: anchor.r, c0: anchor.c, r1: rIdx, c1: cIdx });
                            } else {
                              setAnchor({ r: rIdx, c: cIdx });
                              setSel({ r0: rIdx, c0: cIdx, r1: rIdx, c1: cIdx });
                            }
                          }}
                          onChange={(e) => {
                            const multi = sel && (sel.r0 !== sel.r1 || sel.c0 !== sel.c1);
                            if (multi && inSel(rIdx, cIdx)) props.onSetRange(sel, e.target.value);
                            else props.onCell(rIdx, cIdx, e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') { e.preventDefault(); moveTo(rIdx, cIdx, 1, 0, e.shiftKey); }
                            else if (e.key === 'ArrowUp') { e.preventDefault(); moveTo(rIdx, cIdx, -1, 0, e.shiftKey); }
                            else if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(rIdx, cIdx, 0, -1, e.shiftKey); }
                            else if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(rIdx, cIdx, 0, 1, e.shiftKey); }
                            else if (e.key === 'Enter') { e.preventDefault(); moveTo(rIdx, cIdx, e.shiftKey ? -1 : 1, 0, e.shiftKey); }
                            else if (e.key === 'Tab') {
                              e.preventDefault();
                              if (!e.shiftKey && focusFillHandle(e, rIdx, cIdx)) return;
                              moveTo(rIdx, cIdx, 0, e.shiftKey ? -1 : 1, e.shiftKey);
                            }
                            else if ((e.key === 'Delete' || e.key === 'Backspace') && e.ctrlKey && sel) {
                              e.preventDefault();
                              props.onClearRange(sel);
                            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && sel) {
                              e.preventDefault();
                              props.onCopyRange(sel);
                            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && sel) {
                              e.preventDefault();
                              props.onFillDown(sel);
                            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r' && sel) {
                              e.preventDefault();
                              props.onFillRight(sel);
                            }
                          }}
                          onPaste={(e) => {
                            const text = e.clipboardData.getData('text');
                            if (text.includes('\t') || text.includes('\n')) {
                              e.preventDefault();
                              props.onPaste(rIdx, cIdx, text);
                            }
                          }}
                        />
                      )}
                      {sel &&
                        Math.max(sel.r0, sel.r1) === rIdx &&
                        Math.max(sel.c0, sel.c1) === cIdx && (
                          <button
                            type="button"
                            data-fill-handle
                            aria-label={t('grid.fillHandle')}
                            aria-keyshortcuts="Enter Shift+Enter"
                            title={t('grid.fillHandleTitle')}
                            className="absolute bottom-0 right-0 z-10 h-2 w-2 cursor-crosshair border border-white/70 bg-accent focus:outline focus:outline-2 focus:outline-accent"
                            onMouseDown={event => {
                              event.preventDefault();
                              event.stopPropagation();
                              setFillDrag({
                                start: {
                                  r0: Math.min(sel.r0, sel.r1),
                                  c0: Math.min(sel.c0, sel.c1),
                                  r1: Math.max(sel.r0, sel.r1),
                                  c1: Math.max(sel.c0, sel.c1),
                                },
                                target: { r: rIdx, c: cIdx },
                              });
                            }}
                            onKeyDown={event => {
                              if (event.key !== 'Enter') return;
                              event.preventDefault();
                              event.stopPropagation();
                              const range = {
                                r0: Math.min(sel.r0, sel.r1),
                                c0: Math.min(sel.c0, sel.c1),
                                r1: Math.max(sel.r0, sel.r1),
                                c1: Math.max(sel.c0, sel.c1),
                              };
                              if (event.shiftKey) props.onFillRight(range);
                              else props.onFillDown(range);
                            }}
                          />
                        )}
                      {!isCat && cell === '' && <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-text3 pointer-events-none italic opacity-50">{t('grid.null')}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {win.padBottom > 0 && (
              <tr aria-hidden="true" style={{ height: win.padBottom }}>
                <td colSpan={grid.cols.length + 1} className="p-0 border-0" />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {menu && (
        <div
          ref={menuRef}
          className="fixed z-[9999] bg-surface2 border border-border2 rounded shadow-2xl py-1 min-w-[170px] text-[11px]"
          style={{ left: Math.min(menu.x, window.innerWidth - 190), top: Math.min(menu.y, window.innerHeight - 260) }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.kind === 'col' ? (
            <>
              <MenuItem
                label={t('grid.menuDetails')}
                onClick={() => {
                  props.onInspectCol?.(menu.index);
                  setMenu(null);
                }}
              />
              <MenuItem
                label={t('grid.menuRename')}
                onClick={() => {
                  setEditingCol(menu.index);
                  setDraftName(grid.cols[menu.index]?.name ?? '');
                  setMenu(null);
                }}
              />
              <div className="h-px bg-border my-1" />
              <MenuItem
                label={t('grid.menuSortAsc')}
                onClick={() => {
                  props.onSortCol?.(menu.index, 'asc');
                  setMenu(null);
                }}
              />
              <MenuItem
                label={t('grid.menuSortDesc')}
                onClick={() => {
                  props.onSortCol?.(menu.index, 'desc');
                  setMenu(null);
                }}
              />
              <div className="h-px bg-border my-1" />
              <MenuItem label={t('grid.menuInsertLeft')} onClick={() => { setMenu(null); props.onInsertCol(menu.index); }} />
              <MenuItem label={t('grid.menuInsertRight')} onClick={() => { setMenu(null); props.onInsertCol(menu.index + 1); }} />
              <MenuItem label={t('grid.menuDuplicate')} onClick={() => { setMenu(null); props.onDuplicateCol(menu.index); }} />
              <MenuItem label={t('grid.menuMoveLeft')} onClick={() => { setMenu(null); props.onMoveCol(menu.index, -1); }} />
              <MenuItem label={t('grid.menuMoveRight')} onClick={() => { setMenu(null); props.onMoveCol(menu.index, 1); }} />
              <div className="h-px bg-border my-1" />
              <MenuItem danger label={t('grid.menuDeleteColumn')} onClick={() => { setMenu(null); props.onDeleteCol(menu.index); }} />
            </>
          ) : (
            <>
              <MenuItem label={t('grid.menuInsertAbove')} onClick={() => { setMenu(null); props.onInsertRow(menu.index); }} />
              <MenuItem label={t('grid.menuInsertBelow')} onClick={() => { setMenu(null); props.onInsertRow(menu.index + 1); }} />
              <div className="h-px bg-border my-1" />
              <MenuItem danger label={t('grid.menuDeleteRow')} onClick={() => { setMenu(null); props.onDeleteRow(menu.index); }} />
            </>
          )}
        </div>
      )}

    </>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full text-left px-3 py-1.5 hover:bg-accent hover:text-white transition-colors ${danger ? 'text-red/90' : 'text-text2'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
