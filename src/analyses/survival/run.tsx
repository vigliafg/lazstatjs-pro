import {
  lifeTable,
  lifeTableReport,
  lifeTableTables,
  survivalReport,
  survivalTables,
  turnbull,
  turnbullReport,
  turnbullTables,
} from '../../stats/survival';
import { parseNum } from '../../stats/core';
import { analysisRows, type Dataset } from '../../grid/types';
import { copy } from '../../stats/reportCopy';
import { fmtP } from '../../stats/format';
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

  const mode = params.mode ?? 'km';

  if (mode === 'interval') {
    const upperVariable = params.upperVariable ?? -1;
    if (upperVariable < 0) {
      return { ok: false, reason: 'Interval censoring needs an upper-bound column' };
    }
    if (upperVariable === timeVariable || upperVariable === eventVariable) {
      return { ok: false, reason: 'The upper bound must be different from the lower bound and the event column' };
    }
    const eventValues = Array.from(
      new Set(grid.rows.map(row => String(row[eventVariable] ?? '').trim()).filter(value => value !== ''))
    ).sort();
    const intervals = grid.rows
      .map(row => {
        const lower = parseNum(row[timeVariable]);
        const upper = parseNum(row[upperVariable]);
        const eventLabel = String(row[eventVariable] ?? '').trim();
        const exact =
          eventValues.length === 2
            ? eventLabel === eventValues[1]
            : Number.isFinite(parseNum(eventLabel)) && parseNum(eventLabel) > 0;
        if (exact) {
          if (!Number.isFinite(lower)) return null;
          return { lower, upper: lower };
        }
        const safeLower = Number.isFinite(lower) && lower >= 0 ? lower : 0;
        return {
          lower: safeLower,
          upper: Number.isFinite(upper) && upper >= safeLower ? upper : Infinity,
        };
      })
      .filter((item): item is { lower: number; upper: number } => item !== null);
    if (intervals.length < 3) {
      return {
        ok: false,
        reason: 'Interval censoring needs at least three rows with a lower bound and/or an upper bound',
      };
    }
    const result = turnbull(intervals);
    const tables = turnbullTables(result, ciLevel);
    const support = result.points;
    return {
      ok: true,
      title: copy('Censura a intervalli (Turnbull)'),
      header: copy('{s1} osservazioni · {s2} punti di supporto', {
        s1: result.n,
        s2: support.length,
      }),
      tables,
      report: turnbullReport(result, ciLevel),
      charts: [
        makeChart({
          id: 'survival-turnbull',
          kind: 'survival',
          title: copy('Sopravvivenza NPMLE'),
          subtitle: copy('Stima di Turnbull per dati a intervallo'),
          note: copy('La curva è costante tra i punti di supporto e scende dove la massa è concentrata.'),
          data: {
            curves: [
              { x: 0, y: 1, series: 'NPMLE' },
              ...support.map(point => ({ x: point.time, y: point.survival, series: 'NPMLE' })),
            ],
            censored: [],
            annotations: [],
          },
          fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza') },
        }),
        makeChart({
          id: 'survival-turnbull-mass',
          kind: 'bar',
          title: copy('Massa per intervallo'),
          subtitle: copy('Probabilità attribuita a ciascun intervallo di supporto'),
          note: copy('Barre più alte indicano dove la stima concentra la probabilità dell’evento.'),
          data: {
            bars: support.map(point => ({ category: String(point.time), value: point.mass })),
          },
          fields: { xLabel: copy('Fine intervallo'), yLabel: copy('Massa') },
        }),
      ],
    };
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

  if (mode === 'life') {
    const groupNames = Array.from(new Set(rows.map(row => row.group))).sort();
    const groups = groupNames.map(name => {
      const subset = rows.filter(row => row.group === name);
      return {
        name,
        time: subset.map(row => row.time),
        event: subset.map(row => row.event),
      };
    });
    const intervals = params.intervals ?? 0;
    const specs = lifeTableTables(groups, ciLevel, intervals);
    if (specs.length === 0) {
      return { ok: false, reason: 'The life table needs at least three observations' };
    }
    const withRows = groups.map(group => ({
      name: group.name,
      rows: lifeTable(group.time, group.event, intervals > 0 ? intervals : undefined),
    }));
    const curves: ChartRow[] = withRows.flatMap(group =>
      group.rows.flatMap((row, index) => [
        ...(index === 0 ? [{ x: row.start, y: 1, series: group.name }] : []),
        { x: row.end, y: row.survival, series: group.name },
      ])
    );
    return {
      ok: true,
      title: copy('Life table: {s1}', { s1: grid.cols[timeVariable]?.name ?? 'T' }),
      header: copy('{s1} osservazioni · {s2} gruppi · {s3} intervalli', {
        s1: rows.length,
        s2: groups.length,
        s3: withRows[0]?.rows.length ?? 0,
      }),
      tables: specs,
      report: lifeTableReport(withRows, ciLevel),
      charts: [
        makeChart({
          id: 'survival-life-curve',
          kind: 'survival',
          title: copy('Sopravvivenza per intervallo'),
          subtitle: copy('Tavola attuariale'),
          note: copy(
            'Ogni gradino corrisponde alla fine di un intervallo della tavola: la tavola raggruppa il tempo, mentre la curva di Kaplan–Meier scende a ogni evento senza raggruppare.'
          ),
          data: { curves, censored: [], annotations: [] },
          fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza'), series: copy('Gruppo') },
        }),
        makeChart({
          id: 'survival-life-events',
          kind: 'bar',
          title: copy('Eventi per intervallo'),
          subtitle: copy('Conteggio nella prima tavola'),
          note: copy(
            'Le barre mostrano in quali intervalli si concentrano gli eventi; l’altezza va letta insieme al numero di soggetti a rischio dell’intervallo.'
          ),
          data: {
            bars: (withRows[0]?.rows ?? []).map(row => ({
              category: `${row.start.toFixed(2)}–${row.end.toFixed(2)}`,
              value: row.events,
            })),
          },
          fields: { xLabel: copy('Intervallo'), yLabel: copy('Eventi') },
        }),
      ],
    };
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
  const logRankRow = tables
    .find(spec => spec.id === 'surv-logrank')
    ?.rows.find(row => typeof row.pValue === 'number');
  const logRankP = typeof logRankRow?.pValue === 'number' ? logRankRow.pValue : NaN;
  const annotations = Number.isFinite(logRankP)
    ? [{ x: 0, y: 0.98, text: `Log-rank p = ${fmtP(logRankP)}` }]
    : [];
  const rmstRows = groups.map(group => {
    const points = curves
      .filter(row => String(row.series) === group && Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)))
      .sort((a, b) => Number(a.x) - Number(b.x));
    let area = 0;
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];
      area += Number(previous.y) * (Number(current.x) - Number(previous.x));
    }
    return { category: group, value: area };
  });

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
        data: { curves, censored, annotations },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Sopravvivenza'), series: copy('Gruppo') },
      }),
      makeChart({
        id: 'survival-rmst',
        kind: 'bar',
        title: copy('Sopravvivenza media ristretta'),
        subtitle: copy('Area sotto la curva KM fino all’ultimo tempo osservato'),
        note: copy('La RMST riassume quanti unità di tempo, in media, i soggetti sopravvivono entro l’orizzonte osservato; barre più alte indicano sopravvivenza media più lunga.'),
        data: { bars: rmstRows },
        fields: { xLabel: copy('Gruppo'), yLabel: copy('RMST') },
        options: { valueLabels: true } as never,
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
