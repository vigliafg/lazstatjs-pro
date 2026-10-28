import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { LmmParams } from '../../io/project';

export interface LmmFormProps {
  grid: GridData;
  lmmParams: LmmParams;
  setLmmParams: Dispatch<SetStateAction<LmmParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const LmmForm = ({ grid, lmmParams, setLmmParams }: LmmFormProps) => {
  const { dep, indeps, group } = lmmParams;
  const toggle = (index: number) => {
    setLmmParams(prev => ({
      ...prev,
      indeps: prev.indeps.includes(index)
        ? prev.indeps.filter(item => item !== index)
        : [...prev.indeps, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Outcome (Y)</label>
        <select className={inputClass} value={dep} onChange={e => setLmmParams(prev => ({ ...prev, dep: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{columnLabel(column)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Fixed predictors (X)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[120px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={indeps.includes(index)}
                disabled={index === dep || index === group}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(column)}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Group (random intercept)</label>
        <select className={inputClass} value={group} onChange={e => setLmmParams(prev => ({ ...prev, group: parseInt(e.target.value, 10) }))}>
          {groupColumnIndexes(grid).map(index => (
            <option key={index} value={index}>{columnLabel(grid.cols[index])}</option>
          ))}
        </select>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Modello con sola intercetta casuale: adatto a misure ripetute o soggetti raggruppati.
      </p>
    </div>
  );
};
