import { useEffect, useMemo, useState } from 'react';
import type { ColType, GridData } from '../../grid/types';
import type { Range } from '../../grid/ops';
import { t } from '../../i18n';
import {
  dataActionBlocked,
  dataIssueLabel,
  inspectData,
  type DataActionId,
  type DataActionParams,
  type DataIssue,
  type DataLeaf,
} from './data';

const COL_TYPES: readonly ColType[] = [
  'num', 'int', 'dec', 'cat', 'str', 'id', 'bol', 'dat', 'dtm', 'tim', 'alp', 'chr',
];

const parseCodes = (value: string): string[] =>
  value.split(',').map(code => code.trim()).filter(Boolean);

const parseMapping = (value: string): Record<string, string> => {
  const mapping: Record<string, string> = {};
  for (const line of value.split('\n')) {
    const [from, ...rest] = line.split('=');
    const key = from?.trim();
    const to = rest.join('=').trim();
    if (key) mapping[key] = to;
  }
  return mapping;
};

const QualityIssues = ({
  issues,
  onAction,
  onInspect,
}: {
  issues: DataIssue[];
  onAction: (action: DataActionId, params?: DataActionParams) => void;
  onInspect: (column: number) => void;
}) => {
  const fix = (issue: DataIssue) => {
    if (issue.kind === 'invalid') onAction('findInvalid');
    else if (issue.kind === 'missing') onAction('declareMissing', { column: issue.column });
    else onInspect(issue.column);
  };
  if (issues.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5" data-assistant-issues>
      {issues.slice(0, 8).map(issue => (
        <li
          key={`${issue.column}-${issue.kind}`}
          data-assistant-issue={`${issue.kind}-${issue.column}`}
          className="flex items-center justify-between gap-1 rounded border border-border2 bg-surface2/40 px-1.5 py-1 text-[10px]"
        >
          <span className="min-w-0 truncate text-text2">
            <span className="font-mono text-text">{issue.name}</span>{' '}
            {t(dataIssueLabel[issue.kind])}{' '}
            <span className="text-text3">({issue.count})</span>
          </span>
          <button
            type="button"
            onClick={() => fix(issue)}
            className="shrink-0 rounded border border-border2 px-1 text-[9px] text-accent2 hover:border-accent2"
          >
            {t('assistant.d.fix')}
          </button>
        </li>
      ))}
    </ul>
  );
};

/** Compact quality card shown at the data root and on the quality leaves. */
export const DataQualityCard = ({
  grid,
  onAction,
  onInspect,
}: {
  grid: GridData;
  onAction: (action: DataActionId, params?: DataActionParams) => void;
  onInspect: (column: number) => void;
}) => {
  const issues = useMemo(() => inspectData(grid), [grid]);
  return (
    <div data-assistant-quality className="rounded border border-border bg-surface2/30 p-1.5">
      <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
        {t('assistant.d.qualityTitle')}
      </span>
      {issues.length === 0 ? (
        <p className="mt-1 text-[10px] text-text2">{t('assistant.d.noIssues')}</p>
      ) : (
        <QualityIssues issues={issues} onAction={onAction} onInspect={onInspect} />
      )}
    </div>
  );
};

/**
 * Leaf of the data domain: pickers for the column/selection the action needs,
 * a one-click quality list and a single button wired to the editor command.
 */
