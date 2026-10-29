import type { AnalysisChart, ChartOptions } from '../stats/charts';
import type { ReportSpec } from '../stats/report';
import type { TableSpec } from '../stats/types';
import { AnalysisReport } from './AnalysisReport';
import { ResultTables } from './ResultTable';
import { AnalysisCharts } from './AnalysisCharts';
import { AlertCircle } from 'lucide-react';

interface AnalysisOutputProps {
  title?: string;
  header?: string;
  tables: TableSpec[];
  report?: ReportSpec | null;
  charts?: AnalysisChart[];
  warnings?: string[];
  callout?: {
    title: string;
    badge?: string;
    headline: string;
    bullets?: string[];
  };
  limitationsLabel?: string;
  analysisName?: string;
  onChartOptionsChange?: (chartId: string, options: ChartOptions) => void;
}

/**
 * Canonical body of an analysis card.
 *
 * Order is fixed in one place: title/header, tables, written report, then the
 * editable charts. Worker results and synchronous results use this component,
 * so the two paths cannot drift apart.
 */
export const AnalysisOutput = ({
  title,
  header,
  tables,
  report,
  charts,
  warnings,
  callout,
  limitationsLabel,
  analysisName,
  onChartOptionsChange,
}: AnalysisOutputProps) => (
  <div className="mb-6">
    {title && <div className="output-title">{title}</div>}
    {header && <p className="mb-3 font-mono text-[10px] text-text3">{header}</p>}
    {(warnings ?? []).map((warning, index) => (
      <div key={index} className="mb-3 flex items-start gap-2 rounded border border-yellow/20 bg-yellow/10 p-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow" />
        <p className="text-[10px] leading-normal text-yellow">{warning}</p>
      </div>
    ))}
    {callout && (
      <section className="mb-4 rounded-lg border border-border2 bg-surface3/30 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text3">{callout.title}</span>
          {callout.badge && (
            <span className="rounded border border-accent2/30 bg-accent2/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent2">
              {callout.badge}
            </span>
          )}
        </div>
        <p className="text-[12px] font-semibold text-text">{callout.headline}</p>
        {(callout.bullets ?? []).length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {(callout.bullets ?? []).map((bullet, index) => (
              <li key={index} className="text-[11px] leading-relaxed text-text2">{bullet}</li>
            ))}
          </ul>
        )}
      </section>
    )}
    <ResultTables specs={tables} />
    {report && <AnalysisReport spec={report} limitationsLabel={limitationsLabel} />}
    <AnalysisCharts
      charts={charts}
      analysisName={analysisName ?? title}
      onOptionsChange={onChartOptionsChange}
    />
  </div>
);
