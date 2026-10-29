import type { MessageKey } from '../i18n';
import type {
  AnalysisChart,
  ChartKind,
  ChartOptions,
  CommonChartOptions,
} from '../stats/charts';
import { applyPreset } from './defaults';

export type FeatureGroup = 'general' | 'style' | 'specific';
export type FeatureType = 'checkbox' | 'select' | 'number' | 'range';

export interface FeatureChoice {
  value: string | number;
  labelKey: MessageKey;
}

export interface FeatureDescriptor {
  id: string;
  labelKey: MessageKey;
  group: FeatureGroup;
  type: FeatureType;
  /** Shown in the compact toolbar instead of "More style". */
  prominent?: boolean;
  section?: MessageKey;
  choices?: FeatureChoice[];
  min?: number;
  max?: number;
  step?: number;
  visible?: (options: ChartOptions, chart: AnalysisChart) => boolean;
  get: (options: ChartOptions) => string | number | boolean;
  set: (options: ChartOptions, value: string | number | boolean) => ChartOptions;
}

const choice = (value: string | number, labelKey: MessageKey): FeatureChoice => ({
  value,
  labelKey,
});

const setCommon =
  <K extends keyof CommonChartOptions>(key: K) =>
  (options: ChartOptions, value: string | number | boolean): ChartOptions => {
    if (key === 'preset') {
      return applyPreset(options, value as CommonChartOptions['preset']);
    }
    return { ...options, [key]: value } as ChartOptions;
  };

const setSpecific =
  (kind: ChartKind, key: string) =>
  (options: ChartOptions, value: string | number | boolean): ChartOptions =>
    options.kind === kind ? ({ ...options, [key]: value } as ChartOptions) : options;

const getSpecific =
  (kind: ChartKind, key: string) =>
  (options: ChartOptions): string | number | boolean =>
    options.kind === kind ? ((options as unknown as Record<string, string | number | boolean>)[key] ?? '') : '';

const common = (
  id: string,
  labelKey: MessageKey,
  type: FeatureType,
  group: FeatureGroup,
  extra: Partial<FeatureDescriptor> = {}
): FeatureDescriptor => {
  const key = id.replace('general.', '').replace('style.', '') as keyof CommonChartOptions;
  return {
    id,
    labelKey,
    group,
    type,
    get: options => options[key] as string | number | boolean,
    set: setCommon(key),
    ...extra,
  };
};

const specific = (
  kind: ChartKind,
  id: string,
  labelKey: MessageKey,
  type: FeatureType,
  extra: Partial<FeatureDescriptor> = {}
): FeatureDescriptor => ({
  id,
  labelKey,
  group: 'specific',
  type,
  get: getSpecific(kind, id),
  set: setSpecific(kind, id),
  ...extra,
});

const GENERAL: FeatureDescriptor[] = [
  common('general.preset', 'chart.feature.preset', 'select', 'general', {
    prominent: true,
    choices: [
      choice('default', 'chart.preset.default'),
      choice('minimal', 'chart.preset.minimal'),
      choice('print', 'chart.preset.print'),
    ],
  }),
  common('general.theme', 'chart.feature.theme', 'select', 'general', {
    prominent: true,
    choices: [choice('dark', 'chart.theme.dark'), choice('light', 'chart.theme.light')],
  }),
  common('general.gridX', 'chart.feature.gridX', 'checkbox', 'general', { prominent: true }),
  common('general.gridY', 'chart.feature.gridY', 'checkbox', 'general', { prominent: true }),
  common('general.palette', 'chart.feature.palette', 'select', 'general', {
    prominent: true,
    choices: [
      choice('default', 'chart.palette.default'),
      choice('colorblind', 'chart.palette.colorblind'),
      choice('mono', 'chart.palette.mono'),
    ],
  }),
  common('general.showLegend', 'chart.feature.legend', 'checkbox', 'general', { prominent: true }),
  common('general.legendPosition', 'chart.feature.legendPosition', 'select', 'general', {
    choices: [choice('bottom', 'chart.legend.bottom'), choice('right', 'chart.legend.right')],
  }),
  common('general.showTitle', 'chart.feature.title', 'checkbox', 'general'),
  common('general.showSubtitle', 'chart.feature.subtitle', 'checkbox', 'general'),
  common('general.showNote', 'chart.feature.note', 'checkbox', 'general'),
  common('general.showXTitle', 'chart.feature.xTitle', 'checkbox', 'general'),
  common('general.showYTitle', 'chart.feature.yTitle', 'checkbox', 'general'),
  common('general.zeroBaseline', 'chart.feature.zeroBaseline', 'checkbox', 'general'),
  common('general.tooltip', 'chart.feature.tooltip', 'checkbox', 'general'),
];

