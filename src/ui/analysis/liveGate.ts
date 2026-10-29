/**
 * Monotonic gate for debounced live runs.
 *
 * Each scheduled run owns a token; invalidating (parameter change, Live off,
 * analysis change, cleanup) makes every older token stale, so a slow runner
 * cannot publish a result or clear the pending state of a newer run.
 */
export interface RunGate {
  /** Start a new run and return its token. */
  next(): number;
  /** True only while the token is still the newest one. */
  isCurrent(token: number): boolean;
  /** Invalidate every token issued so far. */
  invalidate(): void;
}

export const createRunGate = (): RunGate => {
  let current = 0;
  return {
    next: () => {
      current += 1;
      return current;
    },
    isCurrent: token => token === current,
    invalidate: () => {
      current += 1;
    },
  };
};
