import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { t } from '../../i18n';
import {
  ANNOTATION_FONT,
  annotationGeometry,
  clamp01,
  createAnnotationId,
  type AnnotationType,
  type AnnotationGeometry,
  type ChartAnnotation,
  type ChartPlotArea,
  type RectGeometry,
} from '../../charts/annotations';
import type { AnnotationTool } from './AnnotationToolbar';

type Point = { x: number; y: number };
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'start' | 'end';

type DragState =
  | {
      mode: 'move';
      id: string;
      start: Point;
      original: ChartAnnotation[];
    }
  | {
      mode: 'resize';
      id: string;
      handle: ResizeHandle;
      start: Point;
      original: ChartAnnotation[];
    }
  | {
      mode: 'create';
      type: Exclude<AnnotationType, 'text'>;
      start: Point;
      current: Point;
    };

interface AnnotationSurfaceProps {
  area: ChartPlotArea;
  annotations: ChartAnnotation[];
  selectedId: string | null;
  tool: AnnotationTool;
  onChange: (annotations: ChartAnnotation[]) => void;
  onSelect: (id: string | null) => void;
  onToolChange: (tool: AnnotationTool) => void;
  theme: 'dark' | 'light';
}

const ACCENT = '#4f9cf9';
const HANDLE = 8;

const scaleAnnotation = (
  annotation: ChartAnnotation,
  scale: number
): ChartAnnotation => ({
  ...annotation,
  strokeWidth: (annotation.strokeWidth ?? 2) * scale,
  ...(annotation.type === 'text' ? { fontSize: (annotation.fontSize ?? 12) * scale } : {}),
});

