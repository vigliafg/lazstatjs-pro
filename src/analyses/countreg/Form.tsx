import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CountParams } from '../../io/project';

export interface CountFormProps {
  grid: GridData;
  countParams: CountParams;
  setCountParams: Dispatch<SetStateAction<CountParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const CountForm = ({ grid, countParams, setCountParams }: CountFormProps) => {
  const { dep, indeps, family } = countParams;
  const toggle = (index: number) => {
    setCountParams(prev => ({
      ...prev,
      indeps: prev.indeps.includes(index)
        ? prev.indeps.filter(item => item !== index)
        : [...prev.indeps, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Count outcome</label>
        <select className={inputClass} value={dep} onChange={e => setCountParams(prev => ({ ...prev, dep: parseInt(e.target.value, 10) }))}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{column.name}</option>
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
                checked={indeps.includes(index)}
                disabled={index === dep}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{column.name}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Family</label>
        <select className={inputClass} value={family} onChange={e => setCountParams(prev => ({ ...prev, family: e.target.value as CountParams['family'] }))}>
          <option value="poisson">Poisson</option>
          <option value="negbin">Negative binomial (NB2)</option>
        </select>
      </div>

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        L’esito deve essere un conteggio non negativo. Con overdispersion usa la negative binomiale.
      </p>
    </div>
  );
};
