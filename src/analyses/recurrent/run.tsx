import { fitRecurrent, recurrentReport, recurrentTables } from '../../stats/recurrent';
import { meanCumulativeFunction } from '../../stats/kernels/recurrent';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import { parseNum } from '../../stats/core';
import { encodeCovariates } from '../shared/encode';
import type { Dataset } from '../../grid/types';
import type { RecurrentParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface RecurrentInput {
  grid: Dataset;
  params: RecurrentParams;
  ciLevel: number;
}

/** Andersen–Gill or Wei–Lin–Weissfeld model for repeated events. */
export const buildRecurrentOutput = ({
  grid,
  params,
  ciLevel,
}: RecurrentInput): AnalysisRunResult => {
  const { id, start, stop, event, covariates, model } = params;
  const used = [id, start, stop, event];
  if (new Set(used).size !== used.length) {
    return { ok: false, reason: 'Subject, start, stop and event must be four different columns' };
  }
  if (covariates.some(column => used.includes(column))) {
    return { ok: false, reason: 'The structural columns cannot be used as covariates' };
  }
  const { encoded, error } = encodeCovariates(
    grid.rows,
    covariates,
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  if (error) return { ok: false, reason: error };

  const subjects: number[] = [];
  const starts: number[] = [];
  const stops: number[] = [];
  const events: number[] = [];
  const values: number[][] = encoded.map(() => []);
  grid.rows.forEach((row, rowIndex) => {
    const subjectLabel = String(row[id] ?? '').trim();
    const entryStart = parseNum(row[start]);
    const entryStop = parseNum(row[stop]);
    const entryEvent = parseNum(row[event]);
    const xs = encoded.map(column => column.values[rowIndex]);
    if (subjectLabel === '') return;
    if (!Number.isFinite(entryStart) || !Number.isFinite(entryStop) || entryStop <= entryStart) return;
    if (xs.some(value => !Number.isFinite(value))) return;
    subjects.push(Number(subjectLabel));
    starts.push(entryStart);
    stops.push(entryStop);
    events.push(entryEvent === 1 ? 1 : 0);
    xs.forEach((value, index) => values[index].push(value));
  });

  if (subjects.length < encoded.length + 3) {
    return { ok: false, reason: 'Not enough complete rows for the recurrent-event model' };
  }

  const fit = fitRecurrent({
    id: subjects,
    start: starts,
    stop: stops,
    event: events,
    covariates: encoded.map((column, index) => ({ name: column.name, values: values[index] })),
    model,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The recurrent-event model could not be estimated: check the start–stop intervals and the number of events',
    };
  }

  const tables = recurrentTables(fit, ciLevel);
  const mcf = meanCumulativeFunction(
    subjects.map((subject, index) => ({
      id: subject,
      start: starts[index],
      stop: stops[index],
      event: events[index],
    }))
  );

  const charts: AnalysisChart[] = [];
  if (fit.coefficients.length > 0) {
    charts.push(
      makeChart({
        id: 'recurrent-forest',
        kind: 'forest',
        title: copy('Hazard ratio robusti'),
        subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
        note: copy('Gli intervalli usano errori standard raggruppati per soggetto.'),
        data: {
          points: fit.coefficients.map(coefficient => ({
            label: coefficient.term,
            estimate: coefficient.hr,
            lo: coefficient.lo,
            hi: coefficient.hi,
          })),
        },
        fields: { xLabel: copy('Hazard ratio'), yLabel: copy('Covariata') },
        options: { reference: 'one' } as never,
      })
    );
  }
  if (mcf.length > 0) {
    charts.push(
      makeChart({
        id: 'recurrent-mcf',
        kind: 'line',
        title: copy('Funzione cumulata media'),
        subtitle: copy('{s1} eventi · {s2} tempi distinti', {
          s1: fit.events,
          s2: mcf.length,
        }),
        note: copy('La curva somma gli eventi osservati divisi per i soggetti a rischio a ogni tempo: pendenze più ripide indicano una ricorrenza più intensa.'),
        data: {
          series: mcf.map(point => ({
            x: point.time,
            y: point.mcf,
            series: copy('MCF'),
          })),
        },
        fields: {
          xLabel: copy('Tempo'),
          yLabel: copy('Eventi cumulati per soggetto'),
          series: copy('MCF'),
        },
        options: { step: true, showMarkers: true, showBand: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: model === 'ag' ? copy('Eventi ricorrenti: Andersen–Gill') : copy('Eventi ricorrenti: Wei–Lin–Weissfeld'),
    header: copy('{s1} soggetti · {s2} episodi · {s3} eventi', {
      s1: fit.subjects,
      s2: fit.episodes,
      s3: fit.events,
    }),
    tables,
    report: recurrentReport(tables, ciLevel),
    charts,
  };
};
