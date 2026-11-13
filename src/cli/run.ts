import { printAnalyses, printInspect, printProjectInspect, printSchema } from './format';
import { printHelp } from './help';
import { renderEnvelope, renderResultFile, type RenderFormat } from './output';
import type { CliIo, ParsedCli } from './types';
import {
  arrayValue,
  boolValue,
  chartsMode,
  emitVerbose,
  isRenderFormat,
  parseCi,
  parseCli,
  parseMaxRows,
  parseRows,
  parseSheet,
  parseTimeout,
  readParamsOverride,
  required,
  stringValue,
  writeEnvelope,
} from './common';
import {
  analysisSchema,
  buildDiagnostics,
  buildParams,
  catalogEntries,
  CHART_KIND_COUNT,
  engineInfo,
  envelopeForFailure,
  envelopeForSuccess,
  errorExitCode,
  failureFromError,
  inspectProject,
  isRunnableAnalysis,
  loadDataset,
  loadProject,
  paramsForAnalysis,
  runAnalysisWithWorkers,
  resolveWorkerCount,
  EngineError,
  RUNNER_COUNT,
  type DiagnosticsLevel,
  type FailureEnvelope,
  type RunTimings,
  type LoadedDataset,
  type SuccessEnvelope,
} from '../engine';

export const CLI_VERSION = '0.35.0';

const defaultIo: CliIo = {
  out: text => process.stdout.write(text),
  err: text => process.stderr.write(text),
};

const engineInfoValue = () =>
  engineInfo(CLI_VERSION, RUNNER_COUNT, CHART_KIND_COUNT);

const parseDiagnosticsLevel = (value: string | undefined): DiagnosticsLevel => {
  if (value === undefined) return 'summary';
  if (value === 'none' || value === 'summary' || value === 'full') return value;
  throw new EngineError({
    code: 'E_ARGS',
    kind: 'invalid_value',
    stage: 'args',
    message: `--diagnostics must be none, summary or full (received ${value})`,
  });
};

