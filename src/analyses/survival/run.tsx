import { survivalReport, survivalTables } from '../../stats/survival';
import { parseNum } from '../../stats/core';
import { analysisRows, type Dataset } from '../../grid/types';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { SurvivalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import type { ChartRow } from '../../stats/charts';

export interface SurvivalInput {
  grid: Dataset;
  params: SurvivalParams;
  ciLevel: number;
}

/** Kaplan–Meier: tabelle, curve per gruppo e report. */
export const buildSurvivalOutput = ({ grid, params, ciLevel }: SurvivalInput): AnalysisRunResult => {
  const { timeVariable, eventVariable, groupVariable } = params;

  if (timeVariable === eventVariable) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }

  const eventLevels = Array.from(
    new Set(
      grid.rows
        .map(row => String(row[eventVariable] ?? '').trim())
        .filter(value => value !== '')
    )
  ).sort();
  if (eventLevels.length !== 2) {
    return {
      ok: false,
      reason: 'The event column needs exactly two values (for example 0/1 or no/yes)',
    };
  }

  const rows: { time: number; event: number; group: string }[] = [];
  const rowsForAnalysis = groupVariable >= 0 ? analysisRows(grid, [groupVariable]) : grid.rows;
  rowsForAnalysis.forEach(row => {
    const time = parseNum(row[timeVariable]);
    const label = String(row[eventVariable] ?? '').trim();
    if (!Number.isFinite(time) || time < 0 || label === '') return;
    rows.push({
      time,
      event: label === eventLevels[1] ? 1 : 0,
      group: groupVariable >= 0 ? String(row[groupVariable] ?? '').trim() || 'All' : 'All',
    });
  });

  if (rows.length < 3) {
    return { ok: false, reason: 'Not enough complete rows: time must be numeric and non-negative' };
  }

  const tables = survivalTables({
    time: rows.map(row => row.time),
    event: rows.map(row => row.event),
    groups: rows.map(row => row.group),
    level: ciLevel,
  });

  if (tables.length === 0) {
    return { ok: false, reason: 'The survival analysis needs at least three observations' };
  }

  const kmRows = tables.find(spec => spec.id === 'surv-km')?.rows ?? [];
  const groups = Array.from(new Set(kmRows.map(row => String(row.group))));
  const curves: ChartRow[] = [];
  const censored: ChartRow[] = [];
  groups.forEach(group => {
    curves.push({ x: 0, y: 1, series: group, lo: 1, hi: 1 });
    kmRows
      .filter(row => String(row.group) === group)
      .forEach(row => {
        const survival = Number(row.survival);
        const point = { x: Number(row.time), y: survival, series: group, lo: Number(row.lo), hi: Number(row.hi) };
        curves.push(point);
        if (Number(row.censored) > 0) {
          censored.push({ x: point.x, y: point.y, series: group });
        }
      });
  });

  const maxTime = rows.reduce((max, row) => Math.max(max, row.time), 0);
  const riskTimes =
    maxTime > 0
      ? [0, 0.25, 0.5, 0.75, 1].map(fraction => Number((fraction * maxTime).toFixed(4)))
      : [0];
  const groupLabels = Array.from(new Set(rows.map(row => row.group)));
  const riskRows: ChartRow[] = [];
  groupLabels.forEach(group => {
    const subset = rows.filter(row => row.group === group);
    riskTimes.forEach(time => {
      riskRows.push({
        time,
        group,
        atRisk: subset.filter(row => row.time >= time).length,
        events: subset.filter(row => row.event === 1 && row.time <= time).length,
      });
    });
  });

  const timeName = grid.cols[timeVariable]?.name ?? 'T';
  const eventName = grid.cols[eventVariable]?.name ?? 'E';
  const header = `Time: ${timeName} · event: ${eventName} = "${eventLevels[1]}" · ${rows.length} observations`;

  return {
    ok: true,
    title: copy('Sopravvivenza: {s1} per {s2}', { s1: timeName, s2: eventName }),
    header,
    tables,
    report: survivalReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'survival-km',
        kind: 'survival',
        title: copy('Curve di Kaplan–Meier'),
        subtitle: copy('IC {s1}%', { s1: ciLevel }),
        note: copy('Ogni gradino è un evento; i tratti piatti indicano che in quell’intervallo non ci sono stati eventi.'),
        data: { curves, censored },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza'), series: copy('Gruppo') },
      }),
      makeChart({
        id: 'survival-risk',
        kind: 'risk',
        title: copy('Tabella dei soggetti a rischio'),
        subtitle: copy('Soggetti a rischio per gruppo ai tempi selezionati'),
        note: copy('Numero a rischio; tra parentesi gli eventi cumulati.'),
        data: { rows: riskRows },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Gruppo') },
        options: { showEvents: true } as never,
      }),
    ],
  };
};
