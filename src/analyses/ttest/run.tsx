import { jStat } from '../../stats/jstat';
import { pairedValues, parseNum, pooledTTest, welchTTest } from '../../stats/core';
import { ttestTables } from '../../stats/ttest';
import { ttestReport } from '../../stats/report';
import { calcMannWhitneyU, calcWilcoxonSignedRank } from '../../stats/kernels';
import type { TableSpec } from '../../stats/types';
import type { ReportSpec } from '../../stats/report';
import type { Dataset } from '../../grid/types';
import type { TTestParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isFiniteNumber } from '../shared/numbers';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';

export interface TTestRunInput {
  grid: Dataset;
  ttestParams: TTestParams;
  ciLevel: number;
}

/** T-test (un campione, indipendente, appaiato) e alternative non parametriche. */
export const buildTTestOutput = (input: TTestRunInput): AnalysisRunResult => {
  const { grid, ttestParams, ciLevel } = input;
    const { type, var1, var2, mu, useNonParam, equalVar } = ttestParams;
    if (type === 'one' && !isFiniteNumber(mu)) {
      return { ok: false, reason: 'Test mean (μ₀) must be a finite number' };
    }
    const a1 = grid.rows.map(r => parseNum(r[var1])).filter(v => !isNaN(v));
    const a2 = grid.rows.map(r => parseNum(r[var2])).filter(v => !isNaN(v));

    // Paired designs need complete cases per row: filtering each column on its
    // own would pair values coming from different observations.
    const paired = pairedValues(grid.rows, var1, var2);

    if (a1.length === 0 || (type !== 'one' && a2.length === 0) || (type === 'dep' && paired.a.length === 0)) {
      return { ok: false, reason: 'Insufficient data for T-Test' };
    }

    let charts: AnalysisChart[] = [];
    let title = copy('T-test');
    let reportSpec: ReportSpec | null = null;
    let tables: TableSpec[] = [];

    if (type === 'one') {
      const n = a1.length;
      const mean = jStat.mean(a1);
      const sd = jStat.stdev(a1, true);
      const se = sd / Math.sqrt(n);
      const t = (mean - mu) / se;
      const df = n - 1;
      const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      // Wilcoxon Signed-Rank Test
      const wilcox = calcWilcoxonSignedRank(a1, mu);
      const q = jStat.quartiles(a1);
      const boxData = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(a1),
          q1: q[0],
          median: q[1],
          q3: q[2],
          max: jStat.max(a1)
        }
      ];

      tables = ttestTables({
        type: 'one',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'one',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      charts = [
        makeChart({
          id: 'ttest-one-box',
          kind: 'box',
          title: copy('T-test a un campione: {s1}', { s1: grid.cols[var1].name }),
          subtitle: copy('Valore test μ = {s1}', { s1: mu }),
          note: copy('La linea tratteggiata è il valore di test; la media osservata è il punto.'),
          data: (() => {
            const box = boxRows([{ category: grid.cols[var1].name, values: a1 }]);
            return { summary: box.summary, points: box.points, outliers: box.outliers };
          })(),
          fields: { xLabel: copy('Campione'), yLabel: grid.cols[var1].name },
          options: { showPoints: true, showMean: true } as never,
        }),
      ];
      if (useNonParam && !isNaN(wilcox.wStat)) {
        const box = boxRows([{ category: grid.cols[var1].name, values: a1 }]);
        charts.push(
          makeChart({
            id: 'ttest-one-rank',
            kind: 'box',
            title: copy('Wilcoxon: distribuzione e mediana H₀'),
            subtitle: copy('Valore di riferimento = {s1}', { s1: mu }),
            note: copy('Il test non parametrico confronta la mediana con il valore di riferimento.'),
            data: { summary: box.summary, points: box.points, outliers: box.outliers, rules: [{ y: mu }] },
            fields: { xLabel: copy('Campione'), yLabel: grid.cols[var1].name },
            options: { showPoints: true } as never,
          })
        );
      }
      title = copy('T-test a un campione e Wilcoxon: {s1}', { s1: grid.cols[var1].name });
    } else if (type === 'ind') {
      const n1 = a1.length;
      const n2 = a2.length;
      if (n1 < 2 || n2 < 2) {
        return { ok: false, reason: 'Each group needs at least 2 numeric values' };
      }
      const m1 = jStat.mean(a1);
      const m2 = jStat.mean(a2);
      const v1 = jStat.variance(a1, true);
      const v2 = jStat.variance(a2, true);

      const { t, df, p } = equalVar ? pooledTTest(a1, a2) : welchTTest(a1, a2);
      const varianceLabel = equalVar ? 'Pooled Variance' : "Welch's Unequal Variances";

      // Mann-Whitney U test
      const mw = calcMannWhitneyU(a1, a2);

      const q1 = jStat.quartiles(a1);
      const q2 = jStat.quartiles(a2);
      const boxDataInd = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(a1),
          q1: q1[0],
          median: q1[1],
          q3: q1[2],
          max: jStat.max(a1)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(a2),
          q1: q2[0],
          median: q2[1],
          q3: q2[2],
          max: jStat.max(a2)
        }
      ];

      // Non-parametric boxplot: ranks of both groups
      const combinedForRanks = [
        ...a1.map(v => ({ val: v, group: 1, rank: 0 })),
        ...a2.map(v => ({ val: v, group: 2, rank: 0 }))
      ];
      const N_comb = combinedForRanks.length;
      combinedForRanks.sort((a, b) => a.val - b.val);
      let idx_comb = 0;
      while (idx_comb < N_comb) {
        let j = idx_comb;
        while (j < N_comb - 1 && combinedForRanks[j + 1].val === combinedForRanks[idx_comb].val) {
          j++;
        }
        const sumRanks = ((j + 1) * (j + 2)) / 2 - (idx_comb * (idx_comb + 1)) / 2;
        const avgRank = sumRanks / (j - idx_comb + 1);
        for (let k_comb = idx_comb; k_comb <= j; k_comb++) {
          combinedForRanks[k_comb].rank = avgRank;
        }
        idx_comb = j + 1;
      }
      const ranks1 = combinedForRanks.filter(item => item.group === 1).map(item => item.rank);
      const ranks2 = combinedForRanks.filter(item => item.group === 2).map(item => item.rank);
      const qRanks1 = jStat.quartiles(ranks1);
      const qRanks2 = jStat.quartiles(ranks2);
      const boxDataRanks = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(ranks1),
          q1: qRanks1[0],
          median: qRanks1[1],
          q3: qRanks1[2],
          max: jStat.max(ranks1)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(ranks2),
          q1: qRanks2[0],
          median: qRanks2[1],
          q3: qRanks2[2],
          max: jStat.max(ranks2)
        }
      ];

      tables = ttestTables({
        type: 'ind',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'ind',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      const box = boxRows([
        { category: grid.cols[var1].name, values: a1 },
        { category: grid.cols[var2].name, values: a2 },
      ]);
      charts = [
        makeChart({
          id: 'ttest-ind-box',
          kind: 'box',
          title: copy('T-test per campioni indipendenti'),
          subtitle: `${grid.cols[var1].name} vs ${grid.cols[var2].name}`,
          note: copy('Confronta la distribuzione dei due gruppi; la linea centrale è la mediana.'),
          data: { summary: box.summary, points: box.points, outliers: box.outliers },
          fields: { xLabel: copy('Gruppo'), yLabel: copy('Valore') },
          options: { showPoints: true } as never,
        }),
      ];
      if (useNonParam && !isNaN(mw.uStat)) {
        const rankBox = boxRows([
          { category: grid.cols[var1].name, values: ranks1 },
          { category: grid.cols[var2].name, values: ranks2 },
        ]);
        charts.push(
          makeChart({
            id: 'ttest-ind-rank',
            kind: 'box',
            title: copy('Mann-Whitney: ranghi per gruppo'),
            subtitle: `${grid.cols[var1].name} vs ${grid.cols[var2].name}`,
            note: copy('Il test non parametrico confronta i ranghi dei due gruppi.'),
            data: { summary: rankBox.summary, points: rankBox.points, outliers: rankBox.outliers },
            fields: { xLabel: copy('Gruppo'), yLabel: copy('Rango') },
            options: { showPoints: true } as never,
          })
        );
      }
      title = copy('T-test per campioni indipendenti e Mann-Whitney');
    } else if (type === 'dep') {
      // Paired samples: only rows where both columns hold a numeric value
      const n = paired.a.length;
      if (n < 2) {
        return { ok: false, reason: 'Paired T-Test needs at least 2 complete pairs' };
      }
      const diffs: number[] = [];
      for (let i = 0; i < n; i++) diffs.push(paired.a[i] - paired.b[i]);

      const meanDiff = jStat.mean(diffs);
      const sdDiff = jStat.stdev(diffs, true);
      const se = sdDiff / Math.sqrt(n);
      const t = meanDiff / se;
      const df = n - 1;
      const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      // Wilcoxon Signed-Rank Test (paired differences vs 0)
      const wilcox = calcWilcoxonSignedRank(diffs, 0);

      const q1 = jStat.quartiles(paired.a);
      const q2 = jStat.quartiles(paired.b);
      const boxDataPaired = [
        {
          x: grid.cols[var1].name,
          min: jStat.min(paired.a),
          q1: q1[0],
          median: q1[1],
          q3: q1[2],
          max: jStat.max(paired.a)
        },
        {
          x: grid.cols[var2].name,
          min: jStat.min(paired.b),
          q1: q2[0],
          median: q2[1],
          q3: q2[2],
          max: jStat.max(paired.b)
        }
      ];

      const qDiffs = jStat.quartiles(diffs);
      const boxDataDiffs = [
        {
          x: 'Differences',
          min: jStat.min(diffs),
          q1: qDiffs[0],
          median: qDiffs[1],
          q3: qDiffs[2],
          max: jStat.max(diffs)
        }
      ];

      tables = ttestTables({
        type: 'dep',
        rows: grid.rows,
        i1: var1,
        i2: var2,
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        equalVar,
        level: ciLevel,
        useNonParam,
      });

      reportSpec = ttestReport({
        tables,
        type: 'dep',
        name1: grid.cols[var1].name,
        name2: grid.cols[var2].name,
        mu,
        level: ciLevel,
        equalVar,
        useNonParam,
      });

      const box = boxRows([
        { category: grid.cols[var1].name, values: paired.a },
        { category: grid.cols[var2].name, values: paired.b },
      ]);
      charts = [
        makeChart({
          id: 'ttest-dep-box',
          kind: 'box',
          title: copy('T-test per campioni appaiati'),
          subtitle: `${grid.cols[var1].name} − ${grid.cols[var2].name}`,
          note: copy('Confronta le due misurazioni appaiate; ogni coppia resta sullo stesso soggetto.'),
          data: { summary: box.summary, points: box.points, outliers: box.outliers },
          fields: { xLabel: copy('Misurazione'), yLabel: copy('Valore') },
          options: { showPoints: true } as never,
        }),
      ];
      if (useNonParam && !isNaN(wilcox.wStat)) {
        const diffBox = boxRows([{ category: copy('Differenze'), values: diffs }]);
        charts.push(
          makeChart({
            id: 'ttest-dep-diff',
            kind: 'box',
            title: copy('Wilcoxon: distribuzione delle differenze'),
            subtitle: copy('H₀: mediana = 0'),
            note: copy('La linea tratteggiata è lo zero; il test non parametrico confronta le differenze con zero.'),
            data: { summary: diffBox.summary, points: diffBox.points, outliers: diffBox.outliers, rules: [{ y: 0 }] },
            fields: { xLabel: copy('Differenze'), yLabel: copy('Differenza') },
            options: { showPoints: true } as never,
          })
        );
      }
      title = copy('T-test per campioni appaiati e Wilcoxon');
    }
    return { ok: true, title, tables, report: reportSpec, charts };
  };
