import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANALYSIS_FAMILIES,
  ANALYSIS_IDS,
  ANALYSIS_TABS,
  analysisMeta,
  familyOf,
  filterAnalyses,
  groupByFamily,
} from './registry';

test('analysis registry has unique ids and valid families', () => {
  const ids = ANALYSIS_TABS.map(meta => meta.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ANALYSIS_IDS], ids);
  for (const meta of ANALYSIS_TABS) {
    assert.ok(
      ANALYSIS_FAMILIES.some(family => family.id === meta.family),
      `${meta.id} has an unknown family`
    );
    assert.ok(meta.description.length > 10);
  }
});

test('filterAnalyses matches labels, descriptions, keywords and families', () => {
  assert.deepEqual(
    filterAnalyses('cox').map(meta => meta.id),
    ['cox', 'stratcox', 'tdcox']
  );
  assert.ok(filterAnalyses('survival').some(meta => meta.id === 'parametric'));
  assert.ok(filterAnalyses('bland altman').some(meta => meta.id === 'agreement'));
  assert.ok(filterAnalyses('bland-altman').some(meta => meta.id === 'agreement'));
  assert.ok(filterAnalyses('t-test').some(meta => meta.id === 'ttest'));
  assert.ok(filterAnalyses('chi-square').some(meta => meta.id === 'chisquare'));
  assert.ok(filterAnalyses('random intercept').some(meta => meta.id === 'lmm'));
  assert.deepEqual(filterAnalyses('definitely-not-an-analysis'), []);
  assert.equal(filterAnalyses('').length, ANALYSIS_TABS.length);
});

test('groupByFamily keeps every analysis exactly once', () => {
  const groups = groupByFamily();
  const ids = groups.flatMap(group => group.analyses.map(meta => meta.id));
  assert.equal(ids.length, ANALYSIS_TABS.length);
  assert.deepEqual(new Set(ids), new Set(ANALYSIS_IDS));
  assert.ok(groups.every(group => group.analyses.length > 0));
});

test('metadata lookups fall back safely', () => {
  assert.equal(analysisMeta('anova')?.label, 'ANOVA');
  assert.equal(familyOf('cox')?.label, 'Survival');
  assert.equal(analysisMeta('missing'), undefined);
  assert.equal(familyOf('missing'), undefined);
});
