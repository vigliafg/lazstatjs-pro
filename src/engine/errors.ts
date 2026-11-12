export type EngineErrorCode =
  | 'E_ARGS'
  | 'E_ANALYSIS'
  | 'E_PARAMS'
  | 'E_DATA'
  | 'E_RUN'
  | 'E_INTERNAL'
  | 'E_TIMEOUT';

export type EngineErrorStage =
  | 'args'
  | 'analysis'
  | 'load'
  | 'params'
  | 'preflight'
  | 'execute'
  | 'render';

export interface EngineErrorOptions {
  code: EngineErrorCode;
  kind: string;
  stage: EngineErrorStage;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
  hint?: string;
}

/** A failure the CLI can render without guessing its cause. */
export class EngineError extends Error {
  readonly code: EngineErrorCode;
  readonly kind: string;
  readonly stage: EngineErrorStage;
  readonly details: Record<string, unknown>;
  readonly retryable: boolean;
  readonly hint?: string;

  constructor(options: EngineErrorOptions) {
    super(options.message);
    this.name = 'EngineError';
    this.code = options.code;
    this.kind = options.kind;
    this.stage = options.stage;
    this.details = options.details ?? {};
    this.retryable = options.retryable ?? false;
    if (options.hint) this.hint = options.hint;
  }
}

export const isEngineError = (value: unknown): value is EngineError =>
  value instanceof EngineError;
