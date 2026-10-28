import { parseNum } from '../core';
import { fSF, holmAdjust, tCrit, twoSidedTP } from '../distributions';
import { sphericityFromCovariance } from './repeatedAnova';
import type { MixedAnovaContrast, MixedAnovaEffect, MixedAnovaOptions, MixedAnovaStats } from '../mixedanova/types';

/** ANOVA mista split-plot: un fattore between e uno within. */
export const mixedAnovaStats = (options: MixedAnovaOptions): MixedAnovaStats | null => {
  const { rows, groupIdx, conditionIdxs } = options;
  const complete = rows
    .map(row => ({
      group: String(row[groupIdx] ?? '').trim(),
      values: conditionIdxs.map(index => parseNum(row[index])),
    }))
    .filter(entry => entry.group !== '' && entry.values.every(value => Number.isFinite(value)));
  if (complete.length < 4) return null;

  const groups = Array.from(new Set(complete.map(entry => entry.group))).sort();
  const g = groups.length;
  const k = conditionIdxs.length;
  if (g < 2 || k < 2) return null;
  const n = complete.length;
  const groupSizes = groups.map(label => complete.filter(entry => entry.group === label).length);
  if (groupSizes.some(size => size < 2)) return null;

  const groupIndex = complete.map(entry => groups.indexOf(entry.group));
  const grand = complete.reduce(
    (sum, entry) => sum + entry.values.reduce((inner, value) => inner + value, 0),
    0
  ) / (n * k);

  const subjectMeans = complete.map(entry => entry.values.reduce((sum, value) => sum + value, 0) / k);
  const groupMeans = groups.map((_, gi) => {
    const members = complete.filter((_, index) => groupIndex[index] === gi);
    return members.reduce((sum, entry) => sum + entry.values.reduce((inner, value) => inner + value, 0), 0) / (members.length * k);
  });
  const conditionMeans = Array.from({ length: k }, (_, j) =>
    complete.reduce((sum, entry) => sum + entry.values[j], 0) / n
  );
  const cellMeans = groups.map((_, gi) => {
    const members = complete.filter((_, index) => groupIndex[index] === gi);
    return Array.from({ length: k }, (_, j) =>
      members.reduce((sum, entry) => sum + entry.values[j], 0) / members.length
    );
  });

  let ssTotal = 0;
  complete.forEach(entry => {
    entry.values.forEach(value => {
      ssTotal += Math.pow(value - grand, 2);
    });
  });
  const ssBetweenSubjects = k * subjectMeans.reduce((sum, mean) => sum + Math.pow(mean - grand, 2), 0);
  const ssWithinSubjects = ssTotal - ssBetweenSubjects;
  const ssGroup = k * groups.reduce(
    (sum, _, gi) => sum + groupSizes[gi] * Math.pow(groupMeans[gi] - grand, 2),
    0
  );
  const ssSubjectsWithin = ssBetweenSubjects - ssGroup;
  const ssTime = n * conditionMeans.reduce((sum, mean) => sum + Math.pow(mean - grand, 2), 0);
  let ssInteraction = 0;
  groups.forEach((_, gi) => {
    for (let j = 0; j < k; j++) {
      const effect = cellMeans[gi][j] - groupMeans[gi] - conditionMeans[j] + grand;
      ssInteraction += groupSizes[gi] * effect * effect;
    }
  });
  const ssErrorWithin = ssWithinSubjects - ssTime - ssInteraction;

  const dfGroup = g - 1;
  const dfSubjectsWithin = n - g;
  const dfTime = k - 1;
  const dfInteraction = (g - 1) * (k - 1);
  const dfErrorWithin = (n - g) * (k - 1);
  if (dfSubjectsWithin <= 0 || dfErrorWithin <= 0) return null;

  const msGroup = ssGroup / dfGroup;
  const msSubjectsWithin = ssSubjectsWithin / dfSubjectsWithin;
  const msTime = ssTime / dfTime;
  const msInteraction = ssInteraction / dfInteraction;
  const msErrorWithin = ssErrorWithin / dfErrorWithin;

  const effects: MixedAnovaEffect[] = [
    {
      source: 'Group (between)',
      ss: ssGroup,
      df: dfGroup,
      ms: msGroup,
      f: msGroup / msSubjectsWithin,
      p: fSF(msGroup / msSubjectsWithin, dfGroup, dfSubjectsWithin),
      eta2: ssGroup / (ssGroup + ssSubjectsWithin),
    },
    {
      source: 'Subjects within groups',
      ss: ssSubjectsWithin,
      df: dfSubjectsWithin,
      ms: msSubjectsWithin,
      f: NaN,
      p: NaN,
      eta2: NaN,
    },
    {
      source: 'Time (within)',
      ss: ssTime,
      df: dfTime,
      ms: msTime,
      f: msTime / msErrorWithin,
      p: fSF(msTime / msErrorWithin, dfTime, dfErrorWithin),
      eta2: ssTime / (ssTime + ssErrorWithin),
    },
    {
      source: 'Group × Time',
      ss: ssInteraction,
      df: dfInteraction,
      ms: msInteraction,
      f: msInteraction / msErrorWithin,
      p: fSF(msInteraction / msErrorWithin, dfInteraction, dfErrorWithin),
      eta2: ssInteraction / (ssInteraction + ssErrorWithin),
    },
    {
      source: 'Error (within)',
      ss: ssErrorWithin,
      df: dfErrorWithin,
      ms: msErrorWithin,
      f: NaN,
      p: NaN,
      eta2: NaN,
    },
  ];

  const residuals = complete.map((entry, index) =>
    entry.values.map((value, j) => value - cellMeans[groupIndex[index]][j])
  );
  const covarianceMatrix = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  residuals.forEach(row => {
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) covarianceMatrix[i][j] += row[i] * row[j];
    }
  });
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) covarianceMatrix[i][j] /= Math.max(1, n - g);
  }
  const sphericity = sphericityFromCovariance(covarianceMatrix, n - g, k);
  const pGGTime = fSF(msTime / msErrorWithin, Math.max(1, dfTime * sphericity.ggEpsilon), Math.max(1, dfErrorWithin * sphericity.ggEpsilon));
  const pGGInteraction = fSF(
    msInteraction / msErrorWithin,
    Math.max(1, dfInteraction * sphericity.ggEpsilon),
    Math.max(1, dfErrorWithin * sphericity.ggEpsilon)
  );

  const groupContrasts: MixedAnovaContrast[] = [];
  for (let i = 0; i < g; i++) {
    for (let j = i + 1; j < g; j++) {
      const diff = groupMeans[i] - groupMeans[j];
      const se = Math.sqrt(msSubjectsWithin * (1 / groupSizes[i] + 1 / groupSizes[j]));
      const t = se > 0 ? diff / se : NaN;
      groupContrasts.push({
        source: 'Group', a: groups[i], b: groups[j], diff, se, t,
        p: twoSidedTP(t, dfSubjectsWithin), adjusted: NaN, lo: NaN, hi: NaN,
      });
    }
  }
  const groupAdjusted = holmAdjust(groupContrasts.map(row => row.p));
  groupContrasts.forEach((row, index) => {
    row.adjusted = groupAdjusted[index];
    const crit = tCrit(options.level, dfSubjectsWithin);
    row.lo = row.diff - crit * row.se;
    row.hi = row.diff + crit * row.se;
  });

  const timeContrasts: MixedAnovaContrast[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const diff = conditionMeans[i] - conditionMeans[j];
      const se = Math.sqrt((2 * msErrorWithin) / n);
      const t = se > 0 ? diff / se : NaN;
      timeContrasts.push({
        source: 'Time', a: `C${i + 1}`, b: `C${j + 1}`, diff, se, t,
        p: twoSidedTP(t, dfErrorWithin), adjusted: NaN, lo: NaN, hi: NaN,
      });
    }
  }
  const timeAdjusted = holmAdjust(timeContrasts.map(row => row.p));
  timeContrasts.forEach((row, index) => {
    row.adjusted = timeAdjusted[index];
    const crit = tCrit(options.level, dfErrorWithin);
    row.lo = row.diff - crit * row.se;
    row.hi = row.diff + crit * row.se;
  });

  return {
    n,
    groups,
    conditions: conditionIdxs,
    groupSizes,
    groupMeans,
    conditionMeans,
    cellMeans,
    effects,
    sphericity,
    pGGTime,
    pGGInteraction,
    contrasts: [...groupContrasts, ...timeContrasts],
  };
};
