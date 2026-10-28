import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { GeeParams } from '../../io/project';

export interface GeeFormProps {
  grid: GridData;
  geeParams: GeeParams;
  setGeeParams: Dispatch<SetStateAction<GeeParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const GeeForm = ({ grid, geeParams, setGeeParams }: GeeFormProps) => {
  const toggle = (index: number) => {
    setGeeParams(prev => ({
      ...prev,
      indeps: prev.indeps.includes(index)
        ? prev.indeps.filter(item => item !== index)
        : [...prev.indeps, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Outcome</label>
        <select className={inputClass} value={geeParams.dep} onChange={e => setGeeParams(prev => ({ ...prev, dep: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{columnLabel(column)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Predictors (X)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[120px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={geeParams.indeps.includes(index)}
                disabled={index === geeParams.dep || index === geeParams.cluster}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(column)}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Cluster</label>
        <select className={inputClass} value={geeParams.cluster} onChange={e => setGeeParams(prev => ({ ...prev, cluster: parseInt(e.target.value, 10) }))}>
          {groupColumnIndexes(grid).map(index => (
            <option key={index} value={index}>{columnLabel(grid.cols[index])}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Family</label>
        <select className={inputClass} value={geeParams.family} onChange={e => setGeeParams(prev => ({ ...prev, family: e.target.value as GeeParams['family'] }))}>
          <option value="gaussian">Gaussian (identity)</option>
          <option value="binomial">Binomial (logit)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Working correlation</label>
        <select className={inputClass} value={geeParams.correlation} onChange={e => setGeeParams(prev => ({ ...prev, correlation: e.target.value as GeeParams['correlation'] }))}>
          <option value="independence">Independence</option>
          <option value="exchangeable">Exchangeable</option>
        </select>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Effetti marginali con SE robusti per cluster. Adatto a dati longitudinali o raggruppati.
      </p>
    </div>
  );
};
