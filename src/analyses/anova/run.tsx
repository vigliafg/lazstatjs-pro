import { jStat } from '../../stats/jstat';
import { parseNum } from '../../stats/core';
import { anovaTables } from '../../stats/anova';
import { anovaReport } from '../../stats/report';
import { calcKruskalWallis, calcMannWhitneyU } from '../../stats/kernels';
import { analysisRows, levelLabel, naturalCompare, orderedColumnLevels } from '../../grid/types';
import type { Dataset } from '../../grid/types';
import type { AnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows, qqBand, qqPoints, qqReference } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import { onewayPanel } from '../../charts/panels';
import { moodMedianTest } from '../../stats/kernels/mood';
import { moodTables } from '../../stats/tables/mood';
import { moodReport } from '../../stats/reports/mood';
import { buildNestedAnovaOutput } from './nested';
import { buildAnomOutput } from './anom';

export interface AnovaRunInput {
  grid: Dataset;
  anovaParams: AnovaParams;
  ciLevel: number;
}

/** ANOVA a una via (e Kruskal-Wallis): tabelle, grafici e report. Estratto da App.tsx. */
  export const buildAnovaOutput = (input: AnovaRunInput): AnalysisRunResult => {
  const { grid, anovaParams, ciLevel } = input;
    if (anovaParams.mode === 'median') return buildMoodOutput(input);
    if (anovaParams.mode === 'nested') return buildNestedAnovaOutput(input);
    if (anovaParams.mode === 'anom') return buildAnomOutput(input);
    const { dep, grp, posthoc, useNonParam, kwPosthoc } = anovaParams;

    // Group labels are what tables and charts show; the codes stay in the grid.
    const rowsForAnalysis = analysisRows(grid, [grp]);

    // Group data
    const groups: { [key: string]: number[] } = {};
    const groupRowKeys: { [key: string]: string[] } = {};
    rowsForAnalysis.forEach((row, rowIndex) => {
      const d = parseNum(row[dep]);
      const g = row[grp];
      if (!isNaN(d) && g !== '') {
        if (!groups[g]) groups[g] = [];
        if (!groupRowKeys[g]) groupRowKeys[g] = [];
        groups[g].push(d);
        groupRowKeys[g].push(String(rowIndex));
      }
    });

    const declaredOrder = orderedColumnLevels(grid.cols[grp], grid.rows, grp).map((level) =>
      levelLabel(grid.cols[grp], level.value)
    );
    const groupKeys = Object.keys(groups).sort((left, right) => {
      const li = declaredOrder.indexOf(left);
      const ri = declaredOrder.indexOf(right);
      if (li >= 0 && ri >= 0) return li - ri;
      if (li >= 0) return -1;
      if (ri >= 0) return 1;
      return naturalCompare(left, right);
    });
    if (groupKeys.length < 2) {
      return { ok: false, reason: 'Need at least 2 groups for ANOVA' };
    }

    const allData = Object.values(groups).flat();
    const grandMean = jStat.mean(allData);
    const nTotal = allData.length;
    const k = groupKeys.length;

    let ssBetween = 0;
    let ssWithin = 0;

    groupKeys.forEach(key => {
      const gData = groups[key];
      const gMean = jStat.mean(gData);
      const gN = gData.length;
      ssBetween += gN * Math.pow(gMean - grandMean, 2);
      gData.forEach(v => {
        ssWithin += Math.pow(v - gMean, 2);
      });
    });

    const dfBetween = k - 1;
    const dfWithin = nTotal - k;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const f = msBetween / msWithin;
    const p = 1 - jStat.centralF.cdf(f, dfBetween, dfWithin);

    // Post-Hoc Analysis
    let postHocResults: any[] = [];
    if (posthoc !== 'none') {
      const numComps = (k * (k - 1)) / 2;
      for (let i = 0; i < groupKeys.length; i++) {
        for (let j = i + 1; j < groupKeys.length; j++) {
          const g1 = groupKeys[i];
          const g2 = groupKeys[j];
          const n1 = groups[g1].length;
          const n2 = groups[g2].length;
          const m1 = jStat.mean(groups[g1]);
          const m2 = jStat.mean(groups[g2]);
          const diff = m1 - m2;
          
          let pVal = 1;
          let testName = "";

          if (posthoc === 'tukey') {
            testName = "Tukey HSD (approx)";
            if (msWithin > 0) {
              const t = diff / (Math.sqrt(msWithin * (1/n1 + 1/n2)));
              pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfWithin));
              pVal = Math.min(1, pVal * (k - 1));
            } else {
              pVal = diff === 0 ? 1 : 0;
            }
          } else if (posthoc === 'bonferroni') {
            testName = "Bonferroni";
            if (msWithin > 0) {
              const t = diff / (Math.sqrt(msWithin * (1/n1 + 1/n2)));
              pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(t), dfWithin));
              pVal = Math.min(1, pVal * numComps);
            } else {
              pVal = diff === 0 ? 1 : 0;
            }
          }

          postHocResults.push({
            comp: `${g1} vs ${g2}`,
            diff,
            p: pVal,
            testName,
            lo: msWithin > 0 && dfWithin > 0
              ? diff - jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, dfWithin) * Math.sqrt(msWithin * (1 / n1 + 1 / n2))
              : NaN,
            hi: msWithin > 0 && dfWithin > 0
              ? diff + jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, dfWithin) * Math.sqrt(msWithin * (1 / n1 + 1 / n2))
              : NaN,
          });
        }
      }
    }

    // Kruskal-Wallis Non-Parametric ANOVA Alternative
    const kw = calcKruskalWallis(groups);
    let kwPostHocResults: any[] = [];
    if (useNonParam && kwPosthoc === 'bonferroni' && k > 2) {
      const numComps = (k * (k - 1)) / 2;
      for (let i = 0; i < groupKeys.length; i++) {
        for (let j = i + 1; j < groupKeys.length; j++) {
          const g1 = groupKeys[i];
          const g2 = groupKeys[j];
          const vals1 = groups[g1];
          const vals2 = groups[g2];
          const mwu = calcMannWhitneyU(vals1, vals2);
          const adjP = Math.min(1.0, mwu.pValue * numComps);
          kwPostHocResults.push({
            comp: `${g1} vs ${g2}`,
            uStat: mwu.uStat,
            zStat: mwu.zStat,
            p: adjP
          });
        }
      }
    }

    const anovaBoxPlotData = groupKeys.map(key => {
      const vals = groups[key];
      const quartiles = jStat.quartiles(vals);
      return {
        x: key,
        min: jStat.min(vals),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(vals)
      };
    });

    const kwCombined: { val: number; gKey: string; rank: number; key: string }[] = [];
    groupKeys.forEach(key => {
      groups[key].forEach((v, index) => {
        kwCombined.push({ val: v, gKey: key, rank: 0, key: groupRowKeys[key][index] });
      });
    });
    const kwN = kwCombined.length;
    kwCombined.sort((a, b) => a.val - b.val);
    let kwIdx = 0;
    while (kwIdx < kwN) {
      let j = kwIdx;
      while (j < kwN - 1 && kwCombined[j + 1].val === kwCombined[kwIdx].val) {
        j++;
      }
      const sumRanks = ((j + 1) * (j + 2)) / 2 - (kwIdx * (kwIdx + 1)) / 2;
      const avgRank = sumRanks / (j - kwIdx + 1);
      for (let k_comb = kwIdx; k_comb <= j; k_comb++) {
        kwCombined[k_comb].rank = avgRank;
      }
      kwIdx = j + 1;
    }

    const kwBoxPlotData = groupKeys.map(key => {
      const ranksOfGroup = kwCombined.filter(item => item.gKey === key).map(item => item.rank);
      if (ranksOfGroup.length === 0) {
        return { x: key, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
      }
      const quartiles = jStat.quartiles(ranksOfGroup);
      return {
        x: key,
        min: jStat.min(ranksOfGroup),
        q1: quartiles[0],
        median: quartiles[1],
        q3: quartiles[2],
        max: jStat.max(ranksOfGroup)
      };
    });

    const kwMeanRanksData = groupKeys.map(key => ({
      x: key,
      y: kw.groupMeanRanks[key] || 0
    }));

    const tables = anovaTables({
      rows: rowsForAnalysis,
      depIdx: dep,
      grpIdx: grp,
      depName: grid.cols[dep].name,
      grpName: grid.cols[grp].name,
      posthoc: posthoc as any,
      kwPosthoc,
      level: ciLevel,
      useNonParam,
    });
    const report = anovaReport({
      tables,
      depName: grid.cols[dep].name,
      grpName: grid.cols[grp].name,
      level: ciLevel,
      postHoc: posthoc,
      useNonParam,
    });

    const box = boxRows(
      groupKeys.map(key => ({ category: key, values: groups[key], keys: groupRowKeys[key] })),
      { level: ciLevel }
    );
    const critical = dfWithin > 0 ? jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, dfWithin) : 1.96;
    const bars = groupKeys.map(key => {
      const values = groups[key];
      const mean = jStat.mean(values);
      const sd = jStat.stdev(values, true);
      const se = sd / Math.sqrt(values.length);
      const interval = Math.sqrt(msWithin / values.length);
      return {
        category: key,
        value: mean,
        sd,
        se,
        lo: mean - critical * interval,
        hi: mean + critical * interval,
      };
    });
    const meanIntervals = bars.map(row => ({
      category: row.category,
      estimate: row.value,
      lo: row.lo,
      hi: row.hi,
    }));
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'anova-box',
        kind: 'box',
        title: copy('ANOVA a una via: {s1} per {s2}', { s1: grid.cols[dep].name, s2: grid.cols[grp].name }),
        subtitle: copy('Confronto delle distribuzioni per gruppo'),
        note: copy('La linea centrale è la mediana; i baffi arrivano ai valori non outlier.'),
        data: { summary: box.summary, points: box.points, outliers: box.outliers },
        fields: { xLabel: grid.cols[grp].name, yLabel: grid.cols[dep].name },
        options: { showPoints: true } as never,
      }),
      makeChart({
        id: 'anova-means',
        kind: 'bar',
        title: copy('Medie per gruppo con IC {s1}%', { s1: ciLevel }),
        subtitle: `${grid.cols[dep].name} per ${grid.cols[grp].name}`,
        note: copy('Le barre d’errore sono l’intervallo di confidenza della media entro il modello.'),
        data: { bars },
        fields: { xLabel: grid.cols[grp].name, yLabel: grid.cols[dep].name },
        options: { error: 'ci', valueLabels: true } as never,
      }),
      makeChart({
        id: 'anova-diamond',
        kind: 'diamond',
        title: copy('Diamanti delle medie per gruppo'),
        subtitle: copy('IC {s1}% entro il modello', { s1: ciLevel }),
        note: copy('Il diamante è centrato sulla media di gruppo; l’ampiezza segue l’intervallo di confidenza del modello.'),
        data: { intervals: meanIntervals },
        fields: { xLabel: grid.cols[grp].name, yLabel: grid.cols[dep].name },
        options: { scaleToCI: true, showLabels: true } as never,
      }),
    ];
    if (k >= 2) {
      charts.push(
        makeChart({
          id: 'anova-circles',
          kind: 'circles',
          title: copy('Cerchi di confronto tra gruppi'),
          subtitle: copy('IC {s1}% · cerchi più grandi = maggiore incertezza', { s1: ciLevel }),
          note: copy('La sovrapposizione dei cerchi è un indizio visivo: il test post-hoc formale resta la tabella dei confronti.'),
          data: { intervals: meanIntervals },
          fields: { xLabel: grid.cols[dep].name, yLabel: grid.cols[grp].name },
          options: { showLabels: true, showIntervals: true } as never,
        })
      );
    }
    const postHocPoints = postHocResults
      .filter(row => Number.isFinite(row.lo) && Number.isFinite(row.hi))
      .map(row => ({ label: row.comp, estimate: row.diff, lo: row.lo, hi: row.hi }));
    if (postHocPoints.length > 0) {
      charts.push(
        makeChart({
          id: 'anova-posthoc-forest',
          kind: 'forest',
          title: copy('Differenze tra gruppi (post-hoc)'),
          subtitle: copy('IC {s1}% · riferimento 0', { s1: ciLevel }),
          note: copy('Punto: differenza media tra i due gruppi. Segmento: intervallo di confidenza; se contiene lo zero la coppia non è distinguibile.'),
          data: { points: postHocPoints },
          fields: { xLabel: copy('Differenza media'), yLabel: copy('Confronto') },
          options: { reference: 'zero', sort: 'none' } as never,
        })
      );
    }
    const meanByGroup = new Map(groupKeys.map(key => [key, jStat.mean(groups[key])]));
    const residualPoints = groupKeys.flatMap(key =>
      groups[key].map(value => ({ x: meanByGroup.get(key) ?? 0, y: value - (meanByGroup.get(key) ?? 0) }))
    );
    if (residualPoints.length > 0) {
      charts.push(
        makeChart({
          id: 'anova-residual-fitted',
          kind: 'scatter',
          title: copy('Residui vs medie di gruppo'),
          subtitle: copy('N = {s1}', { s1: residualPoints.length }),
          note: copy('Residui senza struttura indicano che la media di gruppo descrive i dati; imbuti o curvature suggeriscono varianze diverse.'),
          data: { points: residualPoints, rules: [{ y: 0 }] },
          fields: { xLabel: copy('Media di gruppo'), yLabel: copy('Residuo') },
          options: { fit: 'none', band: 'none' } as never,
        })
      );
    }
    const residualQq = qqPoints(residualPoints.map(point => point.y));
    if (residualQq.length > 0) {
      const residualLine = qqReference(residualQq);
      charts.push(
        makeChart({
          id: 'anova-residual-qq',
          kind: 'qq',
          title: copy('Q-Q dei residui'),
          subtitle: copy('N = {s1}', { s1: residualQq.length }),
          note: copy('I punti vicini alla diagonale indicano residui compatibili con la normalità.'),
          data: { points: residualQq, reference: residualLine, band: qqBand(residualQq, residualLine, ciLevel) },
          fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Residui osservati') },
          options: { showCI: true } as never,
        })
      );
    }
    if (useNonParam && !isNaN(kw.hStat)) {
      const rankBox = boxRows(groupKeys.map(key => ({
        category: key,
        values: kwCombined.filter(item => item.gKey === key).map(item => item.rank),
        keys: kwCombined.filter(item => item.gKey === key).map(item => item.key),
      })));
      charts.push(
        makeChart({
          id: 'anova-rank-box',
          kind: 'box',
          title: copy('Kruskal-Wallis: ranghi per gruppo'),
          subtitle: copy('Alternativa non parametrica all’ANOVA'),
          note: copy('Il test confronta i ranghi medi dei gruppi.'),
          data: { summary: rankBox.summary, points: rankBox.points, outliers: rankBox.outliers },
          fields: { xLabel: grid.cols[grp].name, yLabel: copy('Rango') },
          options: { showPoints: true } as never,
        })
      );
    }
    // L3 Oneway report: diamonds/circles are the JMP signature, the box keeps
    // the raw distributions and the forest shows the formal post-hoc test.
    const oneway = onewayPanel({
      title: copy('Pannello Oneway: {s1} per {s2}', {
        s1: grid.cols[dep].name,
        s2: grid.cols[grp].name,
      }),
      subtitle: copy('IC {s1}% entro il modello', { s1: ciLevel }),
      charts,
      tables,
    });

    return {
      ok: true,
      title: copy('ANOVA a una via e Kruskal-Wallis: {s1} per {s2}', {
        s1: grid.cols[dep].name,
        s2: grid.cols[grp].name,
      }),
      tables,
      report,
      charts,
      ...(oneway ? { panels: [oneway] } : {}),
    };
  };

