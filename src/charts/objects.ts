import type { MessageKey } from '../i18n';
import type { AnalysisChart, ChartKind } from '../stats/charts';
import { featuresFor } from './features';

/** UI-only grouping of chart features; the persisted data stays in ChartOptions. */
export interface ChartObjectNode {
  id: string;
  labelKey: MessageKey;
  features: string[];
  children?: ChartObjectNode[];
  /** Feature id whose boolean value drives the eye icon. */
  visibility?: string;
}

const COMMON_OBJECTS: ChartObjectNode[] = [
  {
    id: 'chart',
    labelKey: 'chart.object.chart',
    features: [
      'general.showTitle',
      'general.showSubtitle',
      'general.showNote',
      'general.zeroBaseline',
      'general.tooltip',
    ],
  },
  {
    id: 'axes',
    labelKey: 'chart.object.axes',
    features: ['general.showXTitle', 'general.showYTitle', 'general.gridX', 'general.gridY', 'style.gridOpacity'],
  },
  {
    id: 'legend',
    labelKey: 'chart.object.legend',
    features: ['general.showLegend', 'general.legendPosition'],
  },
  {
    id: 'style',
    labelKey: 'chart.object.style',
    features: ['style.pointShape', 'style.pointSize', 'style.pointOpacity', 'style.lineWidth', 'style.lineDash'],
  },
];

const PILOT_OBJECTS: Partial<Record<ChartKind, ChartObjectNode[]>> = {
  box: [
    {
      id: 'box',
      labelKey: 'chart.object.box',
      features: ['display', 'sort'],
      children: [
        {
          id: 'box-whiskers',
          labelKey: 'chart.feature.whiskers',
          features: ['showWhiskers'],
          visibility: 'showWhiskers',
        },
        {
          id: 'box-outliers',
          labelKey: 'chart.feature.outliers',
          features: ['showOutliers'],
          visibility: 'showOutliers',
        },
        {
          id: 'box-points',
          labelKey: 'chart.feature.points',
          features: ['showPoints'],
          visibility: 'showPoints',
        },
        {
          id: 'box-mean',
          labelKey: 'chart.feature.mean',
          features: ['showMean'],
          visibility: 'showMean',
        },
        {
          id: 'box-median-label',
          labelKey: 'chart.feature.medianLabel',
          features: ['labelMedian'],
          visibility: 'labelMedian',
        },
      ],
    },
  ],
  scatter: [
    {
      id: 'scatter',
      labelKey: 'chart.object.scatter',
      features: [],
      children: [
        {
          id: 'scatter-points',
          labelKey: 'chart.feature.points',
          features: ['showPoints'],
          visibility: 'showPoints',
        },
        {
          id: 'scatter-labels',
          labelKey: 'chart.feature.pointLabels',
          features: ['pointLabels'],
          visibility: 'pointLabels',
        },
        {
          id: 'scatter-fit',
          labelKey: 'chart.feature.fit',
          features: ['fit', 'showFit'],
          visibility: 'showFit',
        },
        {
          id: 'scatter-band',
          labelKey: 'chart.feature.band',
          features: ['band', 'showBand', 'bandLevel', 'bandOpacity'],
          visibility: 'showBand',
        },
        {
          id: 'scatter-ellipse',
          labelKey: 'chart.feature.ellipse',
          features: ['ellipse'],
          visibility: 'ellipse',
        },
        {
          id: 'scatter-annotation',
          labelKey: 'chart.section.annotation',
          features: ['equation', 'showR2', 'showN'],
        },
      ],
    },
  ],
  line: [
    {
      id: 'line',
      labelKey: 'chart.object.line',
      features: ['step'],
      children: [
        {
          id: 'line-markers',
          labelKey: 'chart.feature.markers',
          features: ['showMarkers'],
          visibility: 'showMarkers',
        },
        {
          id: 'line-band',
          labelKey: 'chart.feature.band',
          features: ['showBand'],
          visibility: 'showBand',
        },
      ],
    },
  ],
  bar: [
    {
      id: 'bar',
      labelKey: 'chart.object.bar',
      features: ['grouping', 'sort'],
      children: [
        {
          id: 'bar-errors',
          labelKey: 'chart.feature.error',
          features: ['error', 'showErrorBars', 'capSize'],
          visibility: 'showErrorBars',
        },
        {
          id: 'bar-labels',
          labelKey: 'chart.feature.valueLabels',
          features: ['valueLabels'],
          visibility: 'valueLabels',
        },
        {
          id: 'bar-reference',
          labelKey: 'chart.feature.referenceLine',
          features: ['referenceLine'],
        },
      ],
    },
  ],
  survival: [
    {
      id: 'survival',
      labelKey: 'chart.object.survival',
      features: ['step'],
      children: [
        {
          id: 'survival-ci',
          labelKey: 'chart.feature.band',
          features: ['showCI'],
          visibility: 'showCI',
        },
        {
          id: 'survival-censoring',
          labelKey: 'chart.feature.censoring',
          features: ['showCensoring'],
          visibility: 'showCensoring',
        },
        {
          id: 'survival-median',
          labelKey: 'chart.feature.median',
          features: ['showMedian'],
          visibility: 'showMedian',
        },
      ],
    },
  ],
};

const sectionGroups = (chart: AnalysisChart, features: string[]): ChartObjectNode[] => {
  const bySection = new Map<string, ChartObjectNode>();
  const all = featuresFor(chart);
  for (const id of features) {
    const feature = all.find(item => item.id === id);
    const key = feature?.section ?? 'chart.section.options';
    const existing = bySection.get(key);
    if (existing) existing.features.push(id);
    else {
      bySection.set(key, {
        id: `section-${key}`,
        labelKey: key,
        features: [id],
      });
    }
  }
  return [...bySection.values()];
};

const flatten = (nodes: ChartObjectNode[]): string[] =>
  nodes.flatMap(node => [...node.features, ...(node.children ? flatten(node.children) : [])]);

/**
 * Build the property-panel tree. Common properties are always present; only
 * the pilot kinds get an explicit object hierarchy. Other kinds fall back to
 * the existing feature sections, so no control is lost.
 */
export const panelObjects = (chart: AnalysisChart): ChartObjectNode[] => {
  const specific = featuresFor(chart)
    .filter(feature => feature.group === 'specific')
    .map(feature => feature.id);
  if (specific.length === 0) return COMMON_OBJECTS;
  const pilot = PILOT_OBJECTS[chart.kind];
  if (!pilot) {
    return [...COMMON_OBJECTS, ...sectionGroups(chart, specific)];
  }
  const assigned = new Set(flatten(pilot));
  const leftovers = specific.filter(id => !assigned.has(id));
  return [
    ...COMMON_OBJECTS,
    ...pilot,
    ...(leftovers.length > 0
      ? [{ id: 'other', labelKey: 'chart.object.other' as MessageKey, features: leftovers }]
      : []),
  ];
};

/** All feature ids that belong to an object subtree, for reset. */
export const objectFeatureIds = (node: ChartObjectNode): string[] =>
  flatten([node]);
