import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { MixedAnovaParams } from '../../io/project';
import { t } from '../../i18n';
import {
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface MixedAnovaFormProps {
  grid: GridData;
  mixedAnovaParams: MixedAnovaParams;
  setMixedAnovaParams: Dispatch<SetStateAction<MixedAnovaParams>>;
}

export const MixedAnovaForm = ({
  grid,
  mixedAnovaParams,
  setMixedAnovaParams,
}: MixedAnovaFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.betweenGroup')}
      value={mixedAnovaParams.group}
      options={variableOptionsFrom(grid.cols, groupColumnIndexes(grid))}
      onChange={value => setMixedAnovaParams(prev => ({ ...prev, group: value }))}
    />
    <VariableList
      label={t('form.withinConditions')}
      cols={grid.cols}
      selected={mixedAnovaParams.conditions}
      disabled={[mixedAnovaParams.group]}
      showType
      hint={t('hint.mixedanova')}
      onToggle={(index, checked) =>
        setMixedAnovaParams(prev => ({
          ...prev,
          conditions: checked
            ? [...prev.conditions, index]
            : prev.conditions.filter(item => item !== index),
        }))
      }
    />
  </div>
);
