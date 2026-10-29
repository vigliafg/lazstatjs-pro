import type { Dataset } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';
import type { HeavyAnalysisId } from './heavyIds';
import type { ReportLocale } from '../../stats/reportCopy/types';
import type { ChartDefaults } from '../../charts/defaults';

export type HeavyProgressPhase = 'starting' | 'computing' | 'finishing';

export interface HeavyRunRequest {
  type: 'run';
  id: number;
  analysisId: HeavyAnalysisId;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
  /** The worker builds the written report, so it needs the language too. */
  reportLocale: ReportLocale;
  /** Chart defaults for this run. */
  chartDefaults?: ChartDefaults;
}

export type HeavyWorkerMessage =
  | {
      type: 'progress';
      id: number;
      phase: HeavyProgressPhase;
      progress: number;
    }
  | {
      type: 'result';
      id: number;
      ok: true;
      title?: string;
      tables: TableSpec[];
      report: ReportSpec | null;
      charts: AnalysisChart[];
      header?: string;
      warnings?: string[];
      callout?: {
        title: string;
        badge?: string;
        headline: string;
        bullets?: string[];
      };
      elapsedMs: number;
    }
  | {
      type: 'result';
      id: number;
      ok: false;
      reason: string;
      elapsedMs: number;
    };

export type HeavyRunOutcome =
  | {
      status: 'ok';
      title?: string;
      tables: TableSpec[];
      report: ReportSpec | null;
      charts: AnalysisChart[];
      header?: string;
      warnings?: string[];
      callout?: {
        title: string;
        badge?: string;
        headline: string;
        bullets?: string[];
      };
      elapsedMs: number;
    }
  | { status: 'cancelled' }
  | { status: 'rejected'; reason: string }
  | { status: 'failed'; message: string }
  | { status: 'unavailable' };
