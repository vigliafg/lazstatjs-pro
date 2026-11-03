import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { NonlinearParams } from '../../io/project';
import { Field, VariableSelect, variableOptionsFrom } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface NonlinearFormProps {
  grid: GridData;
  params: NonlinearParams;
  setParams: Dispatch<SetStateAction<NonlinearParams>>;
}

export const NonlinearForm = ({ grid, params, setParams }: NonlinearFormProps) => {
  const options = variableOptionsFrom(grid.cols, continuousColumnIndexes(grid));
  return (
    <>
      <Field label={t('nonlinear.model')}>
        <select
          aria-label={t('nonlinear.model')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={params.model}
          onChange={event =>
            setParams(previous => ({
              ...previous,
              model: event.target.value as NonlinearParams['model'],
            }))
          }
        >
          <option value="exponential">{t('nonlinear.exponential')}</option>
          <option value="logistic">{t('nonlinear.logistic')}</option>
          <option value="gompertz">{t('nonlinear.gompertz')}</option>
          <option value="power">{t('nonlinear.power')}</option>
          <option value="michaelis">{t('nonlinear.michaelis')}</option>
        </select>
      </Field>

      <VariableSelect
        label={t('form.dependentY')}
        value={params.dep}
        options={options}
        disabledValues={[params.predictor]}
        onChange={value => setParams(previous => ({ ...previous, dep: value }))}
      />

      <VariableSelect
        label={t('form.predictorX')}
        value={params.predictor}
        options={options}
        disabledValues={[params.dep]}
        onChange={value => setParams(previous => ({ ...previous, predictor: value }))}
      />
    </>
  );
};
