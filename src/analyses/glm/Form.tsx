import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { GlmParams } from '../../io/project';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface GlmFormProps {
  grid: GridData;
  glmParams: GlmParams;
  setGlmParams: Dispatch<SetStateAction<GlmParams>>;
}

export const GlmForm = ({ grid, glmParams, setGlmParams }: GlmFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.dependentY')}
      value={glmParams.dep}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value =>
        setGlmParams(previous => ({
          ...previous,
          dep: value,
          indeps: previous.indeps.filter(index => index !== value),
        }))
      }
    />
    <VariableList
      label={t('form.independentsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={glmParams.indeps}
      disabled={[glmParams.dep]}
      onToggle={(column, checked) =>
        setGlmParams(previous => ({
          ...previous,
          indeps: checked
            ? [...previous.indeps, column]
            : previous.indeps.filter(index => index !== column),
        }))
      }
    />
    <Field label={t('form.family')}>
      <select
        aria-label={t('form.family')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={glmParams.family}
        onChange={event =>
          setGlmParams(previous => ({
            ...previous,
            family: event.target.value as GlmParams['family'],
          }))
        }
      >
        <option value="gaussian">{t('form.gaussian')}</option>
        <option value="binomial">{t('form.binomial')}</option>
        <option value="poisson">{t('form.poisson')}</option>
        <option value="gamma">{t('form.gamma')}</option>
      </select>
    </Field>
    <Field label={t('form.link')}>
      <select
        aria-label={t('form.link')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={glmParams.link}
        onChange={event =>
          setGlmParams(previous => ({
            ...previous,
            link: event.target.value as GlmParams['link'],
          }))
        }
      >
        <option value="identity">{t('form.identity')}</option>
        <option value="log">{t('form.log')}</option>
        <option value="logit">{t('form.logit')}</option>
        <option value="probit">{t('form.probit')}</option>
        <option value="inverse">{t('form.inverse')}</option>
      </select>
    </Field>
  </div>
);
