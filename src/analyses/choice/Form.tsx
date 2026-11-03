import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ChoiceParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';

export interface ChoiceFormProps {
  grid: GridData;
  choiceParams: ChoiceParams;
  setChoiceParams: Dispatch<SetStateAction<ChoiceParams>>;
}

export const ChoiceForm = ({ grid, choiceParams, setChoiceParams }: ChoiceFormProps) => (
  <div className="flex flex-col gap-3">
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={choiceParams.mode}
        onChange={event =>
          setChoiceParams(previous => ({
            ...previous,
            mode: event.target.value as ChoiceParams['mode'],
          }))
        }
      >
        <option value="choice">{t('choice.choice')}</option>
        <option value="maxdiff">{t('choice.maxdiff')}</option>
      </select>
    </Field>
    <VariableSelect
      label={choiceParams.mode === 'choice' ? t('form.choiceSet') : t('form.block')}
      value={choiceParams.set}
      options={variableOptions(grid.cols)}
      onChange={value => setChoiceParams(previous => ({ ...previous, set: value }))}
    />
    <VariableSelect
      label={choiceParams.mode === 'choice' ? t('form.alternative') : t('form.item')}
      value={choiceParams.alternative}
      options={variableOptions(grid.cols)}
      onChange={value => setChoiceParams(previous => ({ ...previous, alternative: value }))}
    />
    {choiceParams.mode === 'choice' ? (
      <>
        <VariableSelect
          label={t('form.chosen')}
          value={choiceParams.chosen}
          options={variableOptions(grid.cols)}
          onChange={value => setChoiceParams(previous => ({ ...previous, chosen: value }))}
        />
        <VariableList
          label={t('form.attributes')}
          cols={grid.cols}
          only={continuousColumnIndexes(grid)}
          selected={choiceParams.attributes}
          onToggle={(column, checked) =>
            setChoiceParams(previous => ({
              ...previous,
              attributes: checked
                ? Array.from(new Set([...previous.attributes, column]))
                : previous.attributes.filter(value => value !== column),
            }))
          }
        />
      </>
    ) : (
      <>
        <VariableSelect
          label={t('form.best')}
          value={choiceParams.best}
          options={variableOptions(grid.cols)}
          onChange={value => setChoiceParams(previous => ({ ...previous, best: value }))}
        />
        <VariableSelect
          label={t('form.worst')}
          value={choiceParams.worst}
          options={variableOptions(grid.cols)}
          onChange={value => setChoiceParams(previous => ({ ...previous, worst: value }))}
        />
      </>
    )}
  </div>
);
