import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { coxReport, coxTables, fitCox } from '../../stats/cox';
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import type { GridData } from '../../grid/types';
import type { CoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CoxInput {
  grid: GridData;
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
  rows: string[][],
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

  const usable = fit.coefficients.filter(
    coefficient =>
      Number.isFinite(coefficient.hr) &&
      Number.isFinite(coefficient.lo) &&
      Number.isFinite(coefficient.hi)
  );
  const low = usable.length > 0 ? Math.min(1, ...usable.map(coefficient => coefficient.lo)) : 0.5;
  const high = usable.length > 0 ? Math.max(1, ...usable.map(coefficient => coefficient.hi)) : 2;
  const span = high > low ? high - low : Math.max(0.5, Math.abs(high) * 0.2);
  const forestData = fit.coefficients.map((coefficient, index) => ({
    term: coefficient.term,
    y: fit.coefficients.length - 1 - index,
    hr: coefficient.hr,
    lo: coefficient.lo,
    hi: coefficient.hi,
    usable:
      Number.isFinite(coefficient.hr) &&
      Number.isFinite(coefficient.lo) &&
      Number.isFinite(coefficient.hi),
  }));

  return {
    ok: true,
    tables,
    report: coxReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Time: ${grid.cols[timeVariable]?.name} · event: ${grid.cols[eventVariable]?.name} = "${eventLevels[1]}" · ${times.length} observations · ${fit.events} events`}
        </p>
        <ResultTables specs={tables} />

        <section className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider">
              Hazard ratio per covariata
            </h3>
            <span className="text-[10px] text-text3 font-mono">{`IC ${ciLevel}% · scala lineare`}</span>
          </div>
          <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart
              theme={VictoryTheme.material}
              padding={{ top: 15, bottom: 55, left: 120, right: 30 }}
              domain={{ x: [low - span * 0.08, high + span * 0.08], y: [-0.5, fit.coefficients.length - 0.5] }}
            >
              <VictoryAxis
                label="Hazard ratio"
                style={{
                  axis: { stroke: '#333' },
                  axisLabel: { fill: '#888', fontSize: 10, padding: 32 },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: '#222' },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickValues={forestData.map(point => point.y)}
                tickFormat={value => {
                  const point = forestData.find(item => item.y === value);
                  return point ? point.term : '';
                }}
                style={{
                  axis: { stroke: '#333' },
                  tickLabels: { fill: '#888', fontSize: 9 },
                  grid: { stroke: 'transparent' },
                }}
              />
              <VictoryLine
                data={[
                  { x: 1, y: -0.5 },
                  { x: 1, y: fit.coefficients.length - 0.5 },
                ]}
                style={{ data: { stroke: '#f87171', strokeDasharray: '4,4', strokeWidth: 1 } }}
              />
              {forestData.filter(point => point.usable).map(point => (
                <VictoryLine
                  key={`ci-${point.term}`}
                  data={[
                    { x: point.lo, y: point.y },
                    { x: point.hi, y: point.y },
                  ]}
                  style={{ data: { stroke: '#4f9cf9', strokeWidth: 2 } }}
                />
              ))}
              <VictoryScatter
                data={forestData
                  .filter(point => point.usable)
                  .map(point => ({ x: point.hr, y: point.y }))}
                style={{ data: { fill: '#fbbf24', size: 4 } }}
              />
            </VictoryChart>
          </div>
          <p className="text-[10px] text-text3 mt-1">
            Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1, cioè nessun
            effetto. Il grafico usa una scala lineare, quindi gli HR protettivi sono compressi vicino allo zero.
            {fit.separation
              ? ' Con stime instabili gli intervalli non finiti sono omessi dal grafico.'
              : ''}
          </p>
        </section>
      </div>
    ),
  };
};
