import test from 'node:test';
import assert from 'node:assert/strict';
import { gageRr, type MsaRow } from './msa';

const rows: MsaRow[] = [];
const values: Record<string, number[]> = {
  '1|A': [10.1, 10.2, 10.0],
  '1|B': [10.3, 10.2, 10.4],
  '2|A': [12.0, 12.1, 11.9],
  '2|B': [12.2, 12.3, 12.1],
  '3|A': [14.2, 14.1, 14.3],
  '3|B': [14.0, 14.1, 13.9],
};
for (const [key, reps] of Object.entries(values)) {
  const [part, operator] = key.split('|');
  reps.forEach(value => rows.push({ part, operator, value }));
}

test('Gage R&R separates repeatability, reproducibility and parts', () => {
  const result = gageRr(rows);
  assert.ok(result);
  assert.equal(result!.parts, 3);
  assert.equal(result!.operators, 2);
  assert.equal(result!.replicates, 3);
  assert.ok(result!.variance.repeatability > 0);
  assert.ok(result!.variance.part > result!.variance.grr);
  assert.ok(result!.pctStudyVariation > 0 && result!.pctStudyVariation < 100);
  assert.ok(result!.ndc >= 1);
  assert.equal(result!.anova.length, 5);
});

test('Gage R&R rejects an incomplete crossed design', () => {
  assert.equal(gageRr(rows.filter(row => !(row.part === '3' && row.operator === 'B'))), null);
  assert.equal(gageRr(rows.map(row => ({ ...row, operator: 'A' }))), null);
});
