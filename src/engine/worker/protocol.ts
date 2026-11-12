import type { AnalysisRunResult } from '../../analyses/types';
import type { RunAnalysisOptions } from '../run';
import { EngineError, isEngineError, type EngineErrorCode, type EngineErrorStage } from '../errors';

export interface WorkerRequest {
  id: number;
  options: RunAnalysisOptions;
}

export interface SerializedEngineError {
  code: EngineErrorCode;
  kind: string;
  stage: EngineErrorStage;
  message: string;
  details: Record<string, unknown>;
  retryable: boolean;
  hint?: string;
}

export type WorkerResponse =
  | { id: number; ok: true; result: AnalysisRunResult }
  | { id: number; ok: false; error: SerializedEngineError };

export const serializeError = (error: unknown): SerializedEngineError => {
  if (isEngineError(error)) {
    return {
      code: error.code,
      kind: error.kind,
      stage: error.stage,
      message: error.message,
      details: error.details,
      retryable: error.retryable,
      ...(error.hint ? { hint: error.hint } : {}),
    };
  }
  return {
    code: 'E_INTERNAL',
    kind: 'worker_failure',
    stage: 'execute',
    message: error instanceof Error ? error.message : 'The analysis worker failed',
    details: {},
    retryable: false,
  };
};

export const errorFromSerialized = (error: SerializedEngineError): EngineError =>
  new EngineError(error);
