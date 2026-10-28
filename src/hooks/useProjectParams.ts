import { useState, type SetStateAction } from 'react';
import type { GridData } from '../grid/types';
import { DEFAULT_PARAMS, type ProjectParams, type ProjectSnapshot } from '../io/project';
import { defaultLogisticParams } from '../analyses/logistic/defaults';
import { defaultCoxParams } from '../analyses/cox/defaults';
import { defaultSurvivalParams } from '../analyses/survival/defaults';
import { defaultAncovaParams } from '../analyses/ancova/defaults';
import { defaultFactorialParams } from '../analyses/factorial/defaults';
import { defaultRepeatedAnovaParams } from '../analyses/repeatedanova/defaults';
import { defaultMultivariateParams } from '../analyses/multivariate/defaults';
import { defaultNonParamParams } from '../analyses/nonparamrm/defaults';
import { defaultWizardParams } from '../analyses/wizard/defaults';

/**
 * Owns the analysis parameters and the two update helpers used by the App.
 *
 * Extracted from `App.tsx` so the shell stays under the file-size guard; the
 * parameters are still one object persisted with the project.
 */
export const useProjectParams = (boot: ProjectSnapshot | null, grid: GridData) => {
  const [params, setParams] = useState<ProjectParams>(() => {
    if (boot) return boot.params;
    return {
      ...DEFAULT_PARAMS,
      logistic: defaultLogisticParams(grid),
      cox: defaultCoxParams(grid),
      survival: defaultSurvivalParams(grid),
      ancova: defaultAncovaParams(grid),
      factorial: defaultFactorialParams(grid),
      repeatedanova: defaultRepeatedAnovaParams(grid),
      multivariate: defaultMultivariateParams(grid),
      nonparamrm: defaultNonParamParams(grid),
      wizard: defaultWizardParams(grid),
    };
  });

  function updateParams<K extends keyof ProjectParams>(
    key: K,
    updater: SetStateAction<ProjectParams[K]>
  ) {
    setParams(previous => {
      const current = previous[key];
      const next =
        typeof updater === 'function'
          ? (updater as (value: ProjectParams[K]) => ProjectParams[K])(current)
          : updater;
      return next === current ? previous : { ...previous, [key]: next };
    });
  }

  function bindParam<K extends keyof ProjectParams>(key: K) {
    return (updater: SetStateAction<ProjectParams[K]>) => updateParams(key, updater);
  }

  return { params, setParams, updateParams, bindParam };
};
