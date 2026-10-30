import { useState } from 'react';
import { CopyX, ListX, PaintBucket, RemoveFormatting, Replace } from 'lucide-react';
import type { GridData } from './types';
import { t } from '../i18n';
import {
  fillMissing,
  findReplace,
  removeDuplicateRows,
  removeEmptyRows,
  trimGrid,
} from './ops';
import { Operation } from './OperationPopover';
import {
  clampColumn,
  ColumnSelect,
  inputClass,
  OpField,
  selectClass,
  type CleanApply,
} from './OperationFields';

const FindReplaceOperation = ({ grid, onApply }: { grid: GridData; onApply: CleanApply }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [regex, setRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [scope, setScope] = useState<number | 'all'>('all');

  const changeOpen = (next: boolean) => {
    if (next) {
      setSearch('');
      setReplace('');
      setRegex(false);
      setMatchCase(false);
      setScope('all');
    }
    setOpen(next);
  };

  return (
    <Operation
      id="find-replace"
      label={t('data.clean.findReplace')}
      icon={Replace}
      open={open}
      onOpenChange={changeOpen}
      tooltipAlign="end"
      onRun={() => {
        const result = findReplace(grid, search, replace, {
          regex,
          matchCase,
          col: scope === 'all' ? null : clampColumn(scope, grid.cols.length),
        });
        onApply(
          result.grid,
          result.count === 0 ? t('clean.noMatches') : `${result.count} ${t('clean.replacements')}`
        );
        return true;
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <OpField label={t('data.clean.find')}>
            <input
              className={inputClass}
              data-clean="find"
              placeholder={t('data.clean.find')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </OpField>
          <OpField label={t('data.clean.replace')}>
            <input
              className={inputClass}
              data-clean="replace"
              placeholder={t('data.clean.replace')}
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
            />
          </OpField>
        </div>
        <OpField label={t('data.column')}>
          <select
            className={selectClass}
            data-clean="scope"
            value={scope === 'all' ? 'all' : String(clampColumn(scope, grid.cols.length))}
            onChange={(event) =>
              setScope(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
          >
            <option value="all">{t('data.clean.allCols')}</option>
            {grid.cols.map((column, index) => (
              <option key={index} value={index}>
                {column.name}
              </option>
            ))}
          </select>
        </OpField>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 text-[10px] text-text2">
            <input
              type="checkbox"
              className="accent-accent"
              data-clean="regex"
              checked={regex}
              onChange={(event) => setRegex(event.target.checked)}
            />
            {t('data.clean.regex')}
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-text2">
            <input
              type="checkbox"
              className="accent-accent"
              data-clean="match-case"
              checked={matchCase}
              onChange={(event) => setMatchCase(event.target.checked)}
            />
            {t('data.clean.matchCase')}
          </label>
        </div>
      </div>
    </Operation>
  );
};

const FillMissingOperation = ({ grid, onApply }: { grid: GridData; onApply: CleanApply }) => {
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(0);
  const [strategy, setStrategy] = useState<'mean' | 'median' | 'mode' | 'value'>('mean');
  const [value, setValue] = useState('');
  const column = clampColumn(col, grid.cols.length);

  const changeOpen = (next: boolean) => {
    if (next) {
      setCol(0);
      setStrategy('mean');
      setValue('');
    }
    setOpen(next);
  };

  return (
    <Operation
      id="fill"
      label={t('data.clean.fill')}
      icon={PaintBucket}
      open={open}
      onOpenChange={changeOpen}
      tooltipAlign="end"
      onRun={() => {
        const result = fillMissing(
          grid,
          column,
          strategy === 'value' ? { value } : strategy
        );
        onApply(
          result.grid,
          result.filled === 0
            ? t('clean.noFill')
            : `${result.filled} ${t('clean.filled')} ${result.fillWith}`
        );
        return true;
      }}
    >
      <div className="flex flex-col gap-2">
        <OpField label={t('data.column')}>
          <ColumnSelect value={column} grid={grid} dataClean="column" onChange={setCol} />
        </OpField>
        <OpField label={t('data.clean.missing')}>
          <select
            className={selectClass}
            data-clean="strategy"
            value={strategy}
            onChange={(event) => setStrategy(event.target.value as typeof strategy)}
          >
            <option value="mean">{t('data.clean.mean')}</option>
            <option value="median">{t('data.clean.median')}</option>
            <option value="mode">{t('data.clean.mode')}</option>
            <option value="value">{t('data.clean.value')}</option>
          </select>
        </OpField>
        {strategy === 'value' && (
          <OpField label={t('data.value')}>
            <input
              className={inputClass}
              data-clean="value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </OpField>
        )}
      </div>
    </Operation>
  );
};

const TrimOperation = ({ grid, onApply }: { grid: GridData; onApply: CleanApply }) => {
  const [open, setOpen] = useState(false);
  return (
    <Operation
      id="trim"
      label={t('data.clean.trim')}
      icon={RemoveFormatting}
      open={open}
      onOpenChange={setOpen}
      tooltipAlign="end"
      onRun={() => {
        const result = trimGrid(grid);
        onApply(
          result.grid,
          result.changed === 0 ? t('clean.noTrim') : `${result.changed} ${t('clean.trimmed')}`
        );
        return true;
      }}
    >
      {null}
    </Operation>
  );
};

const DropEmptyOperation = ({ grid, onApply }: { grid: GridData; onApply: CleanApply }) => {
  const [open, setOpen] = useState(false);
  return (
    <Operation
      id="drop-empty"
      label={t('data.clean.dropEmpty')}
      icon={ListX}
      open={open}
      onOpenChange={setOpen}
      tooltipAlign="end"
      onRun={() => {
        const result = removeEmptyRows(grid);
        onApply(
          result.grid,
          result.removed === 0 ? t('clean.noEmpty') : `${result.removed} ${t('clean.emptyRemoved')}`
        );
        return true;
      }}
    >
      {null}
    </Operation>
  );
};

const DropDuplicatesOperation = ({ grid, onApply }: { grid: GridData; onApply: CleanApply }) => {
  const [open, setOpen] = useState(false);
  return (
    <Operation
      id="drop-duplicates"
      label={t('data.clean.dropDuplicates')}
      icon={CopyX}
      open={open}
      onOpenChange={setOpen}
      tooltipAlign="end"
      onRun={() => {
        const result = removeDuplicateRows(grid);
        onApply(
          result.grid,
          result.removed === 0
            ? t('clean.noDuplicates')
            : `${result.removed} ${t('clean.duplicatesRemoved')}`
        );
        return true;
      }}
    >
      {null}
    </Operation>
  );
};

export const CleanOperations = ({
  grid,
  onApply,
}: {
  grid: GridData;
  onApply: CleanApply;
}) => (
  <>
    <FindReplaceOperation grid={grid} onApply={onApply} />
    <FillMissingOperation grid={grid} onApply={onApply} />
    <TrimOperation grid={grid} onApply={onApply} />
    <DropEmptyOperation grid={grid} onApply={onApply} />
    <DropDuplicatesOperation grid={grid} onApply={onApply} />
  </>
);
