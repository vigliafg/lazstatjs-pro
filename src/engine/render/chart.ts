import { compile } from 'vega-lite';
import { parse, View } from 'vega';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import type { AnalysisChart, PanelChart } from '../../stats/charts';
import { EngineError } from '../errors';

export interface ChartSvg {
  key: string;
  chartId: string;
  title: string;
  svg: string;
}

export const chartKey = (id: string): string =>
  id.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'chart';

export const renderChartSvg = async (chart: AnalysisChart): Promise<string> => {
  try {
    const compiled = compile(buildVegaSpec(chart));
    const view = new View(parse(compiled.spec), { renderer: 'none' });
    try {
      return await view.toSVG();
    } finally {
      view.finalize();
    }
  } catch (error) {
    throw new EngineError({
      code: 'E_INTERNAL',
      kind: 'chart_render_failed',
      stage: 'render',
      message: error instanceof Error ? error.message : `Could not render ${chart.id}`,
      details: { chartId: chart.id, kind: chart.kind },
    });
  }
};

export const renderChartSvgs = async (
  result: { charts?: AnalysisChart[]; panels?: PanelChart[] }
): Promise<ChartSvg[]> => {
  const output: ChartSvg[] = [];
  for (const chart of result.charts ?? []) {
    output.push({
      key: chartKey(chart.id),
      chartId: chart.id,
      title: chart.title,
      svg: await renderChartSvg(chart),
    });
  }
  for (const panel of result.panels ?? []) {
    for (const child of panel.children) {
      output.push({
        key: chartKey(`${panel.id}-${child.id}`),
        chartId: child.id,
        title: `${panel.title} — ${child.title}`,
        svg: await renderChartSvg(child),
      });
    }
  }
  return output;
};
