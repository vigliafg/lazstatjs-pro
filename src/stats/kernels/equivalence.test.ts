import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcFisherExact,
  calcKendallTau,
  calcKruskalWallis,
  calcMannWhitneyU,
  calcNormalityTests,
  calcTheilSen,
  calcWilcoxonSignedRank,
  logFactorial,
} from './index';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

/**
 * Valori di riferimento presi dall'implementazione prima dello spostamento in
 * `stats/kernels/`. Servono a dimostrare che il trasloco non ha cambiato i
 * numeri, indipendentemente dai golden delle analisi.
 */
test('kernels: Fisher, log-factorial and ranks keep their values', () => {
  close(logFactorial(10), 15.104412573075518);
  close(calcFisherExact(3, 1, 1, 3), 0.4857142857142845);

  const wilcoxon = calcWilcoxonSignedRank([1, 2, 3, 4, 5]);
  assert.equal(wilcoxon.wStat, 0);
  assert.equal(wilcoxon.posRankSum, 15);
  close(wilcoxon.zStat, -1.8877596148970779);
  close(wilcoxon.pValue, 0.05905822909053671);

  const mann = calcMannWhitneyU([1, 2, 3], [4, 5, 6]);
  assert.equal(mann.uStat, 0);
  assert.deepEqual([mann.sumRank1, mann.sumRank2], [6, 15]);
  close(mann.pValue, 0.0808555983700523);

  const kruskal = calcKruskalWallis({ a: [1, 2, 3], b: [4, 5, 6] });
  close(kruskal.hStat, 3.857142857142854);
  close(kruskal.pValue, 0.049534613434245034);
  assert.deepEqual(kruskal.groupMeanRanks, { a: 2, b: 5 });
});

test('kernels: regression and normality keep their values', () => {
  const theil = calcTheilSen([1, 2, 3, 4], [2, 4, 6, 8]);
  assert.deepEqual(theil, { slope: 2, intercept: 0 });
  assert.equal(calcKendallTau([1, 2, 3, 4], [2, 4, 6, 8]), 1);

  const normality = calcNormalityTests([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(normality.n, 10);
  close(normality.mean, 5.5);
  close(normality.stdev, 3.0276503540974917);
  close(normality.jbStat, 0.6244872972145699);
  close(normality.ksStat, 0.09551932898156279);
});
