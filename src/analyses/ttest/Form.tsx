import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TTestParams } from '../../io/project';

export interface TTestFormProps {
  grid: GridData;
  ttestParams: TTestParams;
  setTTestParams: Dispatch<SetStateAction<TTestParams>>;
}

export const TTestForm = ({ grid, ttestParams, setTTestParams }: TTestFormProps) => (
  <>
      <>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Test Type</label>
          <select 
            className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]"
            value={ttestParams.type}
            onChange={(e) => setTTestParams(p => ({ ...p, type: e.target.value as any }))}
          >
            <option value="ind">Independent Samples</option>
            <option value="dep">Paired Samples</option>
            <option value="one">One-Sample</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variable 1</label>
          <select 
            className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
            value={ttestParams.var1}
            onChange={(e) => setTTestParams(p => ({ ...p, var1: parseInt(e.target.value) }))}
          >
            {grid.cols.map((c, i) => <option key={i} value={i}>{columnLabel(c)}</option>)}
          </select>
        </div>
        {ttestParams.type !== 'one' ? (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variable 2</label>
            <select 
              className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
              value={ttestParams.var2}
              onChange={(e) => setTTestParams(p => ({ ...p, var2: parseInt(e.target.value) }))}
            >
              {grid.cols.map((c, i) => <option key={i} value={i}>{columnLabel(c)}</option>)}
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Test Mean (μ₀)</label>
            <input 
              type="number" 
              className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded w-24"
              value={ttestParams.mu}
              onChange={(e) => setTTestParams(p => ({ ...p, mu: parseFloat(e.target.value) }))}
            />
          </div>
        )}
        {ttestParams.type === 'ind' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variances</label>
            <select
              className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]"
              value={ttestParams.equalVar ? 'equal' : 'welch'}
              onChange={(e) => setTTestParams(p => ({ ...p, equalVar: e.target.value === 'equal' }))}
            >
              <option value="equal">Equal (pooled)</option>
              <option value="welch">Unequal (Welch)</option>
            </select>
          </div>
        )}
      </>
  </>
);
