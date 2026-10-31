import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ANNOTATIONS,
  MAX_ANNOTATION_BYTES,
  MAX_ANNOTATION_TEXT,
  annotationBBox,
  annotationGeometry,
  annotationsMarkup,
  createAnnotation,
  normalizeAnnotations,
  type ChartAnnotation,
} from './annotations';
import { factoryOptions, mergeOptions } from './defaults';
import { parseChartModel } from './schema';
import { makeChart } from './kits/common';

const base = (overrides: Partial<ChartAnnotation> = {}): ChartAnnotation => ({
  id: 'a1',
  type: 'text',
  x: 0.5,
  y: 0.4,
  ...overrides,
});

const area = { left: 100, top: 50, width: 200, height: 100 };

test('normalizeAnnotations keeps valid entries and drops unknown types', () => {
  const result = normalizeAnnotations([
    { id: 't', type: 'text', x: 0.5, y: 0.5, text: '  Hello  ' },
    { id: 'bad', type: 'circle', x: 0.1, y: 0.1 },
    { id: 'off', type: 'line', x: Number.NaN, y: 0.2 },
    null,
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].type, 'text');
  assert.equal(result[0].text, 'Hello');
});

test('normalizeAnnotations clamps coordinates and text length', () => {
  const result = normalizeAnnotations([
    { id: 't', type: 'text', x: -3, y: 9, text: 'x'.repeat(MAX_ANNOTATION_TEXT + 40) },
  ]);
  assert.equal(result[0].x, 0);
  assert.equal(result[0].y, 1);
  assert.equal(result[0].text?.length, MAX_ANNOTATION_TEXT);
});

test('normalizeAnnotations fills missing endpoints for shapes and rects', () => {
  const result = normalizeAnnotations([
    { id: 'l', type: 'line', x: 0.1, y: 0.1 },
    { id: 'a', type: 'arrow', x: 0.2, y: 0.2, x2: 0.8, y2: 0.6 },
    { id: 'r', type: 'rect', x: 0.7, y: 0.7, x2: 0.2, y2: 0.3 },
  ]);
  assert.equal(result.length, 3);
  assert.ok((result[0].x2 ?? 0) > result[0].x);
  assert.equal(result[1].x2, 0.8);
  assert.equal(result[2].x2, 0.2);
});

test('normalizeAnnotations preserves array order as z-order and the hidden flag', () => {
  const result = normalizeAnnotations([
    { id: 'back', type: 'rect', x: 0.1, y: 0.1, x2: 0.4, y2: 0.4 },
    { id: 'front', type: 'text', x: 0.2, y: 0.2, text: 'Top', hidden: true },
  ]);
  assert.deepEqual(result.map(annotation => annotation.id), ['back', 'front']);
  assert.equal(result[1].hidden, true);
});

test('normalizeAnnotations enforces the item cap and unique ids', () => {
  const result = normalizeAnnotations(
    Array.from({ length: MAX_ANNOTATIONS + 8 }, (_, index) => ({
      id: 'same',
      type: 'text',
      x: 0.1,
      y: 0.1,
      text: `N${index}`,
    }))
  );
  assert.equal(result.length, MAX_ANNOTATIONS);
  assert.equal(new Set(result.map(item => item.id)).size, result.length);
});

test('normalizeAnnotations never returns more than the serialized budget', () => {
  const result = normalizeAnnotations(
    Array.from({ length: MAX_ANNOTATIONS }, (_, index) => ({
      id: `a${index}`,
      type: 'text',
      x: 0.1,
      y: 0.1,
      text: 'x'.repeat(MAX_ANNOTATION_TEXT),
    }))
  );
  assert.ok(JSON.stringify(result).length <= MAX_ANNOTATION_BYTES);
  assert.ok(result.length <= MAX_ANNOTATIONS);
});

test('normalizeAnnotations rejects unsafe colours and keeps safe ones', () => {
  const result = normalizeAnnotations([
    { id: 'a', type: 'text', x: 0.1, y: 0.1, color: 'url(javascript:alert(1))' },
    { id: 'b', type: 'rect', x: 0.1, y: 0.1, color: '#fbbf24', fill: 'rgba(0,0,0,.2)' },
  ]);
  assert.equal(result[0].color, undefined);
  assert.equal(result[1].color, '#fbbf24');
  assert.equal(result[1].fill, 'rgba(0,0,0,.2)');
});