const STYLE: FeatureDescriptor[] = [
  common('style.gridOpacity', 'chart.feature.gridOpacity', 'range', 'style', {
    min: 0,
    max: 1,
    step: 0.05,
  }),
  common('style.pointShape', 'chart.feature.pointShape', 'select', 'style', {
    choices: [
      choice('circle', 'chart.shape.circle'),
      choice('square', 'chart.shape.square'),
      choice('diamond', 'chart.shape.diamond'),
      choice('triangle', 'chart.shape.triangle'),
    ],
  }),
  common('style.pointSize', 'chart.feature.pointSize', 'range', 'style', {
    min: 16,
    max: 200,
    step: 4,
  }),
  common('style.pointOpacity', 'chart.feature.pointOpacity', 'range', 'style', {
    min: 0.1,
    max: 1,
    step: 0.05,
  }),
  common('style.lineWidth', 'chart.feature.lineWidth', 'range', 'style', {
    min: 1,
    max: 6,
    step: 0.5,
  }),
  common('style.lineDash', 'chart.feature.lineDash', 'select', 'style', {
    choices: [
      choice('solid', 'chart.dash.solid'),
      choice('dashed', 'chart.dash.dashed'),
      choice('dotted', 'chart.dash.dotted'),
    ],
  }),
  common('style.size', 'chart.feature.size', 'select', 'style', {
    choices: [
      choice('compact', 'chart.size.compact'),
      choice('regular', 'chart.size.regular'),
      choice('wide', 'chart.size.wide'),
    ],
  }),
];

