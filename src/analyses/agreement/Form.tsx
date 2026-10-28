import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { AgreementParams } from '../../io/project';

export interface AgreementFormProps {
  grid: GridData;
  agreementParams: AgreementParams;
  setAgreementParams: Dispatch<SetStateAction<AgreementParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[140px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const AgreementForm = ({ grid, agreementParams, setAgreementParams }: AgreementFormProps) => {
  const { mode, columns, weight } = agreementParams;

  const toggle = (index: number) => {
    setAgreementParams(prev => ({
      ...prev,
      columns: prev.columns.includes(index)
        ? prev.columns.filter(item => item !== index)
        : [...prev.columns, index],
    }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Procedure</label>
        <select
          className={inputClass}
          value={mode}
          onChange={e => setAgreementParams(prev => ({ ...prev, mode: e.target.value as AgreementParams['mode'] }))}
        >
          <option value="icc">ICC (affidabilità)</option>
          <option value="bland">Bland–Altman</option>
          <option value="kappa">Kappa (accordo categoriale)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          {mode === 'bland' ? 'Two measurements' : mode === 'kappa' ? 'Raters' : 'Measurements'}
        </label>
        <div className="bg-surface3 border border-border2 rounded p-2 min-w-[220px] max-h-[120px] overflow-auto scrollbar">
          {grid.cols.map((column, index) => (
            <label key={index} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-accent"
                checked={columns.includes(index)}
                onChange={() => toggle(index)}
              />
              <span className="text-[11px] text-text2">{columnLabel(column)}</span>
              <span className="text-[9px] text-text3 font-mono">{column.type}</span>
            </label>
          ))}
        </div>
      </div>

      {mode === 'kappa' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Weights</label>
          <select
            className={inputClass}
            value={weight}
            onChange={e => setAgreementParams(prev => ({ ...prev, weight: e.target.value as AgreementParams['weight'] }))}
          >
            <option value="none">None (unweighted)</option>
            <option value="linear">Linear</option>
            <option value="quadratic">Quadratic</option>
          </select>
        </div>
      )}

      <p className="text-[10px] text-text3 max-w-[340px] self-end pb-1">
        {mode === 'bland'
          ? 'Servono due colonne con le due misure della stessa unità.'
          : mode === 'kappa'
            ? 'Cohen con due rater, Fleiss con più di due. Le categorie vengono lette dalle celle.'
            : 'ICC(2,1) accordo assoluto, ICC(3,1) consistenza, ICC(1,1) one-way.'}
      </p>
    </div>
  );
};
