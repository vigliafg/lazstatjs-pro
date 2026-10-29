import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MultivariateMode, MultivariateParams } from '../../io/project';
import { defaultMultivariateParams } from './defaults';
import { numericColumnIndexes } from '../shared/columns';
import { t } from '../../i18n';
import {
  CheckboxField,
  Field,
  NumberField,
  VariableList,
} from '../../components/FormFields';

export interface MultivariateFormProps {
  grid: GridData;
  multivariateParams: MultivariateParams;
  setMultivariateParams: Dispatch<SetStateAction<MultivariateParams>>;
}

export const MultivariateForm = ({
  grid,
  multivariateParams,
  setMultivariateParams,
}: MultivariateFormProps) => {
  const { mode, standardize, selected, factors, rotation } = multivariateParams;
  const numericColumns = numericColumnIndexes(grid);

  // A change in the number of columns re-picks the default variables. The
  // first mount must not overwrite restored params.
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    if (previousCols.current === grid.cols.length) return;
    previousCols.current = grid.cols.length;
    setMultivariateParams(prev => ({
      ...prev,
      selected: defaultMultivariateParams(grid).selected,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid.cols.length]);

  const hint = mode === 'pca' ? t('hint.pca') : mode === 'efa' ? t('hint.efa') : t('hint.alpha');

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.analysis')}>
        <select
          aria-label={t('form.analysis')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setMultivariateParams(prev => ({
              ...prev,
              mode: event.target.value as MultivariateMode,
            }))
          }
        >
          <option value="pca">{t('multivariate.pca')}</option>
          <option value="alpha">{t('multivariate.alpha')}</option>
          <option value="efa">{t('multivariate.efa')}</option>
        </select>
      </Field>

      <VariableList
        label={
          mode === 'pca'
            ? t('form.variables2')
            : mode === 'efa'
              ? t('form.variables3')
              : t('form.scaleItems')
        }
        cols={grid.cols}
        only={numericColumns}
        selected={selected}
        showType
        emptyText={t('form.noNumericColumns')}
        hint={hint}
        onToggle={(index, checked) =>
          setMultivariateParams(prev => ({
            ...prev,
            selected: checked
              ? [...prev.selected, index]
              : prev.selected.filter(item => item !== index),
          }))
        }
      />

      {mode === 'efa' && (
        <>
          <NumberField
            label={t('form.factorsAuto')}
            value={factors}
            min="0"
            max="10"
            step="1"
            integer
            onChange={value => setMultivariateParams(prev => ({ ...prev, factors: value }))}
          />
          <Field label={t('form.rotation')}>
            <select
              aria-label={t('form.rotation')}
              className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={rotation}
              onChange={event =>
                setMultivariateParams(prev => ({
                  ...prev,
                  rotation: event.target.value as 'none' | 'varimax',
                }))
              }
            >
              <option value="varimax">{t('form.varimax')}</option>
              <option value="none">{t('form.none')}</option>
            </select>
          </Field>
        </>
      )}

      {mode === 'pca' && (
        <CheckboxField
          label={t('form.correlationStandardized')}
          checked={standardize}
          onChange={checked =>
            setMultivariateParams(prev => ({ ...prev, standardize: checked }))
          }
        />
      )}
    </div>
  );
};
