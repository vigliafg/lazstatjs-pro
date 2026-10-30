import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import {
  repeatedAnovaReport,
  repeatedAnovaTables,
  repeatedMeasuresAnova,
} from '../../stats/repeatedAnova';
import { parseNum } from '../../stats/core';
import { jStat } from '../../stats/jstat';
import type { Dataset } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { completeNumericRows } from '../shared/data';

export interface RepeatedAnovaInput {
  grid: Dataset;
  params: RepeatedAnovaParams;
  ciLevel: number;
}

/** ANOVA per misure ripetute: tabelle, medie per condizione e report. */
export const buildRepeatedAnovaOutput = ({
  grid,
  params,
  ciLevel,
}: RepeatedAnovaInput): AnalysisRunResult => {
  const columns = params.selected.filter(index => isNumericColumn(grid, index));
  if (columns.length < 3) {
    return {
      ok: false,
      reason: 'Select at least three numeric columns measured on the same rows',
    };
  }

  const blocks = completeNumericRows(grid, columns);
  if (blocks.length < 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every condition must be numeric and present',
    };
  }

  const result = repeatedMeasuresAnova(blocks);
  if (!result) {
    return {
      ok: false,
      reason: 'The model could not be estimated: check the selected columns and complete rows',
    };
  }

  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  const tables = repeatedAnovaTables(result, names, ciLevel);
  const critical = result.dfError > 0
    ? jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, result.dfError)
    : 1.96;
  const bars = names.map((name, index) => {
    const mean = result.means[index];
    const se = result.sds[index] / Math.sqrt(result.n);
    return { category: name, value: mean, lo: mean - critical * se, hi: mean + critical * se };
  });
  const trajectories = blocks.slice(0, 30).flatMap((row, subject) =>
    names.map((name, index) => ({
      x: name,
      y: row[index],
      series: copy('Soggetto {s1}', { s1: subject + 1 }),
    }))
  );
  const changeCritical = result.n > 1
    ? jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, result.n - 1)
    : 1.96;
  const changes = names.slice(1).flatMap((name, offset) => {
    const index = offset + 1;
    const differences = blocks.map(row => row[index] - row[0]);
    if (differences.length < 2) return [];
    const mean = differences.reduce((sum, value) => sum + value, 0) / differences.length;
    const variance =
      differences.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      (differences.length - 1);
    const se = Math.sqrt(variance / differences.length);
    return [{
      category: name,
      estimate: mean,
      lo: mean - changeCritical * se,
      hi: mean + changeCritical * se,
    }];
  });
  const charts = [
    makeChart({
      id: 'repeated-means',
      kind: 'bar',
      title: copy('Medie per condizione'),
      subtitle: copy('{s1} soggetti · {s2} condizioni', { s1: result.n, s2: result.k }),
      data: { bars },
      fields: { xLabel: copy('Condizione'), yLabel: copy('Media') },
      options: { valueLabels: true, error: 'ci' } as never,
    }),
    makeChart({
      id: 'repeated-trajectories',
      kind: 'line',
      title: copy('Traiettorie dei soggetti'),
      subtitle: copy('{s1} soggetti · {s2} condizioni', { s1: Math.min(30, result.n), s2: result.k }),
      note: copy('Ogni linea è un soggetto attraverso le condizioni; linee non parallele indicano risposte diverse al trattamento.'),
      data: { series: trajectories },
      fields: { xType: 'nominal', xLabel: copy('Condizione'), yLabel: copy('Valore'), series: copy('Soggetto') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];
  if (changes.length > 0) {
    charts.push(
      makeChart({
        id: 'repeated-change',
        kind: 'interval',
        title: copy('Cambiamento rispetto alla prima condizione'),
        subtitle: copy('Differenze appaiate · IC {s1}%', { s1: ciLevel }),
        note: copy('Il punto è la differenza media rispetto alla prima condizione; se l’intervallo non contiene lo zero il cambiamento è compatibile con un effetto non nullo.'),
        data: { intervals: changes, rules: [{ value: 0 }] },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Differenza media') },
        options: { valueLabels: true } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('ANOVA per misure ripetute'),
    tables,
    report: repeatedAnovaReport(tables, names, ciLevel),
    charts,
  };
};
