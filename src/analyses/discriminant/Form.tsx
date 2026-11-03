import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { DiscriminantParams } from '../../io/project';
import { Field, GroupSelect, VariableList } from '../../components/FormFields';
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
}: DiscriminantFormProps) => {
  const mode = discriminantParams.mode ?? 'classic';
  return (
    <>
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[160px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setDiscriminantParams(previous => ({
              ...previous,
              mode: event.target.value as DiscriminantParams['mode'],
            }))
          }
        >
          <option value="classic">{t('discriminant.modeClassic')}</option>
          <option value="mancova">{t('discriminant.modeMancova')}</option>
        </select>
      </Field>
      <GroupSelect
        label={t('form.group')}
        grid={grid}
        value={discriminantParams.group}
        onChange={value =>
          setDiscriminantParams(previous => ({
            ...previous,
            group: value,
            predictors: previous.predictors.filter(index => index !== value),
            covariates: (previous.covariates ?? []).filter(index => index !== value),
          }))
        }
      />
      <VariableList
        label={mode === 'mancova' ? t('form.variables') : t('form.independentsX')}
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
      {mode === 'mancova' && (
        <VariableList
          label={t('form.covariatesX')}
          cols={grid.cols}
          only={continuousColumnIndexes(grid)}
          emptyText={t('form.noNumericColumns')}
          selected={discriminantParams.covariates ?? []}
          disabled={[discriminantParams.group, ...discriminantParams.predictors]}
          onToggle={(column, checked) =>
            setDiscriminantParams(previous => ({
              ...previous,
              covariates: checked
                ? [...(previous.covariates ?? []), column]
                : (previous.covariates ?? []).filter(index => index !== column),
            }))
          }
        />
      )}
    </>
  );
};
