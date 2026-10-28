import type { Dispatch, SetStateAction } from 'react';
import { DISTRIBUTION_LABEL, type DistributionName } from '../../stats/distfit';
import type { GridData } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';

export interface DistributionFitFormProps {
  grid: GridData;
  distfitParams: DistributionFitParams;
  setDistfitParams: Dispatch<SetStateAction<DistributionFitParams>>;
}

const ALL: DistributionName[] = ['normal', 'lognormal', 'exponential', 'gamma', 'weibull'];

export const DistributionFitForm = ({
  grid,
  distfitParams,
  setDistfitParams,
}: DistributionFitFormProps) => {
  const toggle = (name: DistributionName) => {
    setDistfitParams(prev => ({
      ...prev,
      selected: prev.selected.includes(name)
        ? prev.selected.filter(item => item !== name)
        : [...prev.selected, name],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Variable</label>
        <select
          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[140px]"
          value={distfitParams.variable}
          onChange={e => setDistfitParams(prev => ({ ...prev, variable: parseInt(e.target.value, 10) }))}
        >
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Distributions</label>
        <div className="bg-surface3 border border-border2 rounded p-2 flex flex-wrap gap-x-3 gap-y-1 max-w-[360px]">
          {ALL.map(name => (
            <label
              key={name}
              className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={distfitParams.selected.includes(name)}
                onChange={() => toggle(name)}
              />
              {DISTRIBUTION_LABEL[name]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