const runCommand = async (parsed: ParsedCli, io: CliIo): Promise<number> => {
  const dataPath = stringValue(parsed, 'data');
  const projectPath = stringValue(parsed, 'project');
  if (dataPath && projectPath) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: 'Use either --data or --project, not both',
    });
  }
  if (!dataPath && !projectPath) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'missing_parameter',
      stage: 'args',
      message: 'run requires --data <file> or --project <file.lzs>',
    });
  }

  const formatValue = stringValue(parsed, 'format') ?? 'json';
  if (formatValue !== 'json' && !isRenderFormat(formatValue)) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'unsupported_configuration',
      stage: 'args',
      message: `Unknown output format: ${formatValue}`,
    });
  }
  const format = formatValue as 'json' | RenderFormat;
  const charts = chartsMode(stringValue(parsed, 'charts'), format);
  const workers = resolveWorkerCount(stringValue(parsed, 'workers'));
  const timeoutMs = parseTimeout(stringValue(parsed, 'timeout'));
  const diagnosticsLevel = parseDiagnosticsLevel(stringValue(parsed, 'diagnostics'));
  const includeRowNumbers = boolValue(parsed, 'include-row-numbers');
  const startedAt = Date.now();
  let loadMs: number | undefined;
  let paramsMs: number | undefined;
  let runMs: number | undefined;
  const timingsFor = (): RunTimings | undefined =>
    boolValue(parsed, 'timings')
      ? {
          totalMs: Date.now() - startedAt,
          ...(loadMs !== undefined ? { loadMs } : {}),
          ...(paramsMs !== undefined ? { paramsMs } : {}),
          ...(runMs !== undefined ? { runMs } : {}),
        }
      : undefined;
  const diagnosticsFor = (
    error: unknown,
    grid: LoadedDataset['grid'] | null,
    params?: Parameters<typeof buildDiagnostics>[0]['params'],
    analysis?: string
  ) =>
    buildDiagnostics({
      error,
      grid,
      ...(params ? { params } : {}),
      ...(analysis ? { analysisId: analysis } : {}),
      level: diagnosticsLevel,
      includeRowNumbers,
    });

  let source = dataPath ?? projectPath ?? '';
  let formatName = 'unknown';
  let sha256 = '';
  let grid: LoadedDataset['grid'] | null = null;
  let baseParams;
  let diagnosticsParams: ReturnType<typeof buildParams> | undefined;
  let analysisId = stringValue(parsed, 'analysis');
  let defaultCi = 95;
  let defaultLocale = 'it';

  try {
    if (dataPath) {
      const loaded = await loadDataset(dataPath, {
        ...(stringValue(parsed, 'delimiter') ? { delimiter: stringValue(parsed, 'delimiter') } : {}),
        ...(boolValue(parsed, 'header') ? { header: true } : {}),
        ...(boolValue(parsed, 'no-header') ? { header: false } : {}),
        ...(boolValue(parsed, 'decimal-comma') ? { decimalComma: true } : {}),
        ...(stringValue(parsed, 'sheet') ? { sheet: parseSheet(stringValue(parsed, 'sheet')) } : {}),
        ...(stringValue(parsed, 'types') ? { types: stringValue(parsed, 'types') } : {}),
        ...(stringValue(parsed, 'missing') ? { missing: stringValue(parsed, 'missing') } : {}),
        ...(stringValue(parsed, 'format-input')
          ? { format: stringValue(parsed, 'format-input') }
          : {}),
      });
      grid = loaded.grid;
      source = loaded.source;
      formatName = loaded.format;
      sha256 = loaded.sha256;
      loadMs = Date.now() - startedAt;
      if (!analysisId) {
        throw new EngineError({
          code: 'E_ARGS',
          kind: 'missing_parameter',
          stage: 'args',
          message: 'run --data requires --analysis <id>',
        });
      }
    } else if (projectPath) {
      const loaded = loadProject(projectPath);
      grid = loaded.snapshot.grid;
      baseParams = loaded.snapshot.params;
      source = loaded.source;
      formatName = 'lzs';
      sha256 = loaded.sha256;
      defaultCi = loaded.snapshot.settings.ciLevel;
      defaultLocale = loaded.snapshot.settings.reportLocale;
      analysisId = analysisId ?? loaded.snapshot.settings.activeAnalysis;
      loadMs = Date.now() - startedAt;
      if (analysisId === 'assistant') {
        throw new EngineError({
          code: 'E_ANALYSIS',
          kind: 'unknown_analysis',
          stage: 'analysis',
          message: 'The project active analysis is the UI Assistant, not a runnable procedure',
          details: { analysisId },
        });
      }
    }
  } catch (error) {
    loadMs = Date.now() - startedAt;
    const input = {
      source,
      format: formatName,
      sha256,
      rows: grid?.rows.length ?? 0,
      columns: grid?.cols.length ?? 0,
    };
    const envelope = envelopeForFailure({
      error,
      engine: engineInfoValue(),
      input,
      ...(analysisId ? { analysisId } : {}),
      diagnostics: diagnosticsFor(error, grid, undefined, analysisId),
      timings: timingsFor(),
      ...(boolValue(parsed, 'timestamps') ? { generatedAt: new Date().toISOString() } : {}),
    });
    emitVerbose(error, parsed, io);
    writeEnvelope(envelope, stringValue(parsed, 'out'), io);
    return errorExitCode(failureFromError(error).error.code);
  }

  const paramsStarted = Date.now();
  let params: ReturnType<typeof buildParams>;
  let ciLevel: number;
  let reportLocale: string;
  try {
    if (!analysisId || !grid) {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'missing_parameter',
        stage: 'args',
        message: 'No analysis selected',
      });
    }
    if (!isRunnableAnalysis(analysisId)) {
      throw new EngineError({
        code: 'E_ANALYSIS',
        kind: 'unknown_analysis',
        stage: 'analysis',
        message: `Unknown or non-runnable analysis: ${analysisId}`,
        details: { analysisId },
      });
    }
    params = buildParams({
      analysisId,
      ...(baseParams ? { base: baseParams } : {}),
      override: readParamsOverride(parsed),
      set: arrayValue(parsed, 'set'),
      width: grid.cols.length,
      grid,
    });
    diagnosticsParams = params;
    ciLevel = parseCi(stringValue(parsed, 'ci'), defaultCi);
    reportLocale = stringValue(parsed, 'report-locale') ?? defaultLocale;
    paramsMs = Date.now() - paramsStarted;
  } catch (error) {
    paramsMs = Date.now() - paramsStarted;
    const envelope = envelopeForFailure({
      error,
      engine: engineInfoValue(),
      input: {
        source,
        format: formatName,
        sha256,
        rows: grid?.rows.length ?? 0,
        columns: grid?.cols.length ?? 0,
      },
      ...(analysisId ? { analysisId } : {}),
      diagnostics: diagnosticsFor(error, grid, diagnosticsParams, analysisId),
      timings: timingsFor(),
      ...(boolValue(parsed, 'timestamps') ? { generatedAt: new Date().toISOString() } : {}),
    });
    emitVerbose(error, parsed, io);
    writeEnvelope(envelope, stringValue(parsed, 'out'), io);
    return errorExitCode(failureFromError(error).error.code);
  }

  const runStarted = Date.now();
  let result;
  try {
    result = await runAnalysisWithWorkers(
      {
        analysisId,
        grid,
        params,
        ciLevel,
        reportLocale,
      },
      { workers, timeoutMs }
    );
    runMs = Date.now() - runStarted;
  } catch (error) {
    runMs = Date.now() - runStarted;
    const envelope = envelopeForFailure({
      error,
      engine: engineInfoValue(),
      input: { source, format: formatName, sha256, rows: grid.rows.length, columns: grid.cols.length },
      analysisId,
      params: paramsForAnalysis(analysisId, params),
      diagnostics: diagnosticsFor(error, grid, params, analysisId),
      timings: timingsFor(),
      ...(boolValue(parsed, 'timestamps') ? { generatedAt: new Date().toISOString() } : {}),
    });
    emitVerbose(error, parsed, io);
    writeEnvelope(envelope, stringValue(parsed, 'out'), io);
    return errorExitCode(failureFromError(error).error.code);
  }

  if (!result.ok) {
    const rejection = new EngineError({
      code: 'E_RUN',
      kind: 'runner_rejected',
      stage: 'execute',
      message: result.reason,
      details: { analysisId },
    });
    const envelope: FailureEnvelope = envelopeForFailure({
      error: rejection,
      engine: engineInfoValue(),
      input: { source, format: formatName, sha256, rows: grid.rows.length, columns: grid.cols.length },
      analysisId,
      params: paramsForAnalysis(analysisId, params),
      diagnostics: diagnosticsFor(rejection, grid, params, analysisId),
      result,
      timings: timingsFor(),
      ...(boolValue(parsed, 'timestamps') ? { generatedAt: new Date().toISOString() } : {}),
    });
    writeEnvelope(envelope, stringValue(parsed, 'out'), io);
    return 2;
  }

  const envelope: SuccessEnvelope = envelopeForSuccess({
    analysisId,
    engine: engineInfoValue(),
    input: { source, format: formatName, sha256, rows: grid.rows.length, columns: grid.cols.length },
    params: paramsForAnalysis(analysisId, params),
    ciLevel,
    reportLocale,
    result,
    timings: timingsFor(),
    ...(boolValue(parsed, 'timestamps') ? { generatedAt: new Date().toISOString() } : {}),
  });
  if (
    boolValue(parsed, 'include-data') ||
    (format === 'xlsx' && boolValue(parsed, 'include-data-sheet'))
  ) {
    envelope.data = { cols: grid.cols, rows: grid.rows };
  }
  if (format === 'json') {
    writeEnvelope(envelope, stringValue(parsed, 'out'), io);
  } else {
    const renderStarted = Date.now();
    await renderEnvelope(
      envelope,
      format,
      stringValue(parsed, 'out'),
      charts,
      io,
      boolValue(parsed, 'quiet'),
      boolValue(parsed, 'include-data-sheet')
    );
    if (boolValue(parsed, 'timings')) {
      envelope.timings = {
        ...(envelope.timings ?? { totalMs: 0 }),
        renderMs: Date.now() - renderStarted,
        totalMs: Date.now() - startedAt,
      };
    }
  }
  return 0;
};

