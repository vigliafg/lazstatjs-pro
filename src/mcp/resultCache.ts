import { randomUUID } from 'node:crypto';
import type { SuccessEnvelope } from '../engine';
import { MAX_RESULTS, MAX_RESULT_BYTES, RESULT_TTL_MS } from './limits';

export interface CachedResult {
  envelope: SuccessEnvelope;
  summary: string;
  createdAt: number;
  lastUsed: number;
  bytes: number;
}

const estimateBytes = (value: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  } catch {
    return MAX_RESULT_BYTES + 1;
  }
};

/** Bounded, expiring LRU cache. Only successful runs are ever stored. */
export class ResultCache {
  private readonly items = new Map<string, CachedResult>();
  private totalBytes = 0;

  constructor(
    private readonly ttlMs = RESULT_TTL_MS,
    private readonly maxItems = MAX_RESULTS,
    private readonly maxBytes = MAX_RESULT_BYTES
  ) {}

  put(envelope: SuccessEnvelope, summary: string): string {
    this.evictExpired();
    const bytes = estimateBytes(envelope) + Buffer.byteLength(summary, 'utf8');
    if (bytes > this.maxBytes) return '';
    const resultId = `res_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const now = Date.now();
    this.items.set(resultId, { envelope, summary, createdAt: now, lastUsed: now, bytes });
    this.totalBytes += bytes;
    this.trim();
    return resultId;
  }

  get(resultId: string): CachedResult | undefined {
    this.evictExpired();
    const item = this.items.get(resultId);
    if (!item) return undefined;
    item.lastUsed = Date.now();
    this.items.delete(resultId);
    this.items.set(resultId, item);
    return item;
  }

  clear(): void {
    this.items.clear();
    this.totalBytes = 0;
  }

  get size(): number {
    return this.items.size;
  }

  private evictExpired(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [id, item] of this.items) {
      if (item.lastUsed < cutoff) this.remove(id, item);
    }
  }

  private trim(): void {
    while (this.items.size > this.maxItems || this.totalBytes > this.maxBytes) {
      const oldest = this.items.entries().next().value as [string, CachedResult] | undefined;
      if (!oldest) break;
      this.remove(oldest[0], oldest[1]);
    }
  }

  private remove(id: string, item: CachedResult): void {
    this.items.delete(id);
    this.totalBytes -= item.bytes;
  }
}
