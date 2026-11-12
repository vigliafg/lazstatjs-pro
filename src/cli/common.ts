import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { EngineError, DEFAULT_TIMEOUT_MS } from '../engine';
import type { RunEnvelope } from '../engine';
import type { ChartsMode, RenderFormat } from './output';
import { CLI_PARSE_OPTIONS } from './spec';
import type { CliIo, ParsedCli } from './types';

export const parseCli = (args: string[]): ParsedCli => {
  // `--quiet=false` is documented for scripts; node:util only accepts
  // boolean flags without an explicit value.
  const normalizedArgs = args.flatMap(arg => {
    if (arg === '--quiet=false') return [];
    if (arg === '--quiet=true') return ['--quiet'];
    return [arg];
  });
  const parsed = parseArgs({
    args: normalizedArgs,
    options: CLI_PARSE_OPTIONS,
    allowPositionals: true,
    strict: true,
  });
  return {
    command: parsed.positionals[0] ?? null,
    positionals: parsed.positionals.slice(1),
    values: parsed.values as ParsedCli['values'],
  };
};

export const stringValue = (parsed: ParsedCli, key: string): string | undefined => {
  const value = parsed.values[key];
  return typeof value === 'string' ? value : undefined;
};

export const boolValue = (parsed: ParsedCli, key: string): boolean =>
  parsed.values[key] === true;

export const arrayValue = (parsed: ParsedCli, key: string): string[] => {
  const value = parsed.values[key];
  if (Array.isArray(value)) return value;
  return typeof value === 'string' ? [value] : [];
};

export const required = (value: string | undefined, message: string): string => {
  if (!value) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'missing_parameter',
      stage: 'args',
      message,
    });
  }
  return value;
};

export const parseCi = (value: string | undefined, fallback = 95): number => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (parsed !== 90 && parsed !== 95 && parsed !== 99) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_ci',
      stage: 'args',
      message: `Confidence level must be 90, 95 or 99 (received ${value})`,
    });
  }
  return parsed;
};

export const parseSheet = (value: string | undefined): string | number | undefined => {
  if (value === undefined) return undefined;
  return /^\d+$/.test(value) ? Number(value) : value;
};

export const parseTimeout = (value: string | undefined): number => {
  if (value === undefined) return DEFAULT_TIMEOUT_MS;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `--timeout must be a positive number of seconds (received ${value})`,
    });
  }
  return Math.round(seconds * 1000);
};

export const parseMaxRows = (value: string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50_000) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `--max-rows must be an integer between 1 and 50000 (received ${value})`,
    });
  }
  return parsed;
};

export const parseRows = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `--rows must be a non-negative integer (received ${value})`,
    });
  }
  return Math.min(parsed, 50_000);
};

export const readParamsOverride = (parsed: ParsedCli): unknown => {
  const inline = stringValue(parsed, 'params');
  const file = stringValue(parsed, 'params-file');
  if (inline && file) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: 'Use either --params or --params-file, not both',
    });
  }
  const text = file
    ? (() => {
        try {
          return readFileSync(file, 'utf8');
        } catch (error) {
          throw new EngineError({
            code: 'E_PARAMS',
            kind: 'file_not_found',
            stage: 'params',
            message: error instanceof Error ? error.message : `Cannot read ${file}`,
            details: { path: file },
          });
        }
      })()
    : inline;
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new EngineError({
      code: 'E_PARAMS',
      kind: 'invalid_json',
      stage: 'params',
      message: '--params is not valid JSON',
    });
  }
};

export const isRenderFormat = (value: string): value is RenderFormat =>
  value === 'md' || value === 'html' || value === 'xlsx' || value === 'svg';

export const chartsMode = (value: string | undefined, format: string): ChartsMode => {
  if (value === undefined) return format === 'html' || format === 'svg' ? 'svg' : 'none';
  if (value === 'none' || value === 'svg') return value;
  throw new EngineError({
    code: 'E_ARGS',
    kind: 'invalid_value',
    stage: 'args',
    message: `--charts must be none or svg (received ${value})`,
  });
};

export const emitVerbose = (error: unknown, parsed: ParsedCli, io: CliIo): void => {
  if (boolValue(parsed, 'verbose') && error instanceof Error && error.stack) {
    io.err(`${error.stack}\n`);
  }
};

export const writeEnvelope = (
  envelope: RunEnvelope,
  out: string | undefined,
  io: CliIo
): void => {
  const text = `${JSON.stringify(envelope, null, 2)}\n`;
  if (!out) {
    io.out(text);
    return;
  }
  let target = out;
  try {
    if (statSync(out).isDirectory()) {
      target = `${out.replace(/\/$/, '')}/${envelope.status === 'ok' ? 'result.json' : 'failure.json'}`;
    }
  } catch {
    // The path does not exist yet: use it as a file.
  }
  if (envelope.status !== 'ok' && !target.endsWith('/failure.json')) {
    target = out.endsWith('/') ? `${out}failure.json` : `${out}.failure.json`;
  }
  try {
    writeFileSync(target, text, 'utf8');
  } catch (error) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'write_failed',
      stage: 'args',
      message: error instanceof Error ? error.message : `Cannot write ${target}`,
      details: { path: target },
    });
  }
};
