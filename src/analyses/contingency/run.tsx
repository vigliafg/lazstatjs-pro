import { contingencyReport, contingencyTables } from '../../stats/contingency';
import { ResultTables } from '../../components/ResultTable';
import type { ContingencyParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ContingencyInput {
  params: ContingencyParams;
  ciLevel: number;
}

/** Chi-quadro / Fisher / Monte Carlo su una tabella R×C. */
export const buildContingencyOutput = ({
  params,
  ciLevel,
}: ContingencyInput): AnalysisRunResult => {
  const observed = params.values.map(row => row.map(cell => Number.parseInt(cell, 10) || 0));
  if (observed.some(row => row.some(value => value < 0))) {
    return { ok: false, reason: 'Frequencies must be non-negative' };
  }
  if (observed.flat().reduce((sum, value) => sum + value, 0) === 0) {
    return { ok: false, reason: 'The grand total cannot be zero' };
  }

  const tables = contingencyTables({
    observed,
    rowLabels: params.rows,
    colLabels: params.cols,
    level: ciLevel,
    exact: params.exact,
    monteCarlo: params.monteCarlo,
  });

  if (tables.length === 0) {
    return { ok: false, reason: 'Every row and every column needs at least one observation' };
  }

  return {
    ok: true,
    tables,
    report: contingencyReport(tables, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
