import { coxReport, coxTables, fitCox } from '../../stats/cox';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { CoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CoxInput {
  grid: Dataset;
  params: CoxParams;
  ciLevel: number;
}

interface EncodedCovariate {
  name: string;
  values: number[];
  error?: string;
}

const numericShare = (values: string[]): number => {
  if (values.length === 0) return 0;
  const parsed = values.filter(value => Number.isFinite(parseNum(value))).length;
  return parsed / values.length;
};

/** Numeric columns stay numeric; small categorical columns become dummies. */
const encodeColumn = (
  rows: readonly (readonly string[])[],
  index: number,
  name: string
): EncodedCovariate[] => {
  const raw = rows.map(row => String(row[index] ?? '').trim());
  const present = raw.filter(value => value !== '');
  if (present.length === 0) return [];

  if (numericShare(present) >= 0.8) {
    return [{ name, values: raw.map(value => (value === '' ? NaN : parseNum(value))) }];
  }

  const levels = Array.from(new Set(present)).sort();
  if (levels.length > 4) {
    return [{ name, values: [], error: `"${name}" ha ${levels.length} livelli: usa una codifica manuale` }];
  }
  return levels.slice(1).map(level => ({
    name: `${name} = ${level}`,
    values: raw.map(value => (value === '' ? NaN : value === level ? 1 : 0)),
  }));
};

/** Modello di Cox: tabelle, forest plot degli hazard ratio e report. */
export const buildCoxOutput = ({ grid, params, ciLevel }: CoxInput): AnalysisRunResult => {
  const { timeVariable, eventVariable, covariates } = params;

  if (covariates.length === 0) {
    return { ok: false, reason: 'Select at least one covariate' };
  }
  if (covariates.includes(timeVariable) || covariates.includes(eventVariable)) {
    return { ok: false, reason: 'Time and event columns cannot be used as covariates' };
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

  const encoded: EncodedCovariate[] = [];
  for (const index of covariates) {
    const columns = encodeColumn(grid.rows, index, grid.cols[index]?.name ?? `X${index + 1}`);
    const problem = columns.find(column => column.error);
    if (problem?.error) {
      return { ok: false, reason: problem.error };
    }
    encoded.push(...columns);
  }
  if (encoded.length === 0) {
    return { ok: false, reason: 'The selected covariates contain no usable values' };
  }

  const times: number[] = [];
  const events: number[] = [];
  const covariateValues: number[][] = encoded.map(() => []);
  grid.rows.forEach((row, rowIndex) => {
    const time = parseNum(row[timeVariable]);
    const label = String(row[eventVariable] ?? '').trim();
    if (!Number.isFinite(time) || time < 0 || label === '') return;
    const values = encoded.map(column => column.values[rowIndex]);
    if (values.some(value => !Number.isFinite(value))) return;
    times.push(time);
    events.push(label === eventLevels[1] ? 1 : 0);
    values.forEach((value, index) => covariateValues[index].push(value));
  });

  if (times.length < encoded.length + 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: time, event and all covariates must be present',
    };
  }

  const fit = fitCox({
    time: times,
    event: events,
    covariates: encoded.map((column, index) => ({ name: column.name, values: covariateValues[index] })),
    level: ciLevel,
  });

  if (!fit) {
    return {
      ok: false,
      reason: 'The Cox model could not be estimated: check for constant covariates or too few events',
    };
  }

  const tables = coxTables(fit, ciLevel);

  const forestPoints = fit.coefficients.map(coefficient => ({
    label: coefficient.term,
    estimate: coefficient.hr,
    lo: coefficient.lo,
    hi: coefficient.hi,
  }));
  const forest = makeChart({
    id: 'cox-forest',
    kind: 'forest',
    title: copy('Hazard ratio per covariata'),
    subtitle: copy('IC {s1}% · scala lineare', { s1: ciLevel }),
    note:
      copy('Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1, cioè nessun effetto. Il grafico usa una scala lineare, quindi gli HR protettivi sono compressi vicino allo zero.') +
      (fit.separation ? copy(' Con stime instabili gli intervalli non finiti sono omessi dal grafico.') : ''),
    data: { points: forestPoints },
    fields: { xLabel: copy('Hazard ratio'), yLabel: copy('Covariata') },
    stats: { n: times.length, events: fit.events },
  });
  const header = `Time: ${grid.cols[timeVariable]?.name} · event: ${grid.cols[eventVariable]?.name} = "${eventLevels[1]}" · ${times.length} observations · ${fit.events} events`;

  return {
    ok: true,
    title: copy('Cox: hazard ratio'),
    tables,
    report: coxReport(tables, ciLevel),
    charts: [forest],
    header,
  };
};
