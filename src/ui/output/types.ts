import { sanitizeOutputHtml, type StoredOutput } from '../../io/outputs';
import type { AnalysisChart } from '../../stats/charts';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';

export interface SessionOutputBody {
  title?: string;
  header?: string;
  tables: TableSpec[];
  report: ReportSpec | null;
  warnings?: string[];
  /** Complete chart list for the session; persistence keeps the capped one. */
  charts?: AnalysisChart[];
  callout?: {
    title: string;
    badge?: string;
    headline: string;
    bullets?: string[];
  };
}

/** Un blocco della console: React live nella sessione, HTML quando ripristinato. */
export interface OutputEntry extends StoredOutput {
  /** Serializable result kept in session so charts can be edited. */
  session?: SessionOutputBody;
  /** In-session revision of the grid that produced the block. */
  dataRevision?: number;
  /** In-session dataset identity. */
  datasetId?: string;
  /** Signature of the analysis row filter used for the run. */
  filterSignature?: string;
  /** Session-only live-run card: replaced on the next live run. */
  live?: boolean;
}

/** I blocchi ripristinati sono statici: sanificati una volta e iniettati. */
export const restoredOutputs = (stored: StoredOutput[] | undefined): OutputEntry[] =>
  (stored ?? [])
    .map(entry => ({ ...entry, html: sanitizeOutputHtml(entry.html) }))
    .filter(entry => entry.html.length > 0);

/** Identity and dataset facts shown above the session-report stack. */
export interface SessionReportMeta {
  datasetId?: string;
  /** Rows visible under the current row filter. */
  rows: number;
  totalRows: number;
  columns: number;
  /** Human-readable active row filter, absent when no filter is applied. */
  filterLabel?: string;
  filterAffectsAnalysis?: boolean;
  /** Distinct analyses that produced at least one run-report. */
  analyses: number;
  ciLevel: number;
}
