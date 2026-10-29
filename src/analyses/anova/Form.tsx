import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { AnovaParams } from '../../io/project';
import { Advanced, CheckboxField, Field, GroupSelect, VariableSelect, variableOptions, variableOptionsFrom } from '../../components/FormFields';

export interface AnovaFormProps {
  grid: GridData;
  anovaParams: AnovaParams;
  setAnovaParams: Dispatch<SetStateAction<AnovaParams>>;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
}

export const AnovaForm = ({ grid, anovaParams, setAnovaParams, onLevels, onRecode }: AnovaFormProps) => {
  return (
    <>
      <VariableSelect
        label={t('form.dependentVar')}
        ariaLabel="ANOVA dependent variable"
        value={anovaParams.dep}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setAnovaParams(previous => ({ ...previous, dep: value }))}
      />
      <GroupSelect
        label={t('form.groupVar')}
        ariaLabel="ANOVA group variable"
        grid={grid}
        value={anovaParams.grp}
        onChange={value => setAnovaParams(previous => ({ ...previous, grp: value }))}
        fallback
        onLevels={onLevels}
        onRecode={onRecode}
      />
      <Field label={t('form.postHoc')}>
        <select
          aria-label={t('form.postHoc')}
          className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={anovaParams.posthoc}
          onChange={event =>
            setAnovaParams(previous => ({ ...previous, posthoc: event.target.value }))
          }
        >
          <option value="none">{t('posthoc.none')}</option>
          <option value="tukey">{t('posthoc.tukey')}</option>
          <option value="bonferroni">{t('posthoc.bonferroni')}</option>
          <option value="holm">{t('posthoc.holm')}</option>
          <option value="gameshowell">{t('posthoc.gameshowell')}</option>
        </select>
      </Field>
      <Advanced>
        <CheckboxField
          label={t('form.kruskalWallis')}
          checked={anovaParams.useNonParam}
          onChange={checked => setAnovaParams(previous => ({ ...previous, useNonParam: checked }))}
          hint={t('hint.anova')}
        />
        {anovaParams.useNonParam && (
          <Field label={t('form.kwPostHoc')}>
            <select
              aria-label={t('form.kwPostHoc')}
              className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={anovaParams.kwPosthoc}
              onChange={event =>
                setAnovaParams(previous => ({
                  ...previous,
                  kwPosthoc: event.target.value as AnovaParams['kwPosthoc'],
                }))
              }
            >
              <option value="none">{t('posthoc.none')}</option>
              <option value="bonferroni">{t('posthoc.bonferroni')}</option>
              <option value="holm">{t('posthoc.holm')}</option>
              <option value="fdr">{t('posthoc.fdr')}</option>
            </select>
          </Field>
        )}
      </Advanced>
    </>
  );
};
