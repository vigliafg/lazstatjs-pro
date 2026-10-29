import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { ancovaReport, ancovaTables } from '../../stats/ancova';
import { parseNum } from '../../stats/core';
import {
  analysisRows,
  levelLabel,
  orderedColumnLevels,
  referenceFirst,
  type Dataset,
} from '../../grid/types';
import type { AncovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AncovaInput {
  grid: Dataset;
  params: AncovaParams;
  ciLevel: number;
}

/** ANCOVA: tabelle, medie grezze/aggiustate e report. */
export const buildAncovaOutput = ({ grid, params, ciLevel }: AncovaInput): AnalysisRunResult => {
  const { response, factor, covariates } = params;

  if (response === factor) {
    return { ok: false, reason: 'The response must be different from the factor' };
  }
  const chosen = covariates.filter(index => index !== response && index !== factor);
  if (chosen.length === 0) {
    return { ok: false, reason: 'Select at least one numeric covariate' };
  }

  const y: number[] = [];
  const levels: string[] = [];
  const covariateValues: number[][] = chosen.map(() => []);
  analysisRows(grid, [factor]).forEach(row => {
    const value = parseNum(row[response]);
    const level = String(row[factor] ?? '').trim();
    if (!Number.isFinite(value) || level === '') return;
    const covs = chosen.map(index => parseNum(row[index]));
    if (covs.some(cell => !Number.isFinite(cell))) return;
    y.push(value);
    levels.push(level);
    covs.forEach((cell, index) => covariateValues[index].push(cell));
  });

  if (y.length < 4) {
    return {
      ok: false,
      reason: 'Not enough complete rows for the selected response, factor and covariates',
    };
  }
  const groups = new Set(levels);
  if (groups.size < 2) {
    return { ok: false, reason: 'The factor needs at least two groups with complete data' };
  }

  const responseName = grid.cols[response]?.name ?? 'Y';
  const factorName = grid.cols[factor]?.name ?? 'Fattore';
  const covariateNames = chosen.map(index => grid.cols[index]?.name ?? `Cov${index + 1}`);
  const factorCol = grid.cols[factor];
  const declaredLevels = orderedColumnLevels(factorCol, grid.rows, factor).map(level =>
    levelLabel(factorCol, level.value)
  );
  const referenceLabel = factorCol?.reference ? levelLabel(factorCol, factorCol.reference) : undefined;
  const options = {
    response: y,
    factor: levels,
    covariates: covariateValues,
    responseName,
    factorName,
    covariateNames,
    levels: referenceFirst(declaredLevels, referenceLabel),
    level: ciLevel,
  };

  const tables = ancovaTables(options);
  if (tables.length === 0) {
    return {
      ok: false,
      reason:
        'The model is not estimable: check collinearity, group sizes and that there are more rows than parameters',
    };
  }

  const means = tables.find(table => table.id === 'ancova-means')?.rows ?? [];
  const chartData = means.map((row, index) => ({
    x: index,
    group: String(row.group ?? ''),
    raw: Number(row.rawMean ?? NaN),
    adjusted: Number(row.adjusted ?? NaN),
    ciLo: Number(row.ciLo ?? NaN),
    ciHi: Number(row.ciHi ?? NaN),
  }));
  const bars = chartData.flatMap(point => [
    ...(Number.isFinite(point.raw)
      ? [{ category: point.group, value: point.raw, series: copy('Grezza'), lo: null, hi: null }]
      : []),
    ...(Number.isFinite(point.adjusted)
      ? [{
          category: point.group,
          value: point.adjusted,
          series: copy('Aggiustata'),
          lo: Number.isFinite(point.ciLo) ? point.ciLo : null,
          hi: Number.isFinite(point.ciHi) ? point.ciHi : null,
        }]
      : []),
  ]);

  return {
    ok: true,
    title: copy('ANCOVA: {s1} per {s2}', { s1: responseName, s2: factorName }),
    header: `ANCOVA · ${responseName} ~ ${factorName} + ${covariateNames.join(' + ')} · ${levels.length} righe`,
    tables,
    report: ancovaReport(tables, factorName, covariateNames, ciLevel),
    charts: [
      makeChart({
        id: 'ancova-means',
        kind: 'bar',
        title: copy('Medie grezze e aggiustate'),
        subtitle: `${factorName} × ${responseName}`,
        note: copy('Le barre aggiustate sono le medie alla media delle covariate: è questa la differenza che l’ANCOVA testa.'),
        data: { bars },
        fields: { xLabel: factorName, yLabel: responseName, series: copy('Stima') },
        options: { valueLabels: true, error: 'ci' } as never,
      }),
    ],
  };
};
