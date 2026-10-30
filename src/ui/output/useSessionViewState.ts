import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { OutlineFilter } from '../analysis/sessionOutline';
import {
  pruneSessionView,
  readSessionView,
  writeSessionView,
  type SessionViewState,
} from './sessionViewState';

interface UseSessionViewStateOptions {
  /** View state is stored per dataset; a new dataset starts clean. */
  datasetId: string;
  outputs: readonly { id: string }[];
  analysisIds: readonly string[];
}

export interface SessionViewStateControls {
  pinned: Set<string>;
  collapsedFamilies: Set<string>;
  collapsedAnalyses: Set<string>;
  filterId: string;
  outlineFilter: OutlineFilter;
  setPinned: Dispatch<SetStateAction<Set<string>>>;
  setCollapsedFamilies: Dispatch<SetStateAction<Set<string>>>;
  setCollapsedAnalyses: Dispatch<SetStateAction<Set<string>>>;
  setFilterId: Dispatch<SetStateAction<string>>;
  setOutlineFilter: Dispatch<SetStateAction<OutlineFilter>>;
}

const toSet = (values: readonly string[]): Set<string> => new Set(values);

const snapshot = (
  pinned: Set<string>,
  collapsedFamilies: Set<string>,
  collapsedAnalyses: Set<string>,
  filterId: string,
  outlineFilter: OutlineFilter
): SessionViewState => ({
  pinned: [...pinned],
  collapsedFamilies: [...collapsedFamilies],
  collapsedAnalyses: [...collapsedAnalyses],
  filterId,
  outlineFilter,
});

/**
 * Reading state of the session-report, restored per dataset.
 *
 * View state is written synchronously: it is a handful of ids, and a reload
 * right after a pin must not lose it. Pins that no longer match a run are
 * pruned whenever the stack changes.
 */
export const useSessionViewState = ({
  datasetId,
  outputs,
  analysisIds,
}: UseSessionViewStateOptions): SessionViewStateControls => {
  const [initial] = useState(() =>
    pruneSessionView(readSessionView(datasetId), {
      runIds: new Set(outputs.map(output => output.id)),
      analysisIds,
    })
  );
  const [pinned, setPinned] = useState(() => toSet(initial.pinned));
  const [collapsedFamilies, setCollapsedFamilies] = useState(() =>
    toSet(initial.collapsedFamilies)
  );
  const [collapsedAnalyses, setCollapsedAnalyses] = useState(() =>
    toSet(initial.collapsedAnalyses)
  );
  const [filterId, setFilterId] = useState(initial.filterId);
  const [outlineFilter, setOutlineFilter] = useState<OutlineFilter>(initial.outlineFilter);
  const lastDataset = useRef(datasetId);

  // A new dataset starts from its own saved view (or a clean one), without
  // carrying pins and closed groups from the previous project.
  if (lastDataset.current !== datasetId) {
    lastDataset.current = datasetId;
    const next = pruneSessionView(readSessionView(datasetId), {
      runIds: new Set(outputs.map(output => output.id)),
      analysisIds,
    });
    setPinned(toSet(next.pinned));
    setCollapsedFamilies(toSet(next.collapsedFamilies));
    setCollapsedAnalyses(toSet(next.collapsedAnalyses));
    setFilterId(next.filterId);
    setOutlineFilter(next.outlineFilter);
  }

  // Removing a run must not leave an invisible pin behind.
  const runIdsKey = outputs.map(output => output.id).join('|');
  useEffect(() => {
    const available = new Set(runIdsKey ? runIdsKey.split('|') : []);
    setPinned(previous => {
      if ([...previous].every(id => available.has(id))) return previous;
      return new Set([...previous].filter(id => available.has(id)));
    });
  }, [runIdsKey]);

  useEffect(() => {
    writeSessionView(
      datasetId,
      snapshot(pinned, collapsedFamilies, collapsedAnalyses, filterId, outlineFilter)
    );
  }, [datasetId, pinned, collapsedFamilies, collapsedAnalyses, filterId, outlineFilter]);

  return {
    pinned,
    collapsedFamilies,
    collapsedAnalyses,
    filterId,
    outlineFilter,
    setPinned,
    setCollapsedFamilies,
    setCollapsedAnalyses,
    setFilterId,
    setOutlineFilter,
  };
};
