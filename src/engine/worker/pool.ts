import { existsSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { Worker } from 'node:worker_threads';
import type { AnalysisRunResult } from '../../analyses/types';
import { EngineError } from '../errors';
import type { RunAnalysisOptions } from '../run';
import {
  errorFromSerialized,
  type WorkerRequest,
  type WorkerResponse,
} from './protocol';

/** A worker could not start; the caller may fall back to the main thread. */
export class WorkerUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerUnavailableError';
  }
}

interface PendingTask {
  id: number;
  options: RunAnalysisOptions;
  resolve: (result: AnalysisRunResult) => void;
  reject: (error: Error) => void;
  timer?: ReturnType<typeof setTimeout>;
  signal?: AbortSignal;
  onAbort?: () => void;
}

interface Slot {
  worker: Worker;
  task: PendingTask | null;
}

const DEFAULT_TIMEOUT_MS = 120_000;

/** Resolves `auto|0|N`; auto leaves one core for the CLI and caps at 8. */
export const resolveWorkerCount = (setting: string | number | undefined): number => {
  if (setting === 0 || setting === '0') return 0;
  if (typeof setting === 'number') {
    if (!Number.isInteger(setting) || setting < 0) {
      throw new EngineError({
        code: 'E_ARGS',
        kind: 'invalid_value',
        stage: 'args',
        message: `--workers must be auto or a non-negative integer (received ${setting})`,
      });
    }
    return setting;
  }
  if (typeof setting === 'string' && /^\d+$/.test(setting)) return Number(setting);
  if (setting !== undefined && setting !== 'auto') {
    throw new EngineError({
      code: 'E_ARGS',
      kind: 'invalid_value',
      stage: 'args',
      message: `--workers must be auto or a non-negative integer (received ${setting})`,
    });
  }
  return Math.max(1, Math.min(8, availableParallelism() - 1));
};

const workerExecArgv = (needsTsx: boolean): string[] => {
  const args = process.execArgv.filter(
    arg => arg !== '--test' && !arg.startsWith('--test-') && arg !== '--watch'
  );
  if (needsTsx && !args.some(arg => arg === 'tsx' || arg.includes('tsx'))) {
    args.push('--import', 'tsx');
  }
  return args;
};

const workerEntry = (): { url: URL; needsTsx: boolean } => {
  const bundled = new URL('./worker-entry.mjs', import.meta.url);
  if (existsSync(bundled)) return { url: bundled, needsTsx: false };
  return { url: new URL('./entry.ts', import.meta.url), needsTsx: true };
};

class WorkerPool {
  private readonly size: number;
  private readonly slots: Slot[] = [];
  private readonly queue: PendingTask[] = [];
  private readonly activeTasks = new Map<number, PendingTask>();
  private nextId = 0;
  private closed = false;

  constructor(size: number) {
    this.size = Math.max(1, size);
  }

  get busy(): number {
    return this.activeTasks.size;
  }

  get capacity(): number {
    return this.size;
  }