/** Mood median test mode. */
const buildMoodOutput = ({ grid, anovaParams, ciLevel }: AnovaRunInput): AnalysisRunResult => {
  const { dep, grp } = anovaParams;
  if (dep < 0 || grp < 0 || dep >= grid.cols.length || grp >= grid.cols.length) {
    return { ok: false, reason: 'Select a numeric dependent variable and a group variable' };
  }
  const rowsForAnalysis = analysisRows(grid, [grp]);
  const groups: { name: string; values: number[] }[] = [];
  const byName = new Map<string, number[]>();
  rowsForAnalysis.forEach(row => {
    const value = parseNum(row[dep]);
    const label = String(row[grp] ?? '').trim();
    if (!Number.isFinite(value) || label === '') return;
    const bucket = byName.get(label) ?? [];
    bucket.push(value);
    byName.set(label, bucket);
  });
  const declaredOrder = orderedColumnLevels(grid.cols[grp], grid.rows, grp).map(level =>
    levelLabel(grid.cols[grp], level.value)
  );
  const names = [...byName.keys()].sort((left, right) => {
    const li = declaredOrder.indexOf(left);
    const ri = declaredOrder.indexOf(right);
    if (li >= 0 && ri >= 0) return li - ri;
    if (li >= 0) return -1;
    if (ri >= 0) return 1;
    return naturalCompare(left, right);
  });
  names.forEach(name => groups.push({ name, values: byName.get(name)! }));

  const result = moodMedianTest(groups);
  if (!result) {
    return {
      ok: false,
      reason: 'The Mood median test needs at least two groups with observations on both sides of the median',
    };
  }
  const depName = grid.cols[dep].name;
  const groupName = grid.cols[grp].name;
  const boxes = boxRows(
    groups.map(group => ({ category: group.name, values: group.values })),
    { level: ciLevel }
  );

  return {
    ok: true,
    title: copy('Test della mediana — {s1} per {s2}', { s1: depName, s2: groupName }),
    tables: moodTables(result, depName, groupName),
    report: moodReport(result, depName, groupName, ciLevel),
    charts: [
      makeChart({
        id: 'mood-box',
        kind: 'box',
        title: copy('Distribuzione per gruppo'),
        subtitle: copy('Mediana comune {s1}', { s1: result.median.toFixed(3) }),
        note: copy('La linea centrale di ogni scatola è la mediana del gruppo; il test confronta quante osservazioni cadono sopra e sotto la mediana comune.'),
        data: { summary: boxes.summary, points: boxes.points, outliers: boxes.outliers },
        fields: { xLabel: groupName, yLabel: depName },
        options: { showPoints: true, showMean: false } as never,
      }),
    ],
  };
};
