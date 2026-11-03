import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { GarchParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { NumberField, VariableSelect, variableOptionsFrom } from '../../components/FormFields';

export interface GarchFormProps {
  grid: GridData;
  garchParams: GarchParams;
  setGarchParams: Dispatch<SetStateAction<GarchParams>>;
}

export const GarchForm = ({ grid, garchParams, setGarchParams }: GarchFormProps) => {
  const { variable, horizon } = garchParams;
  const update = (patch: Partial<GarchParams>) =>
    setGarchParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.garchSeries')}
        value={variable}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => update({ variable: value })}
      />
      <NumberField
        label={t('form.forecastHorizon')}
        value={horizon}
        min="1"
        max="40"
        step="1"
        integer
        onChange={value => update({ horizon: value })}
      />
    </div>
  );
};
