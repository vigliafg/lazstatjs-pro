import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeWorkerPool } from '../engine';
import { runCli } from './run';
import type { CliIo } from './types';

const capture = (): { io: CliIo; stdout: () => string; stderr: () => string } => {
  let out = '';
  let err = '';
  return {
    io: { out: text => { out += text; }, err: text => { err += text; } },
    stdout: () => out,
    stderr: () => err,
  };
};

const writeJobs = (directory: string, jobs: unknown): string => {
  const path = join(directory, 'jobs.json');
  writeFileSync(path, JSON.stringify({ jobs }), 'utf8');
  return path;
};

test('batch writes result and failure files with continue-on-error', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-batch-'));
  try {
    const jobs = writeJobs(directory, [
      {
        id: 'iris-ok',
        data: 'samples/descriptive/iris/data.csv',
        analysis: 'descriptive',
        set: { descVars: 'Sepal.Length,Sepal.Width' },
        ciLevel: 95,
      },
      {
        id: 'iris-bad',
        data: 'samples/descriptive/iris/data.csv',
        analysis: 'descriptive',
        set: { descVars: 'Missing' },
      },
    ]);
    const sink = capture();
    assert.equal(
      await runCli(
        ['batch', '--jobs', jobs, '--out', join(directory, 'results'), '--concurrency', '2', '--continue-on-error'],
        sink.io
      ),
      2
    );
    const summary = JSON.parse(sink.stdout()) as {
      status: string;
      succeeded: number;
      failed: number;
      skipped: number;
      jobs: { id: string; status: string; error?: { code: string }; output?: string }[];
    };
    assert.equal(summary.status, 'partial');
    assert.equal(summary.succeeded, 1);
    assert.equal(summary.failed, 1);
    assert.equal(summary.skipped, 0);
    const okJob = summary.jobs.find(job => job.id === 'iris-ok');
    const badJob = summary.jobs.find(job => job.id === 'iris-bad');
    assert.equal(okJob?.status, 'ok');
    assert.equal(badJob?.status, 'rejected');
    assert.equal(badJob?.error?.code, 'E_PARAMS');
    assert.ok(existsSync(join(directory, 'results', 'iris-ok', 'result.json')));
    assert.ok(existsSync(join(directory, 'results', 'iris-bad', 'failure.json')));
    assert.equal(existsSync(join(directory, 'results', 'iris-bad', 'result.json')), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('batch stops scheduling jobs after the first failure', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-batch-stop-'));
  try {
    const jobs = writeJobs(directory, [
      {
        id: 'first-bad',
        data: 'samples/descriptive/iris/data.csv',
        analysis: 'descriptive',
        set: { descVars: 'Missing' },
      },
      {
        id: 'second-ok',
        data: 'samples/descriptive/iris/data.csv',
        analysis: 'descriptive',
        set: { descVars: 'Sepal.Length' },
      },
    ]);
    const sink = capture();
    assert.equal(
      await runCli(
        ['batch', '--jobs', jobs, '--out', join(directory, 'results'), '--concurrency', '1'],
        sink.io
      ),
      2
    );
    const summary = JSON.parse(sink.stdout()) as {
      status: string;
      failed: number;
      skipped: number;
      jobs: { id: string; status: string }[];
    };
    assert.equal(summary.status, 'failed');
    assert.equal(summary.failed, 1);
    assert.equal(summary.skipped, 1);
    assert.equal(summary.jobs.find(job => job.id === 'second-ok')?.status, 'skipped');
    assert.equal(existsSync(join(directory, 'results', 'second-ok')), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('heavy batch jobs run through the worker pool', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-batch-worker-'));
  try {
    const jobs = writeJobs(directory, [
      {
        id: 'cox-lung',
        data: 'samples/survival/lung/data.csv',
        analysis: 'cox',
        set: {
          'cox.timeVariable': 'Time',
          'cox.eventVariable': 'Event',
          'cox.covariates': 'Age,Sex_male',
        },
      },
    ]);
    const sink = capture();
    assert.equal(
      await runCli(
        [
          'batch',
          '--jobs',
          jobs,
          '--out',
          join(directory, 'results'),
          '--workers',
          '1',
          '--concurrency',
          '1',
        ],
        sink.io
      ),
      0
    );
    const summary = JSON.parse(sink.stdout()) as { status: string; jobs: { status: string }[] };
    assert.equal(summary.status, 'ok');
    assert.equal(summary.jobs[0].status, 'ok');
    const envelope = JSON.parse(
      readFileSync(join(directory, 'results', 'cox-lung', 'result.json'), 'utf8')
    ) as { status: string; result: { tables: unknown[] } };
    assert.equal(envelope.status, 'ok');
    assert.ok(envelope.result.tables.length > 0);
  } finally {
    closeWorkerPool();
    rmSync(directory, { recursive: true, force: true });
  }
});
