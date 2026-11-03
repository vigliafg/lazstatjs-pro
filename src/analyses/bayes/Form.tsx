import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { BayesParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Advanced,
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';

export interface BayesFormProps {
  grid: GridData;
  bayesParams: BayesParams;
  setBayesParams: Dispatch<SetStateAction<BayesParams>>;
}

export const BayesForm = ({ grid, bayesParams, setBayesParams }: BayesFormProps) => (
  <div className="flex flex-col gap-3">
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={bayesParams.mode}
        onChange={event =>
          setBayesParams(previous => ({
            ...previous,
            mode: event.target.value as BayesParams['mode'],
          }))
        }
      >
        <option value="normal">{t('bayes.normal')}</option>
        <option value="proportion">{t('bayes.proportion')}</option>
        <option value="rate">{t('bayes.rate')}</option>
        <option value="regression">{t('bayes.regression')}</option>
      </select>
    </Field>
    <VariableSelect
      label={t('form.outcome')}
      value={bayesParams.outcome}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setBayesParams(previous => ({ ...previous, outcome: value }))}
    />
    {bayesParams.mode === 'regression' && (
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={bayesParams.predictors}
        onToggle={(column, checked) =>
          setBayesParams(previous => ({
            ...previous,
            predictors: checked
              ? Array.from(new Set([...previous.predictors, column]))
              : previous.predictors.filter(value => value !== column),
          }))
        }
      />
    )}
    <Advanced>
      <NumberField
        label={t('form.priorMean')}
        value={bayesParams.priorMean}
        step="0.1"
        onChange={value => setBayesParams(previous => ({ ...previous, priorMean: value }))}
      />
      <NumberField
        label={t('form.priorSd')}
        value={bayesParams.priorSd}
        min="0.000001"
        step="0.5"
        onChange={value => setBayesParams(previous => ({ ...previous, priorSd: value }))}
      />
      <NumberField
        label={t('form.iterations')}
        value={bayesParams.iterations}
        min="100"
        max="100000"
        step="500"
        integer
        onChange={value => setBayesParams(previous => ({ ...previous, iterations: value }))}
      />
      <NumberField
        label={t('form.burnin')}
        value={bayesParams.burnin}
        min="0"
        max="50000"
        step="100"
        integer
        onChange={value => setBayesParams(previous => ({ ...previous, burnin: value }))}
      />
      <NumberField
        label={t('form.chains')}
        value={bayesParams.chains}
        min="1"
        max="8"
        step="1"
        integer
        onChange={value => setBayesParams(previous => ({ ...previous, chains: value }))}
      />
      <NumberField
        label={t('form.seed')}
        value={bayesParams.seed}
        step="1"
        integer
        onChange={value => setBayesParams(previous => ({ ...previous, seed: value }))}
      />
    </Advanced>
  </div>
);
