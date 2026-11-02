import { useId, useState } from 'react';
import { ArrowLeftRight, BookmarkPlus, Plus } from 'lucide-react';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import {
  applyChartStyle,
  matchingChartStyle,
  saveUserStyle,
  styleAvailable,
  stylePatchOf,
  stylesFor,
  type ChartStyle,
} from '../../charts/styles';
import { useChartLibrary } from './ChartPresetsProvider';
import { VegaChart } from './VegaChart';

interface ChartStyleGalleryProps {
  chart: AnalysisChart;
  /** Draft options: what a click applies to. */
  options: ChartOptions;
  /** Debounced options used to paint the thumbnails. */
  preview: ChartOptions;
  onChange: (options: ChartOptions) => void;
  /** Optional: insert a copy of the card with this style, one below the other. */
  onInsert?: (style: ChartStyle) => void;
  /** Optional: insert the LazStats and JMP-like variants side by side. */
  onCompare?: (lazstat: ChartStyle, jmp: ChartStyle) => void;
}

type StyleFamily = 'all' | 'lazstat' | 'jmp' | 'user';

const MAX_VISIBLE_BUILTINS = 8;
const MAX_LIVE_PREVIEWS = 6;

const familyOf = (style: ChartStyle): Exclude<StyleFamily, 'all'> =>
  style.user ? 'user' : style.origin ?? 'lazstat';

const styleLabel = (style: ChartStyle): string =>
  style.name ?? (style.labelKey ? t(style.labelKey) : style.id);

/** Thumbnails are small: no title, no note, no axes, no tooltips. */
const thumbnailOptions = (options: ChartOptions): ChartOptions =>
  ({
    ...options,
    size: 'compact',
    showTitle: false,
    showSubtitle: false,
    showNote: false,
    showXTitle: false,
    showYTitle: false,
    showLegend: false,
    tooltip: false,
    annotations: [],
  }) as ChartOptions;

/**
 * Horizontal style gallery under the editor preview.
 *
 * Each tile is one style of the current chart kind (built-in or saved by the
 * user), painted with the card's own data. Clicking a tile applies its options
 * to the draft (one undo step); the "+" action inserts a copy of the card with
 * that style into the run-report, so several styles can live one above the
 * other. "Save style" stores the current kind-specific options in the project.
 */
