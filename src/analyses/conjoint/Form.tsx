import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ConjointParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, VariableList } from '../../components/FormFields';
import { isNumericColumn, numericColumnIndexes } from '../shared/columns';

export interface ConjointFormProps {
  grid: GridData;
  conjointParams: ConjointParams;
  setConjointParams: Dispatch<SetStateAction<ConjointParams>>;
}

export const ConjointForm = ({ grid, conjointParams, setConjointParams }: ConjointFormProps) => {
  const categorical = grid.cols
    .map((_, index) => index)
    .filter(index => !isNumericColumn(grid, index));
  return (
    <div className="flex flex-col gap-3">
      <VariableList
        label={t('conjoint.attributes')}
        cols={grid.cols}
        only={categorical}
        selected={conjointParams.attributes}
        emptyText={t('conjoint.noCategorical')}
        onToggle={(column, checked) =>
          setConjointParams(previous => ({
            ...previous,
            attributes: checked
              ? [...previous.attributes, column]
              : previous.attributes.filter(value => value !== column),
          }))
        }
      />
      <Field label={t('conjoint.rating')}>
        <select
          aria-label={t('conjoint.rating')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={conjointParams.response}
          onChange={event =>
            setConjointParams(previous => ({
              ...previous,
              response: Number(event.target.value),
            }))
          }
        >
          {numericColumnIndexes(grid).map(index => (
            <option key={index} value={index}>
              {grid.cols[index]?.name ?? `V${index + 1}`}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
};
