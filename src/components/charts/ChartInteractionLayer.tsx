import { useId, useMemo, useState, type PointerEvent } from 'react';
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

/** Minimal shape of the mounted Vega view, so the overlay stays testable. */
export interface VegaViewLike {
  scenegraph: () => { root?: SceneItem } | undefined;
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
  onSelect: (keys: string[], kind: LinkSelectionKind) => void;
  onClear: () => void;
}

const ACCENT = '#4f9cf9';

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
  onSelect,
  onClear,
}: ChartInteractionLayerProps) => {
  const [drag, setDrag] = useState<{ start: PolygonPoint; current: PolygonPoint } | null>(null);
  const [lasso, setLasso] = useState<PolygonPoint[] | null>(null);
  const [committedRect, setCommittedRect] = useState<
    { x0: number; y0: number; x1: number; y1: number } | null
  >(null);
  const [committedPolygon, setCommittedPolygon] = useState<PolygonPoint[] | null>(null);
  const hintId = useId();

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
      data-chart-link-surface
      data-no-export
      role="application"
      tabIndex={0}
      aria-label={`${t('chart.link.surface')} (${toolLabel}) · ${points.length} ${t('chart.link.points')}`}
      aria-describedby={hintId}
      aria-keyshortcuts="Enter Escape"
      className="absolute z-[5] cursor-crosshair touch-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
        if (!drag && !lasso) return;
        event.preventDefault();
        event.stopPropagation();
        finish(local(event));
      }}
      onPointerCancel={reset}
      onClick={event => event.stopPropagation()}
      onDoubleClick={event => {
        event.stopPropagation();
        reset();
        onClear();
      }}
    >
      <span id={hintId} className="sr-only">
        {t('chart.link.surfaceHint')}
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
