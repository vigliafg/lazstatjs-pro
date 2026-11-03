import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { SemParams } from '../../io/project';
import { t } from '../../i18n';
import { CheckboxField, Field, NumberField, VariableList } from '../../components/FormFields';
import { numericColumnIndexes } from '../shared/columns';

export interface SemFormProps {
  grid: GridData;
  semParams: SemParams;
  setSemParams: Dispatch<SetStateAction<SemParams>>;
}

export const SemForm = ({ grid, semParams, setSemParams }: SemFormProps) => {
  const names = semParams.selected.map(
    (column, position) => grid.cols[column]?.name ?? `V${position + 1}`
  );
  const setFactorCount = (value: number) =>
    setSemParams(previous => ({
      ...previous,
      factors: value,
      groups: previous.groups.map(group => Math.min(value - 1, group)),
    }));
  return (
    <div className="flex flex-col gap-3">
      <VariableList
        label={t('form.variables2')}
        cols={grid.cols}
        only={numericColumnIndexes(grid)}
        selected={semParams.selected}
        emptyText={t('form.noNumericColumns')}
        onToggle={(column, checked) =>
          setSemParams(previous => ({
            ...previous,
            selected: checked
              ? [...previous.selected, column]
              : previous.selected.filter(value => value !== column),
            groups: checked
              ? [...previous.groups, 0]
              : previous.groups.filter((_, index) => previous.selected[index] !== column),
          }))
        }
      />
      <NumberField
        label={t('sem.factors')}
        value={semParams.factors}
        min="1"
        max="4"
        step="1"
        integer
        onChange={setFactorCount}
      />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-text3">{t('sem.assign')}</span>
        {names.map((name, position) => (
          <div key={`${name}-${position}`}>
            <Field label={name}>
              <select
                aria-label={`${t('sem.factor')} ${name}`}
                className="min-w-[110px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
                value={semParams.groups[position] ?? 0}
                onChange={event =>
                  setSemParams(previous => ({
                    ...previous,
                    groups: previous.groups.map((group, index) =>
                      index === position ? Number(event.target.value) : group
                    ),
                  }))
                }
              >
                {Array.from({ length: semParams.factors }, (_, factor) => (
                  <option key={factor} value={factor}>
                    {t('sem.factor')} {factor + 1}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ))}
      </div>
      <CheckboxField
        label={t('sem.structural')}
        checked={semParams.structural}
        onChange={checked => setSemParams(previous => ({ ...previous, structural: checked }))}
      />
    </div>
  );
};
