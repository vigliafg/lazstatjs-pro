import type { Dispatch, SetStateAction } from 'react';
import type { ProjectParams } from '../../io/project';
import type { AnalysisTabProps } from './types';
import { DescriptiveForm } from '../../analyses/descriptive/Form';
import { TTestForm } from '../../analyses/ttest/Form';
import { AnovaForm } from '../../analyses/anova/Form';
import { RegressionForm } from '../../analyses/regression/Form';
import { CorrelationForm } from '../../analyses/correlation/Form';
import { ChiSquareForm } from '../../analyses/chisquare/Form';
import { SampleSizeForm } from '../../analyses/samplesize/Form';
import { DistributionFitForm } from '../../analyses/distfit/Form';
import { LogisticForm } from '../../analyses/logistic/Form';
import { CoxForm } from '../../analyses/cox/Form';
import { SurvivalForm } from '../../analyses/survival/Form';
import { TimeSeriesForm } from '../../analyses/timeseries/Form';
import { ContingencyForm } from '../../analyses/contingency/Form';
import { AncovaForm } from '../../analyses/ancova/Form';
import { FactorialForm } from '../../analyses/factorial/Form';
import { RepeatedAnovaForm } from '../../analyses/repeatedanova/Form';
import { MultivariateForm } from '../../analyses/multivariate/Form';
import { NonParamForm } from '../../analyses/nonparamrm/Form';
import { WizardForm } from '../../analyses/wizard/Form';
import { TostForm } from '../../analyses/tost/Form';
import { AgreementForm } from '../../analyses/agreement/Form';
import { CountForm } from '../../analyses/countreg/Form';
import { LmmForm } from '../../analyses/lmm/Form';
import { OrdinalForm } from '../../analyses/ordinal/Form';
import { MiForm } from '../../analyses/mi/Form';
import { MixedAnovaForm } from '../../analyses/mixedanova/Form';
import { ParametricForm } from '../../analyses/parametric/Form';
import { ResamplingForm } from '../../analyses/resampling/Form';
import { GeeForm } from '../../analyses/gee/Form';
import { StratifiedCoxForm } from '../../analyses/stratcox/Form';
import { TdCoxForm } from '../../analyses/tdcox/Form';
import { t } from '../../i18n';

interface AnalysisFormProps {
  p: AnalysisTabProps;
  params: ProjectParams;
  setSlice: <K extends keyof ProjectParams>(
    key: K
  ) => (updater: SetStateAction<ProjectParams[K]>) => void;
}

