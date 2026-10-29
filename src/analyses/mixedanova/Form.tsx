import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { MixedAnovaParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  GroupSelect,
  VariableList,
} from '../../components/FormFields';

export interface MixedAnovaFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  mixedAnovaParams: MixedAnovaParams;
  setMixedAnovaParams: Dispatch<SetStateAction<MixedAnovaParams>>;
}

export const MixedAnovaForm = ({
  grid,
  onLevels,
  onRecode,
  mixedAnovaParams,
  setMixedAnovaParams,
}: MixedAnovaFormProps) => (
  <div className="flex flex-col gap-3">
    <GroupSelect
      label={t('form.betweenGroup')}
      grid={grid}
      value={mixedAnovaParams.group}
      onChange={value => setMixedAnovaParams(prev => ({ ...prev, group: value }))}
      onLevels={onLevels}
      onRecode={onRecode}
    />
    <VariableList
      label={t('form.withinConditions')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
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
