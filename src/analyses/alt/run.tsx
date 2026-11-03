import { altReport, altTables, fitAlt } from '../../stats/alt';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { encodeCovariates } from '../shared/encode';
import type { Dataset } from '../../grid/types';
import type { AltParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AltInput {
  grid: Dataset;
  params: AltParams;
  ciLevel: number;
}

/** Accelerated life testing with a Weibull AFT and a transformed stress. */
export const buildAltOutput = ({ grid, params, ciLevel }: AltInput): AnalysisRunResult => {
  const { time, event, stress, covariates, model, useStress } = params;
  const used = [time, event, stress];
  if (new Set(used).size !== used.length) {
    return { ok: false, reason: 'Time, event and stress must be three different columns' };
  }
  if (covariates.some(column => used.includes(column))) {
    return { ok: false, reason: 'Time, event and stress cannot also be covariates' };
  }
  const { encoded, error } = encodeCovariates(
    grid.rows,
    covariates,
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  if (error) return { ok: false, reason: error };

  const times: number[] = [];
  const events: number[] = [];
  const stresses: number[] = [];
  const values: number[][] = encoded.map(() => []);
  grid.rows.forEach((row, rowIndex) => {
    const entryTime = parseNum(row[time]);
    const entryEvent = parseNum(row[event]);
    const entryStress = parseNum(row[stress]);
    const xs = encoded.map(column => column.values[rowIndex]);
    if (!Number.isFinite(entryTime) || entryTime <= 0) return;
    if (!Number.isFinite(entryStress) || entryStress <= 0) return;
    if (entryEvent !== 0 && entryEvent !== 1) return;
    if (xs.some(value => !Number.isFinite(value))) return;
    times.push(entryTime);
    events.push(entryEvent);
    stresses.push(entryStress);
    xs.forEach((value, index) => values[index].push(value));
  });

  if (times.length < encoded.length + 4) {
    return { ok: false, reason: 'Not enough complete rows for the accelerated life model' };
  }

  const fit = fitAlt({
    time: times,
    event: events,
    stress: stresses,
    covariates: encoded.map((column, index) => ({ name: column.name, values: values[index] })),
    model,
    useStress,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The accelerated life model could not be estimated: check positive times, positive stress and enough events',
    };
  }

  const tables = altTables(fit, ciLevel);
  return {
    ok: true,
    title: copy('Test di vita accelerata: {s1}', {
      s1: grid.cols[stress]?.name ?? 'S',
    }),
    header: copy('{s1} osservazioni · {s2} eventi · stress {s3}–{s4}', {
      s1: fit.n,
      s2: fit.events,
      s3: Math.min(...stresses).toFixed(3),
      s4: Math.max(...stresses).toFixed(3),
    }),
    tables,
    report: altReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'alt-coefficients',
        kind: 'forest',
        title: copy('Time ratio per termine'),
        subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
        note: copy('Il primo termine descrive lo stress trasformato; gli altri sono le covariati aggiuntive.'),
        data: {
          points: fit.coefficients.map(coefficient => ({
            label: coefficient.term,
            estimate: coefficient.timeRatio,
            lo: coefficient.lo,
            hi: coefficient.hi,
          })),
        },
        fields: { xLabel: copy('Time ratio'), yLabel: copy('Termine') },
        options: { reference: 'one' } as never,
      }),
      makeChart({
        id: 'alt-acceleration',
        kind: 'bar',
        title: copy('Fattore di accelerazione'),
        subtitle: copy('Stress d’uso rispetto al riferimento'),
        note: copy('Barra sopra 1: vita attesa più lunga allo stress d’uso.'),
        data: {
          bars: [{ category: copy('Stress d’uso'), value: fit.accelerationFactor }],
        },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Fattore') },
        options: { referenceLine: 'one' } as never,
      }),
    ],
  };
};
