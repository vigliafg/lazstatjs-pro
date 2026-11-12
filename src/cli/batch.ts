import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EngineError, errorExitCode, failureFromError } from '../engine';
import type { CliIo, ParsedCli } from './types';

type RunJob = (parsed: ParsedCli, io: CliIo) => Promise<number>;

interface BatchJob {
  id: string;
  data?: string;
  project?: string;
  analysis?: string;
  set: Record<string, unknown>;
  ciLevel?: number;
  params?: Record<string, unknown>;
  timeout?: string | number;
}

interface JobSummary {
  id: string;
  status: 'ok' | 'rejected' | 'error' | 'skipped';
  exitCode: number | null;
  durationMs: number;
  output?: string;
  error?: { code: string; kind: string; message: string };
}

interface BatchSummary {
  status: 'ok' | 'partial' | 'failed';
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  durationMs: number;
  exitCode: number;
  jobs: JobSummary[];
}

const stringValue = (parsed: ParsedCli, key: string): string | undefined => {
  const value = parsed.values[key];
  return typeof value === 'string' ? value : undefined;
};

const boolValue = (parsed: ParsedCli, key: string): boolean => parsed.values[key] === true;

const invalid = (kind: string, message: string): EngineError =>
  new EngineError({ code: 'E_ARGS', kind, stage: 'args', message });

const safeId = (value: string): boolean =>
  /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && value !== '.' && value !== '..';

