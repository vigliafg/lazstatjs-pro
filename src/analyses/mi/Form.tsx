import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MiParams } from '../../io/project';

export interface MiFormProps {
  grid: GridData;
  miParams: MiParams;
  setMiParams: Dispatch<SetStateAction<MiParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[110px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const MiForm = ({ grid, miParams, setMiParams }: MiFormProps) => {
  const toggle = (index: number) => {
    setMiParams(prev => ({
      ...prev,
      variables: prev.variables.includes(index)
        ? prev.variables.filter(item => item !== index)
        : [...prev.variables, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Variables</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[240px] max-h-[140px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={miParams.variables.includes(index)}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{column.name}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Pooled analysis</label>
        <select
          className={inputClass}
          value={miParams.model}
          onChange={e => setMiParams(prev => ({ ...prev, model: e.target.value as MiParams['model'] }))}
        >
          <option value="descriptives">Descriptives</option>
          <option value="linear">Linear regression</option>
        </select>
      </div>

      {miParams.model === 'linear' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Outcome</label>
            <select
              className={inputClass}
              value={miParams.outcome}
              onChange={e => setMiParams(prev => ({ ...prev, outcome: parseInt(e.target.value, 10) }))}
            >
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>{column.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Predictors</label>
            <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
              {grid.cols.map((column, index) => (
                <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={miParams.predictors.includes(index)}
                    disabled={index === miParams.outcome}
                    onChange={() => setMiParams(prev => ({
                      ...prev,
                      predictors: prev.predictors.includes(index)
                        ? prev.predictors.filter(item => item !== index)
                        : [...prev.predictors, index],
                    }))}
                  />
                  <span className="text-[11px] text-text2">{column.name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Imputations (m)</label>
        <input
          type="number"
          min="2"
          max="50"
          step="1"
          className={`${inputClass} w-24`}
          value={miParams.imputations}
          onChange={e => setMiParams(prev => ({ ...prev, imputations: parseInt(e.target.value, 10) }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Iterations</label>
        <input
          type="number"
          min="1"
          max="50"
          step="1"
          className={`${inputClass} w-24`}
          value={miParams.iterations}
          onChange={e => setMiParams(prev => ({ ...prev, iterations: parseInt(e.target.value, 10) }))}
        />
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        Imputazione numerica a catene (MICE) e pooling di Rubin per media e SD. Assume MAR.
      </p>
    </div>
  );
};
