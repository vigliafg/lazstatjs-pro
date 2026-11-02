import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyChartStyle,
  defaultChartStyle,
  deleteUserStyle,
  hasStyleGallery,
  matchingChartStyle,
  normalizeUserStyles,
  renameUserStyle,
  resolvedStyle,
  saveUserStyle,
  styleAvailable,
  stylePatchOf,
  stylesByOrigin,
  stylesFor,
  type ChartStyle,
} from './styles';
import { factoryOptions } from './defaults';
import type { AnalysisChart, ChartData, ChartKind, ChartOptions } from '../stats/charts';

const chartWith = (
  kind: ChartKind,
  data: ChartData,
  stats: Record<string, number | string | null> = {}
): AnalysisChart => ({
  version: 1,
  id: 'test-chart',
  kind,
  title: 'Test',
  layout: 'full',
  data,
  fields: {},
  stats,
  options: factoryOptions(kind),
});

const KINDS: ChartKind[] = [
  'scatter',
  'line',
  'bar',
  'box',
  'histogram',
  'interval',
  'dot',
  'ecdf',
  'qq',
  'forest',
  'survival',
  'risk',
  'mosaic',
  'acf',
  'heatmap',
  'residual',
  'scree',
  'score',
  'bland',
  'power',
  'bootstrap',
  'missingness',
  'diamond',
  'circles',
  'shadowgram',
  'scattermatrix',
  'bubble',
  'scatter3d',
];

test('each style gallery has unique ids and exactly one default', () => {
  for (const kind of KINDS) {
    const styles = stylesFor(kind);
    const ids = styles.map(style => style.id);
    assert.equal(new Set(ids).size, ids.length, `${kind}: duplicate style ids`);
    const defaults = styles.filter(style => style.isDefault);
    assert.equal(defaults.length, styles.length > 0 ? 1 : 0, `${kind}: default count`);
    if (styles.length > 1) assert.ok(hasStyleGallery(kind), `${kind}: gallery flag`);
    else assert.equal(hasStyleGallery(kind), false, `${kind}: gallery flag`);
    for (const style of styles) {
      assert.equal(style.kind, kind, `${kind}: style kind`);
      assert.ok(style.labelKey?.startsWith('chart.'), `${kind}: label key`);
      assert.ok(Object.keys(style.options).length > 0, `${kind}: empty style`);
      assert.equal('kind' in style.options, false, `${kind}: style must not patch kind`);
      assert.equal('annotations' in style.options, false, `${kind}: annotations stay per card`);
    }
  }
});

test('every gallery kind has a LazStats family and the Q-Q default is the documented JMP exception', () => {
  for (const kind of KINDS) {
    if (stylesFor(kind).length === 0) continue;
    assert.ok(
      stylesByOrigin(kind, 'lazstat').length > 0,
      `${kind}: missing a LazStats-like style`
    );
    assert.equal(
      stylesFor(kind).filter(style => style.origin === 'jmp' && style.isDefault).length,
      kind === 'qq' ? 1 : 0,
      `${kind}: unexpected JMP default`
    );
  }
  const qqDefault = defaultChartStyle('qq');
  assert.equal(qqDefault?.id, 'probability');
  assert.equal(qqDefault?.origin, 'jmp');
  assert.ok(qqDefault?.descriptionKey);
  const classic = stylesFor('qq').find(style => style.id === 'classic');
  assert.equal(classic?.origin, 'lazstat');
});

