import type { Dataset } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';
import type { HeavyAnalysisId } from './heavyIds';

export type HeavyProgressPhase = 'starting' | 'computing' | 'finishing';

export interface HeavyRunRequest {
  type: 'run';
  id: number;
  analysisId: HeavyAnalysisId;
  grid: Dataset;
  params: ProjectParams;
  ciLevel: number;
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
      tables: TableSpec[];
      report: ReportSpec | null;
      charts: AnalysisChart[];
      header?: string;
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
      tables: TableSpec[];
      report: ReportSpec | null;
      charts: AnalysisChart[];
      header?: string;
      elapsedMs: number;
    }
  | { status: 'cancelled' }
  | { status: 'rejected'; reason: string }
  | { status: 'failed'; message: string }
  | { status: 'unavailable' };
