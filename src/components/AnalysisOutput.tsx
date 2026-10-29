import type { AnalysisChart } from '../stats/charts';
import type { TableSpec } from '../stats/types';
import { ResultTables } from './ResultTable';
import { AnalysisCharts } from './AnalysisCharts';

/**
 * Canonical body for analyses whose result is tables plus optional charts.
 *
 * Worker results only carry serializable data, so they use this component
 * directly; heavy runners use it too, keeping the worker and main-thread
 * output visually identical.
 */
export const AnalysisOutput = ({
  tables,
  charts,
  header,
}: {
  tables: TableSpec[];
  charts?: AnalysisChart[];
  header?: string;
}) => (
  <div className="mb-6">
    {header && <p className="mb-3 font-mono text-[10px] text-text3">{header}</p>}
    <ResultTables specs={tables} />
    <AnalysisCharts charts={charts} />
  </div>
);
