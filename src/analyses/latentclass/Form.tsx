import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { LatentClassParams } from '../../io/project';
import { t } from '../../i18n';
import { NumberField, VariableList } from '../../components/FormFields';
import { isNumericColumn } from '../shared/columns';

export interface LatentClassFormProps {
  grid: GridData;
  latentClassParams: LatentClassParams;
  setLatentClassParams: Dispatch<SetStateAction<LatentClassParams>>;
}

export const LatentClassForm = ({
  grid,
  latentClassParams,
  setLatentClassParams,
}: LatentClassFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableList
      label={t('latentclass.indicators')}
      cols={grid.cols}
      only={grid.cols.map((_, index) => index).filter(index => !isNumericColumn(grid, index))}
      selected={latentClassParams.selected}
      emptyText={t('latentclass.noCategorical')}
      onToggle={(column, checked) =>
        setLatentClassParams(previous => ({
          ...previous,
          selected: checked
            ? [...previous.selected, column]
            : previous.selected.filter(value => value !== column),
        }))
      }
    />
    <NumberField
      label={t('latentclass.classes')}
      value={latentClassParams.classes}
      min="2"
      max="10"
      step="1"
      integer
      onChange={value => setLatentClassParams(previous => ({ ...previous, classes: value }))}
    />
    <NumberField
      label={t('latentclass.iterations')}
      value={latentClassParams.maxIterations}
      min="50"
      max="2000"
      step="50"
      integer
      onChange={value =>
        setLatentClassParams(previous => ({ ...previous, maxIterations: value }))
      }
    />
  </div>
);
