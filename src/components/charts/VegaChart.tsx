import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AnalysisChart, ChartOptions } from '../../stats/charts';
import {
  chartHasRowKeys,
  interactionPoints,
  linkSignature,
  HIDDEN_KEYS_SIGNAL,
  LINK_KEYS_SIGNAL,
  type ChartLink,
  type LinkSelectionKind,
} from '../../charts/interaction';
import { chartSurfaceBackground } from '../../charts/vega/theme';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import {
  applyAnnotationsToSvg,
  measurePlotArea,
  type ChartPlotArea,
} from '../../charts/annotations';
import { ChartInteractionLayer, type VegaViewLike } from './ChartInteractionLayer';

type ChartState = 'loading' | 'ready' | 'error';

interface VegaChartInteraction {
  tool: 'brush' | 'lasso';
  onSelect: (keys: string[], kind: LinkSelectionKind) => void;
  onClear: () => void;
}

interface VegaChartProps {
  chart: AnalysisChart;
  options: ChartOptions;
  className?: string;
  /** Row-level linking: dims marks outside the selection/hidden rows. */
  link?: ChartLink;
  /** Enables the brush/lasso hit layer (only while linking is on). */
  interaction?: VegaChartInteraction;
  /** Hide the static annotation layer and show the editing overlay instead. */
  annotationEditing?: boolean;
  /** Reports the measured plot rectangle after every render/resize. */
  onPlotArea?: (area: ChartPlotArea | null) => void;
  /** Editor overlay rendered on top of the SVG (excluded from PNG export). */
  overlay?: (area: ChartPlotArea | null) => ReactNode;
  /** Small gallery preview: no export/readiness attributes, no annotations. */
  thumbnail?: boolean;
}

/**
 * Mounts a Vega-Lite view with the SVG renderer.
 *
 * `vega-embed` is loaded on demand: tables-only results and the worker bundle
 * never carry the Vega runtime. The wrapper exposes `data-chart-state` so the
 * async exports can wait for every chart before snapshotting the console.
 *
 * Free annotations are appended inside the Vega SVG itself, so the existing
 * PNG exporter clones them without a second composition pass. The interactive
 * overlay is a sibling marked `data-no-export`.
 */
export const VegaChart = ({
  chart,
  options,
  className = '',
  link,
  interaction,
  annotationEditing = false,
  onPlotArea,
  overlay,
  thumbnail = false,
}: VegaChartProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ChartState>('loading');
  const [plotArea, setPlotArea] = useState<ChartPlotArea | null>(null);
  const [view, setView] = useState<VegaViewLike | null>(null);
  const background = chartSurfaceBackground(options);
  const annotations = options.annotations ?? [];
  const theme = options.theme;

  // Refs let the costly embed effect ignore annotation-only changes while the
  // redraw effect always sees the latest list.
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const linkRef = useRef(link);
  linkRef.current = link;
  const onPlotAreaRef = useRef(onPlotArea);
  onPlotAreaRef.current = onPlotArea;

  // Everything except the annotations and the link state: moving a text or a
  // brush must not recompile Vega.
  const linkKey = linkSignature(link);
  const chartKey = useMemo(
    () => JSON.stringify({ ...options, annotations: undefined }),
    [options]
  );

  const linkPoints = useMemo(() => interactionPoints(chart), [chart]);
  const hasRowKeys = useMemo(() => chartHasRowKeys(chart), [chart]);

  useEffect(() => {
    let cancelled = false;
    let mounted: (VegaViewLike & { finalize: () => void }) | null = null;
    let observer: ResizeObserver | null = null;
    setState('loading');
    setPlotArea(null);
    setView(null);
    onPlotAreaRef.current?.(null);

    const refreshArea = () => {
      const host = hostRef.current;
      const wrap = wrapRef.current;
      if (!host || !wrap) return;
      const svg = host.querySelector('svg') as SVGSVGElement | null;
      if (!svg) return;
      const area = measurePlotArea(svg, wrap);
      setPlotArea(area);
      onPlotAreaRef.current?.(area);
    };

    const mount = async () => {
      try {
        const { default: embed } = await import('vega-embed');
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        const spec = buildVegaSpec(chart, optionsRef.current, linkRef.current);
        const result = await embed(hostRef.current, spec, {
          actions: false,
          renderer: 'svg',
          tooltip: optionsRef.current.tooltip,
        });
        mounted = result.view as unknown as VegaViewLike & { finalize: () => void };
        await result.view.runAsync();
        if (cancelled) return;
        setView(mounted);
        refreshArea();
        setState('ready');
      } catch (error) {
        console.error('Could not render the chart', error);
        if (!cancelled) setState('error');
      }
    };

    void mount();
    if (typeof ResizeObserver !== 'undefined' && wrapRef.current) {
      observer = new ResizeObserver(() => refreshArea());
      observer.observe(wrapRef.current);
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      try {
        mounted?.finalize();
      } catch {
        // A view that failed to initialise has nothing to finalize.
      }
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [chart, chartKey]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || state !== 'ready') return;
    const svg = host.querySelector('svg') as SVGSVGElement | null;
    if (!svg) return;
    applyAnnotationsToSvg(svg, annotations, theme);
  }, [annotations, theme, state]);

  // Selection changes update the mounted view through signals. The spec always
  // carries the link signals, so the brush does not trigger a re-embed.
  useEffect(() => {
    if (!view || !hasRowKeys) return;
    const live = view as VegaViewLike & {
      signal?: (name: string, value: unknown) => void;
      runAsync?: () => Promise<unknown>;
    };
    try {
      live.signal?.(LINK_KEYS_SIGNAL, linkRef.current?.keys ?? []);
      live.signal?.(HIDDEN_KEYS_SIGNAL, linkRef.current?.hidden ?? []);
      void live.runAsync?.();
    } catch {
      // A view finalized between the render and this effect has nothing to update.
    }
  }, [view, linkKey, hasRowKeys]);

  return (
    <div
      {...(thumbnail
        ? { 'data-chart-thumb': true }
        : {
            'data-chart-surface': true,
            'data-chart-state': state,
            'data-chart-background': background,
            'data-annotation-editing': annotationEditing ? 'true' : undefined,
          })}
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
      <div ref={wrapRef} className="relative w-full">
        <div ref={hostRef} className="flex w-full justify-center" />
        {state === 'ready' && interaction && plotArea && (
          <ChartInteractionLayer
            area={plotArea}
            view={view}
            points={linkPoints}
            tool={interaction.tool}
            onSelect={interaction.onSelect}
            onClear={interaction.onClear}
          />
        )}
        {state === 'ready' && overlay?.(plotArea)}
      </div>
    </div>
  );
};
