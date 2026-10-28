import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { LogisticParams } from '../../io/project';

export interface LogisticFormProps {
  grid: GridData;
  logisticParams: LogisticParams;
  setLogisticParams: Dispatch<SetStateAction<LogisticParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[110px]';

export const LogisticForm = ({ grid, logisticParams, setLogisticParams }: LogisticFormProps) => {
  const { outcome, predictors, cutoff, penalized } = logisticParams;

  const toggle = (index: number) => {
    setLogisticParams(prev => ({
      ...prev,
      predictors: prev.predictors.includes(index)
        ? prev.predictors.filter(item => item !== index)
        : [...prev.predictors, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Outcome (0/1)</label>
        <select
          className={inputClass}
          value={outcome}
          onChange={e => setLogisticParams(prev => ({ ...prev, outcome: parseInt(e.target.value, 10) }))}
        >
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {columnLabel(column)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Predictors (X)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label
              key={index}
              className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={predictors.includes(index)}
                disabled={index === outcome}
                onChange={() => toggle(index)}
              />
              {columnLabel(column)}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Penalization</label>
        <label className="flex items-center gap-1.5 text-[11px] text-text2 cursor-pointer pt-1.5">
          <input
            type="checkbox"
            className="accent-accent"
            checked={penalized}
            onChange={e => setLogisticParams(prev => ({ ...prev, penalized: e.target.checked }))}
          />
          Firth (penalized)
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Cut-off</label>
        <input
          type="number"
          min="0.05"
          max="0.95"
          step="0.05"
          className={`${inputClass} w-20`}
          value={cutoff}
          onChange={e => setLogisticParams(prev => ({ ...prev, cutoff: parseFloat(e.target.value) }))}
        />
      </div>
    </div>
  );
};
