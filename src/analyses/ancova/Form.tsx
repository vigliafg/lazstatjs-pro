import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { AncovaParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';

export interface AncovaFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  ancovaParams: AncovaParams;
  setAncovaParams: Dispatch<SetStateAction<AncovaParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const AncovaForm = ({
  grid,
  onLevels,
  onRecode,
  ancovaParams,
  setAncovaParams,
}: AncovaFormProps) => {
  const { response, factor, covariates } = ancovaParams;
  const numericColumns = numericColumnIndexes(grid);
  const factorColumns = groupColumnIndexes(grid);
  const availableCovariates = numericColumns.filter(index => index !== response && index !== factor);

  const toggleCovariate = (index: number) => {
    setAncovaParams(prev => ({
      ...prev,
      covariates: prev.covariates.includes(index)
        ? prev.covariates.filter(item => item !== index)
        : [...prev.covariates, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Response (Y)</label>
        <select
          className={inputClass}
          value={response}
          onChange={event => setAncovaParams(prev => ({ ...prev, response: parseInt(event.target.value, 10) }))}
        >
          {numericColumns.map(index => (
            <option key={index} value={index}>
              {columnLabel(grid.cols[index])}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Factor</label>
        <div className="flex items-center gap-1">
          <select
            className={inputClass}
            value={factor}
            onChange={event => setAncovaParams(prev => ({ ...prev, factor: parseInt(event.target.value, 10) }))}
          >
            {factorColumns.map(index => (
              <option key={index} value={index}>
                {columnLabel(grid.cols[index])}
              </option>
            ))}
          </select>
          <LevelsEditor
            grid={grid}
            column={factor}
            onLevels={onLevels}
            onRecode={onRecode}
            label="Modifica livelli"
            className={LEVELS_BUTTON_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Covariates (≥ 1)</label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[120px] overflow-auto scrollbar">
          {availableCovariates.length === 0 && (
            <p className="text-[10px] text-text3 italic">No numeric covariates</p>
          )}
          {availableCovariates.map(index => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={covariates.includes(index)}
                onChange={() => toggleCovariate(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(grid.cols[index])}</span>
              <span className="text-[9px] text-text3 font-mono">{grid.cols[index]?.type}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-text3 max-w-[380px] self-end pb-1">
        Confronta le medie dei gruppi rimuovendo l’effetto lineare delle covariate. Il test di
        omogeneità delle pendenze e i confronti Holm sulle medie aggiustate sono automatici.
      </p>
    </div>
  );
};