test('style availability follows procedure and precalculated data', () => {
  const style: ChartStyle = {
    id: 'jmp-test',
    kind: 'box',
    origin: 'jmp',
    analyses: ['anova'],
    requires: ['percentile', 'meanCI'],
    options: { display: 'box' },
  };
  const complete = chartWith(
    'box',
    {
      summary: [
        { category: 'A', p10: 1, p90: 9, meanLo: 4, meanHi: 6 },
        { category: 'B', p10: 2, p90: 8, meanLo: 3, meanHi: 7 },
      ],
    }
  );
  assert.equal(styleAvailable(style, { chart: complete, analysisId: 'anova' }), true);
  assert.equal(styleAvailable(style, { chart: complete, analysisId: 'ttest' }), false);
  assert.equal(styleAvailable(style, { analysisId: 'anova' }), true, 'pre-run is optimistic');
  assert.equal(styleAvailable(style, {}), true, 'no context keeps the style');
  assert.equal(
    styleAvailable(style, { chart: chartWith('box', { summary: [{ category: 'A', p10: 1, p90: 9 }] }) }),
    false,
    'missing mean CI hides the style'
  );

  const meanY = { ...style, requires: ['meanY' as const], analyses: undefined };
  assert.equal(styleAvailable(meanY, { chart: chartWith('scatter', {}, { meanY: 4 }) }), true);
  assert.equal(styleAvailable(meanY, { chart: chartWith('scatter', {}, { meanY: null }) }), false);

  const band = { ...style, requires: ['band' as const], analyses: undefined };
  assert.equal(
    styleAvailable(band, { chart: chartWith('scatter', { grid: [{ x: 1, yhat: 2, seMean: 0.5 }] }) }),
    true
  );
  assert.equal(styleAvailable(band, { chart: chartWith('scatter', { grid: [] }) }), false);

  const group = { ...style, requires: ['group' as const], analyses: undefined };
  assert.equal(
    styleAvailable(group, { chart: chartWith('scatter', { points: [{ x: 1, y: 2, group: 'A' }] }) }),
    true
  );
  assert.equal(
    styleAvailable(group, { chart: chartWith('scatter', { points: [{ x: 1, y: 2 }] }) }),
    false
  );

  const residSd = { ...style, requires: ['residSd' as const], analyses: undefined };
  assert.equal(styleAvailable(residSd, { chart: chartWith('residual', { points: [] }, { residSd: 1.2 }) }), true);
  assert.equal(styleAvailable(residSd, { chart: chartWith('residual', { points: [] }) }), false);
});

test('the Milestone B JMP styles pin the documented options', () => {
  const find = (kind: ChartKind, id: string) => stylesFor(kind).find(style => style.id === id);
  assert.deepEqual(find('interval', 'jmp-mean-diamond')?.options, {
    valueLabels: false,
    showMeanDiamond: true,
  });
  assert.equal(find('dot', 'jmp-strip')?.options.jitter, 'wide');
  assert.equal(find('residual', 'jmp-residual')?.options.showStdBand, true);
  assert.deepEqual(find('histogram', 'jmp-basic')?.options, {
    showDensity: false,
    showKde: false,
    showRug: true,
    showMeanLine: true,
  });
  const outlier = find('box', 'jmp-outlier');
  assert.equal(outlier?.options.whisker, 'tukey');
  assert.equal(outlier?.options.showMeanInterval, true);
  assert.deepEqual(outlier?.requires, ['meanCI']);
});

test('user styles stay outside the built-in families', () => {
  const user = saveUserStyle([], 'Mio box', 'box', { display: 'violin' });
  const saved = stylesFor('box', user).at(-1);
  assert.equal(saved?.user, true);
  assert.equal(saved?.origin, undefined);
  assert.equal(stylesByOrigin('box', 'lazstat', user).some(style => style.id === saved?.id), false);
});

test('the default style reproduces the factory options of its kind', () => {
  for (const kind of KINDS) {
    const style = defaultChartStyle(kind);
    if (!style) continue;
    const factory = factoryOptions(kind);
    assert.deepEqual(
      applyChartStyle(factory, style),
      factory,
      `${kind}: default style drifted from the factory options`
    );
  }
});

test('styles only own known keys of their kind and differ from the default', () => {
  for (const kind of KINDS) {
    const factory = factoryOptions(kind) as unknown as Record<string, unknown>;
    const fallback = defaultChartStyle(kind);
    for (const style of stylesFor(kind)) {
      for (const [key, value] of Object.entries(style.options)) {
        assert.ok(key in factory, `${kind}/${style.id}: unknown option ${key}`);
        assert.equal(typeof value, typeof factory[key], `${kind}/${style.id}: ${key} type`);
      }
      if (fallback && style.id !== fallback.id) {
        assert.notDeepEqual(
          applyChartStyle(factoryOptions(kind), style),
          factoryOptions(kind),
          `${kind}/${style.id}: style does not change anything`
        );
      }
    }
  }
});