export const ChartStyleGallery = ({
  chart,
  options,
  preview,
  onChange,
  onInsert,
  onCompare,
}: ChartStyleGalleryProps) => {
  const { styles: userStyles, setStyles, available } = useChartLibrary();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [filter, setFilter] = useState<StyleFamily>('all');
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();
  const styles = stylesFor(chart.kind, userStyles).filter(style =>
    styleAvailable(style, { chart })
  );
  if (styles.length < 2) return null;

  const families = new Set(styles.map(style => familyOf(style)));
  const activeFilter: StyleFamily = filter === 'all' || families.has(filter) ? filter : 'all';
  const filtered =
    activeFilter === 'all'
      ? styles
      : styles.filter(style => familyOf(style) === activeFilter);
  const builtIns = filtered.filter(style => !style.user);
  const userStylesShown = filtered.filter(style => style.user);
  const visibleBuiltIns = expanded ? builtIns : builtIns.slice(0, MAX_VISIBLE_BUILTINS);
  const hiddenCount = builtIns.length - visibleBuiltIns.length;
  const shown = [...visibleBuiltIns, ...userStylesShown];

  const match = matchingChartStyle(options, userStyles);
  const active = match && styleAvailable(match, { chart }) ? match : undefined;
  const jmpStyle = styles.find(style => familyOf(style) === 'jmp');
  const lazStyle =
    active && familyOf(active) === 'lazstat'
      ? active
      : styles.find(style => familyOf(style) === 'lazstat' && style.isDefault) ??
        styles.find(style => familyOf(style) === 'lazstat');
  const canCompare = Boolean(onCompare && jmpStyle && lazStyle);
  const addLabel = t('chart.style.addToReport');
  const compareLabel = t('chart.style.compare');
  const cleanName = name.trim();

  const save = () => {
    if (!cleanName) {
      setInvalid(true);
      return;
    }
    setStyles(previous => saveUserStyle(previous, cleanName, chart.kind, stylePatchOf(options)));
    setSaving(false);
    setName('');
    setInvalid(false);
  };

  return (
    <section
      aria-label={t('chart.style.gallery')}
      className="mt-2 border-t border-border pt-2"
      data-chart-style-gallery
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <p className="font-mono text-[9px] uppercase tracking-wider text-text3">
          {t('chart.style.gallery')}
        </p>
        {canCompare && (
          <button
            type="button"
            className="ml-auto flex items-center gap-1 rounded border border-border2 px-1.5 py-0.5 text-[9px] text-text3 hover:border-accent hover:text-text"
            onClick={() => onCompare?.(lazStyle!, jmpStyle!)}
            title={t('chart.style.compareTitle')}
            data-chart-style-compare
          >
            <ArrowLeftRight className="h-3 w-3" />
            {compareLabel}
          </button>
        )}
        {available && (
          <button
            type="button"
            className={`${canCompare ? '' : 'ml-auto'} flex items-center gap-1 rounded border border-border2 px-1.5 py-0.5 text-[9px] text-text3 hover:border-accent hover:text-text`}
            onClick={() => {
              setSaving(true);
              setInvalid(false);
              setName('');
            }}
            data-chart-style-save
          >
            <BookmarkPlus className="h-3 w-3" />
            {t('chart.style.save')}
          </button>
        )}
      </div>
      {families.size > 1 && (
        <div
          className="mb-1.5 flex flex-wrap gap-1"
          role="group"
          aria-label={t('chart.style.gallery')}
          data-chart-style-filters
        >
          {(
            [
              ['all', 'chart.style.filterAll'],
              ['lazstat', 'chart.style.filterLazstat'],
              ['jmp', 'chart.style.filterJmp'],
              ['user', 'chart.style.filterUser'],
            ] as const
          )
            .filter(([value]) => value === 'all' || families.has(value))
            .map(([value, labelKey]) => (
              <button
                key={value}
                type="button"
                aria-pressed={activeFilter === value}
                onClick={() => setFilter(value)}
                className={`rounded border px-1.5 py-0.5 text-[9px] ${
                  activeFilter === value
                    ? 'border-accent bg-accent/10 text-text'
                    : 'border-border2 text-text3 hover:border-accent hover:text-text'
                }`}
                data-chart-style-filter={value}
              >
                {t(labelKey)}
              </button>
            ))}
        </div>
      )}
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1">
        {shown.map((style, index) => {
          const styleOptions = applyChartStyle(preview, style);
          const label = styleLabel(style);
          const family = familyOf(style);
          const originLabel =
            family === 'user'
              ? t('chart.style.origin.user')
              : family === 'jmp'
                ? t('chart.style.origin.jmp')
                : t('chart.style.origin.lazstat');
          const description = style.descriptionKey ? t(style.descriptionKey) : undefined;
          const selected = active?.id === style.id;
          const livePreview = index < MAX_LIVE_PREVIEWS;
          return (
            <li key={style.id} className="shrink-0 snap-start">
              <div
                className={`relative rounded border ${
                  selected ? 'border-accent bg-accent/10' : 'border-border2 bg-surface2'
                }`}
                data-chart-style={style.id}
                data-chart-style-origin={family}
                data-chart-style-selected={selected ? 'true' : undefined}
              >
                <button
                  type="button"
                  onClick={() => onChange(applyChartStyle(options, style))}
                  aria-pressed={selected}
                  title={description ? `${label} — ${description}` : label}
                  className="block w-[160px] cursor-pointer p-1 text-left"
                >
                  <span
                    className="pointer-events-none block h-[88px] w-[152px] overflow-hidden rounded-sm"
                    data-no-export
                  >
                    {livePreview ? (
                      <span className="block h-[240px] w-[430px] origin-top-left scale-[0.353]">
                        <VegaChart chart={chart} options={thumbnailOptions(styleOptions)} thumbnail />
                      </span>
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center bg-surface3/40 font-mono text-[10px] text-text3"
                        data-chart-style-placeholder
                      >
                        {originLabel}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex items-center gap-1 px-0.5">
                    <span className="truncate text-[10px] text-text2">{label}</span>
                    <span
                      className="ml-auto shrink-0 rounded border border-border2 px-1 font-mono text-[8px] uppercase tracking-wider text-text3"
                      data-chart-style-origin-badge={family}
                    >
                      {originLabel}
                    </span>
                    {style.isDefault && style.labelKey !== 'chart.preset.default' && (
                      <span className="shrink-0 rounded border border-border2 px-1 font-mono text-[8px] uppercase tracking-wider text-text3">
                        {t('chart.preset.default')}
                      </span>
                    )}
                  </span>
                  {description && (
                    <span
                      className="mt-0.5 block truncate px-0.5 text-[9px] text-text3"
                      title={description}
                      data-chart-style-description
                    >
                      {description}
                    </span>
                  )}
                </button>
                {onInsert && (
                  <button
                    type="button"
                    onClick={() => onInsert(style)}
                    title={`${addLabel}: ${label}`}
                    aria-label={`${addLabel}: ${label}`}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded border border-border2 bg-bg/80 text-text2 hover:border-accent hover:text-text"
                    data-chart-style-insert={style.id}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 rounded border border-border2 px-1.5 py-0.5 text-[9px] text-text3 hover:border-accent hover:text-text"
          data-chart-style-more
        >
          {t('chart.style.more')} ({hiddenCount})
        </button>
      )}
      {saving && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" data-chart-style-save-form>
          <label htmlFor={inputId} className="text-[10px] text-text3">
            {t('chart.style.name')}
          </label>
          <input
            id={inputId}
            value={name}
            maxLength={48}
            autoFocus
            onChange={event => {
              setName(event.target.value);
              setInvalid(false);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                save();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setSaving(false);
                setName('');
                setInvalid(false);
              }
            }}
            aria-invalid={invalid}
            className={`w-44 rounded border bg-surface3 px-1.5 py-0.5 text-[11px] text-text ${
              invalid ? 'border-red' : 'border-border2'
            }`}
            data-chart-style-name-input
          />
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[10px]"
            onClick={save}
            data-chart-style-save-confirm
          >
            {t('chart.style.saveConfirm')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[10px]"
            onClick={() => {
              setSaving(false);
              setName('');
              setInvalid(false);
            }}
          >
            {t('chart.cancel')}
          </button>
          {invalid && (
            <span className="text-[10px] text-red">{t('chart.style.nameRequired')}</span>
          )}
        </div>
      )}
    </section>
  );
};