  run(
    options: RunAnalysisOptions,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal?: AbortSignal
  ): Promise<AnalysisRunResult> {
    if (signal?.aborted) {
      return Promise.reject(
        new EngineError({
          code: 'E_RUN',
          kind: 'cancelled',
          stage: 'execute',
          message: 'The request was cancelled',
        })
      );
    }
    if (this.closed) {
      return Promise.reject(
        new EngineError({
          code: 'E_INTERNAL',
          kind: 'worker_pool_closed',
          stage: 'execute',
          message: 'The worker pool is closed',
        })
      );
    }
    const task: PendingTask = {
      id: ++this.nextId,
      options,
      resolve: () => undefined,
      reject: () => undefined,
      ...(signal ? { signal } : {}),
    };
    if (signal) {
      task.onAbort = () => this.cancel(task);
      signal.addEventListener('abort', task.onAbort, { once: true });
    }
    const promise = new Promise<AnalysisRunResult>((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;
    });
    const ms = Math.max(1, timeoutMs);
    task.timer = setTimeout(() => {
      this.timeout(task, ms);
    }, ms);
    task.timer.unref?.();
    this.queue.push(task);
    this.activeTasks.set(task.id, task);
    this.dispatch();
    return promise;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const task of this.queue) this.fail(task, new Error('The worker pool was closed'));
    this.queue.length = 0;
    this.activeTasks.clear();
    for (const slot of this.slots) {
      if (slot.task) {
        this.fail(
          slot.task,
          new EngineError({
            code: 'E_INTERNAL',
            kind: 'worker_pool_closed',
            stage: 'execute',
            message: 'The worker pool was closed',
          })
        );
        slot.task = null;
      }
      void slot.worker.terminate();
    }
    this.slots.length = 0;
  }

  private spawn(): Slot {
    const entry = workerEntry();
    const worker = new Worker(entry.url, {
      execArgv: workerExecArgv(entry.needsTsx),
    });
    const slot: Slot = { worker, task: null };
    worker.on('message', (message: WorkerResponse) => this.onMessage(slot, message));
    worker.on('error', error => this.onWorkerFailure(slot, error));
    worker.on('exit', code => {
      if (!this.closed && (slot.task || code !== 0)) {
        this.onWorkerFailure(slot, new Error(`The analysis worker exited with code ${code}`));
      }
    });
    worker.unref();
    this.slots.push(slot);
    return slot;
  }

  private dispatch(): void {
    if (this.closed) return;
    while (this.queue.length > 0) {
      let slot = this.slots.find(candidate => candidate.task === null);
      if (!slot) {
        if (this.slots.length >= this.size) return;
        slot = this.spawn();
      }
      const task = this.queue.shift();
      if (!task) return;
      slot.task = task;
      slot.worker.ref();
      try {
        slot.worker.postMessage({ id: task.id, options: task.options } satisfies WorkerRequest);
      } catch (error) {
        this.fail(slot.task, error instanceof Error ? error : new Error(String(error)));
        slot.task = null;
        slot.worker.unref();
        this.dispatch();
      }
    }
  }

  private onMessage(slot: Slot, message: WorkerResponse): void {
    if (!message || typeof message.id !== 'number') return;
    const task = slot.task;
    if (!task || task.id !== message.id) return;
    slot.task = null;
    slot.worker.unref();
    this.clearTask(task);
    if ('error' in message) {
      task.reject(errorFromSerialized(message.error));
    } else {
      task.resolve(message.result);
    }
    this.dispatch();
  }

  private onWorkerFailure(slot: Slot, error: Error): void {
    if (this.closed) return;
    const task = slot.task;
    slot.task = null;
    const index = this.slots.indexOf(slot);
    if (index >= 0) this.slots.splice(index, 1);
    void slot.worker.terminate();
    if (task) {
      this.clearTask(task);
      task.reject(new WorkerUnavailableError(error.message));
    }
    this.dispatch();
  }

  private cancel(task: PendingTask): void {
    if (!this.activeTasks.has(task.id)) return;
    this.activeTasks.delete(task.id);
    const index = this.queue.indexOf(task);
    if (index >= 0) this.queue.splice(index, 1);
    const slot = this.slots.find(candidate => candidate.task?.id === task.id);
    if (slot) {
      slot.task = null;
      const slotIndex = this.slots.indexOf(slot);
      if (slotIndex >= 0) this.slots.splice(slotIndex, 1);
      void slot.worker.terminate();
    }
    this.clearTask(task);
    task.reject(
      new EngineError({
        code: 'E_RUN',
        kind: 'cancelled',
        stage: 'execute',
        message: 'The request was cancelled',
      })
    );
    this.dispatch();
  }

  private timeout(task: PendingTask, ms: number): void {
    if (!this.activeTasks.has(task.id)) return;
    this.activeTasks.delete(task.id);
    this.clearTask(task);
    const slot = this.slots.find(candidate => candidate.task?.id === task.id);
    if (slot) {
      slot.task = null;
      const index = this.slots.indexOf(slot);
      if (index >= 0) this.slots.splice(index, 1);
      void slot.worker.terminate();
    }
    const index = this.queue.indexOf(task);
    if (index >= 0) this.queue.splice(index, 1);
    task.reject(
      new EngineError({
        code: 'E_TIMEOUT',
        kind: 'timeout',
        stage: 'execute',
        message: `Analysis timed out after ${Math.round(ms / 1000)} seconds`,
        details: { timeoutMs: ms },
      })
    );
    this.dispatch();
  }

  private clearTask(task: PendingTask): void {
    if (task.timer) clearTimeout(task.timer);
    if (task.signal && task.onAbort) task.signal.removeEventListener('abort', task.onAbort);
    this.activeTasks.delete(task.id);
  }

  private fail(task: PendingTask, error: Error): void {
    this.clearTask(task);
    task.reject(error);
  }
}

let sharedPool: WorkerPool | null = null;

const poolFor = (size: number): WorkerPool => {
  if (sharedPool && sharedPool.busy === 0 && sharedPool.capacity !== size) {
    sharedPool.close();
    sharedPool = null;
  }
  if (!sharedPool) sharedPool = new WorkerPool(size);
  return sharedPool;
};

export const runInWorkerPool = (
  options: RunAnalysisOptions,
  workers: number,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signal?: AbortSignal
): Promise<AnalysisRunResult> => poolFor(workers).run(options, timeoutMs, signal);

export const closeWorkerPool = (): void => {
  sharedPool?.close();
  sharedPool = null;
};

export { DEFAULT_TIMEOUT_MS };
