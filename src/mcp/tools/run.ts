import type { CallToolResult } from '@modelcontextprotocol/server';
import {
  CHART_KIND_COUNT,
  EngineError,
  RUNNER_COUNT,
  buildDiagnostics,
  buildParams,
  envelopeForFailure,
  envelopeForSuccess,
  errorExitCode,
  loadProject,
  paramsForAnalysis,
  runAnalysisWithWorkers,
  type DiagnosticsLevel,
  type EnvelopeInput,
  type RunTimings,
} from '../../engine';
import type { ProjectParams } from '../../io/project';
import type { Dataset } from '../../grid/types';
import { z } from 'zod';
import { inlineDataset, loadFromPath } from '../data';
import { McpError, failureFrom, toolFailure } from '../errors';
import type { RunGate } from '../gate';
import {
  DEFAULT_TIMEOUT_MS,
  MAX_ROWS,
  MAX_STRUCTURED_BYTES,
  MAX_TEXT_CHARS,
  MCP_VERSION,
} from '../limits';
import type { PathGuard } from '../paths';
import type { ResultCache } from '../resultCache';
import { chartList, fitPayload, summaryText } from '../summary';

const includeValues = ['summary', 'tables', 'report', 'charts'] as const;

export const runAnalysisInput = z.object({
  analysisId: z.string().min(1).optional(),
  dataPath: z.string().optional(),
  projectPath: z.string().optional(),
  data: z.unknown().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  set: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
      ])
    )
    .optional(),
  ciLevel: z.number().min(0).max(100).optional(),
  reportLocale: z.string().optional(),
  include: z.array(z.enum(includeValues)).optional(),
  diagnostics: z.enum(['none', 'summary', 'full']).optional(),
  timeoutMs: z.number().int().min(100).max(600_000).optional(),
  workers: z.union([z.string(), z.number().int().min(0).max(64)]).optional(),
});

export type RunAnalysisArgs = z.infer<typeof runAnalysisInput>;

export const runOutputSchema = z.object({
  schemaVersion: z.number(),
  status: z.literal('ok'),
  resultId: z.string().nullable(),
  cached: z.boolean(),
  ok: z.literal(true),
  engine: z.object({
    name: z.string(),
    version: z.string(),
    runners: z.number(),
    chartKinds: z.number(),
  }),
  analysis: z.object({ id: z.string(), label: z.string(), family: z.string() }),
  input: z.object({
    source: z.string(),
    format: z.string(),
    sha256: z.string(),
    rows: z.number(),
    columns: z.number(),
  }),
  params: z.unknown(),
  ciLevel: z.number(),
  reportLocale: z.string(),
  summary: z.string(),
  tables: z.array(z.unknown()),
  report: z.unknown().nullable(),
  charts: z.array(z.unknown()),
  panels: z.array(z.unknown()).optional(),
  warnings: z.array(z.string()),
  elapsedMs: z.number(),
  sections: z.array(z.string()),
  truncated: z.boolean(),
  timings: z.unknown().optional(),
});

interface ResolvedInput {
  analysisId: string;
  grid: Dataset;
  baseParams?: ProjectParams;
  envelopeInput: EnvelopeInput;
  ciLevel: number;
  reportLocale: string;
}

const normalizeCi = (value: number | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  return value > 1 ? value / 100 : value;
};

const sourceCount = (args: RunAnalysisArgs): number =>
  [args.dataPath, args.projectPath, args.data].filter(value => value !== undefined).length;

const setSpecs = (set: RunAnalysisArgs['set']): string[] =>
  Object.entries(set ?? {}).map(([key, value]) => {
    const text = Array.isArray(value) ? value.join(',') : String(value);
    return `${key}=${text}`;
  });

const projectInput = async (
  guard: PathGuard,
  args: RunAnalysisArgs
): Promise<ResolvedInput> => {
  const path = guard.resolve(args.projectPath as string);
  const loaded = loadProject(path);
  const snapshot = loaded.snapshot;
  const analysisId = args.analysisId ?? snapshot.settings.activeAnalysis;
  if (snapshot.grid.cols.length > 500) {
    throw new McpError({
      code: 'E_DATA',
      kind: 'too_many_columns',
      stage: 'load',
      message: `Project has ${snapshot.grid.cols.length} columns; the MCP limit is 500`,
    });
  }
  return {
    analysisId,
    grid: snapshot.grid,
    baseParams: snapshot.params,
    envelopeInput: {
      source: guard.display(path),
      format: 'lzs',
      sha256: loaded.sha256,
      rows: snapshot.grid.rows.length,
      columns: snapshot.grid.cols.length,
    },
    ciLevel: args.ciLevel ?? snapshot.settings.ciLevel,
    reportLocale: args.reportLocale ?? snapshot.settings.reportLocale,
  };
};

