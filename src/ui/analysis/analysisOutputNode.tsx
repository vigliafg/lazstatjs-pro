import type { ReactNode } from 'react';
import type { AnalysisRunResult } from '../../analyses/types';

/**
 * Materialise the React node for a result.
 *
 * Sync runners already return a node. Worker results carry serializable data,
 * so the matching renderer is loaded on demand: tables-only results skip the
 * Victory bundle and chart-heavy results load it only when needed.
 */
export const loadAnalysisOutput = async (result: AnalysisRunResult): Promise<ReactNode | null> => {
  if ('reason' in result) return null;
  if (result.node) return result.node;
  if (result.charts && result.charts.length > 0) {
    const { AnalysisOutput } = await import('../../components/AnalysisOutput');
    return (
      <AnalysisOutput tables={result.tables} charts={result.charts} header={result.header} />
    );
  }
  const { AnalysisTablesOutput } = await import('../../components/AnalysisTablesOutput');
  return <AnalysisTablesOutput tables={result.tables} header={result.header} />;
};
