import { useSyncExternalStore } from 'react';
import type { HelpLevel } from './book';

export interface HelpRequest {
  topicId: string | null;
  level: HelpLevel;
  /** Monotonic counter so re-opening the same topic still triggers a render. */
  seq: number;
}

let current: HelpRequest | null = null;
const listeners = new Set<() => void>();

const emit = (): void => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const snapshot = (): HelpRequest | null => current;

export const openHelp = (topicId: string | null, level: HelpLevel = 'tutorial'): void => {
  current = { topicId, level, seq: (current?.seq ?? 0) + 1 };
  emit();
};

export const closeHelp = (): void => {
  if (!current) return;
  current = null;
  emit();
};

export const useHelpRequest = (): HelpRequest | null =>
  useSyncExternalStore(subscribe, snapshot, snapshot);
