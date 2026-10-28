import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ParametricSurvivalParams } from '../../io/project';

export interface ParametricFormProps {
  grid: GridData;
  parametricParams: ParametricSurvivalParams;
  setParametricParams: Dispatch<SetStateAction<ParametricSurvivalParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const ParametricForm = ({ grid, parametricParams, setParametricParams }: ParametricFormProps) => {
  const { time, event, predictors, distribution } = parametricParams;
  const toggle = (index: number) => {
    setParametricParams(prev => ({
      ...prev,
      predictors: prev.predictors.includes(index)
        ? prev.predictors.filter(item => item !== index)
        : [...prev.predictors, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Time</label>
        <select className={inputClass} value={time} onChange={e => setParametricParams(prev => ({ ...prev, time: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{columnLabel(column)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Event (0/1)</label>
        <select className={inputClass} value={event} onChange={e => setParametricParams(prev => ({ ...prev, event: parseInt(e.target.value, 10) }))}>
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
                checked={predictors.includes(index)}
                disabled={index === time || index === event}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(column)}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Distribution</label>
        <select className={inputClass} value={distribution} onChange={e => setParametricParams(prev => ({ ...prev, distribution: e.target.value as ParametricSurvivalParams['distribution'] }))}>
          <option value="weibull">Weibull</option>
          <option value="exponential">Exponential</option>
        </select>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Modello AFT: log(T) = μ + Xβ + σ·W. L’evento deve essere 0/1 e il tempo positivo.
      </p>
    </div>
  );
};