export const DataLeafView = ({
  leaf,
  grid,
  selection,
  onAction,
  onInspect,
}: {
  leaf: DataLeaf;
  grid: GridData;
  selection: Range | null;
  onAction: (action: DataActionId, params?: DataActionParams) => void;
  onInspect: (column: number) => void;
}) => {
  const first = grid.cols[0];
  const [column, setColumn] = useState(0);
  const [type, setType] = useState<ColType>(first?.type ?? 'num');
  const [codes, setCodes] = useState(first?.missing?.join(', ') ?? '');
  const [mapping, setMapping] = useState('');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [move, setMove] = useState<-1 | 1>(1);

  // A different leaf must not inherit the pickers of the previous one.
  useEffect(() => {
    setColumn(0);
    setType(grid.cols[0]?.type ?? 'num');
    setCodes(grid.cols[0]?.missing?.join(', ') ?? '');
    setMapping('');
    setDirection('asc');
    setMove(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaf.id]);

  const needsColumn = leaf.requires === 'column';
  const needsSelection = leaf.requires === 'selection';
  const params: DataActionParams = {
    column: needsColumn ? column : undefined,
    type: leaf.action === 'setColumnType' ? type : undefined,
    codes: leaf.action === 'declareMissingCodes' ? parseCodes(codes) : undefined,
    mapping: leaf.action === 'recodeLevels' ? parseMapping(mapping) : undefined,
    direction: leaf.action === 'sortRows' ? direction : undefined,
    move: leaf.action === 'moveColumn' ? move : undefined,
  };
  const blocked = dataActionBlocked(leaf.action, params, { grid, selection });
  const quality = ['inspectTypes', 'declareMissing', 'findInvalid', 'inspectColumns'];

  const pickColumn = (value: number) => {
    setColumn(value);
    const col = grid.cols[value];
    setType(col?.type ?? 'num');
    setCodes(col?.missing?.join(', ') ?? '');
  };

  return (
    <div data-assistant-data-leaf={leaf.id} data-assistant-leaf-action={leaf.action}>
      <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
        {t('assistant.target')}
      </span>
      <p className="mt-1 text-[11px] leading-relaxed text-text">{t(leaf.help)}</p>
      {leaf.checks.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-4">
          {leaf.checks.map(key => (
            <li key={key} className="text-[10px] leading-relaxed text-text2">
              {t(key)}
            </li>
          ))}
        </ul>
      )}

      {needsColumn && (
        <label className="mt-2 block text-[10px] text-text2">
          {t('assistant.d.column')}
          <select
            data-assistant-column
            value={column}
            onChange={event => pickColumn(Number(event.target.value))}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[11px] text-text"
          >
            {grid.cols.map((col, index) => (
              <option key={col.id ?? index} value={index}>
                {col.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {leaf.action === 'setColumnType' && (
        <label className="mt-1.5 block text-[10px] text-text2">
          {t('assistant.d.type')}
          <select
            data-assistant-type
            value={type}
            onChange={event => setType(event.target.value as ColType)}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[11px] text-text"
          >
            {COL_TYPES.map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      )}

      {leaf.action === 'declareMissingCodes' && (
        <label className="mt-1.5 block text-[10px] text-text2">
          {t('assistant.d.codes')}
          <input
            data-assistant-codes
            value={codes}
            onChange={event => setCodes(event.target.value)}
            placeholder={t('assistant.d.codesHint')}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[11px] text-text"
          />
        </label>
      )}

      {leaf.action === 'recodeLevels' && (
        <label className="mt-1.5 block text-[10px] text-text2">
          {t('assistant.d.mapping')}
          <textarea
            data-assistant-mapping
            value={mapping}
            onChange={event => setMapping(event.target.value)}
            placeholder={t('assistant.d.mappingHint')}
            rows={3}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 font-mono text-[10px] text-text"
          />
        </label>
      )}

      {leaf.action === 'sortRows' && (
        <label className="mt-1.5 block text-[10px] text-text2">
          {t('assistant.d.direction')}
          <select
            data-assistant-direction
            value={direction}
            onChange={event => setDirection(event.target.value as 'asc' | 'desc')}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[11px] text-text"
          >
            <option value="asc">{t('assistant.d.asc')}</option>
            <option value="desc">{t('assistant.d.desc')}</option>
          </select>
        </label>
      )}

      {leaf.action === 'moveColumn' && (
        <label className="mt-1.5 block text-[10px] text-text2">
          {t('assistant.d.moveTo')}
          <select
            data-assistant-move
            value={move}
            onChange={event => setMove(Number(event.target.value) as -1 | 1)}
            className="mt-0.5 w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[11px] text-text"
          >
            <option value={1}>{t('assistant.d.moveRight')}</option>
            <option value={-1}>{t('assistant.d.moveLeft')}</option>
          </select>
        </label>
      )}

      {needsSelection && (
        <p data-assistant-selection className="mt-2 text-[10px] text-text2">
          {selection
            ? `${t('assistant.d.selection')}: R${Math.min(selection.r0, selection.r1) + 1}-${
                Math.max(selection.r0, selection.r1) + 1
              } C${Math.min(selection.c0, selection.c1) + 1}-${
                Math.max(selection.c0, selection.c1) + 1
              }`
            : t('assistant.d.noSelection')}
        </p>
      )}

      {quality.includes(leaf.action) && (
        <div className="mt-2">
          <DataQualityCard grid={grid} onAction={onAction} onInspect={onInspect} />
        </div>
      )}

      {blocked && (
        <p data-assistant-blocked className="mt-2 text-[9px] leading-snug text-yellow">
          {t(blocked)}
        </p>
      )}

      <button
        type="button"
        data-assistant-action
        data-assistant-handoff={leaf.action === 'handoffAnalysis' ? '' : undefined}
        disabled={blocked !== null}
        onClick={() => onAction(leaf.action, params)}
        className="mt-3 w-full rounded bg-accent px-2 py-1.5 text-[11px] font-semibold text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {leaf.action === 'handoffAnalysis'
          ? t('assistant.d.goal.handoff')
          : t('assistant.d.apply')}
      </button>
    </div>
  );
};