const parseJobs = (path: string): BatchJob[] => {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new EngineError({
      code: 'E_DATA',
      kind: 'file_not_found',
      stage: 'load',
      message: error instanceof Error ? error.message : `Cannot read ${path}`,
      details: { path },
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw invalid('invalid_json', 'The jobs file is not valid JSON');
  }
  const rawJobs =
    Array.isArray(parsed) ? parsed : (parsed as { jobs?: unknown } | null)?.jobs;
  if (!Array.isArray(rawJobs) || rawJobs.length === 0) {
    throw invalid('invalid_jobs', 'The jobs file must contain a non-empty jobs array');
  }
  const ids = new Set<string>();
  return rawJobs.map((raw, index): BatchJob => {
    if (typeof raw !== 'object' || raw === null) {
      throw invalid('invalid_jobs', `Job ${index} must be an object`);
    }
    const job = raw as Record<string, unknown>;
    if (typeof job.id !== 'string' || !safeId(job.id)) {
      throw invalid('invalid_job_id', `Job ${index} has a missing or unsafe id`);
    }
    if (ids.has(job.id)) throw invalid('duplicate_job_id', `Duplicate job id: ${job.id}`);
    ids.add(job.id);
    if (job.data !== undefined && typeof job.data !== 'string') {
      throw invalid('invalid_jobs', `Job ${job.id}: data must be a path`);
    }
    if (job.project !== undefined && typeof job.project !== 'string') {
      throw invalid('invalid_jobs', `Job ${job.id}: project must be a path`);
    }
    if (job.data && job.project) {
      throw invalid('invalid_jobs', `Job ${job.id}: use either data or project, not both`);
    }
    if (!job.data && !job.project) {
      throw invalid('invalid_jobs', `Job ${job.id}: data or project is required`);
    }
    if (job.analysis !== undefined && typeof job.analysis !== 'string') {
      throw invalid('invalid_jobs', `Job ${job.id}: analysis must be an id`);
    }
    if (job.set !== undefined && (typeof job.set !== 'object' || job.set === null || Array.isArray(job.set))) {
      throw invalid('invalid_jobs', `Job ${job.id}: set must be an object`);
    }
    if (job.ciLevel !== undefined && ![90, 95, 99].includes(Number(job.ciLevel))) {
      throw invalid('invalid_ci', `Job ${job.id}: ciLevel must be 90, 95 or 99`);
    }
    if (job.params !== undefined && (typeof job.params !== 'object' || job.params === null || Array.isArray(job.params))) {
      throw invalid('invalid_jobs', `Job ${job.id}: params must be an object`);
    }
    return {
      id: job.id,
      ...(typeof job.data === 'string' ? { data: job.data } : {}),
      ...(typeof job.project === 'string' ? { project: job.project } : {}),
      ...(typeof job.analysis === 'string' ? { analysis: job.analysis } : {}),
      set: (job.set as Record<string, unknown> | undefined) ?? {},
      ...(job.ciLevel !== undefined ? { ciLevel: Number(job.ciLevel) } : {}),
      ...(job.params ? { params: job.params as Record<string, unknown> } : {}),
      ...(job.timeout !== undefined ? { timeout: String(job.timeout) } : {}),
    };
  });
};

const setValue = (value: unknown): string =>
  Array.isArray(value) ? value.map(item => String(item)).join(',') : String(value);

const jobArgs = (
  job: BatchJob,
  output: string,
  workers: string | undefined,
  timeout: string | undefined,
  diagnostics: string | undefined,
  includeRowNumbers: boolean
): ParsedCli => {
  const values: ParsedCli['values'] = { out: output };
  if (diagnostics !== undefined) values.diagnostics = diagnostics;
  if (includeRowNumbers) values['include-row-numbers'] = true;
  if (job.data) values.data = job.data;
  if (job.project) values.project = job.project;
  if (job.analysis) values.analysis = job.analysis;
  if (workers !== undefined) values.workers = workers;
  const effectiveTimeout = job.timeout ?? timeout;
  if (effectiveTimeout !== undefined) values.timeout = String(effectiveTimeout);
  if (job.ciLevel !== undefined) values.ci = String(job.ciLevel);
  if (job.params) values.params = JSON.stringify(job.params);
  const sets = Object.entries(job.set).map(([key, value]) => `${key}=${setValue(value)}`);
  if (sets.length > 0) values.set = sets;
  return { command: 'run', positionals: [], values };
};

const readFailure = (
  path: string
): { status: 'rejected' | 'error'; error: { code: string; kind: string; message: string } } | null => {
  try {
    const envelope = JSON.parse(readFileSync(path, 'utf8')) as {
      status?: string;
      error?: { code?: string; kind?: string; message?: string };
    };
    if (envelope.status !== 'rejected' && envelope.status !== 'error') return null;
    return {
      status: envelope.status,
      error: {
        code: envelope.error?.code ?? 'E_INTERNAL',
        kind: envelope.error?.kind ?? 'unknown',
        message: envelope.error?.message ?? 'The job failed',
      },
    };
  } catch {
    return null;
  }
};

const executionPrecedence = (current: number, next: number): number => {
  if (current === 0) return next;
  if (next === 0) return current;
  const order = [4, 5, 3, 2];
  const currentRank = order.indexOf(current);
  const nextRank = order.indexOf(next);
  if (nextRank < 0) return current;
  if (currentRank < 0) return next;
  return nextRank < currentRank ? next : current;
};

const runOne = async (
  job: BatchJob,
  out: string,
  workers: string | undefined,
  timeout: string | undefined,
  diagnostics: string | undefined,
  includeRowNumbers: boolean,
  runJob: RunJob
): Promise<JobSummary> => {
  const directory = join(out, job.id);
  mkdirSync(directory, { recursive: true });
  const started = Date.now();
  let stderr = '';
  const capture: CliIo = {
    out: () => undefined,
    err: text => {
      stderr += text;
    },
  };
  let exitCode: number;
  try {
    exitCode = await runJob(
      jobArgs(job, directory, workers, timeout, diagnostics, includeRowNumbers),
      capture
    );
  } catch (error) {
    const failure = failureFromError(error);
    return {
      id: job.id,
      status: failure.status,
      exitCode: errorExitCode(failure.error.code),
      durationMs: Date.now() - started,
      error: {
        code: failure.error.code,
        kind: failure.error.kind,
        message: failure.error.message,
      },
    };
  }
  const failure = readFailure(join(directory, 'failure.json'));
  if (failure) {
    return {
      id: job.id,
      status: failure.status,
      exitCode,
      durationMs: Date.now() - started,
      error: failure.error,
    };
  }
  const output = join(directory, 'result.json');
  if (exitCode !== 0 || stderr.trim()) {
    return {
      id: job.id,
      status: 'error',
      exitCode,
      durationMs: Date.now() - started,
      output,
      error: {
        code: 'E_INTERNAL',
        kind: 'missing_result',
        message: stderr.trim() || `Job ${job.id} did not produce a result`,
      },
    };
  }
  return {
    id: job.id,
    status: 'ok',
    exitCode,
    durationMs: Date.now() - started,
    output,
  };
};

export const batchCommand = async (
  parsed: ParsedCli,
  io: CliIo,
  runJob: RunJob
): Promise<number> => {
  const jobsPath = stringValue(parsed, 'jobs');
  if (!jobsPath) throw invalid('missing_parameter', 'batch requires --jobs <file>');
  const out = stringValue(parsed, 'out');
  if (!out) throw invalid('missing_parameter', 'batch requires --out <directory>');
  const rawConcurrency = stringValue(parsed, 'concurrency');
  const concurrency = rawConcurrency === undefined ? 2 : Number(rawConcurrency);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 64) {
    throw invalid('invalid_value', '--concurrency must be an integer between 1 and 64');
  }
  const jobs = parseJobs(jobsPath);
  mkdirSync(out, { recursive: true });
  const continueOnError = boolValue(parsed, 'continue-on-error');
  const workers = stringValue(parsed, 'workers');
  const timeout = stringValue(parsed, 'timeout');
  const diagnostics = stringValue(parsed, 'diagnostics');
  const includeRowNumbers = boolValue(parsed, 'include-row-numbers');
  const summaries = new Array<JobSummary | undefined>(jobs.length);
  let cursor = 0;
  let stop = false;
  let firstFailure = 0;
  const started = Date.now();

  const worker = async (): Promise<void> => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      if (stop) {
        summaries[index] = {
          id: jobs[index].id,
          status: 'skipped',
          exitCode: null,
          durationMs: 0,
        };
        continue;
      }
      const summary = await runOne(
        jobs[index],
        out,
        workers,
        timeout,
        diagnostics,
        includeRowNumbers,
        runJob
      );
      summaries[index] = summary;
      if (summary.exitCode !== 0) {
        if (firstFailure === 0) firstFailure = summary.exitCode ?? 0;
        if (!continueOnError) stop = true;
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker())
  );

  const completed = summaries.filter((summary): summary is JobSummary => summary !== undefined);
  const failed = completed.filter(summary => summary.status !== 'ok' && summary.status !== 'skipped');
  const skipped = completed.filter(summary => summary.status === 'skipped').length;
  let exitCode = 0;
  if (continueOnError) {
    for (const summary of failed) exitCode = executionPrecedence(exitCode, summary.exitCode ?? 4);
  } else {
    exitCode = firstFailure;
  }
  const summary: BatchSummary = {
    status: failed.length === 0 ? 'ok' : continueOnError ? 'partial' : 'failed',
    total: jobs.length,
    succeeded: completed.filter(entry => entry.status === 'ok').length,
    failed: failed.length,
    skipped,
    durationMs: Date.now() - started,
    exitCode,
    jobs: completed,
  };
  io.out(`${JSON.stringify(summary, null, 2)}\n`);
  return exitCode;
};
