#!/usr/bin/env node
/**
 * Baseline timings for the shared kernels.
 *
 * Not a pass/fail test: it prints milliseconds for representative sizes so a
 * regression in a refactor is visible before it reaches a release. Run with:
 *
 *   npm run bench:kernels
 */
import { performance } from 'node:perf_hooks';
import { regressionStats } from '../src/stats/kernels/regression.ts';
import { glmFit, addIntercept } from '../src/stats/kernels/glm.ts';
import { hierarchicalClusters } from '../src/stats/kernels/cluster.ts';
import { GUARD_LIMITS } from '../src/stats/kernels/guards.ts';

const time = (label, work) => {
  const start = performance.now();
  const value = work();
  const ms = performance.now() - start;
  console.log(`${label.padEnd(48)} ${ms.toFixed(1).padStart(9)} ms${value ? '' : '  (no result)'}`);
};

const linearRows = (n) =>
  Array.from({ length: n }, (_, index) => {
    const x1 = index % 97;
    const x2 = (index * 7) % 53;
    return [String(3 + 0.5 * x1 + 0.2 * x2 + ((index * 13) % 11) / 10), String(x1), String(x2)];
  });

for (const n of [1_000, 10_000, 50_000]) {
  const rows = linearRows(n);
  time(`OLS, ${n.toLocaleString()} rows × 2 predictors`, () =>
    regressionStats(rows, 0, [1, 2], 95)
  );
}

for (const n of [1_000, 10_000]) {
  const rows = linearRows(n);
  const y = rows.map(row => (Number(row[0]) > 30 ? 1 : 0));
  const x = addIntercept(rows.map(row => [Number(row[1])]));
  time(`binomial GLM (logit), ${n.toLocaleString()} rows`, () =>
    glmFit({ y, x, family: 'binomial', link: 'logit' })
  );
}

for (const n of [60, 120]) {
  const data = Array.from({ length: n }, (_, index) => [
    Math.cos(index / 7) * 10 + (index % 3),
    Math.sin(index / 5) * 10 + (index % 5),
  ]);
  time(`Ward clustering, ${n} rows × 2 variables`, () =>
    hierarchicalClusters({
      data,
      method: 'ward',
      clusters: 3,
      standardize: true,
      variableNames: ['X', 'Y'],
    })
  );
}

console.log(
  `\nGuard limits: quadratic ${GUARD_LIMITS.quadratic.maxRows} rows / ${GUARD_LIMITS.quadratic.maxColumns} columns, ` +
    `iterative ${GUARD_LIMITS.iterative.maxRows} / ${GUARD_LIMITS.iterative.maxColumns}, ` +
    `linear ${GUARD_LIMITS.linear.maxRows} / ${GUARD_LIMITS.linear.maxColumns}.`
);
