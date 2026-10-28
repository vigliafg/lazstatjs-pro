import { ResultTables } from '../../components/ResultTable';
import { timeDependentCoxStats } from '../../stats/kernels/tdcox';
import { tdCoxTables } from '../../stats/tables/tdcox';
import { tdCoxReport } from '../../stats/reports/tdcox';
import type { Dataset } from '../../grid/types';
import type { TdCoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface TdCoxInput {
  grid: Dataset;
  params: TdCoxParams;
  ciLevel: number;
}

/** Cox con covariate tempo-dipendenti su formato start-stop. */
export const buildTdCoxOutput = ({ grid, params, ciLevel }: TdCoxInput): AnalysisRunResult => {
  if (params.covariates.length === 0) {
    return { ok: false, reason: 'Select at least one covariate' };
  }
  if (
    params.start === params.stop ||
    params.start === params.event ||
    params.stop === params.event
  ) {
    return { ok: false, reason: 'Start, stop and event must be different columns' };
  }
  const start = grid.rows.map(row => Number(row[params.start]));
  const stop = grid.rows.map(row => Number(row[params.stop]));
  const event = grid.rows.map(row => Number(row[params.event]));
  const covariates = params.covariates.map(index => ({
    name: grid.cols[index]?.name ?? `X${index + 1}`,
    values: grid.rows.map(row => Number(row[index])),
  }));
  const stats = timeDependentCoxStats({ start, stop, event, covariates, level: ciLevel });
  if (!stats) {
    return {
      ok: false,
      reason: 'Time-dependent Cox needs valid start < stop intervals, events and complete covariates',
    };
  }
  const tables = tdCoxTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: tdCoxReport(stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
