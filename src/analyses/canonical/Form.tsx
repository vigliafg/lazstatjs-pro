import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CanonicalParams } from '../../io/project';
import { t } from '../../i18n';
import { VariableList } from '../../components/FormFields';
import { numericColumnIndexes } from '../shared/columns';

export interface CanonicalFormProps {
  grid: GridData;
  canonicalParams: CanonicalParams;
  setCanonicalParams: Dispatch<SetStateAction<CanonicalParams>>;
}

export const CanonicalForm = ({ grid, canonicalParams, setCanonicalParams }: CanonicalFormProps) => {
  const numeric = numericColumnIndexes(grid);
  const toggle = (block: 'x' | 'y', column: number, checked: boolean) => {
    setCanonicalParams(previous => {
      const other = block === 'x' ? previous.y : previous.x;
      const next = checked
        ? [...previous[block], column]
        : previous[block].filter(value => value !== column);
      return { ...previous, [block]: next.filter(value => !other.includes(value)) };
    });
  };
  return (
    <div className="flex flex-col gap-3">
      <VariableList
        label={t('canonical.xBlock')}
        cols={grid.cols}
        only={numeric}
        selected={canonicalParams.x}
        emptyText={t('form.noNumericColumns')}
        onToggle={(column, checked) => toggle('x', column, checked)}
      />
      <VariableList
        label={t('canonical.yBlock')}
        cols={grid.cols}
        only={numeric.filter(index => !canonicalParams.x.includes(index))}
        selected={canonicalParams.y}
        emptyText={t('form.noNumericColumns')}
        onToggle={(column, checked) => toggle('y', column, checked)}
      />
    </div>
  );
};
