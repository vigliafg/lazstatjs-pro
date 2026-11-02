import { useMemo, useState, type DragEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { t } from '../../i18n';
import type { AnalysisChart } from '../../stats/charts';
import type { GridData } from '../../grid/types';
import { BUILDER_KINDS, buildGraphChart, type BuilderKind, type BuilderSpec } from '../../charts/builder';
import { VegaChart } from './VegaChart';
import { mergeOptions } from '../../charts/defaults';

interface GraphBuilderDialogProps {
  grid: GridData;
  onAdd: (chart: AnalysisChart) => void;
  onClose: () => void;
}

type Slot = 'x' | 'y' | 'group';

const kindLabel = (kind: BuilderKind): string => {
  switch (kind) {
    case 'scatter':
      return t('builder.kind.scatter');
    case 'line':
      return t('builder.kind.line');
    case 'bar':
      return t('builder.kind.bar');
    case 'box':
      return t('builder.kind.box');
    case 'histogram':
      return t('builder.kind.histogram');
  }
};

/**
 * Small Graph Builder: assign X, Y and an optional group by drag-and-drop (or
 * click a column, then a slot) and preview one of the existing chart kinds.
 * It does not introduce a new renderer: the preview is the same VegaChart used
 * by every run-report.
 */
export const GraphBuilderDialog = ({ grid, onAdd, onClose }: GraphBuilderDialogProps) => {
  const [kind, setKind] = useState<BuilderKind>('scatter');
  const [roles, setRoles] = useState<{ x: number; y: number; group: number }>({
    x: 0,
    y: 1,
    group: -1,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<Slot | null>(null);

  const spec: BuilderSpec = { kind, x: roles.x, y: roles.y, group: roles.group };
  const chart = useMemo(() => buildGraphChart(grid, spec), [grid, kind, roles.x, roles.y, roles.group]);
  const options = useMemo(
    () => (chart ? mergeOptions(chart.kind, chart.options) : null),
    [chart]
  );

  const assign = (slot: Slot, column: number) => {
    setRoles(previous => ({ ...previous, [slot]: column }));
    setSelected(null);
  };

  const clearSlot = (slot: Slot) => {
    setRoles(previous => ({ ...previous, [slot]: -1 }));
  };

  const readDrop = (event: DragEvent<HTMLDivElement>): number | null => {
    const value = Number(event.dataTransfer.getData('text/plain'));
    return Number.isInteger(value) && value >= 0 && value < grid.cols.length ? value : null;
  };

  const dropProps = (slot: Slot) => ({
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(slot);
    },
    onDragLeave: () => setDragOver(current => (current === slot ? null : current)),
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(null);
      const column = readDrop(event);
      if (column !== null) assign(slot, column);
    },
    onClick: () => {
      if (selected !== null) assign(slot, selected);
    },
  });

  const slotLabel = (slot: Slot): string =>
    slot === 'group'
      ? roles.group >= 0
        ? grid.cols[roles.group]?.name ?? ''
        : t('builder.none')
      : roles[slot] >= 0
        ? grid.cols[roles[slot]]?.name ?? ''
        : slot === 'x'
          ? t('builder.x')
          : t('builder.y');

  const slotChip = (slot: Slot, label: string) => (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-text3">
        {slot === 'x' ? t('builder.x') : slot === 'y' ? t('builder.y') : t('builder.group')}
      </div>
      <div
        data-builder-slot={slot}
        className={`flex min-h-[30px] items-center gap-1 rounded border px-2 py-1 text-[10px] ${
          dragOver === slot
            ? 'border-accent2 bg-accent2/10 text-accent2'
            : 'border-border2 bg-surface3 text-text2'
        } ${selected !== null ? 'cursor-copy' : ''}`}
        {...dropProps(slot)}
      >
        <span className="min-w-0 flex-1 truncate">{dragOver === slot ? t('builder.dragging') : label}</span>
        {slot !== 'x' && slot !== 'y' && roles[slot] >= 0 && (
          <button
            type="button"
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
            onClick={event => {
              event.stopPropagation();
              clearSlot(slot);
            }}
            aria-label={`${t('builder.none')} ${t('builder.group')}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('builder.title')}
      data-graph-builder
      onKeyDown={event => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border2 bg-surface shadow-2xl">
        <header className="flex items-center gap-2 border-b border-border bg-surface2/60 px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent2">
            {t('builder.title')}
          </span>
          <button
            type="button"
            className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text"
            onClick={onClose}
            aria-label={t('builder.close')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 md:grid-cols-[200px_minmax(0,1fr)]">
          <section className="min-w-0">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-text3">
              {t('filter.column')}
            </div>
            <div className="scrollbar max-h-[220px] overflow-auto rounded border border-border2/60">
              {grid.cols.map((column, index) => (
                <button
                  key={index}
                  type="button"
                  draggable
                  data-builder-column={index}
                  onDragStart={event => {
                    event.dataTransfer.setData('text/plain', String(index));
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => setSelected(current => (current === index ? null : index))}
                  className={`block w-full truncate border-b border-border2/40 px-2 py-1 text-left text-[10px] last:border-b-0 hover:bg-surface3 ${
                    selected === index ? 'bg-accent2/15 text-accent2' : 'text-text2'
                  }`}
                  title={column.name}
                >
                  {column.name || `C${index + 1}`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-snug text-text3">{t('builder.note')}</p>
          </section>

          <section className="min-w-0">
            <label className="mb-2 block">
              <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-wider text-text3">
                {t('builder.kind')}
              </span>
              <select
                data-builder-kind
                value={kind}
                onChange={event => setKind(event.target.value as BuilderKind)}
                className="w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2"
              >
                {BUILDER_KINDS.map(item => (
                  <option key={item} value={item}>
                    {kindLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-2 flex items-stretch gap-2">
              {kind === 'histogram' ? (
                slotChip('y', slotLabel('y'))
              ) : (
                <>
                  {slotChip('x', slotLabel('x'))}
                  {slotChip('y', slotLabel('y'))}
                  {slotChip('group', slotLabel('group'))}
                </>
              )}
            </div>

            <div className="rounded border border-border2/60 bg-bg/40 p-2" data-builder-preview>
              {chart && options ? (
                <VegaChart chart={chart} options={options} thumbnail />
              ) : (
                <p className="p-6 text-center font-mono text-[10px] text-text3">
                  {t('builder.empty')}
                </p>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[9px] text-text3">
                {chart ? t('builder.rows', { s1: grid.rows.length }) : t('builder.invalid')}
              </span>
              <button
                type="button"
                data-builder-add
                className="tb-btn ml-auto px-2 py-1 text-[10px]"
                disabled={!chart}
                onClick={() => {
                  if (!chart) return;
                  onAdd({ ...chart, id: `${chart.id}-${Date.now().toString(36)}` });
                  onClose();
                }}
              >
                <Plus className="h-3 w-3" />
                {t('builder.add')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
