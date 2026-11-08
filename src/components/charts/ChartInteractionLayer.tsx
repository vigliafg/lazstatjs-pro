import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from 'react';
import { t } from '../../i18n';
import type { ChartPlotArea } from '../../charts/annotations';
import {
  brushRect,
  keysInPolygon,
  keysInRect,
  type InteractionPoint,
  type LinkSelectionKind,
  type PolygonPoint,
} from '../../charts/interaction';
import { panDomain, zoomDomain, zoomSignal } from '../../charts/vega/zoom';

/** Minimal shape of the mounted Vega view, so the overlay stays testable. */
export interface VegaViewLike {
  scenegraph: () => { root?: SceneItem } | undefined;
  /** Read or write a Vega signal: the scale binding lives in `chartZoom_x/y`. */
  signal?: (name: string, value?: unknown) => unknown;
  /** Pixel-to-value projection of one bound scale. */
  scale?: (name: string) => { domain?: () => unknown; invert?: (value: number) => number } | undefined;
  runAsync?: () => Promise<unknown>;
}

interface SceneItem {
  x?: number;
  y?: number;
  datum?: Record<string, unknown>;
  mark?: { marktype?: string };
  items?: SceneItem[];
}

interface ChartInteractionLayerProps {
  area: ChartPlotArea;
  view: VegaViewLike | null;
  points: readonly InteractionPoint[];
  tool: LinkSelectionKind;
  /** The card has the zoom option on: the overlay drives the same binding. */
  zoom: boolean;
  onSelect: (keys: string[], kind: LinkSelectionKind) => void;
  onClear: () => void;
}

const ACCENT = '#4f9cf9';

type ZoomDomain = [number, number];

/** Compiled spec carries the scale-binding signals only when zoom applies. */
const hasZoomSignals = (view: VegaViewLike | null): boolean => {
  if (!view?.signal) return false;
  try {
    view.signal(zoomSignal('x'));
    return true;
  } catch {
    return false;
  }
};

const readDomain = (view: VegaViewLike | null, channel: 'x' | 'y'): ZoomDomain | null => {
  try {
    const raw = view?.scale?.(channel)?.domain?.();
    if (!Array.isArray(raw) || raw.length !== 2) return null;
    const lo = Number(raw[0]);
    const hi = Number(raw[1]);
    return Number.isFinite(lo) && Number.isFinite(hi) && hi > lo ? [lo, hi] : null;
  } catch {
    return null;
  }
};

const writeDomain = (
  view: VegaViewLike | null,
  channel: 'x' | 'y',
  domain: ZoomDomain
): boolean => {
  try {
    view?.signal?.(zoomSignal(channel), domain);
    return true;
  } catch {
    return false;
  }
};

/**
 * Transparent hit layer over the Vega plot area.
 *
 * The layer owns the brush and the lasso: pointer coordinates stay in CSS
 * pixels and each observation is projected through the real Vega scales. It is
 * rendered only while linking is on, so tooltips, annotations and the chart
 * editor keep working normally the rest of the time.
 */
