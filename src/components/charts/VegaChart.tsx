import { useEffect, useRef, useState } from 'react';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import { chartSurfaceBackground } from '../../charts/vega/theme';
import { buildVegaSpec } from '../../charts/vega/buildSpec';

type ChartState = 'loading' | 'ready' | 'error';

interface VegaChartProps {
  chart: AnalysisChart;
  options: ChartOptions;
  className?: string;
}

/**
 * Mounts a Vega-Lite view with the SVG renderer.
 *
 * `vega-embed` is loaded on demand: tables-only results and the worker bundle
 * never carry the Vega runtime. The wrapper exposes `data-chart-state` so the
 * async exports can wait for every chart before snapshotting the console.
 */
export const VegaChart = ({ chart, options, className = '' }: VegaChartProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ChartState>('loading');
  const background = chartSurfaceBackground(options);

  useEffect(() => {
    let cancelled = false;
    let view: { finalize: () => void } | null = null;
    setState('loading');

    const mount = async () => {
      try {
        const { default: embed } = await import('vega-embed');
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        const spec = buildVegaSpec(chart, options);
        const result = await embed(hostRef.current, spec, {
          actions: false,
          renderer: 'svg',
          tooltip: options.tooltip,
        });
        view = result.view;
        await result.view.runAsync();
        if (!cancelled) setState('ready');
      } catch (error) {
        console.error('Could not render the chart', error);
        if (!cancelled) setState('error');
      }
    };

    void mount();
    return () => {
      cancelled = true;
      try {
        view?.finalize();
      } catch {
        // A view that failed to initialise has nothing to finalize.
      }
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [chart, options]);

  return (
    <div
      data-chart-surface
      data-chart-state={state}
      data-chart-background={background}
      className={`relative w-full overflow-x-auto rounded ${className}`}
      style={{ background }}
    >
      {state === 'loading' && (
        <p className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-text3">
          …
        </p>
      )}
      {state === 'error' && (
        <p className="flex h-full items-center justify-center p-4 text-center font-mono text-[10px] text-red">
          {chart.title}
        </p>
      )}
      <div ref={hostRef} className="flex w-full justify-center" />
    </div>
  );
};
