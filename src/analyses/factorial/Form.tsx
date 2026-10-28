import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { FactorialParams } from '../../io/project';

export interface FactorialFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  factorialParams: FactorialParams;
  setFactorialParams: Dispatch<SetStateAction<FactorialParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const FactorialForm = ({
  grid,
  onLevels,
  onRecode,
  factorialParams,
  setFactorialParams,
}: FactorialFormProps) => {
  const { response, factorA, factorB, interaction } = factorialParams;
  const factors = groupColumnIndexes(grid);

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Response (Y)</label>
        <select
          className={inputClass}
          value={response}
          onChange={e => setFactorialParams(prev => ({ ...prev, response: parseInt(e.target.value, 10) }))}
        >
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Factor A</label>
        <div className="flex items-center gap-1">
          <select
            className={inputClass}
            value={factorA}
            onChange={e => setFactorialParams(prev => ({ ...prev, factorA: parseInt(e.target.value, 10) }))}
          >
            {factors.map(index => (
              <option key={index} value={index}>
                {grid.cols[index]?.name}
              </option>
            ))}
          </select>
          <LevelsEditor
            grid={grid}
            column={factorA}
            onLevels={onLevels}
            onRecode={onRecode}
            label="Modifica livelli"
            className={LEVELS_BUTTON_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Factor B</label>
        <div className="flex items-center gap-1">
          <select
            className={inputClass}
            value={factorB}
            onChange={e => setFactorialParams(prev => ({ ...prev, factorB: parseInt(e.target.value, 10) }))}
          >
            {factors.map(index => (
              <option key={index} value={index}>
                {grid.cols[index]?.name}
              </option>
            ))}
          </select>
          <LevelsEditor
            grid={grid}
            column={factorB}
            onLevels={onLevels}
            onRecode={onRecode}
            label="Modifica livelli"
            className={LEVELS_BUTTON_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Model</label>
        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer pt-1.5">
          <input
            type="checkbox"
            className="accent-accent"
            checked={interaction}
            onChange={e => setFactorialParams(prev => ({ ...prev, interaction: e.target.checked }))}
          />
          Include A × B interaction
        </label>
      </div>
    </div>
  );
};
