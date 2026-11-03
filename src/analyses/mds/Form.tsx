import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MdsParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, NumberField, VariableList } from '../../components/FormFields';
import { numericColumnIndexes } from '../shared/columns';

export interface MdsFormProps {
  grid: GridData;
  mdsParams: MdsParams;
  setMdsParams: Dispatch<SetStateAction<MdsParams>>;
}

export const MdsForm = ({ grid, mdsParams, setMdsParams }: MdsFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableList
      label={t('form.variables2')}
      cols={grid.cols}
      only={numericColumnIndexes(grid)}
      selected={mdsParams.selected}
      emptyText={t('form.noNumericColumns')}
      onToggle={(column, checked) =>
        setMdsParams(previous => ({
          ...previous,
          selected: checked
            ? [...previous.selected, column]
            : previous.selected.filter(value => value !== column),
        }))
      }
    />
    <NumberField
      label={t('mds.dimensions')}
      value={mdsParams.dimensions}
      min="1"
      max="10"
      step="1"
      integer
      onChange={value => setMdsParams(previous => ({ ...previous, dimensions: value }))}
    />
    <Field label={t('mds.metric')}>
      <select
        aria-label={t('mds.metric')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={mdsParams.metric}
        onChange={event =>
          setMdsParams(previous => ({
            ...previous,
            metric: event.target.value as MdsParams['metric'],
          }))
        }
      >
        <option value="classical">{t('mds.classical')}</option>
        <option value="nonmetric">{t('mds.nonmetric')}</option>
      </select>
    </Field>
  </div>
);
