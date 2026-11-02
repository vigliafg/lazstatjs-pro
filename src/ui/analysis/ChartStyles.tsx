import { t } from '../../i18n';
import { Section } from '../../components/FormFields';
import { chartKindsFor } from '../../charts/analysisKinds';
import {
  defaultChartStyle,
  styleAvailable,
  stylesFor,
} from '../../charts/styles';
import type { ChartKind } from '../../stats/charts';
import { useChartLibrary } from '../../components/charts/ChartPresetsProvider';
import { chartKindLabel } from '../../components/charts/chartKindLabel';

interface ChartStyleOverridesProps {
  analysisId: string;
  overrides: Partial<Record<ChartKind, string>>;
  onChange: (next: Partial<Record<ChartKind, string>>) => void;
}

/**
 * Run setup: style used by the new charts of this procedure, per kind.
 *
 * "Follow global" keeps the per-kind default from Settings; any other value is
 * a procedure-only override, saved with the project.
 */
export const ChartStyleOverrides = ({
  analysisId,
  overrides,
  onChange,
}: ChartStyleOverridesProps) => {
  const { styles, styleDefaults } = useChartLibrary();
  const availableOf = (kind: ChartKind) =>
    stylesFor(kind, styles).filter(style => styleAvailable(style, { analysisId }));
  const kinds = chartKindsFor(analysisId).filter(
    kind => availableOf(kind).length > 1
  );
  if (kinds.length === 0) return null;

  return (
    <Section title={t('analysis.chartStyles')} hint={t('analysis.chartStylesHint')}>
      <div className="flex flex-col gap-1.5" data-analysis-chart-styles>
        {kinds.map(kind => {
          const list = availableOf(kind);
          const overrideId = overrides[kind];
          const known = overrideId !== undefined && list.some(style => style.id === overrideId);
          const effective =
            (known ? list.find(style => style.id === overrideId) : undefined) ??
            list.find(style => style.id === styleDefaults[kind]) ??
            defaultChartStyle(kind);
          return (
            <label
              key={kind}
              className="flex items-center justify-between gap-2 text-[10px] text-text3"
            >
              <span className="truncate">{chartKindLabel(kind)}</span>
              <select
                aria-label={chartKindLabel(kind)}
                className="max-w-[180px] rounded border border-border2 bg-surface3 px-1.5 py-0.5 text-[10px] text-text2"
                value={known ? overrideId ?? '' : ''}
                onChange={event => {
                  const value = event.target.value;
                  const next = { ...overrides };
                  if (!value) delete next[kind];
                  else next[kind] = value;
                  onChange(next);
                }}
                data-analysis-chart-style={kind}
                title={effective?.name ?? (effective?.labelKey ? t(effective.labelKey) : undefined)}
              >
                <option value="">{t('chart.style.followGlobal')}</option>
                {list.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.name ?? (style.labelKey ? t(style.labelKey) : style.id)}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </Section>
  );
};