export const ChartInteractionLayer = ({
  area,
  view,
  points,
  tool,
  zoom,
  onSelect,
  onClear,
}: ChartInteractionLayerProps) => {
  const [drag, setDrag] = useState<{ start: PolygonPoint; current: PolygonPoint } | null>(null);
  const [pan, setPan] = useState<{
    start: PolygonPoint;
    domains: { x: ZoomDomain | null; y: ZoomDomain | null };
  } | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [lasso, setLasso] = useState<PolygonPoint[] | null>(null);
  const [committedRect, setCommittedRect] = useState<
    { x0: number; y0: number; x1: number; y1: number } | null
  >(null);
  const [committedPolygon, setCommittedPolygon] = useState<PolygonPoint[] | null>(null);
  const [shiftHeld, setShiftHeld] = useState(false);
  const hintId = useId();
  const zoomReady = useMemo(() => zoom && hasZoomSignals(view), [view, zoom]);

  // Shift turns the drag into a pan, so the cursor announces it before the
  // gesture starts. Reset on blur and on leaving the plot, where the release
  // of the key may never be observed.
  useEffect(() => {
    if (!zoomReady) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Shift') setShiftHeld(event.type === 'keydown');
    };
    const clear = () => setShiftHeld(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', clear);
    };
  }, [zoomReady]);

  // The overlay sits above the SVG, so a wheel over the plot never reaches
  // Vega's own handler: apply the same projection to the bound signals, which
  // is what the compiled `zoomLinear` update would have done.
  useEffect(() => {
    const node = surfaceRef.current;
    if (!node || !view || !zoomReady) return;
    const apply = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.pow(1.001, event.deltaY * Math.pow(16, event.deltaMode));
      if (!Number.isFinite(factor) || factor <= 0) return;
      const rect = node.getBoundingClientRect();
      let changed = false;
      for (const channel of ['x', 'y'] as const) {
        const scale = view.scale?.(channel);
        const domain = readDomain(view, channel);
        if (!domain || typeof scale?.invert !== 'function') continue;
        const pixel = channel === 'x' ? event.clientX - rect.left : event.clientY - rect.top;
        const anchor = Number(scale.invert(pixel));
        if (!Number.isFinite(anchor)) continue;
        const next = zoomDomain(domain, anchor, factor);
        if (next[1] > next[0] && writeDomain(view, channel, next)) changed = true;
      }
      if (changed) void view.runAsync?.();
    };
    node.addEventListener('wheel', apply, { passive: false });
    return () => node.removeEventListener('wheel', apply);
  }, [view, zoomReady]);

  const pixelPoints = useMemo(() => {
    if (!view) return [];
    let root: SceneItem | undefined;
    try {
      root = view.scenegraph?.().root;
    } catch {
      return [];
    }
    if (!root) return [];
    const ratioX = area.svg.width > 0 ? area.css.width / area.svg.width : 1;
    const ratioY = area.svg.height > 0 ? area.css.height / area.svg.height : 1;
    const found = new Map<string, { key: string; x: number; y: number }>();
    const walk = (item: SceneItem, offsetX: number, offsetY: number): void => {
      const x = offsetX + (Number.isFinite(item.x) ? Number(item.x) : 0);
      const y = offsetY + (Number.isFinite(item.y) ? Number(item.y) : 0);
      const raw = item.datum?.__row;
      const key =
        typeof raw === 'string' && raw.length > 0
          ? raw
          : typeof raw === 'number' && Number.isFinite(raw)
            ? String(raw)
            : null;
      if (key !== null && item.mark?.marktype === 'symbol' && !found.has(key)) {
        found.set(key, {
          key,
          x: (x - area.svg.left) * ratioX,
          y: (y - area.svg.top) * ratioY,
        });
      }
      (item.items ?? []).forEach(child => walk(child, x, y));
    };
    walk(root, 0, 0);
    return [...found.values()];
  }, [area, view]);

  const local = (event: PointerEvent<HTMLDivElement>): PolygonPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(area.css.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(area.css.height, Math.max(0, event.clientY - rect.top)),
    };
  };

  const reset = () => {
    setDrag(null);
    setLasso(null);
    setPan(null);
    setCommittedRect(null);
    setCommittedPolygon(null);
  };

  const finish = (end: PolygonPoint) => {
    if (tool === 'lasso') {
      const last = lasso?.[lasso.length - 1];
      const polygon =
        lasso && last && Math.hypot(end.x - last.x, end.y - last.y) >= 1
          ? [...lasso, end]
          : lasso ?? [];
      setCommittedPolygon(polygon.length >= 3 ? polygon : null);
      setCommittedRect(null);
      const keys = keysInPolygon(pixelPoints, polygon);
      if (keys.length > 0) onSelect(keys, 'lasso');
      else onClear();
    } else {
      const rect = drag ? brushRect(drag.start, end) : null;
      setCommittedRect(rect);
      setCommittedPolygon(null);
      const keys = rect ? keysInRect(pixelPoints, rect) : [];
      if (keys.length > 0) onSelect(keys, 'brush');
      else onClear();
    }
    setDrag(null);
    setLasso(null);
  };

  const hasVisual = committedRect !== null || (committedPolygon?.length ?? 0) >= 3;
  const rect = drag
    ? {
        x: Math.min(drag.start.x, drag.current.x),
        y: Math.min(drag.start.y, drag.current.y),
        width: Math.abs(drag.current.x - drag.start.x),
        height: Math.abs(drag.current.y - drag.start.y),
      }
    : committedRect
      ? {
          x: Math.min(committedRect.x0, committedRect.x1),
          y: Math.min(committedRect.y0, committedRect.y1),
          width: Math.abs(committedRect.x1 - committedRect.x0),
          height: Math.abs(committedRect.y1 - committedRect.y0),
        }
      : null;
  const polygon = lasso ?? committedPolygon;
  const toolLabel = tool === 'lasso' ? t('chart.link.lasso') : t('chart.link.brush');

  return (
    <div
      ref={surfaceRef}
      data-chart-link-surface
      data-no-export
      role="application"
      tabIndex={0}
      aria-label={`${t('chart.link.surface')} (${toolLabel}) · ${points.length} ${t('chart.link.points')}`}
      aria-describedby={hintId}
      aria-keyshortcuts="Enter Escape"
      className={`absolute z-[5] touch-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        pan ? 'cursor-grabbing' : zoomReady && shiftHeld ? 'cursor-grab' : 'cursor-crosshair'
      }`}
      style={{
        left: area.css.left,
        top: area.css.top,
        width: area.css.width,
        height: area.css.height,
        background: 'rgba(79, 156, 249, 0.04)',
      }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          reset();
          onClear();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          if (points.length > 0) onSelect(points.map(point => point.key), tool);
        }
      }}
      onPointerDown={event => {
        // Shift (or the middle button) pans the bound scales instead of
        // brushing, so navigation stays available while linking is on.
        if (zoomReady && (event.shiftKey || event.button === 1)) {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          setPan({
            start: local(event),
            domains: { x: readDomain(view, 'x'), y: readDomain(view, 'y') },
          });
          return;
        }
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        const start = local(event);
        if (tool === 'lasso') {
          setLasso([start]);
          setCommittedPolygon(null);
        } else {
          setDrag({ start, current: start });
          setCommittedRect(null);
        }
      }}
      onPointerMove={event => {
        if (pan) {
          event.stopPropagation();
          const current = local(event);
          const width = Math.max(1, area.css.width);
          const height = Math.max(1, area.css.height);
          let changed = false;
          if (pan.domains.x) {
            changed =
              writeDomain(view, 'x', panDomain(pan.domains.x, (current.x - pan.start.x) / width)) ||
              changed;
          }
          if (pan.domains.y) {
            changed =
              writeDomain(
                view,
                'y',
                panDomain(pan.domains.y, -(current.y - pan.start.y) / height)
              ) || changed;
          }
          if (changed) void view?.runAsync?.();
          return;
        }
        if (!drag && !lasso) return;
        event.stopPropagation();
        const current = local(event);
        if (tool === 'lasso' && lasso) {
          const last = lasso[lasso.length - 1];
          if (Math.hypot(current.x - last.x, current.y - last.y) >= 2) {
            setLasso([...lasso, current]);
          }
        } else if (drag) {
          setDrag({ ...drag, current });
        }
      }}
      onPointerUp={event => {
        if (pan) {
          event.preventDefault();
          event.stopPropagation();
          setPan(null);
          return;
        }
        if (!drag && !lasso) return;
        event.preventDefault();
        event.stopPropagation();
        finish(local(event));
      }}
      onPointerCancel={reset}
      onPointerLeave={() => setShiftHeld(false)}
      onClick={event => event.stopPropagation()}
      onDoubleClick={event => {
        event.stopPropagation();
        reset();
        onClear();
      }}
    >
      <span id={hintId} className="sr-only">
        {t('chart.link.surfaceHint')}
        {zoomReady ? ` ${t('chart.link.surfaceZoomHint')}` : ''}
      </span>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {rect && (
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill={ACCENT}
            fillOpacity={0.12}
            stroke={ACCENT}
            strokeDasharray="4 3"
            strokeWidth={1}
          />
        )}
        {polygon && polygon.length >= 3 && (
          <polygon
            points={polygon.map(point => `${point.x},${point.y}`).join(' ')}
            fill={ACCENT}
            fillOpacity={hasVisual ? 0.12 : 0.08}
            stroke={ACCENT}
            strokeDasharray="4 3"
            strokeWidth={1}
          />
        )}
      </svg>
    </div>
  );
};
