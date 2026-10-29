import test from 'node:test';
import assert from 'node:assert/strict';
import { withReportLocale } from './reportCopy';
import type { ReportSpec } from './report';
import { ttestReport } from './reports/ttest';
import { descriptiveReport } from './reports/descriptive';
import { anovaReport } from './reports/anova';
import { ttestTables } from './tables/ttest';
import { descriptiveTables } from './tables/descriptive';
import { anovaTables } from './tables/anova';

/**
 * End-to-end checks of the English written output.
 *
 * The catalog test proves that every sentence is translated; these tests prove
 * that the builders still find their numbers once the labels are translated
 * (the report reads the rendered tables) and that nothing Italian leaks into
 * the card the user copies or exports.
 */

const rowsBy = (groups: Record<string, number[]>) => {
  const length = Math.max(...Object.values(groups).map(values => values.length));
  const rows: string[][] = [];
  for (let i = 0; i < length; i++) {
    rows.push(Object.values(groups).map(values => (values[i] === undefined ? '' : String(values[i]))));
  }
  return rows;
};

const ITALIAN = [' della ', ' delle ', ' nella ', ' quindi ', ' sono ', ' questo ', ' viene ', ' gruppo ', ' misure ', ' soglia ', ' valori '];

const flatten = (report: ReportSpec): string =>
  [
    report.title,
    report.headline,
    report.badge,
    ...report.intro,
    ...report.sections.flatMap(section => [section.heading, ...(section.body ?? []), ...(section.bullets ?? [])]),
    ...report.limitations,
  ].join(' ');

const assertEnglish = (report: ReportSpec) => {
  const text = flatten(report);
  assert.ok(!text.includes('NaN'), `${report.id}: NaN`);
  assert.ok(!text.includes('undefined'), `${report.id}: undefined`);
  assert.ok(!text.includes('{s'), `${report.id}: placeholder leaked`);
  const padded = ` ${text.toLowerCase()} `;
  for (const word of ITALIAN) assert.ok(!padded.includes(word), `${report.id}: Italian "${word}"`);
};

const ttestTablesFor = (a: number[], b: number[]) =>
  ttestTables({
    type: 'ind',
    rows: rowsBy({ a, b }),
    i1: 0,
    i2: 1,
    name1: 'Treatment',
    name2: 'Control',
    mu: 0,
    equalVar: true,
    level: 95,
    useNonParam: true,
  });

test('the t-test card is fully English and keeps reading the translated table', () => {
  const tables = ttestTablesFor([10, 11, 12, 13, 14, 15], [20, 21, 22, 23, 24, 25]);
  const report = withReportLocale('en', () =>
    ttestReport({
      tables,
      type: 'ind',
      name1: 'Treatment',
      name2: 'Control',
      mu: 0,
      level: 95,
      equalVar: true,
      useNonParam: true,
    })
  );
  assertEnglish(report);
  assert.equal(report.title, 'Reading report — T-Test');
  assert.match(report.headline, /The means of Treatment and Control differ/);
  // The effect table is found through the translated row label.
  assert.ok(
    report.sections.some(section => (section.bullets ?? []).some(bullet => bullet.startsWith('Hedges g ='))),
    'the effect size paragraph reads the effect table'
  );
});

test('descriptive and ANOVA cards are English end to end', () => {
  const rows: string[][] = Array.from({ length: 20 }, (_, i) => [
    String(10 + (i % 10)),
    String(20 + (i % 10)),
    String(1 + (i % 2)),
  ]);

  const descriptive = withReportLocale('en', () =>
    descriptiveReport(descriptiveTables(rows, [0, 1], ['Score_Pre', 'Score_Post'], 95), 95)
  );
  assertEnglish(descriptive);
  assert.equal(descriptive.title, 'Reading report — Descriptive statistics');
  assert.equal(descriptive.sections[0].heading, 'Result variable by variable');

  const anova = withReportLocale('en', () =>
    anovaReport({
      tables: anovaTables({
        rows,
        depIdx: 0,
        grpIdx: 2,
        depName: 'Score_Pre',
        grpName: 'Group',
        posthoc: 'holm',
        kwPosthoc: 'holm',
        level: 95,
        useNonParam: true,
      }),
      depName: 'Score_Pre',
      grpName: 'Group',
      level: 95,
      postHoc: 'holm',
      useNonParam: true,
    })
  );
  assertEnglish(anova);
  assert.equal(anova.title, 'Reading report — One-way ANOVA');
});

test('table headers follow the report language', () => {
  const tables = withReportLocale('en', () => ttestTablesFor([1, 2, 3], [4, 5, 6]));
  const labels = tables.flatMap(table => table.columns.map(column => column.label));
  assert.ok(labels.includes('Group'), `missing translated header: ${labels.join(', ')}`);
  assert.ok(!labels.includes('Gruppo'));
});
