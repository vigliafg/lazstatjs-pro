import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TextParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Advanced,
  CheckboxField,
  Field,
  NumberField,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface TextFormProps {
  grid: GridData;
  textParams: TextParams;
  setTextParams: Dispatch<SetStateAction<TextParams>>;
}

export const TextForm = ({ grid, textParams, setTextParams }: TextFormProps) => (
  <div className="flex flex-col gap-3">
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={textParams.mode}
        onChange={event =>
          setTextParams(previous => ({
            ...previous,
            mode: event.target.value as TextParams['mode'],
          }))
        }
      >
        <option value="frequency">{t('text.frequency')}</option>
        <option value="tfidf">{t('text.tfidf')}</option>
        <option value="similarity">{t('text.similarity')}</option>
        <option value="topics">{t('text.topics')}</option>
      </select>
    </Field>
    <VariableSelect
      label={t('form.textColumn')}
      value={textParams.text}
      options={variableOptions(grid.cols)}
      onChange={value => setTextParams(previous => ({ ...previous, text: value }))}
    />
    <VariableSelect
      label={t('form.group')}
      value={textParams.group}
      options={[{ value: -1, label: t('form.none') }, ...variableOptions(grid.cols)]}
      onChange={value => setTextParams(previous => ({ ...previous, group: value }))}
    />
    <Advanced>
      <NumberField
        label={t('form.maxTerms')}
        value={textParams.maxTerms}
        min="3"
        max="200"
        step="1"
        integer
        onChange={value => setTextParams(previous => ({ ...previous, maxTerms: value }))}
      />
      <NumberField
        label={t('form.minDocFreq')}
        value={textParams.minDocFreq}
        min="1"
        max="100"
        step="1"
        integer
        onChange={value => setTextParams(previous => ({ ...previous, minDocFreq: value }))}
      />
      <NumberField
        label={t('form.topics')}
        value={textParams.topics}
        min="2"
        max="12"
        step="1"
        integer
        onChange={value => setTextParams(previous => ({ ...previous, topics: value }))}
      />
      <NumberField
        label={t('form.iterations')}
        value={textParams.iterations}
        min="20"
        max="3000"
        step="20"
        integer
        onChange={value => setTextParams(previous => ({ ...previous, iterations: value }))}
      />
      <NumberField
        label={t('form.seed')}
        value={textParams.seed}
        step="1"
        integer
        onChange={value => setTextParams(previous => ({ ...previous, seed: value }))}
      />
      <CheckboxField
        label={t('form.stopwords')}
        checked={textParams.stopwords}
        onChange={checked => setTextParams(previous => ({ ...previous, stopwords: checked }))}
      />
    </Advanced>
  </div>
);