export const AnalysisForm = ({ p, params, setSlice }: AnalysisFormProps) => {
    switch (p.activeAnalysis) {
      case 'descriptive':
        return <DescriptiveForm grid={p.grid} descVars={params.descVars} setDescVars={setSlice('descVars')} />;
      case 'ttest':
        return (
          <TTestForm
            grid={p.grid}
            ttestParams={params.ttest}
            setTTestParams={setSlice('ttest')}
          />
        );
      case 'anova':
        return (
          <AnovaForm
            grid={p.grid}
            anovaParams={params.anova}
            setAnovaParams={setSlice('anova')}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
          />
        );
      case 'regression':
        return (
          <RegressionForm
            grid={p.grid}
            regParams={params.reg}
            setRegParams={setSlice('reg')}
          />
        );
      case 'correlation':
        return (
          <CorrelationForm
            grid={p.grid}
            corrParams={params.corr}
            setCorrParams={setSlice('corr')}
          />
        );
      case 'chisquare':
        return (
          <ChiSquareForm
            grid={p.grid}
            chisqParams={params.chisq}
            setChisqParams={setSlice('chisq')}
          />
        );
      case 'timeseries':
        return (
          <TimeSeriesForm
            grid={p.grid}
            timeseriesParams={params.timeseries}
            setTimeseriesParams={setSlice('timeseries')}
          />
        );
      case 'survival':
        return (
          <SurvivalForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            survivalParams={params.survival}
            setSurvivalParams={setSlice('survival')}
          />
        );
      case 'cox':
        return (
          <CoxForm
            grid={p.grid}
            coxParams={params.cox}
            setCoxParams={setSlice('cox')}
          />
        );
      case 'wizard':
        return (
          <WizardForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            onOpenAnalysis={analysisId => p.setActiveAnalysis(analysisId)}
            ciLevel={p.ciLevel}
            wizardParams={params.wizard}
            setWizardParams={setSlice('wizard')}
          />
        );
      case 'logistic':
        return (
          <LogisticForm
            grid={p.grid}
            logisticParams={params.logistic}
            setLogisticParams={setSlice('logistic')}
          />
        );
      case 'factorial':
        return (
          <FactorialForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            factorialParams={params.factorial}
            setFactorialParams={setSlice('factorial')}
          />
        );
      case 'distfit':
        return (
          <DistributionFitForm
            grid={p.grid}
            distfitParams={params.distfit}
            setDistfitParams={setSlice('distfit')}
          />
        );
      case 'samplesize':
        return (
          <SampleSizeForm
            samplesizeParams={params.samplesize}
            setSamplesizeParams={setSlice('samplesize')}
          />
        );
      case 'ancova':
        return (
          <AncovaForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            ancovaParams={params.ancova}
            setAncovaParams={setSlice('ancova')}
          />
        );
      case 'multivariate':
        return (
          <MultivariateForm
            grid={p.grid}
            multivariateParams={params.multivariate}
            setMultivariateParams={setSlice('multivariate')}
          />
        );
      case 'repeatedanova':
        return (
          <RepeatedAnovaForm
            grid={p.grid}
            repeatedAnovaParams={params.repeatedanova}
            setRepeatedAnovaParams={setSlice('repeatedanova')}
          />
        );
      case 'nonparamrm':
        return (
          <NonParamForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            nonParamParams={params.nonparamrm}
            setNonParamParams={setSlice('nonparamrm')}
          />
        );
      case 'tdcox':
        return (
          <TdCoxForm
            grid={p.grid}
            tdCoxParams={params.tdcox}
            setTdCoxParams={setSlice('tdcox')}
          />
        );
      case 'stratcox':
        return (
          <StratifiedCoxForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            stratCoxParams={params.stratcox}
            setStratCoxParams={setSlice('stratcox')}
          />
        );
      case 'gee':
        return (
          <GeeForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            geeParams={params.gee}
            setGeeParams={setSlice('gee')}
          />
        );
      case 'resampling':
        return (
          <ResamplingForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            resamplingParams={params.resampling}
            setResamplingParams={setSlice('resampling')}
          />
        );
      case 'parametric':
        return (
          <ParametricForm
            grid={p.grid}
            parametricParams={params.parametric}
            setParametricParams={setSlice('parametric')}
          />
        );
      case 'mixedanova':
        return (
          <MixedAnovaForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            mixedAnovaParams={params.mixedanova}
            setMixedAnovaParams={setSlice('mixedanova')}
          />
        );
      case 'mi':
        return (
          <MiForm grid={p.grid} miParams={params.mi} setMiParams={setSlice('mi')} />
        );
      case 'ordinal':
        return (
          <OrdinalForm
            grid={p.grid}
            ordinalParams={params.ordinal}
            setOrdinalParams={setSlice('ordinal')}
          />
        );
      case 'lmm':
        return (
          <LmmForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            lmmParams={params.lmm}
            setLmmParams={setSlice('lmm')}
          />
        );
      case 'countreg':
        return (
          <CountForm
            grid={p.grid}
            countParams={params.countreg}
            setCountParams={setSlice('countreg')}
          />
        );
      case 'agreement':
        return (
          <AgreementForm
            grid={p.grid}
            agreementParams={params.agreement}
            setAgreementParams={setSlice('agreement')}
          />
        );
      case 'tost':
        return (
          <TostForm
            grid={p.grid}
            tostParams={params.tost}
            setTostParams={setSlice('tost')}
          />
        );
      case 'contingency':
        return (
          <ContingencyForm
            contingencyParams={params.contingency}
            setContingencyParams={setSlice('contingency')}
          />
        );
      default:
        return (
          <div className="rounded border border-dashed border-border2 p-4 text-center">
            <p className="text-[11px] text-text2">{t('analysis.noForm')}</p>
          </div>
        );
    }
};