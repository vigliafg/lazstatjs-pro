import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { NonParamMode, NonParamParams } from '../../io/project';
import {
  defaultSelection,
  isBinaryColumn,
  isNumericColumn,
} from './defaults';

export interface NonParamFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  nonParamParams: NonParamParams;
  setNonParamParams: Dispatch<SetStateAction<NonParamParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const NonParamForm = ({
  grid,
  onLevels,
  onRecode,
  nonParamParams,
  setNonParamParams,
}: NonParamFormProps) => {
  const { mode, selected, left, right, outcome, group } = nonParamParams;

  // Il pannello resettava le misure al cambio di modalità o di colonne e
  // clampava gli indici. Ripetiamo l'effetto solo quando qualcosa cambia
  // davvero: il primo mount non deve sovrascrivere i parametri ripristinati.
  const previousMode = useRef(mode);
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    const modeChanged = previousMode.current !== mode;
    const colsChanged = previousCols.current !== grid.cols.length;
    previousMode.current = mode;
    previousCols.current = grid.cols.length;
    if (!modeChanged && !colsChanged) return;

    setNonParamParams(prev => {
      const max = Math.max(0, grid.cols.length - 1);
      return {
        ...prev,
        selected: modeChanged || colsChanged ? defaultSelection(grid, mode) : prev.selected,
        left: Math.min(prev.left, max),
        right: Math.min(prev.right, max),
        outcome: Math.min(prev.outcome, max),
        group: Math.min(prev.group, max),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, grid.cols.length]);

  const toggle = (index: number) => {
    setNonParamParams(prev => ({
      ...prev,
      selected: prev.selected.includes(index)
        ? prev.selected.filter(item => item !== index)
        : [...prev.selected, index],
    }));
  };

  const numericColumns = grid.cols
    .map((_, index) => index)
    .filter(index => isNumericColumn(grid, index));
  const binaryColumns = grid.cols
    .map((_, index) => index)
    .filter(index => isBinaryColumn(grid, index));
  const listColumns = mode === 'friedman' ? numericColumns : mode === 'cochran' ? binaryColumns : [];

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Test</label>
        <select
          className={inputClass}
          value={mode}
          onChange={event =>
            setNonParamParams(prev => ({ ...prev, mode: event.target.value as NonParamMode }))
          }
        >
          <option value="friedman">Friedman + Nemenyi</option>
          <option value="mcnemar">McNemar</option>
          <option value="cochran">Cochran Q</option>
          <option value="jonckheere">Jonckheere–Terpstra</option>
        </select>
      </div>

      {(mode === 'friedman' || mode === 'cochran') && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            {mode === 'friedman' ? 'Numeric measures (≥ 3)' : 'Binary conditions (≥ 3)'}
          </label>
          <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[120px] overflow-auto scrollbar">
            {listColumns.length === 0 && (
              <p className="text-[10px] text-text3 italic">No suitable columns</p>
            )}
            {listColumns.map(index => (
              <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={selected.includes(index)}
                  onChange={() => toggle(index)}
                />
                <span className="text-[11px] text-text2">{grid.cols[index]?.name}</span>
                <span className="text-[9px] text-text3 font-mono">{grid.cols[index]?.type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {mode === 'mcnemar' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>First measure</label>
            <select
              className={inputClass}
              value={left}
              onChange={event =>
                setNonParamParams(prev => ({ ...prev, left: Number(event.target.value) }))
              }
            >
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>{column.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Second measure</label>
            <select
              className={inputClass}
              value={right}
              onChange={event =>
                setNonParamParams(prev => ({ ...prev, right: Number(event.target.value) }))
              }
            >
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>{column.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {mode === 'jonckheere' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Numeric outcome</label>
            <select
              className={inputClass}
              value={outcome}
              onChange={event =>
                setNonParamParams(prev => ({ ...prev, outcome: Number(event.target.value) }))
              }
            >
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>{column.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Ordered groups (2–10)</label>
            <div className="flex items-center gap-1">
              <select
                className={inputClass}
                value={group}
                onChange={event =>
                  setNonParamParams(prev => ({ ...prev, group: Number(event.target.value) }))
                }
              >
                {groupColumnIndexes(grid).map(index => (
                  <option key={index} value={index}>{grid.cols[index]?.name}</option>
                ))}
              </select>
              <LevelsEditor
                grid={grid}
                column={group}
                onLevels={onLevels}
                onRecode={onRecode}
                label="Modifica livelli"
                className={LEVELS_BUTTON_CLASS}
              />
            </div>
          </div>
          <p className="text-[10px] text-text3 max-w-[220px] self-end pb-1">
            Il test usa l’ordine alfabetico/numerico dei livelli del gruppo.
          </p>
        </>
      )}
    </div>
  );
};
