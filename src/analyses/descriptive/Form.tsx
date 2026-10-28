import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';

export interface DescriptiveFormProps {
  grid: GridData;
  descVars: number[];
  setDescVars: Dispatch<SetStateAction<number[]>>;
}

export const DescriptiveForm = ({ grid, descVars, setDescVars }: DescriptiveFormProps) => (
  <>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Select Variables</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[200px] max-h-[100px] overflow-auto scrollbar">
          {grid.cols.map((col, i) => (
            <label key={i} className="flex items-center gap-2 text-[11px] text-text2 hover:text-text cursor-pointer py-0.5">
              <input 
                type="checkbox" 
                className="accent-accent" 
                checked={descVars.includes(i)} 
                onChange={(e) => {
                  const newVars = e.target.checked 
                    ? [...descVars, i]
                    : descVars.filter(idx => idx !== i);
                  setDescVars(newVars);
                }}
              />
              {col.name}
            </label>
          ))}
        </div>
      </div>
  </>
);
