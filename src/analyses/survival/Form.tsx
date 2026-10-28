import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { SurvivalParams } from '../../io/project';

export interface SurvivalFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  survivalParams: SurvivalParams;
  setSurvivalParams: Dispatch<SetStateAction<SurvivalParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]';

export const SurvivalForm = ({
  grid,
  onLevels,
  onRecode,
  survivalParams,
  setSurvivalParams,
}: SurvivalFormProps) => (
  <div className="flex flex-wrap gap-4 items-start">
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Time</label>
      <select
        className={inputClass}
        value={survivalParams.timeVariable}
        onChange={e => setSurvivalParams(prev => ({ ...prev, timeVariable: parseInt(e.target.value, 10) }))}
      >
        {grid.cols.map((column, index) => (
          <option key={index} value={index}>
            {columnLabel(column)}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Event (0/1)</label>
      <select
        className={inputClass}
        value={survivalParams.eventVariable}
        onChange={e => setSurvivalParams(prev => ({ ...prev, eventVariable: parseInt(e.target.value, 10) }))}
      >
        {grid.cols.map((column, index) => (
          <option key={index} value={index}>
            {columnLabel(column)}
          </option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Group (optional)</label>
      <div className="flex items-center gap-1">
        <select
          className={inputClass}
          value={survivalParams.groupVariable}
          onChange={e => setSurvivalParams(prev => ({ ...prev, groupVariable: parseInt(e.target.value, 10) }))}
        >
          <option value={-1}>None</option>
          {groupColumnIndexes(grid).map((index) => (
            <option key={index} value={index}>
              {columnLabel(grid.cols[index])}
            </option>
          ))}
        </select>
        <LevelsEditor
          grid={grid}
          column={survivalParams.groupVariable}
          onLevels={onLevels}
          onRecode={onRecode}
          label="Modifica livelli"
          className={LEVELS_BUTTON_CLASS}
        />
      </div>
    </div>
  </div>
);