const SPECIFIC: Record<ChartKind, FeatureDescriptor[]> = {
  scatter: [
    specific('scatter', 'showPoints', 'chart.feature.points', 'checkbox', {
      section: 'chart.section.data',
    }),
    specific('scatter', 'fit', 'chart.feature.fit', 'select', {
      section: 'chart.section.fit',
      choices: [
        choice('none', 'chart.fit.none'),
        choice('ols', 'chart.fit.ols'),
        choice('robust', 'chart.fit.robust'),
        choice('both', 'chart.fit.both'),
      ],
    }),
    specific('scatter', 'band', 'chart.feature.band', 'select', {
      section: 'chart.section.uncertainty',
      choices: [
        choice('none', 'chart.band.none'),
        choice('ci', 'chart.band.ci'),
        choice('pi', 'chart.band.pi'),
      ],
    }),
    specific('scatter', 'bandLevel', 'chart.feature.bandLevel', 'select', {
      section: 'chart.section.uncertainty',
      choices: [
        choice(90, 'chart.level.90'),
        choice(95, 'chart.level.95'),
        choice(99, 'chart.level.99'),
      ],
    }),
    specific('scatter', 'bandOpacity', 'chart.feature.bandOpacity', 'range', {
      section: 'chart.section.uncertainty',
      min: 0.05,
      max: 0.6,
      step: 0.05,
    }),
    specific('scatter', 'equation', 'chart.feature.equation', 'select', {
      section: 'chart.section.annotation',
      choices: [
        choice('none', 'chart.equation.none'),
        choice('short', 'chart.equation.short'),
        choice('full', 'chart.equation.full'),
      ],
    }),
    specific('scatter', 'showR2', 'chart.feature.r2', 'checkbox', {
      section: 'chart.section.annotation',
    }),
    specific('scatter', 'showN', 'chart.feature.n', 'checkbox', {
      section: 'chart.section.annotation',
    }),
    specific('scatter', 'pointLabels', 'chart.feature.pointLabels', 'checkbox', {
      section: 'chart.section.annotation',
    }),
  ],
  line: [
    specific('line', 'step', 'chart.feature.step', 'checkbox', { section: 'chart.section.curve' }),
    specific('line', 'showMarkers', 'chart.feature.markers', 'checkbox', {
      section: 'chart.section.data',
    }),
    specific('line', 'showBand', 'chart.feature.band', 'checkbox', {
      section: 'chart.section.uncertainty',
    }),
  ],
  bar: [
    specific('bar', 'error', 'chart.feature.error', 'select', {
      section: 'chart.section.data',
      choices: [
        choice('none', 'chart.error.none'),
        choice('se', 'chart.error.se'),
        choice('ci', 'chart.error.ci'),
        choice('sd', 'chart.error.sd'),
      ],
    }),
    specific('bar', 'valueLabels', 'chart.feature.valueLabels', 'checkbox', {
      section: 'chart.section.annotation',
    }),
    specific('bar', 'sort', 'chart.feature.sort', 'select', {
      section: 'chart.section.order',
      choices: [
        choice('none', 'chart.sort.none'),
        choice('asc', 'chart.sort.asc'),
        choice('desc', 'chart.sort.desc'),
      ],
    }),
    specific('bar', 'referenceLine', 'chart.feature.referenceLine', 'select', {
      section: 'chart.section.annotation',
      choices: [
        choice('none', 'chart.reference.none'),
        choice('zero', 'chart.reference.zero'),
        choice('one', 'chart.reference.one'),
      ],
    }),
  ],
  box: [
    specific('box', 'showPoints', 'chart.feature.points', 'checkbox', {
      section: 'chart.section.data',
    }),
    specific('box', 'showOutliers', 'chart.feature.outliers', 'checkbox', {
      section: 'chart.section.data',
    }),
    specific('box', 'showMean', 'chart.feature.mean', 'checkbox', {
      section: 'chart.section.summary',
    }),
    specific('box', 'labelMedian', 'chart.feature.medianLabel', 'checkbox', {
      section: 'chart.section.summary',
    }),
    specific('box', 'sort', 'chart.feature.sort', 'select', {
      section: 'chart.section.order',
      choices: [
        choice('none', 'chart.sort.none'),
        choice('asc', 'chart.sort.asc'),
        choice('desc', 'chart.sort.desc'),
      ],
    }),
  ],
  histogram: [
    specific('histogram', 'bins', 'chart.feature.bins', 'range', {
      section: 'chart.section.data',
      min: 4,
      max: 40,
      step: 1,
    }),
    specific('histogram', 'showDensity', 'chart.feature.density', 'checkbox', {
      section: 'chart.section.curve',
    }),
    specific('histogram', 'showRug', 'chart.feature.rug', 'checkbox', {
      section: 'chart.section.data',
    }),
    specific('histogram', 'showMeanLine', 'chart.feature.meanLine', 'checkbox', {
      section: 'chart.section.annotation',
    }),
  ],
  qq: [
    specific('qq', 'showReference', 'chart.feature.reference', 'checkbox', {
      section: 'chart.section.annotation',
    }),
    specific('qq', 'showCI', 'chart.feature.qqCI', 'checkbox', {
      section: 'chart.section.uncertainty',
      visible: (_options, chart) => Boolean(chart.data.band?.length),
    }),
  ],
  forest: [
    specific('forest', 'logScale', 'chart.feature.logScale', 'checkbox', {
      section: 'chart.section.axis',
    }),
    specific('forest', 'reference', 'chart.feature.referenceLine', 'select', {
      section: 'chart.section.annotation',
      choices: [choice('one', 'chart.reference.one'), choice('zero', 'chart.reference.zero')],
    }),
    specific('forest', 'sort', 'chart.feature.sort', 'select', {
      section: 'chart.section.order',
      choices: [
        choice('none', 'chart.sort.none'),
        choice('estimate', 'chart.sort.estimate'),
        choice('label', 'chart.sort.label'),
      ],
    }),
  ],
  survival: [
    specific('survival', 'showCI', 'chart.feature.band', 'checkbox', {
      section: 'chart.section.uncertainty',
      visible: (_options, chart) =>
        Boolean(chart.data.curves?.some(row => row.lo !== undefined && row.hi !== undefined)),
    }),
    specific('survival', 'showCensoring', 'chart.feature.censoring', 'checkbox', {
      section: 'chart.section.censoring',
    }),
    specific('survival', 'showMedian', 'chart.feature.median', 'checkbox', {
      section: 'chart.section.annotation',
    }),
    specific('survival', 'step', 'chart.feature.step', 'checkbox', { section: 'chart.section.curve' }),
  ],
  acf: [specific('acf', 'showBand', 'chart.feature.band', 'checkbox')],
  heatmap: [
    specific('heatmap', 'showValues', 'chart.feature.valueLabels', 'checkbox'),
    specific('heatmap', 'diverging', 'chart.feature.diverging', 'checkbox'),
    specific('heatmap', 'sort', 'chart.feature.sort', 'select', {
      choices: [
        choice('none', 'chart.sort.none'),
        choice('asc', 'chart.sort.asc'),
        choice('desc', 'chart.sort.desc'),
      ],
    }),
  ],
  mosaic: [
    specific('mosaic', 'showResiduals', 'chart.feature.residuals', 'checkbox'),
    specific('mosaic', 'showValues', 'chart.feature.valueLabels', 'checkbox'),
  ],
  residual: [
    specific('residual', 'showPoints', 'chart.feature.points', 'checkbox'),
    specific('residual', 'showZeroLine', 'chart.feature.zeroLine', 'checkbox'),
  ],
  scree: [
    specific('scree', 'showKaiser', 'chart.feature.kaiser', 'checkbox'),
    specific('scree', 'showValues', 'chart.feature.valueLabels', 'checkbox'),
  ],
  score: [
    specific('score', 'showLabels', 'chart.feature.labels', 'checkbox'),
    specific('score', 'ellipse', 'chart.feature.ellipse', 'checkbox'),
  ],
  bland: [
    specific('bland', 'showBias', 'chart.feature.bias', 'checkbox'),
    specific('bland', 'showLoA', 'chart.feature.loa', 'checkbox'),
    specific('bland', 'showIdentity', 'chart.feature.identity', 'checkbox'),
  ],
  power: [
    specific('power', 'showTarget', 'chart.feature.target', 'checkbox'),
    specific('power', 'showDesignMarker', 'chart.feature.designMarker', 'checkbox'),
  ],
  bootstrap: [
    specific('bootstrap', 'showObserved', 'chart.feature.observed', 'checkbox'),
    specific('bootstrap', 'showCI', 'chart.feature.band', 'checkbox'),
  ],
  missingness: [specific('missingness', 'showLabels', 'chart.feature.labels', 'checkbox')],
};

/** The single registry: toolbar and panel only filter/lay out these entries. */
export const featuresFor = (chart: AnalysisChart): FeatureDescriptor[] => [
  ...GENERAL,
  ...STYLE,
  ...(SPECIFIC[chart.kind] ?? []),
];

export const prominentFeatures = (chart: AnalysisChart): FeatureDescriptor[] =>
  featuresFor(chart).filter(feature => feature.prominent);

export const specificFeatures = (chart: AnalysisChart): FeatureDescriptor[] =>
  featuresFor(chart).filter(feature => feature.group === 'specific');