const moveWithin = (
  annotation: ChartAnnotation,
  dx: number,
  dy: number
): ChartAnnotation => {
  const xs = annotation.type === 'text' ? [annotation.x] : [annotation.x, annotation.x2 ?? annotation.x];
  const ys = annotation.type === 'text' ? [annotation.y] : [annotation.y, annotation.y2 ?? annotation.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bx = dx < 0 ? Math.max(dx, -minX) : Math.min(dx, 1 - maxX);
  const by = dy < 0 ? Math.max(dy, -minY) : Math.min(dy, 1 - maxY);
  return {
    ...annotation,
    x: clamp01(annotation.x + bx),
    y: clamp01(annotation.y + by),
    ...(annotation.x2 !== undefined ? { x2: clamp01(annotation.x2 + bx) } : {}),
    ...(annotation.y2 !== undefined ? { y2: clamp01(annotation.y2 + by) } : {}),
  };
};

const resizeAnnotation = (
  annotation: ChartAnnotation,
  handle: ResizeHandle,
  point: Point
): ChartAnnotation => {
  if (annotation.type === 'line' || annotation.type === 'arrow') {
    if (handle === 'start') return { ...annotation, x: point.x, y: point.y };
    return { ...annotation, x2: point.x, y2: point.y };
  }
  const x1 = Math.min(annotation.x, annotation.x2 ?? annotation.x);
  const x2 = Math.max(annotation.x, annotation.x2 ?? annotation.x);
  const y1 = Math.min(annotation.y, annotation.y2 ?? annotation.y);
  const y2 = Math.max(annotation.y, annotation.y2 ?? annotation.y);
  let left = x1;
  let right = x2;
  let top = y1;
  let bottom = y2;
  if (handle.includes('w')) left = point.x;
  if (handle.includes('e')) right = point.x;
  if (handle.includes('n')) top = point.y;
  if (handle.includes('s')) bottom = point.y;
  if (right - left < 0.01) {
    if (handle.includes('w')) left = Math.max(0, right - 0.01);
    else right = Math.min(1, left + 0.01);
  }
  if (bottom - top < 0.01) {
    if (handle.includes('n')) top = Math.max(0, bottom - 0.01);
    else bottom = Math.min(1, top + 0.01);
  }
  return { ...annotation, x: left, y: top, x2: right, y2: bottom };
};

const GeometryMark = ({
  geometry,
  preview = false,
}: {
  geometry: AnnotationGeometry;
  preview?: boolean;
}) => {
  if (geometry.kind === 'text') {
    return (
      <text
        x={geometry.x}
        y={geometry.y}
        fill={geometry.color}
        fontFamily={ANNOTATION_FONT}
        fontSize={geometry.fontSize}
        fontWeight={500}
        dominantBaseline="hanging"
        opacity={preview ? 0.75 : 1}
        pointerEvents="none"
      >
        {geometry.text}
      </text>
    );
  }
  if (geometry.kind === 'line' || geometry.kind === 'arrow') {
    return (
      <g pointerEvents="none" opacity={preview ? 0.75 : 1}>
        <line
          x1={geometry.x1}
          y1={geometry.y1}
          x2={geometry.x2}
          y2={geometry.y2}
          stroke={geometry.color}
          strokeWidth={geometry.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={preview ? '4 3' : undefined}
        />
        {geometry.kind === 'arrow' && geometry.points && (
          <polygon points={geometry.points} fill={geometry.color} />
        )}
      </g>
    );
  }
  const rect = geometry as RectGeometry;
  return (
    <rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      rx={2}
      fill={rect.fill}
      fillOpacity={preview ? rect.fillOpacity * 0.6 : rect.fillOpacity}
      stroke={rect.color}
      strokeWidth={rect.strokeWidth}
      strokeDasharray={preview ? '4 3' : undefined}
      pointerEvents="none"
    />
  );
};

const handlePositions = (
  geometry: AnnotationGeometry
): Array<{ handle: ResizeHandle; x: number; y: number; cursor: string }> => {
  if (geometry.kind === 'line' || geometry.kind === 'arrow') {
    return [
      { handle: 'start', x: geometry.x1, y: geometry.y1, cursor: 'crosshair' },
      { handle: 'end', x: geometry.x2, y: geometry.y2, cursor: 'crosshair' },
    ];
  }
  if (geometry.kind !== 'rect') return [];
  const { x, y, width, height } = geometry;
  const midX = x + width / 2;
  const midY = y + height / 2;
  return [
    { handle: 'nw', x, y, cursor: 'nwse-resize' },
    { handle: 'n', x: midX, y, cursor: 'ns-resize' },
    { handle: 'ne', x: x + width, y, cursor: 'nesw-resize' },
    { handle: 'e', x: x + width, y: midY, cursor: 'ew-resize' },
    { handle: 'se', x: x + width, y: y + height, cursor: 'nwse-resize' },
    { handle: 's', x: midX, y: y + height, cursor: 'ns-resize' },
    { handle: 'sw', x, y: y + height, cursor: 'nesw-resize' },
    { handle: 'w', x, y: midY, cursor: 'ew-resize' },
  ];
};

/**
 * Second editor: a transparent hit/selection layer over the chart. The real
 * annotations live inside the Vega SVG; this layer only moves and resizes them
 * and commits one change per gesture to the chart editor history.
 */
export const AnnotationSurface = ({
  area,
  annotations,
  selectedId,
  tool,
  onChange,
  onSelect,
  onToolChange,
  theme,
}: AnnotationSurfaceProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [local, setLocal] = useState<ChartAnnotation[]>(annotations);
  const localRef = useRef(local);
  localRef.current = local;
  const annotationsRef = useRef(annotations);
  annotationsRef.current = annotations;
  const [drawing, setDrawing] = useState<ForcedDraw | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const cancelEditRef = useRef(false);

  useEffect(() => {
    setLocal(annotations);
    localRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    setEditingId(null);
  }, [selectedId]);

  const scale = area.svg.width > 0 ? area.css.width / area.svg.width : 1;
  const overlayArea = { left: 0, top: 0, width: area.css.width, height: area.css.height };
  const geometryOf = (annotation: ChartAnnotation): AnnotationGeometry =>
    annotationGeometry(scaleAnnotation(annotation, scale), overlayArea, theme);

  const toNormalized = (clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    };
  };

  const updateLocal = (next: ChartAnnotation[]) => {
    localRef.current = next;
    setLocal(next);
  };

  const commit = (next: ChartAnnotation[]) => {
    updateLocal(next);
    onChange(next);
  };

  const startEditing = (annotation: ChartAnnotation) => {
    if (annotation.type !== 'text') return;
    cancelEditRef.current = false;
    setEditingId(annotation.id);
    setEditText(annotation.text ?? '');
  };

  const applyText = () => {
    if (!editingId) return;
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }
    const id = editingId;
    setEditingId(null);
    if ((localRef.current.find(annotation => annotation.id === id)?.text ?? '') === editText) return;
    commit(localRef.current.map(annotation =>
      annotation.id === id ? { ...annotation, text: editText } : annotation
    ));
  };

  /** Commit a text edit before a new gesture captures the baseline list. */
  const flushEdit = () => {
    if (editingId) applyText();
  };

  const beginMove = (event: PointerEvent, annotation: ChartAnnotation) => {
    if (event.button !== 0 || annotation.hidden) return;
    event.stopPropagation();
    event.preventDefault();
    flushEdit();
    onSelect(annotation.id);
    if (tool !== 'select') onToolChange('select');
    setEditingId(null);
    rootRef.current?.focus({ preventScroll: true });
    dragRef.current = {
      mode: 'move',
      id: annotation.id,
      start: toNormalized(event.clientX, event.clientY),
      original: localRef.current,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const beginResize = (
    event: PointerEvent,
    annotation: ChartAnnotation,
    handle: ResizeHandle
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    flushEdit();
    onSelect(annotation.id);
    rootRef.current?.focus({ preventScroll: true });
    dragRef.current = {
      mode: 'resize',
      id: annotation.id,
      handle,
      start: toNormalized(event.clientX, event.clientY),
      original: localRef.current,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const beginCreate = (event: PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    flushEdit();
    rootRef.current?.focus({ preventScroll: true });
    const point = toNormalized(event.clientX, event.clientY);
    if (tool === 'select') {
      onSelect(null);
      return;
    }
    if (tool === 'text') {
      const next: ChartAnnotation = {
        id: createAnnotationId(),
        type: 'text',
        x: point.x,
        y: point.y,
        text: t('chart.annotation.defaultText'),
        fontSize: 12,
        strokeWidth: 2,
      };
      const list = [...localRef.current, next];
      commit(list);
      onSelect(next.id);
      onToolChange('select');
      return;
    }
    dragRef.current = { mode: 'create', type: tool, start: point, current: point };
    setDrawing({ type: tool, start: point, current: point });
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (drag.mode === 'create') {
      const next = { ...drag, current: point };
      dragRef.current = next;
      setDrawing(next);
      return;
    }
    const original = drag.original;
    const base = original.find(annotation => annotation.id === drag.id);
    if (!base) return;
    if (drag.mode === 'move') {
      const dx = point.x - drag.start.x;
      const dy = point.y - drag.start.y;
      const moved = moveWithin(base, dx, dy);
      updateLocal(original.map(annotation => (annotation.id === moved.id ? moved : annotation)));
      return;
    }
    const resized = resizeAnnotation(base, drag.handle, point);
    updateLocal(original.map(annotation => (annotation.id === resized.id ? resized : annotation)));
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.mode === 'create') {
      const distance = Math.hypot(
        drag.current.x - drag.start.x,
        drag.current.y - drag.start.y
      );
      const end =
        distance < 0.01
          ? {
              x: clamp01(drag.start.x + 0.2),
              y: clamp01(drag.start.y + 0.15),
            }
          : drag.current;
      const next: ChartAnnotation = {
        id: createAnnotationId(),
        type: drag.type,
        x: drag.start.x,
        y: drag.start.y,
        x2: end.x,
        y2: end.y,
        strokeWidth: 2,
      };
      commit([...localRef.current, next]);
      onSelect(next.id);
      setDrawing(null);
      onToolChange('select');
      return;
    }
    onChange(localRef.current);
  };

  const onPointerCancel = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDrawing(null);
    if (drag && drag.mode !== 'create') updateLocal(drag.original);
  };

  const onDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const point = toNormalized(event.clientX, event.clientY);
    const px = point.x * area.css.width;
    const py = point.y * area.css.height;
    const target = [...localRef.current].reverse().find(annotation => {
      if (annotation.hidden || annotation.type !== 'text') return false;
      const box = geometryOf(annotation).bbox;
      return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height;
    });
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(target.id);
    startEditing(target);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).tagName === 'TEXTAREA') return;
    const selected = localRef.current.find(annotation => annotation.id === selectedId);
    if (event.key === 'Escape') {
      if (tool !== 'select') {
        onToolChange('select');
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (selected) {
        onSelect(null);
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    if (!selected) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(null);
      commit(localRef.current.filter(annotation => annotation.id !== selected.id));
      return;
    }
    if (event.key === 'Enter' && selected.type === 'text') {
      event.preventDefault();
      event.stopPropagation();
      startEditing(selected);
      return;
    }
    const step = event.shiftKey ? 0.05 : 0.01;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    event.stopPropagation();
    const moved = moveWithin(selected, move[0], move[1]);
    commit(localRef.current.map(annotation => (annotation.id === moved.id ? moved : annotation)));
  };

  const selected = local.find(annotation => annotation.id === selectedId) ?? null;
  const selectedGeometry = selected && !selected.hidden ? geometryOf(selected) : null;
  const drawingGeometry: AnnotationGeometry | null = drawing
    ? annotationGeometry(
        scaleAnnotation(
          {
            id: '__draft__',
            type: drawing.type,
            x: drawing.start.x,
            y: drawing.start.y,
            x2: drawing.current.x,
            y2: drawing.current.y,
            strokeWidth: 2,
          },
          scale
        ),
        overlayArea,
        theme
      )
    : null;

  return (
    <div
      ref={rootRef}
      className="absolute z-20 outline-none"
      style={{
        left: area.css.left,
        top: area.css.top,
        width: area.css.width,
        height: area.css.height,
      }}
      data-no-export
      data-annotation-surface
      role="application"
      aria-label={t('chart.annotation.editorTitle')}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <svg
        ref={svgRef}
        width={area.css.width}
        height={area.css.height}
        viewBox={`0 0 ${area.css.width} ${area.css.height}`}
        className="h-full w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDoubleClick={onDoubleClick}
      >
        <rect
          data-annotation-background
          x={0}
          y={0}
          width={area.css.width}
          height={area.css.height}
          fill="transparent"
          pointerEvents="all"
          onPointerDown={beginCreate}
        />
        {local.map(annotation => {
          if (annotation.hidden) return null;
          const geometry = geometryOf(annotation);
          const bbox = geometry.bbox;
          return (
            <g
              key={annotation.id}
              data-annotation-hit={annotation.id}
              data-annotation-type={annotation.type}
              className={tool === 'select' ? 'cursor-move' : 'cursor-crosshair'}
              onPointerDown={event => beginMove(event, annotation)}
            >
              <GeometryMark geometry={geometry} />
              <rect
                x={bbox.x - 2}
                y={bbox.y - 2}
                width={Math.max(4, bbox.width + 4)}
                height={Math.max(4, bbox.height + 4)}
                fill="transparent"
                pointerEvents="all"
              />
            </g>
          );
        })}
        {drawingGeometry && <GeometryMark geometry={drawingGeometry} preview />}
        {selectedGeometry && (
          <rect
            x={selectedGeometry.bbox.x - 3}
            y={selectedGeometry.bbox.y - 3}
            width={Math.max(6, selectedGeometry.bbox.width + 6)}
            height={Math.max(6, selectedGeometry.bbox.height + 6)}
            fill="none"
            stroke={ACCENT}
            strokeWidth={1}
            strokeDasharray="4 3"
            pointerEvents="none"
            data-annotation-selection
          />
        )}
        {selected &&
          selectedGeometry &&
          handlePositions(selectedGeometry).map(item => (
            <rect
              key={item.handle}
              data-annotation-handle={item.handle}
              x={item.x - HANDLE / 2}
              y={item.y - HANDLE / 2}
              width={HANDLE}
              height={HANDLE}
              rx={1}
              fill="#ffffff"
              stroke={ACCENT}
              strokeWidth={1.5}
              style={{ cursor: item.cursor }}
              onPointerDown={event => beginResize(event, selected, item.handle)}
            />
          ))}
      </svg>
      {editingId && selected && selectedGeometry && (
        <textarea
          autoFocus
          value={editText}
          maxLength={200}
          onChange={event => setEditText(event.target.value)}
          onBlur={applyText}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === 'Escape') {
              event.preventDefault();
              cancelEditRef.current = true;
              setEditingId(null);
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              applyText();
            }
          }}
          style={{
            left: Math.max(0, Math.min(selectedGeometry.bbox.x, area.css.width - 180)),
            top: Math.max(0, Math.min(selectedGeometry.bbox.y, area.css.height - 40)),
            width: Math.max(180, selectedGeometry.bbox.width + 24),
            minHeight: Math.max(30, selectedGeometry.bbox.height + 8),
            fontSize: Math.max(10, selectedGeometry.kind === 'text' ? selectedGeometry.fontSize : 12),
          }}
          className="absolute z-30 resize rounded border border-accent bg-surface3 px-1.5 py-1 text-text outline-none"
          data-annotation-text-editor
        />
      )}
    </div>
  );
};

interface ForcedDraw {
  type: Exclude<AnnotationType, 'text'>;
  start: Point;
  current: Point;
}
