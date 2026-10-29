import type { TableSpec } from '../stats/types';
import { ResultTables } from './ResultTable';

/** Worker result without charts: keeps Victory out of the download. */
export const AnalysisTablesOutput = ({
  tables,
  header,
}: {
  tables: TableSpec[];
  header?: string;
}) => (
  <div className="mb-6">
    {header && <p className="mb-3 font-mono text-[10px] text-text3">{header}</p>}
    <ResultTables specs={tables} />
  </div>
);
