import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { AgreementParams } from '../../io/project';
import { Field, VariableList } from '../../components/FormFields';
import { t } from '../../i18n';

export interface AgreementFormProps {
  grid: GridData;
  agreementParams: AgreementParams;
  setAgreementParams: Dispatch<SetStateAction<AgreementParams>>;
}

export const AgreementForm = ({ grid, agreementParams, setAgreementParams }: AgreementFormProps) => {
  const { mode, columns, weight } = agreementParams;
  const hint =
    mode === 'bland'
      ? t('hint.agreementBland')
      : mode === 'kappa'
        ? t('hint.agreementKappa')
        : t('hint.agreementIcc');

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[140px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={e =>
            setAgreementParams(prev => ({
              ...prev,
              mode: e.target.value as AgreementParams['mode'],
            }))
          }
        >
          <option value="icc">{t('agreement.icc')}</option>
          <option value="bland">{t('agreement.bland')}</option>
          <option value="kappa">{t('agreement.kappa')}</option>
        </select>
      </Field>

      <VariableList
        label={
          mode === 'bland'
            ? t('form.twoMeasurements')
            : mode === 'kappa'
              ? t('form.raters')
              : t('form.measurements')
        }
        cols={grid.cols}
        selected={columns}
        showType
        onToggle={(index, checked) =>
          setAgreementParams(prev => ({
            ...prev,
            columns: checked
              ? [...prev.columns, index]
              : prev.columns.filter(item => item !== index),
          }))
        }
        hint={hint}
      />

      {mode === 'kappa' && (
        <Field label={t('form.weights')}>
          <select
            aria-label={t('form.weights')}
            className="min-w-[140px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={weight}
            onChange={e =>
              setAgreementParams(prev => ({
                ...prev,
                weight: e.target.value as AgreementParams['weight'],
              }))
            }
          >
            <option value="none">{t('form.unweighted')}</option>
            <option value="linear">{t('form.linear')}</option>
            <option value="quadratic">{t('form.quadratic')}</option>
          </select>
        </Field>
      )}
    </div>
  );
};
