import { useState } from 'react';
import {
  ArrowUpDown,
  Merge,
  Repeat2,
  Scissors,
  ScissorsLineDashed,
  Sigma,
} from 'lucide-react';
import type { GridData } from './types';
import { t } from '../i18n';
import {
  computeColumn,
  mergeColumns,
  recodeColumnValues,
  sortByColumn,
  splitColumn,
  splitColumnAll,
} from './ops';
import { Operation } from './OperationPopover';
import {
  clampColumn,
  ColumnSelect,
  inputClass,
  OpField,
  selectClass,
  type TransformApply,
} from './OperationFields';

const SortOperation = ({ grid, onApply }: { grid: GridData; onApply: TransformApply }) => {
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(0);
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const column = clampColumn(col, grid.cols.length);

  const changeOpen = (next: boolean) => {
    if (next) {
      setCol(0);
      setDir('asc');
    }
    setOpen(next);
  };

  return (
    <Operation
      id="sort"
      label={t('data.transform.sort')}
      hint={t('data.op.sortHint')}
      icon={ArrowUpDown}
      open={open}
      onOpenChange={changeOpen}
      onRun={() => {
        onApply(sortByColumn(grid, column, dir), `${t('data.sortedBy')} ${grid.cols[column]?.name ?? ''}`);
        return true;
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <OpField label={t('data.column')}>
          <ColumnSelect value={column} grid={grid} dataTransform="sort-col" onChange={setCol} />
        </OpField>
        <OpField label={t('data.transform.sort')}>
          <select
            className={selectClass}
            data-transform="sort-dir"
            value={dir}
            onChange={(event) => setDir(event.target.value as 'asc' | 'desc')}
          >
            <option value="asc">{t('data.transform.asc')}</option>
            <option value="desc">{t('data.transform.desc')}</option>
          </select>
        </OpField>
      </div>
    </Operation>
  );
};

const RecodeOperation = ({ grid, onApply }: { grid: GridData; onApply: TransformApply }) => {
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(0);
  const [text, setText] = useState('1=Yes\n2=No');
  const column = clampColumn(col, grid.cols.length);

  const changeOpen = (next: boolean) => {
    if (next) {
      setCol(0);
      setText('1=Yes\n2=No');
    }
    setOpen(next);
  };

  const parseMapping = (): Record<string, string> => {
    const map: Record<string, string> = {};
    text.split('\n').forEach((line) => {
      const index = line.indexOf('=');
      if (index > 0) map[line.slice(0, index)] = line.slice(index + 1);
    });
    return map;
  };

  return (
    <Operation
      id="recode"
      label={t('data.transform.recodeAction')}
      hint={t('data.op.recodeHint')}
      icon={Repeat2}
      open={open}
      onOpenChange={changeOpen}
      onRun={() => {
        const result = recodeColumnValues(grid, column, parseMapping());
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
        return true;
      }}
    >
      <div className="flex flex-col gap-2">
        <OpField label={t('data.column')}>
          <ColumnSelect value={column} grid={grid} dataTransform="recode-col" onChange={setCol} />
        </OpField>
        <OpField label={t('data.transform.recode')}>
          <textarea
            className={`${inputClass} h-24 font-mono`}
            data-transform="recode-map"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </OpField>
      </div>
    </Operation>
  );
};

const SplitOperation = ({
  grid,
  mode,
  onApply,
}: {
  grid: GridData;
  mode: 'first' | 'all';
  onApply: TransformApply;
}) => {
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(0);
  const [sep, setSep] = useState(';');
  const column = clampColumn(col, grid.cols.length);

  const changeOpen = (next: boolean) => {
    if (next) {
      setCol(0);
      setSep(';');
    }
    setOpen(next);
  };

  const all = mode === 'all';
  const label = all ? t('data.transform.splitAll') : t('data.transform.split');
  const hint = all ? t('data.op.splitAllHint') : t('data.op.splitHint');

  return (
    <Operation
      id={all ? 'split-all' : 'split'}
      label={label}
      hint={hint}
      icon={all ? ScissorsLineDashed : Scissors}
      open={open}
      onOpenChange={changeOpen}
      onRun={() => {
        const next = all ? splitColumnAll(grid, column, sep) : splitColumn(grid, column, sep);
        onApply(next, t('data.transform.columnSplit'), 'ok', {
          kind: 'split',
          at: column,
          count: Math.max(1, next.cols.length - grid.cols.length),
        });
        return true;
      }}
    >
      <div className="grid grid-cols-[1fr_4.5rem] gap-2">
        <OpField label={t('data.column')}>
          <ColumnSelect value={column} grid={grid} dataTransform="split-col" onChange={setCol} />
        </OpField>
        <OpField label={t('data.transform.separator')}>
          <input
            className={`${inputClass} text-center`}
            data-transform="split-sep"
            value={sep}
            onChange={(event) => setSep(event.target.value)}
          />
        </OpField>
      </div>
    </Operation>
  );
};

const MergeOperation = ({ grid, onApply }: { grid: GridData; onApply: TransformApply }) => {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [sep, setSep] = useState('_');
  const left = clampColumn(a, grid.cols.length);
  const right = clampColumn(b, grid.cols.length);

  const changeOpen = (next: boolean) => {
    if (next) {
      setA(0);
      setB(Math.min(1, Math.max(0, grid.cols.length - 1)));
      setSep('_');
    }
    setOpen(next);
  };

  return (
    <Operation
      id="merge"
      label={t('data.transform.merge')}
      hint={t('data.op.mergeHint')}
      icon={Merge}
      open={open}
      onOpenChange={changeOpen}
      onRun={() => {
        onApply(mergeColumns(grid, left, right, sep), t('data.transform.columnsMerged'), 'ok', {
          kind: 'merge',
          a: left,
          b: right,
        });
        return true;
      }}
    >
      <div className="grid grid-cols-[1fr_1fr_4.5rem] gap-2">
        <OpField label={t('data.column')}>
          <ColumnSelect value={left} grid={grid} dataTransform="merge-a" onChange={setA} />
        </OpField>
        <OpField label={t('data.column')}>
          <ColumnSelect value={right} grid={grid} dataTransform="merge-b" onChange={setB} />
        </OpField>
        <OpField label={t('data.transform.separator')}>
          <input
            className={`${inputClass} text-center`}
            data-transform="merge-sep"
            value={sep}
            onChange={(event) => setSep(event.target.value)}
          />
        </OpField>
      </div>
    </Operation>
  );
};

const ComputeOperation = ({ grid, onApply }: { grid: GridData; onApply: TransformApply }) => {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('Score_Post - Score_Pre');
  const [name, setName] = useState('Diff');
  const [persistent, setPersistent] = useState(true);

  const changeOpen = (next: boolean) => {
    if (next) {
      setExpr('Score_Post - Score_Pre');
      setName('Diff');
      setPersistent(true);
    }
    setOpen(next);
  };

  return (
    <Operation
      id="compute"
      label={t('data.transform.computeAction')}
      hint={t('data.op.computeHint')}
      icon={Sigma}
      open={open}
      onOpenChange={changeOpen}
      onRun={() => {
        const colIndex: Record<string, number> = {};
        grid.cols.forEach((column, index) => {
          colIndex[column.name] = index;
        });
        const { grid: next, error } = computeColumn(
          grid,
          expr,
          name,
          colIndex,
          persistent ? expr : undefined
        );
        if (error) {
          onApply(grid, error, 'error');
          return false;
        }
        onApply(
          next,
          `${t('data.transform.computed')} ${name}${persistent ? ` ${t('data.transform.formulaSuffix')}` : ''}`,
          'ok'
        );
        return true;
      }}
    >
      <div className="flex flex-col gap-2">
        <OpField label={t('data.transform.compute')}>
          <input
            aria-label={t('data.formulaExpression')}
            className={`${inputClass} font-mono`}
            value={expr}
            onChange={(event) => setExpr(event.target.value)}
          />
        </OpField>
        <OpField label={t('data.transform.name')}>
          <input
            aria-label={t('data.newColumnName')}
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </OpField>
        <label className="flex items-center gap-2 text-[10px] text-text2" title={t('data.recalcHint')}>
          <input
            type="checkbox"
            className="accent-accent"
            checked={persistent}
            onChange={(event) => setPersistent(event.target.checked)}
          />
          {t('data.transform.formula')}
        </label>
      </div>
    </Operation>
  );
};

export const TransformOperations = ({
  grid,
  onApply,
}: {
  grid: GridData;
  onApply: TransformApply;
}) => (
  <>
    <SortOperation grid={grid} onApply={onApply} />
    <RecodeOperation grid={grid} onApply={onApply} />
    <SplitOperation grid={grid} mode="first" onApply={onApply} />
    <SplitOperation grid={grid} mode="all" onApply={onApply} />
    <MergeOperation grid={grid} onApply={onApply} />
    <ComputeOperation grid={grid} onApply={onApply} />
  </>
);
