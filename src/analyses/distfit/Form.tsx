import type { Dispatch, SetStateAction } from 'react';
import { DISTRIBUTION_LABEL, type DistributionName } from '../../stats/distfit';
import type { GridData } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
import { CheckboxList, Field, GroupSelect, VariableSelect, variableOptions } from '../../components/FormFields';

export interface DistributionFitFormProps {
  grid: GridData;
  distfitParams: DistributionFitParams;
  setDistfitParams: Dispatch<SetStateAction<DistributionFitParams>>;
}

const ALL: DistributionName[] = ['normal', 'lognormal', 'exponential', 'gamma', 'weibull'];

export const DistributionFitForm = ({
  grid,
  distfitParams,
  setDistfitParams,
}: DistributionFitFormProps) => {
  const toggle = (name: DistributionName, checked: boolean) => {
    setDistfitParams(prev => ({
      ...prev,
      selected: checked
        ? [...prev.selected, name]
        : prev.selected.filter(item => item !== name),
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[160px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={distfitParams.mode}
          onChange={event =>
            setDistfitParams(prev => ({
              ...prev,
              mode: event.target.value as DistributionFitParams['mode'],
            }))
          }
        >
          <option value="fit">{t('distfit.fit')}</option>
          <option value="ks">{t('distfit.ks')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.variable')}
        value={distfitParams.variable}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setDistfitParams(prev => ({ ...prev, variable: value }))}
      />
      {distfitParams.mode === 'ks' ? (
        <GroupSelect
          label={t('form.group')}
          grid={grid}
          value={distfitParams.group}
          onChange={value => setDistfitParams(prev => ({ ...prev, group: value }))}
        />
      ) : (
        <CheckboxList
          label={t('form.distributions')}
          columns
          hint={t('hint.distfit')}
          items={ALL.map(name => ({
            value: name,
            label: DISTRIBUTION_LABEL[name],
            checked: distfitParams.selected.includes(name),
            onChange: checked => toggle(name, checked),
          }))}
        />
      )}
    </div>
  );
};
