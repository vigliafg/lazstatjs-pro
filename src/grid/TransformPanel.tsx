import { useEffect, useState } from 'react';
import type { GridData } from './types';
import { sortByColumn, recodeColumnValues, splitColumn, splitColumnAll, mergeColumns, computeColumn } from './ops';
import type { ColumnOperation } from './columnOps';
import { t } from '../i18n';

interface Props {
  grid: GridData;
  onApply: (
    next: GridData,
    msg: string,
    kind?: 'ok' | 'warn' | 'error',
    operation?: ColumnOperation
  ) => void;
}

export function TransformPanel({ grid, onApply }: Props) {
  const [sortCol, setSortCol] = useState(0);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [recodeCol, setRecodeCol] = useState(0);
  const [recodeText, setRecodeText] = useState('1=Yes\n2=No');
  const [splitCol, setSplitCol] = useState(0);
  const [splitSep, setSplitSep] = useState(';');
  const [mergeA, setMergeA] = useState(0);
  const [mergeB, setMergeB] = useState(1);
  const [mergeSep, setMergeSep] = useState('_');
  const [expr, setExpr] = useState('Score_Post - Score_Pre');
  const [exprName, setExprName] = useState('Diff');
  const [persistent, setPersistent] = useState(true);

  // Column indexes go stale after delete/merge: clamp into range.
  useEffect(() => {
    const max = Math.max(0, grid.cols.length - 1);
    if (sortCol > max) setSortCol(max);
    if (recodeCol > max) setRecodeCol(max);
    if (splitCol > max) setSplitCol(max);
    if (mergeA > max) setMergeA(max);
    if (mergeB > max) setMergeB(Math.min(max, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  const parseMapping = (): Record<string, string> => {
    const map: Record<string, string> = {};
    recodeText.split('\n').forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > 0) map[line.slice(0, idx)] = line.slice(idx + 1);
    });
    return map;
  };

  return (
    <div className="bg-surface border-b border-border px-3 py-2 flex flex-wrap gap-4 items-end text-[11px] shrink-0">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.transform.sort')}</span>
        <div className="flex gap-1.5 items-center">
          <select data-transform="sort-col" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={sortCol} onChange={(e) => setSortCol(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <select data-transform="sort-dir" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}>
            <option value="asc">{t('data.transform.asc')}</option>
            <option value="desc">{t('data.transform.desc')}</option>
          </select>
          <button data-transform="sort-apply" className="tb-btn" onClick={() => onApply(sortByColumn(grid, sortCol, sortDir), `${t('data.sortedBy')} ${grid.cols[sortCol]?.name}`)}>{t('data.transform.sort')}</button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.transform.recode')}</span>
        <div className="flex gap-1.5 items-start">
          <select data-transform="recode-col" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={recodeCol} onChange={(e) => setRecodeCol(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <textarea data-transform="recode-map" className="bg-surface3 border border-border2 rounded px-2 py-1 w-28 h-[52px] text-text font-mono" value={recodeText} onChange={(e) => setRecodeText(e.target.value)} />
          <button
            className="tb-btn"
            data-transform="recode-apply"
            onClick={() => {
              const result = recodeColumnValues(grid, recodeCol, parseMapping());
              const parts = [`${result.changed} ${t('recode.cells')}`];
              if (result.merged > 0) parts.push(`${result.merged} ${t('recode.merged')}`);
              if (result.cleared > 0) parts.push(`${result.cleared} ${t('recode.cleared')}`);
              if (result.typeChangedTo) parts.push(`${t('recode.typeChanged')} → ${result.typeChangedTo}`);
              if (result.formulaDropped) parts.push(t('data.transform.formulaDropped'));
              onApply(
                result.grid,
                result.changed === 0 ? t('data.transform.noRecoded') : parts.join(', '),
                result.changed === 0 ? 'warn' : 'ok'
              );
            }}
          >
            {t('data.transform.recodeAction')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.transform.splitMerge')}</span>
        <div className="flex gap-1.5 items-center">
          <select data-transform="split-col" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={splitCol} onChange={(e) => setSplitCol(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <input data-transform="split-sep" className="bg-surface3 border border-border2 rounded px-1 py-1 w-10 text-text text-center" value={splitSep} onChange={(e) => setSplitSep(e.target.value)} title={t('data.transform.separator')} />
          <button data-transform="split-apply" className="tb-btn" onClick={() => onApply(splitColumn(grid, splitCol, splitSep), t('data.transform.columnSplit'), 'ok', { kind: 'split', at: splitCol })}>{t('data.transform.split')}</button>
          <button data-transform="split-all" className="tb-btn" onClick={() => onApply(splitColumnAll(grid, splitCol, splitSep), t('data.transform.columnSplit'), 'ok', { kind: 'split', at: splitCol })}>{t('data.transform.splitAll')}</button>
          <span className="text-text3">|</span>
          <select data-transform="merge-a" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={mergeA} onChange={(e) => setMergeA(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <select data-transform="merge-b" className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={mergeB} onChange={(e) => setMergeB(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <input data-transform="merge-sep" className="bg-surface3 border border-border2 rounded px-1 py-1 w-10 text-text text-center" value={mergeSep} onChange={(e) => setMergeSep(e.target.value)} title={t('data.transform.separator')} />
          <button data-transform="merge-apply" className="tb-btn" onClick={() => onApply(mergeColumns(grid, mergeA, mergeB, mergeSep), t('data.transform.columnsMerged'), 'ok', { kind: 'merge', a: mergeA, b: mergeB })}>{t('data.transform.merge')}</button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.transform.compute')}</span>
        <div className="flex gap-1.5 items-center">
          <input
            aria-label={t('data.formulaExpression')}
            className="bg-surface3 border border-border2 rounded px-2 py-1 w-40 text-text font-mono"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
          />
          <input
            aria-label={t('data.newColumnName')}
            className="bg-surface3 border border-border2 rounded px-2 py-1 w-20 text-text"
            value={exprName}
            onChange={(e) => setExprName(e.target.value)}
            placeholder={t('data.transform.name')}
          />
          <label className="flex items-center gap-1 text-text2" title={t('data.recalcHint')}>
            <input
              type="checkbox"
              className="accent-accent"
              checked={persistent}
              onChange={(e) => setPersistent(e.target.checked)}
            />
            {t('data.transform.formula')}
          </label>
          <button
            className="tb-btn"
            onClick={() => {
              const colIndex: Record<string, number> = {};
              grid.cols.forEach((c, i) => {
                colIndex[c.name] = i;
              });
              const { grid: next, error } = computeColumn(
                grid,
                expr,
                exprName,
                colIndex,
                persistent ? expr : undefined
              );
              if (error) onApply(grid, error, 'error');
              else onApply(next, `${t('data.transform.computed')} ${exprName}${persistent ? ` ${t('data.transform.formulaSuffix')}` : ''}`, 'ok');
            }}
          >
            {t('data.transform.computeAction')}
          </button>
        </div>
      </div>
    </div>
  );
}
