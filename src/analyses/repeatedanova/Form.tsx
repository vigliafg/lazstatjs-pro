import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import { defaultRepeatedAnovaParams } from './defaults';
import { numericColumnIndexes } from '../shared/columns';
import { t } from '../../i18n';
import { VariableList } from '../../components/FormFields';

export interface RepeatedAnovaFormProps {
  grid: GridData;
  repeatedAnovaParams: RepeatedAnovaParams;
  setRepeatedAnovaParams: Dispatch<SetStateAction<RepeatedAnovaParams>>;
}

export const RepeatedAnovaForm = ({
  grid,
  repeatedAnovaParams,
  setRepeatedAnovaParams,
}: RepeatedAnovaFormProps) => {
  const numericColumns = numericColumnIndexes(grid);
  // A change in the number of columns re-picks the default conditions. The
  // first mount must not overwrite restored params.
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    if (previousCols.current === grid.cols.length) return;
    previousCols.current = grid.cols.length;
    setRepeatedAnovaParams(prev => ({
      ...prev,
      selected: defaultRepeatedAnovaParams(grid).selected,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  return (
    <VariableList
      label={t('form.withinConditions3')}
      cols={grid.cols}
      only={numericColumns}
      selected={repeatedAnovaParams.selected}
      showType
      emptyText={t('form.noNumericColumns')}
      hint={t('hint.repeatedanova')}
      onToggle={(index, checked) =>
        setRepeatedAnovaParams(prev => ({
          ...prev,
          selected: checked
            ? [...prev.selected, index]
            : prev.selected.filter(item => item !== index),
        }))
      }
    />
  );
};
