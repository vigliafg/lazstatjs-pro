import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  normalizeKeys,
  type LinkSelection,
  type LinkSelectionKind,
} from '../../charts/interaction';

export type LinkTool = 'brush' | 'lasso';

export interface ChartLinkValue {
  /** Shared selection, or null when nothing is selected. */
  selection: LinkSelection | null;
  /** Rows removed by the Data Filter. */
  hidden: string[];
  /** When on, charts with row keys show the brush/lasso surface. */
  linkMode: boolean;
  /** While exporting, dimming/animation overlays are suspended. */
  exporting: boolean;
  tool: LinkTool;
  setLinkMode: (value: boolean) => void;
  setExporting: (value: boolean) => void;
  setTool: (tool: LinkTool) => void;
  /** Replace the selection with keys from one chart. */
  select: (sourceId: string, kind: LinkSelectionKind, keys: readonly string[]) => void;
  clearSelection: () => void;
  setHidden: (keys: readonly string[]) => void;
  clearHidden: () => void;
}

const ChartLinkContext = createContext<ChartLinkValue | null>(null);

export const ChartLinkProvider = ({
  value,
  children,
}: {
  value: ChartLinkValue;
  children: ReactNode;
}) => <ChartLinkContext.Provider value={value}>{children}</ChartLinkContext.Provider>;

export const useChartLink = (): ChartLinkValue | null => useContext(ChartLinkContext);

/** Session state for dynamic linking. Owned by the output console. */
export const useChartLinkState = (): ChartLinkValue => {
  const [selection, setSelection] = useState<LinkSelection | null>(null);
  const [hidden, setHiddenState] = useState<string[]>([]);
  const [linkMode, setLinkMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tool, setTool] = useState<LinkTool>('brush');

  const select = useCallback(
    (sourceId: string, kind: LinkSelectionKind, keys: readonly string[]) => {
      const normalized = normalizeKeys(keys);
      setSelection(normalized.length > 0 ? { sourceId, kind, keys: normalized } : null);
    },
    []
  );

  const clearSelection = useCallback(() => setSelection(null), []);
  const setHidden = useCallback((keys: readonly string[]) => setHiddenState(normalizeKeys(keys)), []);
  const clearHidden = useCallback(() => setHiddenState([]), []);

  return useMemo(
    () => ({
      selection,
      hidden,
      linkMode,
      exporting,
      tool,
      setLinkMode,
      setExporting,
      setTool,
      select,
      clearSelection,
      setHidden,
      clearHidden,
    }),
    [
      selection,
      hidden,
      linkMode,
      exporting,
      tool,
      select,
      clearSelection,
      setHidden,
      clearHidden,
    ]
  );
};
