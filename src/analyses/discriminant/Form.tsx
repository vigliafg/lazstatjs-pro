import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { DiscriminantParams } from '../../io/project';
import { GroupSelect, VariableList } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface DiscriminantFormProps {
  grid: GridData;
  discriminantParams: DiscriminantParams;
  setDiscriminantParams: Dispatch<SetStateAction<DiscriminantParams>>;
}

export const DiscriminantForm = ({
  grid,
  discriminantParams,
  setDiscriminantParams,
}: DiscriminantFormProps) => (
  <>
    <GroupSelect
      label={t('form.group')}
      grid={grid}
      value={discriminantParams.group}
      onChange={value =>
        setDiscriminantParams(previous => ({
          ...previous,
          group: value,
          predictors: previous.predictors.filter(index => index !== value),
        }))
      }
    />
    <VariableList
      label={t('form.independentsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={discriminantParams.predictors}
      disabled={[discriminantParams.group]}
      onToggle={(column, checked) =>
        setDiscriminantParams(previous => ({
          ...previous,
          predictors: checked
            ? [...previous.predictors, column]
            : previous.predictors.filter(index => index !== column),
        }))
      }
    />
  </>
);
