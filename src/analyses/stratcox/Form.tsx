import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';

export interface StratifiedCoxFormProps {
  grid: GridData;
  stratCoxParams: StratifiedCoxParams;
  setStratCoxParams: Dispatch<SetStateAction<StratifiedCoxParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const StratifiedCoxForm = ({ grid, stratCoxParams, setStratCoxParams }: StratifiedCoxFormProps) => {
  const toggle = (index: number) => {
    setStratCoxParams(prev => ({
      ...prev,
      covariates: prev.covariates.includes(index)
        ? prev.covariates.filter(item => item !== index)
        : [...prev.covariates, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Time</label>
        <select className={inputClass} value={stratCoxParams.time} onChange={e => setStratCoxParams(prev => ({ ...prev, time: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{columnLabel(column)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Event (0/1)</label>
        <select className={inputClass} value={stratCoxParams.event} onChange={e => setStratCoxParams(prev => ({ ...prev, event: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{columnLabel(column)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Stratum</label>
        <select className={inputClass} value={stratCoxParams.stratum} onChange={e => setStratCoxParams(prev => ({ ...prev, stratum: parseInt(e.target.value, 10) }))}>
          <option value={-1}>None</option>
          {groupColumnIndexes(grid).map(index => (
            <option key={index} value={index}>{columnLabel(grid.cols[index])}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Covariates (X)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[110px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={stratCoxParams.covariates.includes(index)}
                disabled={index === stratCoxParams.time || index === stratCoxParams.event || index === stratCoxParams.stratum}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(column)}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Baseline separata per strato, coefficienti condivisi. Lo strato deve avere eventi in ogni gruppo.
      </p>
    </div>
  );
};
