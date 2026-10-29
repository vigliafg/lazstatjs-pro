import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ProjectParams } from '../../io/project';

export type AnalysisAction =
  | { type: 'slice'; key: keyof ProjectParams; updater: SetStateAction<unknown> }
  | { type: 'replace'; params: ProjectParams };

/**
 * Pure reducer behind the store. Kept free of React so it can be unit-tested:
 * only the addressed slice changes, and a no-op updater returns the same object.
 */
export const applyAnalysisAction = (
  params: ProjectParams,
  action: AnalysisAction
): ProjectParams => {
  if (action.type === 'replace') return action.params;
  const current = params[action.key];
  const next =
    typeof action.updater === 'function'
      ? (action.updater as (value: unknown) => unknown)(current)
      : action.updater;
  if (next === current) return params;
  return { ...params, [action.key]: next } as ProjectParams;
};

interface StoreValue {
  params: ProjectParams;
  dispatch: Dispatch<AnalysisAction>;
}

const AnalysisStoreContext = createContext<StoreValue | null>(null);

/**
 * Controlled store for the analysis parameters.
 *
 * `App` still owns the single `params` object (persisted with the project);
 * the provider exposes it with a reducer-style `dispatch`, so the analysis
 * workspace no longer needs 30 slice/setter prop pairs.
 */
export const AnalysisStoreProvider = ({
  params,
  onChange,
  children,
}: {
  params: ProjectParams;
  onChange: Dispatch<SetStateAction<ProjectParams>>;
  children: ReactNode;
}) => {
  const dispatch = useCallback<Dispatch<AnalysisAction>>(
    action => {
      const next = applyAnalysisAction(params, action);
      if (next !== params) onChange(next);
    },
    [params, onChange]
  );

  const value = useMemo(() => ({ params, dispatch }), [params, dispatch]);
  return <AnalysisStoreContext.Provider value={value}>{children}</AnalysisStoreContext.Provider>;
};

export const useAnalysisStore = (): StoreValue => {
  const value = useContext(AnalysisStoreContext);
  if (!value) throw new Error('useAnalysisStore must be used inside AnalysisStoreProvider');
  return value;
};

/** Slice + setter for one procedure, typed on the slice it controls. */
export const useAnalysisSlice = <K extends keyof ProjectParams>(
  key: K
): readonly [ProjectParams[K], Dispatch<SetStateAction<ProjectParams[K]>>] => {
  const { params, dispatch } = useAnalysisStore();
  const set = useCallback<Dispatch<SetStateAction<ProjectParams[K]>>>(
    updater => dispatch({ type: 'slice', key, updater: updater as SetStateAction<unknown> }),
    [dispatch, key]
  );
  return [params[key], set] as const;
};
