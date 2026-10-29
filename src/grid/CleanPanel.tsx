import { useEffect, useState } from 'react';
import type { GridData } from './types';
import {
  findReplace, trimGrid, removeEmptyRows, removeDuplicateRows, fillMissing,
} from './ops';
import { t } from '../i18n';

interface Props {
  grid: GridData;
  onApply: (next: GridData, msg: string) => void;
}

export function CleanPanel({ grid, onApply }: Props) {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [regex, setRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [scopeCol, setScopeCol] = useState<number | 'all'>('all');
  const [fillCol, setFillCol] = useState(0);
  const [fillStrategy, setFillStrategy] = useState<'mean' | 'median' | 'mode' | 'value'>('mean');
  const [fillValue, setFillValue] = useState('');

  useEffect(() => {
    const max = Math.max(0, grid.cols.length - 1);
    if (fillCol > max) setFillCol(max);
    if (typeof scopeCol === 'number' && scopeCol > max) setScopeCol(max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  const runFindReplace = () => {
    const { grid: next, count } = findReplace(grid, search, replace, {
      regex,
      matchCase,
      col: scopeCol === 'all' ? null : scopeCol,
    });
    onApply(next, count === 0 ? t('clean.noMatches') : `${count} ${t('clean.replacements')}`);
  };

  return (
    <div className="bg-surface border-b border-border px-3 py-2 flex flex-wrap gap-4 items-end text-[11px] shrink-0">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.clean.findReplace')}</span>
        <div className="flex gap-1.5 items-center">
          <input className="bg-surface3 border border-border2 rounded px-2 py-1 w-24 text-text" placeholder={t('data.clean.find')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="bg-surface3 border border-border2 rounded px-2 py-1 w-24 text-text" placeholder={t('data.clean.replace')} value={replace} onChange={(e) => setReplace(e.target.value)} />
          <select className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={scopeCol === 'all' ? 'all' : String(scopeCol)} onChange={(e) => setScopeCol(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">{t('data.clean.allCols')}</option>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-text2"><input type="checkbox" className="accent-accent" checked={regex} onChange={(e) => setRegex(e.target.checked)} />{t('data.clean.regex')}</label>
          <label className="flex items-center gap-1 text-text2"><input type="checkbox" className="accent-accent" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />{t('data.clean.matchCase')}</label>
          <button className="tb-btn" onClick={runFindReplace}>{t('data.clean.apply')}</button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.clean.missing')}</span>
        <div className="flex gap-1.5 items-center">
          <select className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={fillCol} onChange={(e) => setFillCol(Number(e.target.value))}>
            {grid.cols.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
          <select className="bg-surface3 border border-border2 rounded px-1 py-1 text-text" value={fillStrategy} onChange={(e) => setFillStrategy(e.target.value as typeof fillStrategy)}>
            <option value="mean">{t('data.clean.mean')}</option>
            <option value="median">{t('data.clean.median')}</option>
            <option value="mode">{t('data.clean.mode')}</option>
            <option value="value">{t('data.clean.value')}</option>
          </select>
          {fillStrategy === 'value' && (
            <input className="bg-surface3 border border-border2 rounded px-2 py-1 w-20 text-text" placeholder={t('data.value')} value={fillValue} onChange={(e) => setFillValue(e.target.value)} />
          )}
          <button
            className="tb-btn"
            onClick={() => {
              const strategy = fillStrategy === 'value' ? { value: fillValue } : fillStrategy;
              const { grid: next, filled, fillWith } = fillMissing(grid, fillCol, strategy);
              onApply(next, filled === 0 ? t('clean.noFill') : `${filled} ${t('clean.filled')} ${fillWith}`);
            }}
          >
            {t('data.clean.fill')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-text3 font-mono uppercase tracking-widest">{t('data.clean.tidy')}</span>
        <div className="flex gap-1.5">
          <button
            className="tb-btn"
            onClick={() => {
              const { grid: next, changed } = trimGrid(grid);
              onApply(next, changed === 0 ? t('clean.noTrim') : `${changed} ${t('clean.trimmed')}`);
            }}
          >
            {t('data.clean.trim')}
          </button>
          <button
            className="tb-btn"
            onClick={() => {
              const { grid: next, removed } = removeEmptyRows(grid);
              onApply(next, removed === 0 ? t('clean.noEmpty') : `${removed} ${t('clean.emptyRemoved')}`);
            }}
          >
            {t('data.clean.dropEmpty')}
          </button>
          <button
            className="tb-btn"
            onClick={() => {
              const { grid: next, removed } = removeDuplicateRows(grid);
              onApply(next, removed === 0 ? t('clean.noDuplicates') : `${removed} ${t('clean.duplicatesRemoved')}`);
            }}
          >
            {t('data.clean.dropDuplicates')}
          </button>
        </div>
      </div>
    </div>
  );
}
