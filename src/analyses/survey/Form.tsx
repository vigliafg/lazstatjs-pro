import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { SurveyParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Advanced,
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { continuousColumnIndexes, isNumericColumn } from '../shared/columns';

export interface SurveyFormProps {
  grid: GridData;
  surveyParams: SurveyParams;
  setSurveyParams: Dispatch<SetStateAction<SurveyParams>>;
}

export const SurveyForm = ({ grid, surveyParams, setSurveyParams }: SurveyFormProps) => {
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={surveyParams.mode}
          onChange={event =>
            setSurveyParams(previous => ({
              ...previous,
              mode: event.target.value as SurveyParams['mode'],
            }))
          }
        >
          <option value="mean">{t('survey.mean')}</option>
          <option value="total">{t('survey.total')}</option>
          <option value="proportion">{t('survey.proportion')}</option>
          <option value="regression">{t('survey.regression')}</option>
        </select>
      </Field>

      {surveyParams.mode === 'proportion' ? (
        <>
          <VariableSelect
            label={t('form.paretoCategory')}
            value={surveyParams.category}
            options={variableOptions(grid.cols)}
            onChange={value => setSurveyParams(previous => ({ ...previous, category: value }))}
          />
          <Field label={t('form.successLevel')}>
            <input
              className="w-32 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={surveyParams.successLevel}
              onChange={event =>
                setSurveyParams(previous => ({ ...previous, successLevel: event.target.value }))
              }
            />
          </Field>
        </>
      ) : (
        <VariableSelect
          label={t('form.variable1')}
          value={surveyParams.variable}
          options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
          onChange={value => setSurveyParams(previous => ({ ...previous, variable: value }))}
        />
      )}

      <Advanced>
        <VariableSelect
          label={t('form.weight')}
          value={surveyParams.weight}
          options={[{ value: -1, label: t('form.none') }, ...variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))]}
          onChange={value => setSurveyParams(previous => ({ ...previous, weight: value }))}
        />
        <VariableSelect
          label={t('form.strata')}
          value={surveyParams.strata}
          options={[{ value: -1, label: t('form.none') }, ...variableOptions(grid.cols)]}
          onChange={value => setSurveyParams(previous => ({ ...previous, strata: value }))}
        />
        <VariableSelect
          label={t('form.cluster')}
          value={surveyParams.cluster}
          options={[{ value: -1, label: t('form.none') }, ...variableOptions(grid.cols)]}
          onChange={value => setSurveyParams(previous => ({ ...previous, cluster: value }))}
        />
        {surveyParams.mode === 'regression' && (
          <VariableList
            label={t('form.predictorsX')}
            cols={grid.cols}
            only={continuousColumnIndexes(grid)}
            selected={surveyParams.predictors}
            onToggle={(column, checked) =>
              setSurveyParams(previous => ({
                ...previous,
                predictors: checked
                  ? Array.from(new Set([...previous.predictors, column]))
                  : previous.predictors.filter(value => value !== column),
              }))
            }
          />
        )}
      </Advanced>
    </div>
  );
};
