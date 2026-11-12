import { McpError } from './errors';
import { MAX_CONCURRENT_RUNS, MAX_QUEUED_RUNS } from './limits';

/** Bounded FIFO admission for analysis runs. */
export class RunGate {
  private active = 0;
  private queued: (() => void)[] = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= MAX_CONCURRENT_RUNS) {
      if (this.queued.length >= MAX_QUEUED_RUNS) {
        throw new McpError({
          code: 'E_BUSY',
          kind: 'queue_full',
          stage: 'execute',
          message: 'The analysis queue is full; retry later',
          details: { active: this.active, queued: this.queued.length },
          retryable: true,
        });
      }
      await new Promise<void>(resolve => this.queued.push(resolve));
    }
    this.active += 1;
    try {
      return await task();
    } finally {
      this.active -= 1;
      const next = this.queued.shift();
      if (next) next();
    }
  }

  get stats(): { active: number; queued: number } {
    return { active: this.active, queued: this.queued.length };
  }
}
