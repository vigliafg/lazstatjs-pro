import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Minus,
  MoveDown,
  MoveUp,
  Square,
  Trash2,
  Type,
} from 'lucide-react';
import { t, type MessageKey } from '../../i18n';
import {
  MAX_ANNOTATIONS,
  annotationColor,
  clamp01,
  createAnnotation,
  type AnnotationType,
  type ChartAnnotation,
} from '../../charts/annotations';

interface AnnotationPanelProps {
  annotations: ChartAnnotation[];
  selectedId: string | null;
  onChange: (annotations: ChartAnnotation[]) => void;
  onSelect: (id: string | null) => void;
  onOpenEditor?: () => void;
  /** The editor mode shows a full property editor; the chart panel is compact. */
  compact?: boolean;
  theme: 'dark' | 'light';
}

const TYPE_LABEL: Record<AnnotationType, MessageKey> = {
  text: 'chart.annotation.tool.text',
  line: 'chart.annotation.tool.line',
  arrow: 'chart.annotation.tool.arrow',
  rect: 'chart.annotation.tool.rect',
};

const ADD_LABEL: Record<AnnotationType, MessageKey> = {
  text: 'chart.annotation.addText',
  line: 'chart.annotation.addLine',
  arrow: 'chart.annotation.addArrow',
  rect: 'chart.annotation.addRect',
};

const ADD_ORDER: readonly AnnotationType[] = ['text', 'line', 'arrow', 'rect'];

const TypeIcon = ({ type, className }: { type: AnnotationType; className?: string }) => {
  if (type === 'text') return <Type className={className} aria-hidden="true" />;
  if (type === 'line') return <Minus className={className} aria-hidden="true" />;
  if (type === 'arrow') return <ArrowUpRight className={className} aria-hidden="true" />;
  return <Square className={className} aria-hidden="true" />;
};

const annotationLabel = (annotation: ChartAnnotation): string => {
  if (annotation.type === 'text') {
    return annotation.text?.trim() || t('chart.annotation.untitled');
  }
  return t(TYPE_LABEL[annotation.type]);
};

const toColorInput = (value: string, fallback: string): string => {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [r, g, b] = [value[1], value[2], value[3]];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.slice(0, 7);
  return fallback;
};

/** Numeric field that keeps a local draft while the user types. */
const CoordinateField = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => {
  const [draft, setDraft] = useState(value.toFixed(2));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(value.toFixed(2));
  }, [value, focused]);
  return (
    <label htmlFor={id} className="flex items-center gap-1 text-[9px] text-text3">
      <span className="w-4 shrink-0 font-mono">{label}</span>
      <input
        id={id}
        type="number"
        min={0}
        max={1}
        step={0.01}
        value={draft}
        onFocus={() => setFocused(true)}
        onChange={event => {
          const next = event.target.value;
          setDraft(next);
          if (next.trim() === '') return;
          const numeric = Number(next);
          if (Number.isFinite(numeric)) onChange(clamp01(numeric));
        }}
        onBlur={() => {
          setFocused(false);
          const numeric = Number(draft);
          setDraft((Number.isFinite(numeric) ? clamp01(numeric) : value).toFixed(2));
        }}
        className="w-14 rounded border border-border2 bg-surface3 px-1 py-0.5 font-mono text-[10px] text-text2"
      />
    </label>
  );
};

