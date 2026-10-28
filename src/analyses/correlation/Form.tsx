import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CorrParams } from '../../io/project';

export interface CorrelationFormProps {
  grid: GridData;
  corrParams: CorrParams;
  setCorrParams: Dispatch<SetStateAction<CorrParams>>;
}

export const CorrelationForm = ({ grid, corrParams, setCorrParams }: CorrelationFormProps) => (
  <>
      <>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variables</label>
          <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
            {grid.cols.map((col, i) => (
              <label key={i} className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5">
                <input 
                  type="checkbox" 
                  className="accent-accent" 
                  checked={corrParams.vars.includes(i)}
                  onChange={(e) => {
                    const newVars = e.target.checked 
                      ? [...corrParams.vars, i]
                      : corrParams.vars.filter(idx => idx !== i);
                    setCorrParams(p => ({ ...p, vars: newVars }));
                  }}
                />
                {columnLabel(col)}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Primary Method</label>
          <select 
            className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
            value={corrParams.method}
            onChange={(e) => setCorrParams(p => ({ ...p, method: e.target.value as any }))}
          >
            <option value="pearson">Pearson</option>
            <option value="spearman">Spearman</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Non-Parametric</label>
          <div className="flex flex-col gap-1 pt-0.5">
            <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-accent" 
                checked={corrParams.showSpearman}
                onChange={(e) => setCorrParams(p => ({ ...p, showSpearman: e.target.checked }))}
              />
              Spearman (ρ)
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-accent" 
                checked={corrParams.showKendall}
                onChange={(e) => setCorrParams(p => ({ ...p, showKendall: e.target.checked }))}
              />
              Kendall's Tau (τ)
            </label>
          </div>
        </div>
      </>
  </>
);
