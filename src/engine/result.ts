import type { AnalysisRunResult } from '../analyses/types';
import type { Dataset } from '../grid/types';
import type { ProjectParams } from '../io/project';
import { analysisMeta, analysisLabel } from '../analyses/registry';
import { isEngineError, EngineError, type EngineErrorCode } from './errors';
import type { DiagnosticsBlock } from './diagnostics';

export const ENGINE_SCHEMA_VERSION = 1;

export interface EnvelopeInput {
  source: string;
  format: string;
  sha256: string;
  rows: number;
  columns: number;
}

export interface RunTimings {
  totalMs: number;
  loadMs?: number;
  paramsMs?: number;
  runMs?: number;
  renderMs?: number;
}

export interface EngineInfo {
  name: string;
  version: string;
  runners: number;
  chartKinds: number;
}

export interface FailureError {
  code: EngineErrorCode;
  kind: string;
  stage: string;
  message: string;
  details: Record<string, unknown>;
  retryable: boolean;
  hint?: string;
}

export interface FailureEnvelope {
  schemaVersion: number;
  status: 'rejected' | 'error';
  engine: EngineInfo;
  analysis?: ReturnType<typeof analysisBlock>;
  input: EnvelopeInput;
  params?: unknown;
  error: FailureError;
  diagnostics?: DiagnosticsBlock;
  timings?: RunTimings;
  result?: Extract<AnalysisRunResult, { ok: false }>;
  warnings: [];
  artifacts: [];
  generatedAt?: string;
}

export interface SuccessEnvelope {
  schemaVersion: number;
  status: 'ok';
  engine: EngineInfo;
  analysis: ReturnType<typeof analysisBlock>;
  input: EnvelopeInput;
  params: unknown;
  ciLevel: number;
  reportLocale: string;
  result: Extract<AnalysisRunResult, { ok: true }>;
  warnings: string[];
  artifacts: string[];
  data?: Dataset;
  timings?: RunTimings;
  generatedAt?: string;
}

export type RunEnvelope = SuccessEnvelope | FailureEnvelope;

export const analysisBlock = (analysisId: string): {
  id: string;
  label: string;
  family: string;
} => {
  const meta = analysisMeta(analysisId);
  return {
    id: analysisId,
    label: analysisLabel(analysisId),
    family: meta?.family ?? 'unknown',
  };
};

export const engineInfo = (version: string, runners: number, chartKinds: number): EngineInfo => ({
  name: 'lazstats',
  version,
  runners,
  chartKinds,
});

export const failureFromError = (error: unknown): { error: FailureError; status: 'rejected' | 'error' } => {
  if (isEngineError(error)) {
    return {
      status: error.code === 'E_PARAMS' || error.code === 'E_RUN' ? 'rejected' : 'error',
      error: {
        code: error.code,
        kind: error.kind,
        stage: error.stage,
        message: error.message,
        details: error.details,
        retryable: error.retryable,
        ...(error.hint ? { hint: error.hint } : {}),
      },
    };
  }
  const message = error instanceof Error ? error.message : 'Unexpected engine failure';
  return {
    status: 'error',
    error: {
      code: 'E_INTERNAL',
      kind: 'unexpected',
      stage: 'execute',
      message,
      details: {},
      retryable: false,
    },
  };
};

export const successWarnings = (result: AnalysisRunResult): string[] =>
  result.ok ? [...(result.warnings ?? [])] : [];

export const errorExitCode = (code: EngineErrorCode): number => {
  if (code === 'E_DATA') return 3;
  if (code === 'E_INTERNAL') return 4;
  if (code === 'E_TIMEOUT') return 5;
  return 2;
};

export const envelopeForFailure = (options: {
  error: unknown;
  engine: EngineInfo;
  input: EnvelopeInput;
  analysisId?: string;
  params?: unknown;
  diagnostics?: DiagnosticsBlock;
  result?: Extract<AnalysisRunResult, { ok: false }>;
  timings?: RunTimings;
  generatedAt?: string;
}): FailureEnvelope => {
  const failure = failureFromError(options.error);
  return {
    schemaVersion: ENGINE_SCHEMA_VERSION,
    status: failure.status,
    engine: options.engine,
    ...(options.analysisId ? { analysis: analysisBlock(options.analysisId) } : {}),
    input: options.input,
    ...(options.params !== undefined ? { params: options.params } : {}),
    error: failure.error,
    ...(options.diagnostics ? { diagnostics: options.diagnostics } : {}),
    ...(options.result ? { result: options.result } : {}),
    ...(options.timings ? { timings: options.timings } : {}),
    warnings: [],
    artifacts: [],
    ...(options.generatedAt ? { generatedAt: options.generatedAt } : {}),
  };
};

export const envelopeForSuccess = (options: {
  analysisId: string;
  engine: EngineInfo;
  input: EnvelopeInput;
  params: unknown;
  ciLevel: number;
  reportLocale: string;
  result: Extract<AnalysisRunResult, { ok: true }>;
  timings?: RunTimings;
  generatedAt?: string;
}): SuccessEnvelope => ({
  schemaVersion: ENGINE_SCHEMA_VERSION,
  status: 'ok',
  engine: options.engine,
  analysis: analysisBlock(options.analysisId),
  input: options.input,
  params: options.params,
  ciLevel: options.ciLevel,
  reportLocale: options.reportLocale,
  result: options.result,
  warnings: successWarnings(options.result),
  artifacts: [],
  ...(options.timings ? { timings: options.timings } : {}),
  ...(options.generatedAt ? { generatedAt: options.generatedAt } : {}),
});

export const isFailureEnvelope = (value: RunEnvelope): value is FailureEnvelope =>
  value.status !== 'ok';

export { EngineError };
