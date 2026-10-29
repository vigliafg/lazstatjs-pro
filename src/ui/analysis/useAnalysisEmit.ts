import type { ReactNode } from 'react';
import type { AnalysisRunResult } from '../../analyses/types';
import { analysisParamsOf, analysisParamsSignature } from '../../analyses/paramsSnapshot';
import type { ProjectParams } from '../../io/project';
import type { ReportSpec } from '../../stats/report';
import { t } from '../../i18n';
import { loadAnalysisOutput } from './analysisOutputNode';

export interface OutputMeta {
  dataRevision?: number;
  datasetId?: string;
  filterSignature?: string;
  params?: unknown;
  paramsSignature?: string;
  ciLevel?: number;
  live?: boolean;
}

interface EmitOptions {
  activeAnalysis: string;
  params: ProjectParams;
  dataRevision: number;
  datasetId: string;
  filterSignature: string;
  ciLevel: number;
  pushOutput: (
    node: ReactNode,
    report: ReportSpec | null,
    analysisId?: string,
    meta?: OutputMeta
  ) => void;
  showToast: (title: string, message: string, type?: 'ok' | 'warn' | 'error') => void;
}

/**
 * The single point where an analysis result becomes an output card.
 *
 * Kept outside `App` so the shell only composes: the node can come from a
 * synchronous builder or from a worker payload, and the metadata always
 * describes the data revision the result belongs to.
 */
export const useAnalysisEmit =
  ({ activeAnalysis, params, dataRevision, datasetId, filterSignature, ciLevel, pushOutput, showToast }: EmitOptions) =>
  async (
    result: AnalysisRunResult,
    analysisId: string = activeAnalysis,
    paramsUsed: ProjectParams = params,
    options?: { live?: boolean; ciLevel?: number }
  ): Promise<boolean> => {
    if ('reason' in result) {
      showToast(t('toast.error'), result.reason, 'error');
      return false;
    }
    const meta: OutputMeta = {
      dataRevision,
      datasetId,
      filterSignature,
      params: analysisParamsOf(analysisId, paramsUsed),
      paramsSignature: analysisParamsSignature(analysisId, paramsUsed),
      ciLevel: options?.ciLevel ?? ciLevel,
      live: options?.live,
    };
    const node = await loadAnalysisOutput(result);
    if (!node) return false;
    pushOutput(node, result.report, analysisId, meta);
    return true;
  };
