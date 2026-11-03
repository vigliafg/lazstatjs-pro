import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MlParams } from '../../io/project';
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

export interface MlFormProps {
  grid: GridData;
  mlParams: MlParams;
  setMlParams: Dispatch<SetStateAction<MlParams>>;
}

export const MlForm = ({ grid, mlParams, setMlParams }: MlFormProps) => (
  <div className="flex flex-col gap-3">
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={mlParams.mode}
        onChange={event =>
          setMlParams(previous => ({
            ...previous,
            mode: event.target.value as MlParams['mode'],
          }))
        }
      >
        <option value="rf">{t('ml.rf')}</option>
        <option value="boosting">{t('ml.boosting')}</option>
        <option value="nnet">{t('ml.nnet')}</option>
      </select>
    </Field>
    <VariableSelect
      label={t('form.outcome')}
      value={mlParams.outcome}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setMlParams(previous => ({ ...previous, outcome: value }))}
    />
    <VariableList
      label={t('form.predictorsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      selected={mlParams.predictors}
      onToggle={(column, checked) =>
        setMlParams(previous => ({
          ...previous,
          predictors: checked
            ? Array.from(new Set([...previous.predictors, column]))
            : previous.predictors.filter(value => value !== column),
        }))
      }
    />
    <Advanced>
      <NumberField
        label={t('form.trees')}
        value={mlParams.trees}
        min="10"
        max="2000"
        step="10"
        integer
        onChange={value => setMlParams(previous => ({ ...previous, trees: value }))}
      />
      <NumberField
        label={t('form.minNode')}
        value={mlParams.minNode}
        min="1"
        max="100"
        step="1"
        integer
        onChange={value => setMlParams(previous => ({ ...previous, minNode: value }))}
      />
      <NumberField
        label={t('form.mtry')}
        value={mlParams.mtry}
        min="0"
        max="50"
        step="1"
        integer
        hint={t('hint.ml.mtry')}
        onChange={value => setMlParams(previous => ({ ...previous, mtry: value }))}
      />
      <NumberField
        label={t('form.shrinkage')}
        value={mlParams.shrinkage}
        min="0.001"
        max="1"
        step="0.01"
        onChange={value => setMlParams(previous => ({ ...previous, shrinkage: value }))}
      />
      <NumberField
        label={t('form.hidden')}
        value={mlParams.hidden}
        min="1"
        max="20"
        step="1"
        integer
        onChange={value => setMlParams(previous => ({ ...previous, hidden: value }))}
      />
      <NumberField
        label={t('form.iterations')}
        value={mlParams.iterations}
        min="50"
        max="5000"
        step="50"
        integer
        onChange={value => setMlParams(previous => ({ ...previous, iterations: value }))}
      />
      <NumberField
        label={t('form.seed')}
        value={mlParams.seed}
        step="1"
        integer
        onChange={value => setMlParams(previous => ({ ...previous, seed: value }))}
      />
    </Advanced>
  </div>
);
