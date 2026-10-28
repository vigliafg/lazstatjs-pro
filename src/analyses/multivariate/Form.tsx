import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MultivariateMode, MultivariateParams } from '../../io/project';
import { defaultMultivariateParams } from './defaults';
import { numericColumnIndexes } from '../shared/columns';

export interface MultivariateFormProps {
  grid: GridData;
  multivariateParams: MultivariateParams;
  setMultivariateParams: Dispatch<SetStateAction<MultivariateParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const MultivariateForm = ({
  grid,
  multivariateParams,
  setMultivariateParams,
}: MultivariateFormProps) => {
  const { mode, standardize, selected, factors, rotation } = multivariateParams;
  const numericColumns = numericColumnIndexes(grid);

  // Keep the old behaviour: a change in the number of columns re-picks the
  // default variables. The first mount must not overwrite restored params.
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    if (previousCols.current === grid.cols.length) return;
    previousCols.current = grid.cols.length;
    setMultivariateParams(prev => ({ ...prev, selected: defaultMultivariateParams(grid).selected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  const toggle = (index: number) => {
    setMultivariateParams(prev => ({
      ...prev,
      selected: prev.selected.includes(index)
        ? prev.selected.filter(item => item !== index)
        : [...prev.selected, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Analysis</label>
        <select
          className={inputClass}
          value={mode}
          onChange={event =>
            setMultivariateParams(prev => ({ ...prev, mode: event.target.value as MultivariateMode }))
          }
        >
          <option value="pca">PCA (componenti)</option>
          <option value="alpha">Cronbach α (affidabilità)</option>
          <option value="efa">EFA (analisi fattoriale)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          {mode === 'pca' ? 'Variables (≥ 2)' : mode === 'efa' ? 'Variables (≥ 3)' : 'Items of the scale (≥ 2)'}
        </label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[240px] max-h-[120px] overflow-auto scrollbar">
          {numericColumns.length === 0 && (
            <p className="text-[10px] text-text3 italic">No numeric columns</p>
          )}
          {numericColumns.map(index => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={selected.includes(index)}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{grid.cols[index]?.name}</span>
              <span className="text-[9px] text-text3 font-mono">{grid.cols[index]?.type}</span>
            </label>
          ))}
        </div>
      </div>

      {mode === 'efa' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Factors (0 = auto)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="1"
              className={`${inputClass} w-24`}
              value={factors}
              onChange={event => setMultivariateParams(prev => ({ ...prev, factors: parseInt(event.target.value, 10) }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Rotation</label>
            <select
              className={inputClass}
              value={rotation}
              onChange={event => setMultivariateParams(prev => ({ ...prev, rotation: event.target.value as 'none' | 'varimax' }))}
            >
              <option value="varimax">Varimax</option>
              <option value="none">None</option>
            </select>
          </div>
        </>
      )}

      {mode === 'pca' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Matrix</label>
          <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer pt-1.5">
            <input
              type="checkbox"
              className="accent-accent"
              checked={standardize}
              onChange={event =>
                setMultivariateParams(prev => ({ ...prev, standardize: event.target.checked }))
              }
            />
            Correlation (standardized)
          </label>
        </div>
      )}

      <p className="text-[10px] text-text3 max-w-[380px] self-end pb-1">
        {mode === 'pca'
          ? 'La PCA riassume le variabili in componenti non correlati. La matrice di correlazione è consigliata quando le scale differiscono; Kaiser, Bartlett e KMO sono calcolati automaticamente.'
          : mode === 'efa'
            ? 'L’EFA stima fattori latenti con principal-axis factoring. La parallel analysis sceglie il numero di fattori quando lasci 0; varimax ruota la soluzione.'
            : 'L’α di Cronbach stima la coerenza interna della scala. Servono item nella stessa direzione (ricodifica i reverse) e casi completi.'}
      </p>
    </div>
  );
};
