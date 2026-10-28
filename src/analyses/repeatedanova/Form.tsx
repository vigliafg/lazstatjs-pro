import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import { defaultRepeatedAnovaParams, isNumericColumn } from './defaults';

export interface RepeatedAnovaFormProps {
  grid: GridData;
  repeatedAnovaParams: RepeatedAnovaParams;
  setRepeatedAnovaParams: Dispatch<SetStateAction<RepeatedAnovaParams>>;
}

export const RepeatedAnovaForm = ({
  grid,
  repeatedAnovaParams,
  setRepeatedAnovaParams,
}: RepeatedAnovaFormProps) => {
  const { selected } = repeatedAnovaParams;
  const numericColumns = grid.cols
    .map((_, index) => index)
    .filter(index => isNumericColumn(grid, index));

  // Keep the old behaviour: a change in the number of columns re-picks the
  // default conditions. The first mount must not overwrite restored params.
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    if (previousCols.current === grid.cols.length) return;
    previousCols.current = grid.cols.length;
    setRepeatedAnovaParams(prev => ({ ...prev, selected: defaultRepeatedAnovaParams(grid).selected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  const toggle = (index: number) => {
    setRepeatedAnovaParams(prev => ({
      ...prev,
      selected: prev.selected.includes(index)
        ? prev.selected.filter(item => item !== index)
        : [...prev.selected, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">
          Within-subject conditions (≥ 3)
        </label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[240px] max-h-[120px] overflow-auto scrollbar">
          {numericColumns.length === 0 && (
            <p className="text-[10px] text-text3 italic">No numeric columns</p>
          )}
          {numericColumns.map(index => (
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
      <p className="text-[10px] text-text3 max-w-[360px] self-end pb-1">
        Una riga = un soggetto. Le condizioni sono confrontate within-subject; Mauchly e le
        correzioni Greenhouse–Geisser/Huynh–Feldt sono calcolate automaticamente.
      </p>
    </div>
  );
};