test('createAnnotation gives every shape a visible default size', () => {
  for (const type of ['text', 'line', 'arrow', 'rect'] as const) {
    const annotation = createAnnotation(type, 3, 'Note');
    assert.equal(annotation.type, type);
    assert.ok(annotation.x >= 0 && annotation.x <= 1);
    assert.ok(annotation.y >= 0 && annotation.y <= 1);
    if (type !== 'text') {
      assert.ok((annotation.x2 ?? 0) > annotation.x);
      assert.ok((annotation.y2 ?? 0) > annotation.y);
    }
  }
});

test('annotationGeometry maps normalized coordinates into the plot area', () => {
  const geometry = annotationGeometry(base({ x: 0.5, y: 0.25 }), area, 'dark');
  assert.equal(geometry.kind, 'text');
  if (geometry.kind !== 'text') return;
  assert.equal(geometry.x, 200);
  assert.equal(geometry.y, 75);
  assert.equal(geometry.color, '#fbbf24');
});

test('annotationGeometry uses the light-theme default colour', () => {
  const geometry = annotationGeometry(base({ x: 0, y: 0 }), area, 'light');
  assert.equal(geometry.kind === 'text' ? geometry.color : '', '#b45309');
});

test('line and arrow geometry exposes endpoints and an arrow head', () => {
  const line = annotationGeometry(
    base({ type: 'line', x: 0.1, y: 0.1, x2: 0.6, y2: 0.8 }),
    area,
    'dark'
  );
  assert.equal(line.kind, 'line');
  if (line.kind !== 'line' && line.kind !== 'arrow') return;
  assert.equal(line.x1, 120);
  assert.equal(line.y1, 60);
  assert.equal(line.x2, 220);
  assert.equal(line.y2, 130);

  const arrow = annotationGeometry(
    base({ type: 'arrow', x: 0.1, y: 0.1, x2: 0.6, y2: 0.8 }),
    area,
    'dark'
  );
  assert.equal(arrow.kind, 'arrow');
  if (arrow.kind !== 'arrow') return;
  assert.match(arrow.points ?? '', /^\d+\.\d{2},\d+\.\d{2} /);
});

test('rect geometry normalizes reversed endpoints and uses a translucent fill', () => {
  const rect = annotationGeometry(
    base({ type: 'rect', x: 0.7, y: 0.8, x2: 0.2, y2: 0.3 }),
    area,
    'dark'
  );
  assert.equal(rect.kind, 'rect');
  if (rect.kind !== 'rect') return;
  assert.deepEqual(
    { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    { x: 140, y: 80, width: 100, height: 50 }
  );
  assert.equal(rect.fillOpacity, 0.14);
});

test('annotationBBox and markup agree and hidden annotations are omitted', () => {
  const annotations = [
    base({ id: 't', x: 0.2, y: 0.2, text: '<b>not markup</b>' }),
    base({ id: 'h', type: 'rect', x: 0.1, y: 0.1, x2: 0.4, y2: 0.4, hidden: true }),
  ];
  const bbox = annotationBBox(annotations[0], area, 'dark');
  assert.equal(bbox.x, 140);
  assert.equal(bbox.y, 70);
  const markup = annotationsMarkup(annotations, area, 'dark');
  assert.match(markup, /data-annotation-id="t"/);
  assert.doesNotMatch(markup, /data-annotation-id="h"/);
  assert.match(markup, /&lt;b&gt;not markup&lt;\/b&gt;/);
  assert.doesNotMatch(markup, /<b>/);
});

test('mergeOptions preserves annotations but keeps them out of factory defaults', () => {
  assert.equal('annotations' in factoryOptions('bar'), false);
  const merged = mergeOptions('bar', {
    kind: 'bar',
    annotations: [{ id: 'x', type: 'text', x: 2, y: -1, text: 'A' }],
  });
  assert.equal(merged.annotations?.length, 1);
  assert.equal(merged.annotations?.[0].x, 1);
  assert.equal(merged.annotations?.[0].y, 0);
});

test('parseChartModel restores annotations from a project and accepts legacy charts', () => {
  const chart = makeChart({
    id: 'c1',
    kind: 'bar',
    title: 'Chart',
    data: { bars: [{ category: 'A', value: 1 }] },
    options: {
      kind: 'bar',
      annotations: [{ id: 'note', type: 'text', x: 0.3, y: 0.2, text: 'p = 0.03' }],
    },
  });
  const restored = parseChartModel(chart);
  assert.equal(restored?.options.annotations?.[0].text, 'p = 0.03');

  const legacy = parseChartModel({ ...chart, options: { kind: 'bar' } });
  assert.equal(legacy?.options.annotations, undefined);
});
