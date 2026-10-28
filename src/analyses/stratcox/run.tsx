import { ResultTables } from '../../components/ResultTable';
import { stratifiedCoxStats } from '../../stats/kernels/stratcox';
import { stratCoxTables } from '../../stats/tables/stratcox';
import { stratCoxReport } from '../../stats/reports/stratcox';
import type { Dataset } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface StratifiedCoxInput {
  grid: Dataset;
  params: StratifiedCoxParams;
  ciLevel: number;
}

/** Cox stratificato con coefficienti condivisi. */
export const buildStratifiedCoxOutput = ({ grid, params, ciLevel }: StratifiedCoxInput): AnalysisRunResult => {
  if (params.stratum < 0) {
    return { ok: false, reason: 'Select a stratum column' };
  }
  if (params.time === params.event) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }
  if (params.covariates.length === 0) {
    return { ok: false, reason: 'Select at least one covariate' };
  }
  if (params.covariates.includes(params.stratum)) {
    return { ok: false, reason: 'The stratum cannot also be a covariate' };
  }

  const time = grid.rows.map(row => Number(row[params.time]));
  const event = grid.rows.map(row => Number(row[params.event]));
  const strata = grid.rows.map(row => String(row[params.stratum] ?? '').trim());
  const covariates = params.covariates.map(index => ({
    name: grid.cols[index]?.name ?? `X${index + 1}`,
    values: grid.rows.map(row => Number(row[index])),
  }));
  const stats = stratifiedCoxStats({ time, event, covariates, strata, level: ciLevel });
  if (!stats) {
    return {
      ok: false,
      reason: 'Stratified Cox needs at least two strata with events and complete numeric covariates',
    };
  }
  const tables = stratCoxTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: stratCoxReport(stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
