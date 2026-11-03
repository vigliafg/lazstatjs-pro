import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { IrtParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, NumberField, VariableList } from '../../components/FormFields';
import { columnStrings, isNumericColumn } from '../shared/columns';

export interface IrtFormProps {
  grid: GridData;
  irtParams: IrtParams;
  setIrtParams: Dispatch<SetStateAction<IrtParams>>;
}

export const IrtForm = ({ grid, irtParams, setIrtParams }: IrtFormProps) => {
  const binary = grid.cols
    .map((_, index) => index)
    .filter(index => {
      if (!isNumericColumn(grid, index)) return false;
      const values = columnStrings(grid, index).filter(value => value !== '');
      return values.length > 0 && values.every(value => value === '0' || value === '1');
    });
  return (
    <div className="flex flex-col gap-3">
      <VariableList
        label={t('irt.items')}
        cols={grid.cols}
        only={binary}
        selected={irtParams.selected}
        emptyText={t('irt.noBinary')}
        onToggle={(column, checked) =>
          setIrtParams(previous => ({
            ...previous,
            selected: checked
              ? [...previous.selected, column]
              : previous.selected.filter(value => value !== column),
          }))
        }
      />
      <Field label={t('irt.model')}>
        <select
          aria-label={t('irt.model')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={irtParams.model}
          onChange={event =>
            setIrtParams(previous => ({
              ...previous,
              model: event.target.value as IrtParams['model'],
            }))
          }
        >
          <option value="2pl">{t('irt.2pl')}</option>
          <option value="rasch">{t('irt.rasch')}</option>
        </select>
      </Field>
      <NumberField
        label={t('irt.quadrature')}
        value={irtParams.quadrature}
        min="5"
        max="61"
        step="2"
        integer
        onChange={value => setIrtParams(previous => ({ ...previous, quadrature: value }))}
      />
    </div>
  );
};
