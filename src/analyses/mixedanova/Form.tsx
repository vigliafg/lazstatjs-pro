import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { MixedAnovaParams } from '../../io/project';

export interface MixedAnovaFormProps {
  grid: GridData;
  mixedAnovaParams: MixedAnovaParams;
  setMixedAnovaParams: Dispatch<SetStateAction<MixedAnovaParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const MixedAnovaForm = ({ grid, mixedAnovaParams, setMixedAnovaParams }: MixedAnovaFormProps) => {
  const toggle = (index: number) => {
    setMixedAnovaParams(prev => ({
      ...prev,
      conditions: prev.conditions.includes(index)
        ? prev.conditions.filter(item => item !== index)
        : [...prev.conditions, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Between-subject group</label>
        <select className={inputClass} value={mixedAnovaParams.group} onChange={e => setMixedAnovaParams(prev => ({ ...prev, group: parseInt(e.target.value, 10) }))}>
          {groupColumnIndexes(grid).map(index => (
            <option key={index} value={index}>{grid.cols[index]?.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Within-subject conditions (≥ 2)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[240px] max-h-[120px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={mixedAnovaParams.conditions.includes(index)}
                disabled={index === mixedAnovaParams.group}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{column.name}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Formato wide: una riga per soggetto, una colonna per condizione. Il gruppo è tra soggetti.
      </p>
    </div>
  );
};