test('applying a style keeps kind and annotations, and is recognised afterwards', () => {
  const base = {
    ...factoryOptions('qq'),
    annotations: [{ id: 'a', type: 'text' as const, x: 0.5, y: 0.5, text: 'note' }],
  };
  const classic = stylesFor('qq').find(style => style.id === 'classic');
  assert.ok(classic);
  const next = applyChartStyle(base, classic!);
  assert.equal(next.kind, 'qq');
  assert.deepEqual(next.annotations, base.annotations);
  assert.equal((next as unknown as Record<string, unknown>).ciStyle, 'band');
  assert.equal(matchingChartStyle(next)?.id, 'classic');
  assert.equal(matchingChartStyle(factoryOptions('qq'))?.id, 'probability');
});

test('a style of another kind leaves the options untouched', () => {
  const qq = stylesFor('qq')[0];
  const bar = factoryOptions('bar');
  assert.equal(applyChartStyle(bar, qq), bar);
});

test('user styles are validated, unique per kind and never keep common options', () => {
  const styles = normalizeUserStyles([
    { id: 'a', name: 'Mio Q-Q', kind: 'qq', options: { ciStyle: 'band', qqAxis: 'z', theme: 'light' } },
    { id: 'a', name: 'Mio Q-Q', kind: 'qq', options: { ciStyle: 'curves' } },
    { name: 'Mio Q-Q', kind: 'qq', options: { ciStyle: 'curves' } },
    { name: '', kind: 'qq', options: { ciStyle: 'curves' } },
    { name: 'Tipo ignoto', kind: 'nope', options: { x: 1 } },
    { name: 'Chiave ignota', kind: 'box', options: { nonsense: 1 } },
    { name: 'Solo tema', kind: 'box', options: { theme: 'light' } },
  ]);
  assert.equal(styles.length, 1, 'one valid, unique style survives');
  assert.equal(styles[0].name, 'Mio Q-Q');
  assert.equal(styles[0].kind, 'qq');
  assert.deepEqual(styles[0].options, { ciStyle: 'band', qqAxis: 'z' });
});

test('saving, renaming and deleting a user style keeps the library consistent', () => {
  const kind = 'qq';
  const options = { ...factoryOptions(kind), ciStyle: 'band', qqAxis: 'z' } as ChartOptions;
  let styles = saveUserStyle([], 'Classico mio', kind, stylePatchOf(options));
  assert.equal(styles.length, 1);
  assert.equal(styles[0].name, 'Classico mio');
  assert.deepEqual(styles[0].options, {
    ciStyle: 'band',
    qqAxis: 'z',
    detrended: false,
    showReference: true,
    showCI: false,
  });

  // Same name on the same kind overwrites, on another kind it is a new style.
  styles = saveUserStyle(styles, 'classico MIO', kind, { ciStyle: 'curves' });
  assert.equal(styles.length, 1);
  assert.equal(styles[0].options.ciStyle, 'curves');
  styles = saveUserStyle(styles, 'Classico mio', 'box', { display: 'violin' });
  assert.equal(styles.length, 2);

  styles = saveUserStyle(styles, 'Secondo stile', kind, { ciStyle: 'curves', qqAxis: 'both' });
  assert.equal(styles.length, 3);
  styles = renameUserStyle(styles, styles[0].id, 'Rinominato');
  assert.equal(styles[0].name, 'Rinominato');
  styles = renameUserStyle(styles, styles[2].id, 'Rinominato');
  assert.equal(styles[2].name, 'Secondo stile', 'duplicate names are rejected per kind');

  const id = styles[0].id;
  assert.equal(deleteUserStyle(styles, id).length, 2);
});

test('user styles join the gallery of their kind and resolve as defaults', () => {
  const user = saveUserStyle([], 'Mio classico', 'qq', { ciStyle: 'band', qqAxis: 'z' });
  const gallery = stylesFor('qq', user);
  assert.equal(gallery.length, 3);
  assert.equal(gallery.at(-1)?.name, 'Mio classico');
  const applied = applyChartStyle(factoryOptions('qq'), gallery.at(-1)!);
  assert.equal(matchingChartStyle(applied, user)?.name, 'Mio classico');

  // The analysis override wins over the global default; unknown ids fall back.
  const id = user[0].id;
  assert.equal(resolvedStyle('qq', undefined, id, user)?.id, id);
  assert.equal(resolvedStyle('qq', id, undefined, user)?.id, id);
  assert.equal(resolvedStyle('qq', 'missing', undefined, user)?.id, 'probability');
  assert.equal(resolvedStyle('box', id, undefined, user)?.id, 'box');
});
