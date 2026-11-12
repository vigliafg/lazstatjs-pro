import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EngineError } from '../engine/errors';
import { renderChartSvgs } from '../engine/render/chart';
import { renderHtml } from '../engine/render/html';
import { renderMarkdown } from '../engine/render/markdown';
import { renderXlsx } from '../engine/render/xlsx';
import type { SuccessEnvelope } from '../engine/result';
import type { CliIo } from './types';

export type RenderFormat = 'md' | 'html' | 'xlsx' | 'svg';
export type ChartsMode = 'none' | 'svg';

const isDirectory = (path: string): boolean => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

const textTarget = (out: string | undefined, extension: string): string | null => {
  if (!out) return null;
  if (isDirectory(out)) return join(out, `report.${extension}`);
  return out;
};

const requireOut = (out: string | undefined, format: string): string => {
  if (!out) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'missing_parameter',
      stage: 'args',
      message: `--out is required for ${format} output`,
    });
  }
  return out;
};

const writeText = (text: string, out: string | undefined, extension: string, io: CliIo): void => {
  const target = textTarget(out, extension);
  if (!target) {
    io.out(text);
    return;
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

const svgTargets = (out: string, entries: { key: string }[]): string[] => {
  mkdirSync(out, { recursive: true });
  const used = new Set<string>();
  return entries.map(entry => {
    const base = entry.key || 'chart';
    let name = `${base}.svg`;
    let counter = 2;
    while (used.has(name)) {
      name = `${base}-${counter}.svg`;
      counter += 1;
    }
    used.add(name);
    return join(out, name);
  });
};

export const renderEnvelope = async (
  envelope: SuccessEnvelope,
  format: RenderFormat,
  out: string | undefined,
  charts: ChartsMode,
  io: CliIo,
  quiet = false,
  includeDataSheet = false
): Promise<void> => {
  if (format === 'md') {
    writeText(renderMarkdown(envelope), out, 'md', io);
    return;
  }
  if (format === 'html') {
    const svgs = charts === 'svg' ? await renderChartSvgs(envelope.result) : [];
    writeText(renderHtml(envelope, svgs), out, 'html', io);
    return;
  }
  if (format === 'xlsx') {
    const target = requireOut(out, 'XLSX');
    if (includeDataSheet && !envelope.data) {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'missing_data',
        stage: 'render',
        message: 'The envelope has no data for --include-data-sheet',
      });
    }
    const file = isDirectory(target) ? join(target, 'result.xlsx') : target;
    const bytes = renderXlsx(envelope, includeDataSheet);
    try {
      writeFileSync(file, Buffer.from(bytes));
    } catch (error) {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'write_failed',
        stage: 'args',
        message: error instanceof Error ? error.message : `Cannot write ${file}`,
        details: { path: file },
      });
    }
    if (!quiet) io.out(`${file}\n`);
    return;
  }

  const directory = requireOut(out, 'SVG');
  if (charts === 'none') {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: 'SVG output requires --charts svg',
    });
  }
  if (existsSync(directory) && !isDirectory(directory)) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `SVG output requires a directory: ${directory}`,
    });
  }
  const entries = await renderChartSvgs(envelope.result);
  if (entries.length === 0) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: 'This result has no charts to export',
    });
  }
  const targets = svgTargets(directory, entries);
  entries.forEach((entry, index) => {
    try {
      writeFileSync(targets[index], entry.svg, 'utf8');
    } catch (error) {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'write_failed',
        stage: 'args',
        message: error instanceof Error ? error.message : `Cannot write ${targets[index]}`,
        details: { path: targets[index] },
      });
    }
  });
  if (!quiet) for (const target of targets) io.out(`${target}\n`);
};

export const renderResultFile = async (
  resultPath: string,
  format: RenderFormat,
  out: string | undefined,
  charts: ChartsMode,
  io: CliIo,
  quiet = false,
  includeDataSheet = false
): Promise<void> => {
  let raw: string;
  try {
    raw = readFileSync(resultPath, 'utf8');
  } catch (error) {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'file_not_found',
      stage: 'load',
      message: error instanceof Error ? error.message : `Cannot read ${resultPath}`,
      details: { path: resultPath },
    });
  }
  let envelope: unknown;
  try {
    envelope = JSON.parse(raw) as unknown;
  } catch {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'parse_error',
      stage: 'load',
      message: 'The result file is not valid JSON',
      details: { path: resultPath },
    });
  }
  if (
    typeof envelope !== 'object' ||
    envelope === null ||
    (envelope as { status?: unknown }).status !== 'ok'
  ) {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_result',
      stage: 'args',
      message: 'render accepts only a successful run envelope (status "ok")',
      details: { path: resultPath },
    });
  }
  await renderEnvelope(
    envelope as SuccessEnvelope,
    format,
    out,
    charts,
    io,
    quiet,
    includeDataSheet
  );
};