const dataInput = async (
  guard: PathGuard,
  args: RunAnalysisArgs
): Promise<ResolvedInput> => {
  if (!args.analysisId) {
    throw new McpError({
      code: 'E_ARGS',
      kind: 'missing_analysis',
      stage: 'args',
      message: 'analysisId is required when running a dataset without a project',
    });
  }
  const dataset =
    args.dataPath !== undefined
      ? await loadFromPath(guard, args.dataPath, { maxRows: MAX_ROWS })
      : inlineDataset(args.data);
  if (dataset.grid.cols.length > 500) {
    throw new McpError({
      code: 'E_DATA',
      kind: 'too_many_columns',
      stage: 'load',
      message: `Dataset has ${dataset.grid.cols.length} columns; the MCP limit is 500`,
    });
  }
  return {
    analysisId: args.analysisId,
    grid: dataset.grid,
    envelopeInput: {
      source: dataset.source,
      format: dataset.format,
      sha256: dataset.sha256,
      rows: dataset.grid.rows.length,
      columns: dataset.grid.cols.length,
    },
    ciLevel: args.ciLevel ?? 0.95,
    reportLocale: args.reportLocale ?? 'it',
  };
};

const abortable = async <T>(promise: Promise<T>, signal: AbortSignal): Promise<T> => {
  if (signal.aborted) {
    throw new McpError({
      code: 'E_CANCELLED',
      kind: 'cancelled',
      stage: 'execute',
      message: 'The request was cancelled',
    });
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () =>
      reject(
        new McpError({
          code: 'E_CANCELLED',
          kind: 'cancelled',
          stage: 'execute',
          message: 'The request was cancelled',
        })
      );
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      value => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      error => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      }
    );
  });
};

const timeoutError = (timeoutMs: number) =>
  new EngineError({
    code: 'E_TIMEOUT',
    kind: 'analysis_timeout',
    stage: 'execute',
    message: `Analysis exceeded the ${timeoutMs} ms timeout`,
    details: { timeoutMs },
    retryable: true,
  });

const runInsideTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(timeoutError(timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const failureResult = (
  error: unknown,
  analysisId: string | undefined,
  grid: Dataset | undefined,
  params: ProjectParams | undefined,
  level: DiagnosticsLevel,
  includeRowNumbers: boolean,
  envelopeInput?: EnvelopeInput,
  timings?: RunTimings
): CallToolResult => {
  const diagnostics = buildDiagnostics({
    error,
    grid: grid ?? null,
    params: params ?? null,
    analysisId,
    level,
    includeRowNumbers,
  });
  const failure = failureFrom(error, analysisId, diagnostics);
  const envelope = envelopeForFailure({
    error,
    engine: {
      name: 'lazstats',
      version: MCP_VERSION,
      runners: RUNNER_COUNT,
      chartKinds: CHART_KIND_COUNT,
    },
    input: envelopeInput ?? { source: '', format: '', sha256: '', rows: 0, columns: 0 },
    analysisId,
    params: params ? paramsForAnalysis(analysisId ?? '', params) : undefined,
    diagnostics,
    timings,
  });
  return toolFailure({
    ...failure,
    status: envelope.status,
    engine: envelope.engine,
    input: envelope.input,
    details: { ...failure.details, exitCode: errorExitCode(envelope.error.code) },
  });
};

export const runAnalysisTool = async (
  args: RunAnalysisArgs,
  guard: PathGuard,
  cache: ResultCache,
  gate: RunGate,
  signal: AbortSignal,
  onProgress?: (message: string, progress: number) => void
): Promise<CallToolResult> => {
  if (sourceCount(args) !== 1) {
    throw new McpError({
      code: 'E_ARGS',
      kind: 'invalid_source',
      stage: 'args',
      message: 'Provide exactly one of dataPath, projectPath or data',
    });
  }
  const started = Date.now();
  let analysisId = args.analysisId;
  let grid: Dataset | undefined;
  let params: ProjectParams | undefined;
  let envelopeInput: EnvelopeInput | undefined;
  let ciLevel = normalizeCi(args.ciLevel, 0.95);
  let reportLocale = args.reportLocale ?? 'it';
  const level = args.diagnostics ?? 'summary';
  const includeRowNumbers = false;
  const include = args.include ?? ['summary', 'tables', 'report'];
  const timeoutMs = args.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const source =
      args.projectPath !== undefined
        ? await projectInput(guard, args)
        : await dataInput(guard, args);
    analysisId = source.analysisId;
    grid = source.grid;
    ciLevel = normalizeCi(args.ciLevel, source.ciLevel);
    reportLocale = args.reportLocale ?? source.reportLocale;
    params = buildParams({
      analysisId: source.analysisId,
      ...(source.baseParams ? { base: source.baseParams } : {}),
      ...(args.params !== undefined ? { override: args.params } : {}),
      set: setSpecs(args.set),
      width: source.grid.cols.length,
      grid: source.grid,
    });
    envelopeInput = source.envelopeInput;
    onProgress?.('starting', 0);
  } catch (error) {
    return failureResult(
      error,
      analysisId,
      grid,
      params,
      level,
      includeRowNumbers,
      envelopeInput
    );
  }

  try {
    return await gate.run(async () => {
      let value;
      onProgress?.('computing', 1);
      try {
        value = await abortable(
          runInsideTimeout(
            runAnalysisWithWorkers(
              {
                analysisId: analysisId as string,
                grid: grid as Dataset,
                params: params as ProjectParams,
                ciLevel,
                reportLocale,
              },
              {
                timeoutMs,
                signal,
                ...(args.workers !== undefined ? { workers: args.workers } : {}),
              }
            ),
            timeoutMs
          ),
          signal
        );
      } catch (error) {
        return failureResult(
          error,
          analysisId,
          grid,
          params,
          level,
          includeRowNumbers,
          envelopeInput,
          { totalMs: Date.now() - started }
        );
      }
      if (!value.ok) {
        const error = new EngineError({
          code: 'E_RUN',
          kind: 'runner_rejected',
          stage: 'execute',
          message: value.reason,
          details: { analysisId },
        });
        return failureResult(
          error,
          analysisId,
          grid,
          params,
          level,
          includeRowNumbers,
          envelopeInput,
          { totalMs: Date.now() - started }
        );
      }
      onProgress?.('finishing', 2);
      const timings = { totalMs: Date.now() - started };
      const envelope = envelopeForSuccess({
        analysisId: analysisId as string,
        engine: {
          name: 'lazstats',
          version: MCP_VERSION,
          runners: RUNNER_COUNT,
          chartKinds: CHART_KIND_COUNT,
        },
        input: envelopeInput as EnvelopeInput,
        params: paramsForAnalysis(analysisId as string, params as ProjectParams),
        ciLevel,
        reportLocale,
        result: value,
        timings,
        generatedAt: new Date().toISOString(),
      });
      const resultId = cache.put(envelope, '');
      const summary = summaryText(envelope, resultId || '(not cached)');
      const withTables = include.includes('tables');
      const withReport = include.includes('report');
      const withCharts = include.includes('charts');
      const structuredContent = {
        schemaVersion: 1,
        status: 'ok',
        resultId: resultId || null,
        cached: resultId !== '',
        ok: true,
        engine: envelope.engine,
        analysis: envelope.analysis,
        input: envelope.input,
        params: envelope.params,
        ciLevel: envelope.ciLevel,
        reportLocale: envelope.reportLocale,
        summary,
        tables: withTables ? envelope.result.tables : [],
        report: withReport ? envelope.result.report : null,
        charts: withCharts ? chartList(envelope.result) : [],
        ...(withCharts && envelope.result.panels ? { panels: envelope.result.panels } : {}),
        warnings: envelope.warnings,
        elapsedMs: timings.totalMs,
        sections: include,
        truncated: false,
        timings,
      };
      const text = summary.length > MAX_TEXT_CHARS ? `${summary.slice(0, MAX_TEXT_CHARS - 3)}...` : summary;
      return {
        content: [{ type: 'text', text }],
        structuredContent: fitPayload(structuredContent, MAX_STRUCTURED_BYTES),
      };
    });
  } catch (error) {
    return failureResult(error, analysisId, grid, params, level, includeRowNumbers, envelopeInput);
  }
};
