import { competingReport, competingTables, fitCompetingRisks } from '../../stats/competing';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { encodeCovariates } from '../shared/encode';
import type { Dataset } from '../../grid/types';
import type { CompetingParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CompetingInput {
  grid: Dataset;
  params: CompetingParams;
  ciLevel: number;
}

/** Fine–Gray competing risks: subdistribution coefficients, CIF and forest plot. */
export const buildCompetingOutput = ({
  grid,
  params,
  ciLevel,
}: CompetingInput): AnalysisRunResult => {
  const { time, event, cause, covariates } = params;
  if (time === event) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }
  if (covariates.includes(time) || covariates.includes(event)) {
    return { ok: false, reason: 'Time and event columns cannot be used as covariates' };
  }
  const { encoded, error } = encodeCovariates(
    grid.rows,
    covariates,
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  if (error) return { ok: false, reason: error };

  const times: number[] = [];
  const events: number[] = [];
  const values: number[][] = encoded.map(() => []);
  grid.rows.forEach((row, rowIndex) => {
    const entryTime = parseNum(row[time]);
    const code = Math.trunc(parseNum(row[event]));
    const xs = encoded.map(column => column.values[rowIndex]);
    if (!Number.isFinite(entryTime) || entryTime < 0) return;
    if (columnMissing(xs)) return;
    times.push(entryTime);
    events.push(Number.isFinite(code) && code > 0 ? code : 0);
    xs.forEach((value, index) => values[index].push(value));
  });

  if (times.length < encoded.length + 3) {
    return { ok: false, reason: 'Not enough complete rows for the competing risks model' };
  }

  const fit = fitCompetingRisks({
    time: times,
    event: events,
    covariates: encoded.map((column, index) => ({ name: column.name, values: values[index] })),
    cause,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The competing risks model could not be estimated: check that the cause code exists and that there are enough events',
    };
  }

  const tables = competingTables(fit, ciLevel);
  return {
    ok: true,
    title: copy('Rischi competitivi: causa {s1}', { s1: fit.cause }),
    header: copy('{s1} osservazioni · {s2} eventi della causa · {s3} competitivi', {
      s1: fit.n,
      s2: fit.events,
      s3: fit.competing,
    }),
    tables,
    report: competingReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'competing-cif',
        kind: 'line',
        title: copy('Incidenza cumulativa'),
        subtitle: copy('Causa {s1} · profilo medio', { s1: fit.cause }),
        note: copy('La CIF cresce solo quando accadono eventi della causa scelta: non è il complemento della sopravvivenza globale.'),
        data: {
          series: [
            { x: 0, y: 0, series: copy('CIF') },
            ...fit.cif.map(point => ({ x: point.time, y: point.cif, series: copy('CIF') })),
          ],
        },
        fields: { xLabel: copy('Tempo'), yLabel: copy('Incidenza cumulativa'), series: copy('Serie') },
        options: { showMarkers: false, showBand: false, step: true } as never,
      }),
      ...(fit.coefficients.length > 0
        ? [
            makeChart({
              id: 'competing-forest',
              kind: 'forest',
              title: copy('Hazard ratio di sottodistribuzione'),
              subtitle: copy('IC {s1}% · riferimento 1', { s1: ciLevel }),
              note: copy('Valori sopra 1 indicano una maggiore incidenza cumulativa della causa scelta.'),
              data: {
                points: fit.coefficients.map(coefficient => ({
                  label: coefficient.term,
                  estimate: coefficient.hr,
                  lo: coefficient.lo,
                  hi: coefficient.hi,
                })),
              },
              fields: { xLabel: copy('sHR'), yLabel: copy('Covariata') },
              options: { reference: 'one' } as never,
            }),
          ]
        : []),
    ],
  };
};

const columnMissing = (values: number[]): boolean => values.some(value => !Number.isFinite(value));
