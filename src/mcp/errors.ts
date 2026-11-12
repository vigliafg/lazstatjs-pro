import type { CallToolResult } from '@modelcontextprotocol/server';
import { EngineError, isEngineError } from '../engine';
import type { DiagnosticsBlock } from '../engine';
import type { EngineErrorCode, EngineErrorStage } from '../engine';

export type McpErrorCode = EngineErrorCode | 'E_CANCELLED' | 'E_BUSY' | 'E_RESULT_EXPIRED';

export class McpError extends Error {
  readonly code: McpErrorCode;
  readonly kind: string;
  readonly stage: string;
  readonly details: Record<string, unknown>;
  readonly retryable: boolean;

  constructor(options: {
    code: McpErrorCode;
    kind: string;
    stage: string;
    message: string;
    details?: Record<string, unknown>;
    retryable?: boolean;
  }) {
    super(options.message);
    this.name = 'McpError';
    this.code = options.code;
    this.kind = options.kind;
    this.stage = options.stage;
    this.details = options.details ?? {};
    this.retryable = options.retryable ?? false;
  }
}

export interface McpFailure {
  code: McpErrorCode;
  kind: string;
  stage: string;
  message: string;
  details: Record<string, unknown>;
  retryable: boolean;
  analysisId?: string;
  diagnostics?: DiagnosticsBlock;
  status?: 'rejected' | 'error';
  engine?: { name: string; version: string; runners: number; chartKinds: number };
  input?: { source: string; format: string; sha256: string; rows: number; columns: number };
}

export const failureFrom = (
  error: unknown,
  analysisId?: string,
  diagnostics?: DiagnosticsBlock
): McpFailure => {
  if (error instanceof McpError) {
    return {
      code: error.code,
      kind: error.kind,
      stage: error.stage,
      message: error.message,
      details: error.details,
      retryable: error.retryable,
      ...(analysisId ? { analysisId } : {}),
      ...(diagnostics ? { diagnostics } : {}),
    };
  }
  if (isEngineError(error)) {
    return {
      code: error.code,
      kind: error.kind,
      stage: error.stage,
      message: error.message,
      details: error.details,
      retryable: error.retryable,
      ...(analysisId ? { analysisId } : {}),
      ...(diagnostics ? { diagnostics } : {}),
    };
  }
  return {
    code: 'E_INTERNAL',
    kind: 'unexpected',
    stage: 'execute',
    message: error instanceof Error ? error.message : 'Unexpected MCP failure',
    details: {},
    retryable: false,
    ...(analysisId ? { analysisId } : {}),
    ...(diagnostics ? { diagnostics } : {}),
  };
};

export const toolFailure = (failure: McpFailure): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: failure.message }],
  structuredContent: failure,
});

export const toolError = (error: unknown, analysisId?: string, diagnostics?: DiagnosticsBlock) =>
  toolFailure(failureFrom(error, analysisId, diagnostics));

export const asEngineError = (failure: McpFailure): EngineError =>
  new EngineError({
    code: failure.code === 'E_CANCELLED' || failure.code === 'E_BUSY' || failure.code === 'E_RESULT_EXPIRED'
      ? 'E_ARGS'
      : failure.code,
    kind: failure.kind,
    stage: failure.stage as EngineErrorStage,
    message: failure.message,
    details: failure.details,
    retryable: failure.retryable,
  });
