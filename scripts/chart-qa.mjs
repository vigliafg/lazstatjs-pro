/**
 * Visual QA contact sheet for the charts added by the W10 waves.
 *
 * Runs the real builders on small fixtures, compiles the same Vega-Lite spec
 * the app uses (`buildVegaSpec`) and writes a static page with one card per
 * chart. Playwright then screenshots that page; no app server is needed.
 *
 * Usage: node --import tsx scripts/chart-qa.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { buildVegaSpec } from '../src/charts/vega/buildSpec.ts';
import { readDelimitedTable } from '../src/io/readers.ts';
import { DEFAULT_PARAMS } from '../src/io/project/types.ts';
import { buildAnovaOutput } from '../src/analyses/anova/run.tsx';
import { buildChiSquareOutput } from '../src/analyses/chisquare/run.tsx';
import { buildRegressionOutput } from '../src/analyses/regression/run.tsx';
import { buildMultinomialOutput } from '../src/analyses/multinomial/run.tsx';
import { buildIvOutput } from '../src/analyses/iv/run.tsx';
import { buildPlsOutput } from '../src/analyses/pls/run.tsx';

const OUT = '/tmp/chart-qa';
mkdirSync(OUT, { recursive: true });

const grid = (cols, rows) => ({ cols, rows });
const num = name => ({ name, type: 'num' });
const cat = name => ({ name, type: 'cat' });

const moodRows = [
  ...[5.1, 4.8, 5.5, 4.9, 5.2, 5.0].map(value => [String(value), 'A']),
  ...[5.4, 5.9, 5.1, 5.6, 5.3, 5.7].map(value => [String(value), 'B']),
  ...[4.2, 4.5, 3.9, 4.4, 4.1, 4.3].map(value => [String(value), 'C']),
];

const nestedRows = [
  ['10', 'A', 'A1'], ['12', 'A', 'A1'], ['14', 'A', 'A2'], ['16', 'A', 'A2'],
  ['11', 'B', 'B1'], ['13', 'B', 'B1'], ['15', 'B', 'B2'], ['17', 'B', 'B2'],
  ['12', 'C', 'C1'], ['14', 'C', 'C1'], ['16', 'C', 'C2'], ['18', 'C', 'C2'],
];

const gofRows = [
  ...Array.from({ length: 30 }, () => ['A']),
  ...Array.from({ length: 20 }, () => ['B']),
  ...Array.from({ length: 25 }, () => ['C']),
  ...Array.from({ length: 15 }, () => ['D']),
  ...Array.from({ length: 10 }, () => ['E']),
];

const multinomialRows = [
  ...[...Array.from({ length: 10 }, (_, i) => i), 25].map(x => [String(x), 'A']),
  ...[5, ...Array.from({ length: 10 }, (_, i) => 20 + i), 45].map(x => [String(x), 'B']),
  ...[25, ...Array.from({ length: 10 }, (_, i) => 40 + i)].map(x => [String(x), 'C']),
];

const selectionRows = Array.from({ length: 30 }, (_, index) => {
  const x = index;
  const y = 4 + 1.5 * x + 0.3 * Math.sin(index * 1.7);
  return [String(x), String(y), String((index * 13) % 17), String((index * 7) % 11)];
});

const ivCsv = readFileSync('samples/regression/iv_demo/data.csv', 'utf8').trim().split(/\r?\n/);
const ivHeader = ivCsv[0].split(',').map(value => value.replace(/^"|"$/g, '').trim());
const ivGrid = grid(
  ivHeader.map(name => num(name)),
  ivCsv.slice(1).map(line => line.split(',').map(value => value.trim()))
);

const mtcars = readDelimitedTable(
  readFileSync('samples/regression/mtcars/data.csv', 'utf8'),
  { delimiter: ',', hasHeader: true }
);
const plsCols = mtcars.names.map((name, index) => ({ name, type: mtcars.types[index] }));
const plsColumn = name => mtcars.names.indexOf(name);

const cases = [
  ['mood-median-ci', () =>
    buildAnovaOutput({
      grid: grid([num('Score'), cat('Group')], moodRows),
      anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'median', dep: 0, grp: 1 },
      ciLevel: 95,
    })],
  ['nested-variance', () =>
    buildAnovaOutput({
      grid: grid([num('Y'), cat('Outer'), cat('Inner')], nestedRows),
      anovaParams: { ...DEFAULT_PARAMS.anova, mode: 'nested', dep: 0, grp: 1, inner: 2 },
      ciLevel: 95,
    })],
  ['gof-contribution', () =>
    buildChiSquareOutput({
      grid: grid([cat('Category')], gofRows),
      chisqParams: { ...DEFAULT_PARAMS.chisq, mode: 'gof', gofVariable: 0, gofExpected: '' },
      ciLevel: 95,
    })],
  ['selection-coefficients', () =>
    buildRegressionOutput({
      grid: grid([num('X'), num('Y'), num('Z'), num('W')], selectionRows),
      regParams: {
        ...DEFAULT_PARAMS.reg,
        mode: 'selection',
        dep: 1,
        indeps: [0, 2, 3],
        selectionDirection: 'both',
        selectionCriterion: 'bic',
      },
      ciLevel: 95,
    })],
  ['multinomial-confusion', () =>
    buildMultinomialOutput({
      grid: grid([num('X'), cat('Y')], multinomialRows),
      params: { outcome: 1, predictors: [0] },
      ciLevel: 95,
    })],
  ['iv-first-stage', () =>
    buildIvOutput({
      grid: ivGrid,
      params: { dep: 0, endog: [1], instruments: [2, 3], exog: [4], robust: false },
      ciLevel: 95,
    })],
  ['pls-loadings', () =>
    buildPlsOutput({
      grid: grid(plsCols, mtcars.rows),
      params: {
        dep: plsColumn('mpg'),
        indeps: [plsColumn('wt'), plsColumn('hp'), plsColumn('disp'), plsColumn('qsec')],
        components: 2,
        cvFolds: 5,
      },
      ciLevel: 95,
    })],
];

const wanted = new Set(cases.map(([id]) => id));
const cards = [];
const failed = [];

for (const [id, build] of cases) {
  try {
    const result = build();
    if (!result.ok) {
      failed.push(`${id}: ${result.reason}`);
      continue;
    }
    for (const chart of result.charts ?? []) {
      if (!wanted.has(chart.id)) continue;
      cards.push({ id: chart.id, spec: buildVegaSpec(chart, chart.options) });
    }
  } catch (error) {
    failed.push(`${id}: ${error.message}`);
  }
}

const missing = [...wanted].filter(id => !cards.some(card => card.id === id));
for (const id of missing) failed.push(`${id}: chart not emitted`);

const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<title>Chart QA</title>
<style>
  body { margin: 0; background: #f8fafc; font: 13px/1.4 system-ui, sans-serif; color: #0f172a; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin: 12px auto; padding: 8px 12px; width: 940px; }
  .card h2 { font-size: 13px; font-weight: 600; margin: 4px 0 8px; font-family: ui-monospace, monospace; }
  .view { width: 916px; height: 420px; }
  .error { color: #b91c1c; font-family: ui-monospace, monospace; }
</style>
<script src="file://${process.cwd()}/node_modules/vega/build/vega.min.js"></script>
<script src="file://${process.cwd()}/node_modules/vega-lite/build/vega-lite.min.js"></script>
<script src="file://${process.cwd()}/node_modules/vega-embed/build/vega-embed.min.js"></script>
</head><body>
<div id="status" class="card error"></div>
${cards.map(card => `<div class="card"><h2>${card.id}</h2><div class="view" id="${card.id}"></div></div>`).join('\n')}
<script>
const specs = ${JSON.stringify(cards.map(card => ({ id: card.id, spec: card.spec })))};
const errors = [];
(async () => {
  for (const { id, spec } of specs) {
    try {
      await vegaEmbed('#' + id, spec, { actions: false, renderer: 'canvas' });
    } catch (error) {
      errors.push(id + ': ' + error.message);
    }
  }
  document.getElementById('status').textContent = errors.length ? errors.join(' | ') : 'OK ' + specs.length;
  document.title = errors.length ? 'QA ERRORS' : 'QA OK';
})();
</script>
</body></html>`;

writeFileSync(`${OUT}/index.html`, html);
writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ cards: cards.map(card => card.id), failed }, null, 2));
console.log(`cards: ${cards.length} (${cards.map(card => card.id).join(', ')})`);
if (failed.length > 0) console.log(`failed: ${failed.join(' | ')}`);
