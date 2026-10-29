import type { AnalysisRunResult } from '../../analyses/types';
import { analysisParamsOf, analysisParamsSignature } from '../../analyses/paramsSnapshot';
import type { ProjectParams } from '../../io/project';
import { t } from '../../i18n';

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
    result: AnalysisRunResult,
    analysisId?: string,
    meta?: OutputMeta
  ) => void;
  showToast: (title: string, message: string, type?: 'ok' | 'warn' | 'error') => void;
}

/**
 * The single point where an analysis result becomes an output card.
 *
 * The result crosses the boundary as plain data: tables, report and chart
 * models. The console renders it and keeps the chart models editable.
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
    pushOutput(result, analysisId, meta);
    return true;
  };