const AnnotationProperties = ({
  annotation,
  theme,
  onChange,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  annotation: ChartAnnotation;
  theme: 'dark' | 'light';
  onChange: (patch: Partial<ChartAnnotation>) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  const color = annotationColor(annotation, theme);
  const colorFallback = theme === 'dark' ? '#fbbf24' : '#b45309';
  return (
    <div
      className="mt-1 flex flex-col gap-1.5 border-t border-border2/60 px-2 py-2"
      data-annotation-properties
    >
      <p className="font-mono text-[9px] uppercase tracking-wider text-text3">
        {t('chart.annotation.properties')}
      </p>
      {annotation.type === 'text' && (
        <label htmlFor="annotation-text" className="flex flex-col gap-0.5 text-[9px] text-text3">
          <span>{t('chart.annotation.text')}</span>
          <textarea
            id="annotation-text"
            data-annotation-property="text"
            rows={2}
            maxLength={200}
            value={annotation.text ?? ''}
            onChange={event => onChange({ text: event.target.value })}
            className="w-full resize-y rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2"
          />
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="annotation-color" className="flex items-center gap-1 text-[9px] text-text3">
          <span>{t('chart.annotation.color')}</span>
          <input
            id="annotation-color"
            data-annotation-property="color"
            type="color"
            value={toColorInput(color, colorFallback)}
            onChange={event => onChange({ color: event.target.value })}
            className="h-6 w-8 cursor-pointer rounded border border-border2 bg-surface3 p-0.5"
          />
        </label>
        {annotation.type === 'rect' && (
          <label
            htmlFor="annotation-fill"
            className="flex cursor-pointer items-center gap-1 text-[9px] text-text3"
          >
            <input
              id="annotation-fill"
              data-annotation-property="fill"
              type="checkbox"
              checked={Boolean(annotation.fill)}
              onChange={event =>
                onChange({ fill: event.target.checked ? toColorInput(color, colorFallback) : undefined })
              }
              className="accent-accent"
            />
            {t('chart.annotation.fillEnabled')}
          </label>
        )}
      </div>
      {annotation.type === 'rect' && annotation.fill && (
        <label htmlFor="annotation-fill-color" className="flex items-center gap-1 text-[9px] text-text3">
          <span>{t('chart.annotation.fill')}</span>
          <input
            id="annotation-fill-color"
            data-annotation-property="fill-color"
            type="color"
            value={toColorInput(annotation.fill, colorFallback)}
            onChange={event => onChange({ fill: event.target.value })}
            className="h-6 w-8 cursor-pointer rounded border border-border2 bg-surface3 p-0.5"
          />
        </label>
      )}
      <label htmlFor="annotation-stroke" className="flex flex-col gap-0.5 text-[9px] text-text3">
        <span>{t('chart.annotation.strokeWidth')}</span>
        <input
          id="annotation-stroke"
          data-annotation-property="strokeWidth"
          type="range"
          min={1}
          max={8}
          step={1}
          value={annotation.strokeWidth ?? 2}
          onChange={event => onChange({ strokeWidth: Number(event.target.value) })}
          className="h-1 accent-accent"
        />
      </label>
      {annotation.type === 'text' && (
        <label htmlFor="annotation-font" className="flex flex-col gap-0.5 text-[9px] text-text3">
          <span>{t('chart.annotation.fontSize')}</span>
          <input
            id="annotation-font"
            data-annotation-property="fontSize"
            type="range"
            min={8}
            max={32}
            step={1}
            value={annotation.fontSize ?? 12}
            onChange={event => onChange({ fontSize: Number(event.target.value) })}
            className="h-1 accent-accent"
          />
        </label>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[9px] uppercase tracking-wider text-text3">
          {t('chart.annotation.position')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <CoordinateField
            id="annotation-x"
            label="X"
            value={annotation.x}
            onChange={value => onChange({ x: value })}
          />
          <CoordinateField
            id="annotation-y"
            label="Y"
            value={annotation.y}
            onChange={value => onChange({ y: value })}
          />
          {annotation.type !== 'text' && (
            <>
              <CoordinateField
                id="annotation-x2"
                label="X₂"
                value={annotation.x2 ?? annotation.x}
                onChange={value => onChange({ x2: value })}
              />
              <CoordinateField
                id="annotation-y2"
                label="Y₂"
                value={annotation.y2 ?? annotation.y}
                onChange={value => onChange({ y2: value })}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="tb-btn px-1.5 py-0.5 text-[9px]"
          disabled={!canMoveUp}
          onClick={() => onMove(-1)}
          title={t('chart.annotation.moveDown')}
          aria-label={t('chart.annotation.moveDown')}
        >
          <MoveDown className="h-3 w-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="tb-btn px-1.5 py-0.5 text-[9px]"
          disabled={!canMoveDown}
          onClick={() => onMove(1)}
          title={t('chart.annotation.moveUp')}
          aria-label={t('chart.annotation.moveUp')}
        >
          <MoveUp className="h-3 w-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="tb-btn ml-auto px-1.5 py-0.5 text-[9px] hover:border-red hover:bg-red"
          onClick={onDelete}
          title={t('chart.annotation.delete')}
          aria-label={t('chart.annotation.delete')}
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

/**
 * Two-way view over the same annotation array: list, create, delete, order and
 * precise properties. The canvas overlay is the other view; neither owns state.
 */
export const AnnotationPanel = ({
  annotations,
  selectedId,
  onChange,
  onSelect,
  onOpenEditor,
  compact = false,
  theme,
}: AnnotationPanelProps) => {
  const selected = annotations.find(annotation => annotation.id === selectedId) ?? null;
  const full = annotations.length >= MAX_ANNOTATIONS;

  const add = (type: AnnotationType) => {
    if (full) return;
    const next = createAnnotation(
      type,
      annotations.length,
      type === 'text' ? t('chart.annotation.defaultText') : ''
    );
    onChange([...annotations, next]);
    onSelect(next.id);
  };

  const update = (id: string, patch: Partial<ChartAnnotation>) => {
    onChange(annotations.map(annotation => (annotation.id === id ? { ...annotation, ...patch } : annotation)));
  };

  const remove = (id: string) => {
    onChange(annotations.filter(annotation => annotation.id !== id));
    if (selectedId === id) onSelect(null);
  };

  const move = (id: string, direction: -1 | 1) => {
    const index = annotations.findIndex(annotation => annotation.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= annotations.length) return;
    const next = [...annotations];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section
      className={`rounded border border-border2 bg-surface2/40 ${compact ? '' : 'flex flex-col'}`}
      aria-label={t('chart.annotation.title')}
      data-annotation-panel
    >
      <header className="flex flex-wrap items-center gap-1.5 border-b border-border2/60 px-2 py-1.5">
        <span className="font-mono text-[9px] uppercase tracking-widest text-accent2">
          {t('chart.annotation.title')}
        </span>
        <span className="font-mono text-[9px] text-text3" data-annotation-count>
          {t('chart.annotation.count', { count: annotations.length, max: MAX_ANNOTATIONS })}
        </span>
        {onOpenEditor && (
          <button
            type="button"
            className="tb-btn ml-auto px-1.5 py-0.5 text-[9px]"
            onClick={onOpenEditor}
            data-annotation-open-editor
          >
            {t('chart.annotation.openEditor')}
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-1 px-2 py-1.5">
        {ADD_ORDER.map(type => (
          <button
            key={type}
            type="button"
            className="tb-btn flex items-center gap-1 px-1.5 py-0.5 text-[9px]"
            onClick={() => add(type)}
            disabled={full}
            title={full ? t('chart.annotation.limit') : t(ADD_LABEL[type])}
            data-annotation-add={type}
          >
            <TypeIcon type={type} className="h-3 w-3" />
            {t(ADD_LABEL[type])}
          </button>
        ))}
      </div>

      {annotations.length === 0 ? (
        <p className="px-2 pb-2 text-[10px] text-text3">{t('chart.annotation.empty')}</p>
      ) : (
        <ul className="flex flex-col" data-annotation-list>
          {annotations.map((annotation, index) => {
            const active = annotation.id === selectedId;
            return (
              <li
                key={annotation.id}
                className={`flex items-center gap-1 border-t border-border2/40 px-1.5 py-1 ${
                  active ? 'bg-accent/10' : ''
                }`}
                data-annotation-row={annotation.id}
              >
                <button
                  type="button"
                  onClick={() => onSelect(annotation.id)}
                  aria-pressed={active}
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[10px] text-text2"
                  data-annotation-select={annotation.id}
                >
                  <TypeIcon type={annotation.type} className="h-3 w-3 shrink-0 text-text3" />
                  <span className={`truncate ${annotation.hidden ? 'line-through opacity-60' : ''}`}>
                    {annotationLabel(annotation)}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[8px] text-text3">{index + 1}</span>
                </button>
                <button
                  type="button"
                  aria-label={t('chart.annotation.toggle')}
                  aria-pressed={!annotation.hidden}
                  title={t('chart.annotation.toggle')}
                  className="rounded p-0.5 text-text3 hover:bg-surface3 hover:text-text"
                  onClick={() => update(annotation.id, { hidden: !annotation.hidden })}
                  data-annotation-toggle={annotation.id}
                >
                  {annotation.hidden ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={t('chart.annotation.delete')}
                  title={t('chart.annotation.delete')}
                  className="rounded p-0.5 text-text3 hover:bg-red hover:text-on-accent"
                  onClick={() => remove(annotation.id)}
                  data-annotation-delete={annotation.id}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && !compact && (
        <AnnotationProperties
          annotation={selected}
          theme={theme}
          onChange={patch => update(selected.id, patch)}
          onDelete={() => remove(selected.id)}
          onMove={direction => move(selected.id, direction)}
          canMoveUp={annotations.findIndex(item => item.id === selected.id) > 0}
          canMoveDown={
            annotations.findIndex(item => item.id === selected.id) < annotations.length - 1
          }
        />
      )}
      {!selected && !compact && annotations.length > 0 && (
        <p className="border-t border-border2/60 px-2 py-2 text-[10px] text-text3">
          {t('chart.annotation.noSelection')}
        </p>
      )}
    </section>
  );
};
