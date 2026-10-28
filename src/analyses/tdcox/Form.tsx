import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TdCoxParams } from '../../io/project';

export interface TdCoxFormProps {
  grid: GridData;
  tdCoxParams: TdCoxParams;
  setTdCoxParams: Dispatch<SetStateAction<TdCoxParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const TdCoxForm = ({ grid, tdCoxParams, setTdCoxParams }: TdCoxFormProps) => {
  const toggle = (index: number) => {
    setTdCoxParams(prev => ({
      ...prev,
      covariates: prev.covariates.includes(index)
        ? prev.covariates.filter(item => item !== index)
        : [...prev.covariates, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Start</label>
        <select className={inputClass} value={tdCoxParams.start} onChange={e => setTdCoxParams(prev => ({ ...prev, start: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{column.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Stop</label>
        <select className={inputClass} value={tdCoxParams.stop} onChange={e => setTdCoxParams(prev => ({ ...prev, stop: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{column.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Event (0/1)</label>
        <select className={inputClass} value={tdCoxParams.event} onChange={e => setTdCoxParams(prev => ({ ...prev, event: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{column.name}</option>
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
                checked={tdCoxParams.covariates.includes(index)}
                disabled={index === tdCoxParams.start || index === tdCoxParams.stop || index === tdCoxParams.event}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{column.name}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Formato start-stop: ogni riga è un intervallo; le covariate possono cambiare tra intervalli.
      </p>
    </div>
  );
};
