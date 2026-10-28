import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TostParams } from '../../io/project';

export interface TostFormProps {
  grid: GridData;
  tostParams: TostParams;
  setTostParams: Dispatch<SetStateAction<TostParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const TostForm = ({ grid, tostParams, setTostParams }: TostFormProps) => {
  const { design, var1, var2, mu, margin, equalVar } = tostParams;
  const update = (patch: Partial<TostParams>) =>
    setTostParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Design</label>
        <select className={inputClass} value={design} onChange={e => update({ design: e.target.value as TostParams['design'] })}>
          <option value="one">One-sample / vs target</option>
          <option value="paired">Paired measures</option>
          <option value="ind">Two independent groups</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Variable 1</label>
        <select className={inputClass} value={var1} onChange={e => update({ var1: parseInt(e.target.value, 10) })}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>{column.name}</option>
          ))}
        </select>
      </div>

      {design !== 'one' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Variable 2</label>
          <select className={inputClass} value={var2} onChange={e => update({ var2: parseInt(e.target.value, 10) })}>
            {grid.cols.map((column, index) => (
              <option key={index} value={index}>{column.name}</option>
            ))}
          </select>
        </div>
      )}

      {design === 'one' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Target (μ₀)</label>
          <input type="number" step="any" className={`${inputClass} w-24`} value={mu} onChange={e => update({ mu: parseFloat(e.target.value) })} />
        </div>
      )}

      {design === 'ind' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Variances</label>
          <select className={inputClass} value={equalVar ? 'equal' : 'welch'} onChange={e => update({ equalVar: e.target.value === 'equal' })}>
            <option value="equal">Equal (pooled)</option>
            <option value="welch">Unequal (Welch)</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Equivalence margin</label>
        <input type="number" min="0" step="any" className={`${inputClass} w-28`} value={margin} onChange={e => update({ margin: parseFloat(e.target.value) })} />
      </div>

      <p className="text-[10px] text-text3 max-w-[320px] self-end pb-1">
        Il margine va fissato prima di vedere i dati. Il livello di confidenza è quello globale della scheda.
      </p>
    </div>
  );
};
