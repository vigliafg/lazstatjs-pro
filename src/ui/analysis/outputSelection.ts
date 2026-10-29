/** Minimal shape needed to filter the output console by analysis. */
export interface SelectableOutput {
  id: string;
  analysisId?: string;
}

export interface IndexedOutput<T> {
  output: T;
  /** Position in the original, unfiltered list (used by remove). */
  index: number;
}

/** Distinct analyses that produced at least one card, in first-seen order. */
export const analysisIdsOf = (outputs: readonly SelectableOutput[]): string[] => {
  const seen = new Set<string>();
  for (const output of outputs) {
    if (output.analysisId) seen.add(output.analysisId);
  }
  return Array.from(seen);
};

/** A filter is valid only when it is "all" or one of the present analyses. */
export const isValidFilter = (filterId: string, analysisIds: readonly string[]): boolean =>
  filterId === 'all' || analysisIds.includes(filterId);

/**
 * Cards matching the filter, keeping their original index so removal still
 * addresses the right entry in the full `outputs` array.
 */
export const selectOutputs = <T extends SelectableOutput>(
  outputs: readonly T[],
  filterId: string
): IndexedOutput<T>[] =>
  outputs
    .map((output, index) => ({ output, index }))
    .filter(({ output }) => filterId === 'all' || output.analysisId === filterId);