export const runCli = async (
  args: string[],
  io: CliIo = defaultIo
): Promise<number> => {
  let parsed: ParsedCli;
  try {
    parsed = parseCli(args);
  } catch (error) {
    io.err(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }

  if (boolValue(parsed, 'version')) {
    io.out(`${CLI_VERSION}\n`);
    return 0;
  }
  if (boolValue(parsed, 'help') || parsed.command === 'help' || !parsed.command) {
    const topic =
      parsed.command === 'help'
        ? parsed.positionals.join(' ')
        : parsed.command === 'project' &&
            (parsed.positionals[0] === 'inspect' || parsed.positionals[0] === 'run')
          ? `project ${parsed.positionals[0]}`
          : (parsed.command ?? undefined);
    try {
      printHelp(io, CLI_VERSION, topic || undefined, boolValue(parsed, 'json'));
      return 0;
    } catch (error) {
      const failure = failureFromError(error);
      io.err(`${failure.error.code}/${failure.error.kind}: ${failure.error.message}\n`);
      emitVerbose(error, parsed, io);
      return errorExitCode(failure.error.code);
    }
  }

  try {
    const json = boolValue(parsed, 'json');
    switch (parsed.command) {
      case 'analyses': {
        const family = stringValue(parsed, 'family');
        const entries = catalogEntries(boolValue(parsed, 'all')).filter(
          entry => !family || entry.family === family
        );
        printAnalyses(entries, json, io, boolValue(parsed, 'verbose'));
        return 0;
      }
      case 'schema': {
        const id = required(parsed.positionals[0], 'schema requires an analysis id');
        const schema = analysisSchema(id);
        if (!schema) {
          throw new EngineError({
            code: 'E_ANALYSIS',
            kind: 'unknown_analysis',
            stage: 'analysis',
            message: `Unknown or non-runnable analysis: ${id}`,
            details: { analysisId: id },
          });
        }
        printSchema(schema, json, io);
        return 0;
      }
      case 'inspect': {
        const path = required(parsed.positionals[0], 'inspect requires a dataset path');
        const maxRows = parseMaxRows(stringValue(parsed, 'max-rows'));
        const loaded = await loadDataset(path, {
          ...(stringValue(parsed, 'delimiter') ? { delimiter: stringValue(parsed, 'delimiter') } : {}),
          ...(boolValue(parsed, 'header') ? { header: true } : {}),
          ...(boolValue(parsed, 'no-header') ? { header: false } : {}),
          ...(boolValue(parsed, 'decimal-comma') ? { decimalComma: true } : {}),
          ...(stringValue(parsed, 'sheet') ? { sheet: parseSheet(stringValue(parsed, 'sheet')) } : {}),
          ...(stringValue(parsed, 'types') ? { types: stringValue(parsed, 'types') } : {}),
          ...(stringValue(parsed, 'missing') ? { missing: stringValue(parsed, 'missing') } : {}),
          ...(stringValue(parsed, 'format-input')
            ? { format: stringValue(parsed, 'format-input') }
            : {}),
          ...(maxRows !== undefined ? { maxRows } : {}),
        });
        printInspect(loaded, parseRows(stringValue(parsed, 'rows'), 5), json, io);
        return 0;
      }
      case 'run':
        return await runCommand(parsed, io);
      case 'project': {
        const action = required(
          parsed.positionals[0],
          'project requires inspect or run'
        );
        const path = required(
          parsed.positionals[1],
          `project ${action} requires a .lzs path`
        );
        if (action === 'inspect') {
          printProjectInspect(inspectProject(path), json, io);
          return 0;
        }
        if (action === 'run') {
          return await runCommand(
            {
              ...parsed,
              command: 'run',
              positionals: [],
              values: { ...parsed.values, project: path },
            },
            io
          );
        }
        throw new EngineError({
          code: 'E_ARGS',
          kind: 'unknown_project_command',
          stage: 'args',
          message: `Unknown project command: ${action}`,
          details: { action },
        });
      }
      case 'batch': {
        const { batchCommand } = await import('./batch');
        return await batchCommand(parsed, io, runCommand);
      }
      case 'render': {
        const resultPath =
          stringValue(parsed, 'result') ?? parsed.positionals[0];
        if (!resultPath) {
          throw new EngineError({
            code: 'E_ARGS',
            kind: 'missing_parameter',
            stage: 'args',
            message: 'render requires --result <file> or a result path',
          });
        }
        const format = stringValue(parsed, 'format') ?? 'html';
        if (!isRenderFormat(format)) {
          throw new EngineError({
            code: 'E_ARGS',
            kind: 'unsupported_configuration',
            stage: 'args',
            message: `render format must be md, html, xlsx or svg (received ${format})`,
          });
        }
        await renderResultFile(
          resultPath,
          format,
          stringValue(parsed, 'out'),
          chartsMode(stringValue(parsed, 'charts'), format),
          io,
          boolValue(parsed, 'quiet'),
          boolValue(parsed, 'include-data-sheet')
        );
        return 0;
      }
      default:
        throw new EngineError({
          code: 'E_ARGS',
          kind: 'unknown_command',
          stage: 'args',
          message: `Unknown command: ${parsed.command}`,
        });
    }
  } catch (error) {
    const failure = failureFromError(error);
    io.err(`${failure.error.code}/${failure.error.kind}: ${failure.error.message}\n`);
    emitVerbose(error, parsed, io);
    return errorExitCode(failure.error.code);
  }
};

export const isCliEntry = (url: string): boolean =>
  url === new URL(import.meta.url).href;
