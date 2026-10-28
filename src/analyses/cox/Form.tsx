import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CoxParams } from '../../io/project';

export interface CoxFormProps {
  grid: GridData;
  coxParams: CoxParams;
  setCoxParams: Dispatch<SetStateAction<CoxParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[110px]';

export const CoxForm = ({ grid, coxParams, setCoxParams }: CoxFormProps) => {
  const { timeVariable, eventVariable, covariates } = coxParams;

  const toggle = (index: number) => {
    setCoxParams(prev => ({
      ...prev,
      covariates: prev.covariates.includes(index)
        ? prev.covariates.filter(item => item !== index)
        : [...prev.covariates, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Time</label>
        <select
          className={inputClass}
          value={timeVariable}
          onChange={e => setCoxParams(prev => ({ ...prev, timeVariable: parseInt(e.target.value, 10) }))}
        >
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Event (0/1)</label>
        <select
          className={inputClass}
          value={eventVariable}
          onChange={e => setCoxParams(prev => ({ ...prev, eventVariable: parseInt(e.target.value, 10) }))}
        >
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Covariates (X)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[110px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label
              key={index}
              className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={covariates.includes(index)}
                disabled={index === timeVariable || index === eventVariable}
                onChange={() => toggle(index)}
              />
              {column.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
