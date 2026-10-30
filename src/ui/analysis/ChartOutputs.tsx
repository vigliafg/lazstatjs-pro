import { CheckboxField, Section } from '../../components/FormFields';
import { t } from '../../i18n';
import { outputGroupsFor, type ChartOutputGroup } from '../../charts/outputs';

interface ChartOutputsProps {
  analysisId: string;
  hidden: ChartOutputGroup[];
  onChange: (next: ChartOutputGroup[]) => void;
  /** Charts produced by the latest run of this procedure, when available. */
  lastRunCount?: number;
}

/** Optional chart groups shown in the setup panel; mandatory cards are implicit. */
export const ChartOutputs = ({ analysisId, hidden, onChange, lastRunCount }: ChartOutputsProps) => {
  const groups = outputGroupsFor(analysisId);
  if (groups.length === 0) return null;
  const toggle = (group: ChartOutputGroup, visible: boolean) => {
    const next = visible
      ? hidden.filter(item => item !== group)
      : hidden.includes(group)
        ? hidden
        : [...hidden, group];
    onChange(next);
  };
  return (
    <Section title={t('analysis.chartOutputs')} hint={t('analysis.chartOutputsHint')}>
      <div className="flex flex-col gap-2">
        {groups.map(group => (
          <div key={group}>
            <CheckboxField
              label={t(
                group === 'recommended'
                  ? 'analysis.chartGroup.recommended'
                  : 'analysis.chartGroup.diagnostic'
              )}
              hint={t(
                group === 'recommended'
                  ? 'analysis.chartGroup.recommendedHint'
                  : 'analysis.chartGroup.diagnosticHint'
              )}
              checked={!hidden.includes(group)}
              onChange={checked => toggle(group, checked)}
            />
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          {hidden.length > 0 && (
            <button
              type="button"
              className="tb-btn px-2 py-0.5 text-[10px]"
              onClick={() => onChange([])}
            >
              {t('analysis.chartShowAll')}
            </button>
          )}
          {typeof lastRunCount === 'number' && lastRunCount > 0 && (
            <span className="font-mono text-[9px] text-text3">
              {lastRunCount} {t('analysis.chartCount')}
            </span>
          )}
        </div>
      </div>
    </Section>
  );
};
