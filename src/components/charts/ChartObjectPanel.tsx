import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { t } from '../../i18n';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { featuresFor, type FeatureDescriptor } from '../../charts/features';
import { objectFeatureIds, panelObjects, type ChartObjectNode } from '../../charts/objects';
import { ChartControls } from './ChartControls';

interface ChartObjectPanelProps {
  chart: AnalysisChart;
  options: ChartOptions;
  onChange: (options: ChartOptions) => void;
  onReset: (featureIds: string[]) => void;
}

interface NodeProps extends ChartObjectPanelProps {
  node: ChartObjectNode;
  depth: number;
  featureMap: Map<string, FeatureDescriptor>;
  key?: string;
}

const visibleFeaturesOf = (
  node: ChartObjectNode,
  chart: AnalysisChart,
  options: ChartOptions,
  featureMap: Map<string, FeatureDescriptor>
) =>
  node.features
    .map(id => featureMap.get(id))
    .filter((feature): feature is FeatureDescriptor => Boolean(feature))
    .filter(feature => !feature.visible || feature.visible(options, chart));

const nodeVisible = (
  node: ChartObjectNode,
  chart: AnalysisChart,
  options: ChartOptions,
  featureMap: Map<string, FeatureDescriptor>
): boolean =>
  visibleFeaturesOf(node, chart, options, featureMap).length > 0 ||
  Boolean(node.visibility && featureMap.get(node.visibility)) ||
  (node.children ?? []).some(child => nodeVisible(child, chart, options, featureMap));

const ObjectNode = ({ node, depth, chart, options, onChange, onReset, featureMap }: NodeProps) => {
  const [open, setOpen] = useState(true);
  const features = visibleFeaturesOf(node, chart, options, featureMap);
  const rawVisibility = node.visibility ? featureMap.get(node.visibility) : undefined;
  const visibilityFeature =
    rawVisibility && (!rawVisibility.visible || rawVisibility.visible(options, chart))
      ? rawVisibility
      : undefined;
  const visible = visibilityFeature
    ? Boolean(visibilityFeature.set && visibilityFeature.get(options))
    : false;
  const children = (node.children ?? []).filter(child =>
    nodeVisible(child, chart, options, featureMap)
  );
  if (features.length === 0 && children.length === 0 && !visibilityFeature) return null;

  return (
    <details
      open={open}
      onToggle={event => setOpen(event.currentTarget.open)}
      className={`rounded border border-border2 bg-surface2/40 ${depth > 0 ? 'ml-2' : ''}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-text2">
        {open ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-text3" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-text3" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 truncate">{t(node.labelKey)}</span>
        {visibilityFeature && visibilityFeature.set && (
          <button
            type="button"
            aria-label={t('chart.toggleObject')}
            aria-pressed={visible}
            title={t('chart.toggleObject')}
            className="rounded p-0.5 text-text3 hover:bg-surface3 hover:text-text"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              onChange(visibilityFeature.set(options, !visible));
            }}
          >
            {visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
        )}
      </summary>
      <div className="flex flex-col gap-1.5 border-t border-border2/60 px-2 py-1.5">
        {features.length > 0 && (
          <ChartControls
            features={features}
            options={options}
            onChange={onChange}
            chart={chart}
            layout="stacked"
          />
        )}
        {(features.some(feature => feature.id !== node.visibility) || children.length > 0) && (
          <button
            type="button"
            className="self-start font-mono text-[8px] uppercase tracking-wider text-text3 hover:text-text"
            onClick={() => onReset(objectFeatureIds(node))}
          >
            {t('chart.resetObject')}
          </button>
        )}
        {children.map(child => (
          <ObjectNode
            key={child.id}
            node={child}
            depth={depth + 1}
            chart={chart}
            options={options}
            onChange={onChange}
            onReset={onReset}
            featureMap={featureMap}
          />
        ))}
      </div>
    </details>
  );
};

/** Collapsible object tree used by the right-hand property panel. */
export const ChartObjectPanel = ({ chart, options, onChange, onReset }: ChartObjectPanelProps) => {
  const featureMap = new Map(featuresFor(chart).map(feature => [feature.id, feature]));
  const nodes = panelObjects(chart);
  return (
    <div className="flex flex-col gap-1.5">
      {nodes.map(node => (
        <ObjectNode
          key={node.id}
          node={node}
          depth={0}
          chart={chart}
          options={options}
          onChange={onChange}
          onReset={onReset}
          featureMap={featureMap}
        />
      ))}
    </div>
  );
};

