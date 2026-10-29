import type { Dispatch, SetStateAction } from 'react';
import { DISTRIBUTION_LABEL, type DistributionName } from '../../stats/distfit';
import type { GridData } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';
import { t } from '../../i18n';
import { CheckboxList, VariableSelect, variableOptions } from '../../components/FormFields';

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
      <VariableSelect
        label={t('form.variable')}
        value={distfitParams.variable}
        options={variableOptions(grid.cols)}
        onChange={value => setDistfitParams(prev => ({ ...prev, variable: value }))}
      />
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
    </div>
  );
};
