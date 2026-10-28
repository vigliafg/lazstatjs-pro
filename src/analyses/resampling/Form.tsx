import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { ResamplingParams } from '../../io/project';

export interface ResamplingFormProps {
  grid: GridData;
  resamplingParams: ResamplingParams;
  setResamplingParams: Dispatch<SetStateAction<ResamplingParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[130px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const ResamplingForm = ({ grid, resamplingParams, setResamplingParams }: ResamplingFormProps) => (
  <div className="flex flex-wrap gap-4 items-start">
    <div className="flex flex-col gap-1">
      <label className={labelClass}>Outcome</label>
      <select className={inputClass} value={resamplingParams.outcome} onChange={e => setResamplingParams(prev => ({ ...prev, outcome: parseInt(e.target.value, 10) }))}>
        {grid.cols.map((column, index) => (
          <option key={index} value={index}>{column.name}</option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className={labelClass}>Group (2 levels)</label>
      <select className={inputClass} value={resamplingParams.group} onChange={e => setResamplingParams(prev => ({ ...prev, group: parseInt(e.target.value, 10) }))}>
        {groupColumnIndexes(grid).map(index => (
          <option key={index} value={index}>{grid.cols[index]?.name}</option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className={labelClass}>Statistic</label>
      <select className={inputClass} value={resamplingParams.statistic} onChange={e => setResamplingParams(prev => ({ ...prev, statistic: e.target.value as ResamplingParams['statistic'] }))}>
        <option value="mean">Difference of means</option>
        <option value="median">Difference of medians</option>
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className={labelClass}>Permutations</label>
      <input type="number" min="99" max="50000" step="100" className={`${inputClass} w-28`} value={resamplingParams.permutations} onChange={e => setResamplingParams(prev => ({ ...prev, permutations: parseInt(e.target.value, 10) }))} />
    </div>

    <div className="flex flex-col gap-1">
      <label className={labelClass}>Bootstrap reps</label>
      <input type="number" min="99" max="50000" step="100" className={`${inputClass} w-28`} value={resamplingParams.bootstrap} onChange={e => setResamplingParams(prev => ({ ...prev, bootstrap: parseInt(e.target.value, 10) }))} />
    </div>

    <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
      Permutazione a due code e bootstrap percentile della differenza tra due gruppi.
    </p>
  </div>
);
