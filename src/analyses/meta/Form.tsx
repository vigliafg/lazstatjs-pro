import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MetaParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Advanced,
  CheckboxField,
  Field,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';

export interface MetaFormProps {
  grid: GridData;
  metaParams: MetaParams;
  setMetaParams: Dispatch<SetStateAction<MetaParams>>;
}

export const MetaForm = ({ grid, metaParams, setMetaParams }: MetaFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.effectSize')}
      value={metaParams.effect}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setMetaParams(previous => ({ ...previous, effect: value }))}
    />
    <VariableSelect
      label={t('form.standardError')}
      value={metaParams.se}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setMetaParams(previous => ({ ...previous, se: value }))}
    />
    <VariableSelect
      label={t('form.study')}
      value={metaParams.study}
      options={[{ value: -1, label: t('form.none') }, ...variableOptions(grid.cols)]}
      onChange={value => setMetaParams(previous => ({ ...previous, study: value }))}
    />
    <Field label={t('form.method')}>
      <select
        aria-label={t('form.method')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={metaParams.method}
        onChange={event =>
          setMetaParams(previous => ({
            ...previous,
            method: event.target.value as MetaParams['method'],
          }))
        }
      >
        <option value="DL">DerSimonian–Laird</option>
        <option value="REML">REML</option>
        <option value="FE">{t('meta.fe')}</option>
      </select>
    </Field>
    <Advanced>
      <CheckboxField
        label={t('form.egger')}
        checked={metaParams.egger}
        onChange={checked => setMetaParams(previous => ({ ...previous, egger: checked }))}
      />
    </Advanced>
  </div>
);
