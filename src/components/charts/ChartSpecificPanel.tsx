import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { ChartObjectPanel } from './ChartObjectPanel';
import { AnnotationPanel } from './AnnotationPanel';

interface ChartSpecificPanelProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
  /** With ids resets one object; without ids resets every specific feature. */
  onReset: (featureIds?: string[]) => void;
  selectedAnnotationId?: string | null;
  onSelectAnnotation?: (id: string | null) => void;
  onOpenAnnotations?: () => void;
}

/** Property panel: annotations on top, then collapsible chart objects. */
export const ChartSpecificPanel = ({
  chart,
  options,
  onChange,
  onReset,
  selectedAnnotationId = null,
  onSelectAnnotation,
  onOpenAnnotations,
}: ChartSpecificPanelProps) => (
  <div className="flex flex-col gap-2">
    <p className="font-mono text-[9px] uppercase tracking-widest text-accent2">
      {`${t('chart.featuresFor')} ${chart.title}`}
    </p>
    <AnnotationPanel
      annotations={options.annotations ?? []}
      selectedId={selectedAnnotationId}
      onChange={next => onChange({ ...options, annotations: next })}
      onSelect={onSelectAnnotation ?? (() => {})}
      onOpenEditor={onOpenAnnotations}
      compact
      theme={options.theme}
    />
    <ChartObjectPanel
      chart={chart}
      options={options}
      onChange={onChange}
      onReset={featureIds => onReset(featureIds)}
    />
    <button
      type="button"
      className="tb-btn w-full px-2 py-1 text-[10px]"
      onClick={() => onReset()}
    >
      {t('chart.resetSection')}
    </button>
  </div>
);
