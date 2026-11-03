import type { Dispatch, SetStateAction } from 'react';
import type { ProjectParams } from '../../io/project';
import type { AnalysisTabProps } from './types';
import { DescriptiveForm } from '../../analyses/descriptive/Form';
import { ProportionsForm } from '../../analyses/proportions/Form';
import { VariancesForm } from '../../analyses/variances/Form';
import { TTestForm } from '../../analyses/ttest/Form';
import { AnovaForm } from '../../analyses/anova/Form';
import { RegressionForm } from '../../analyses/regression/Form';
import { GlmForm } from '../../analyses/glm/Form';
import { QuantileForm } from '../../analyses/quantile/Form';
import { NonlinearForm } from '../../analyses/nonlinear/Form';
import { MultinomialForm } from '../../analyses/multinomial/Form';
import { GlmmForm } from '../../analyses/glmm/Form';
import { PlsForm } from '../../analyses/pls/Form';
import { MarsForm } from '../../analyses/mars/Form';
import { IvForm } from '../../analyses/iv/Form';
import { PanelForm } from '../../analyses/panel/Form';
import { SelectionForm } from '../../analyses/selection/Form';
import { MediationForm } from '../../analyses/mediation/Form';
import { PropensityForm } from '../../analyses/propensity/Form';
import { CorrelationForm } from '../../analyses/correlation/Form';
import { ChiSquareForm } from '../../analyses/chisquare/Form';
import { SampleSizeForm } from '../../analyses/samplesize/Form';
import { DistributionFitForm } from '../../analyses/distfit/Form';
import { LogisticForm } from '../../analyses/logistic/Form';
import { CoxForm } from '../../analyses/cox/Form';
import { SurvivalForm } from '../../analyses/survival/Form';
import { TimeSeriesForm } from '../../analyses/timeseries/Form';
import { ContingencyForm } from '../../analyses/contingency/Form';
import { LoglinearForm } from '../../analyses/loglinear/Form';
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
import { PartitionForm } from '../../analyses/partition/Form';
import { QualityForm } from '../../analyses/quality/Form';
import { ClusterForm } from '../../analyses/cluster/Form';
import { CanonicalForm } from '../../analyses/canonical/Form';
import { MdsForm } from '../../analyses/mds/Form';
import { CorrespondenceForm } from '../../analyses/correspondence/Form';
import { SemForm } from '../../analyses/sem/Form';
import { LatentClassForm } from '../../analyses/latentclass/Form';
import { IrtForm } from '../../analyses/irt/Form';
import { ConjointForm } from '../../analyses/conjoint/Form';
import { DiscriminantForm } from '../../analyses/discriminant/Form';
import { DoeForm } from '../../analyses/doe/Form';
import { CompetingForm } from '../../analyses/competing/Form';
import { RecurrentForm } from '../../analyses/recurrent/Form';
import { AltForm } from '../../analyses/alt/Form';
import { ReliabilityForm } from '../../analyses/reliability/Form';
import { VarForm } from '../../analyses/var/Form';
import { GarchForm } from '../../analyses/garch/Form';
import { StateSpaceForm } from '../../analyses/statespace/Form';
import { SurveyForm } from '../../analyses/survey/Form';
import { MlForm } from '../../analyses/ml/Form';
import { TextForm } from '../../analyses/text/Form';
import { ChoiceForm } from '../../analyses/choice/Form';
import { MetaForm } from '../../analyses/meta/Form';
import { BayesForm } from '../../analyses/bayes/Form';
import { SpatialForm } from '../../analyses/spatial/Form';
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
      case 'variances':
        return (
          <VariancesForm
            grid={p.grid}
            params={params.variances}
            setParams={setSlice('variances')}
          />
        );
      case 'proportions':
        return (
          <ProportionsForm
            grid={p.grid}
            params={params.proportions}
            setParams={setSlice('proportions')}
          />
        );
      case 'descriptive':
        return (
          <DescriptiveForm
            grid={p.grid}
            descVars={params.descVars}
            descMode={params.descMode}
            setDescVars={setSlice('descVars')}
            setDescMode={setSlice('descMode')}
          />
        );
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
      case 'glm':
        return (
          <GlmForm
            grid={p.grid}
            glmParams={params.glm}
            setGlmParams={setSlice('glm')}
          />
        );
      case 'quantile':
        return (
          <QuantileForm
            grid={p.grid}
            params={params.quantile}
            setParams={setSlice('quantile')}
          />
        );
      case 'nonlinear':
        return (
          <NonlinearForm
            grid={p.grid}
            params={params.nonlinear}
            setParams={setSlice('nonlinear')}
          />
        );
      case 'multinomial':
        return (
          <MultinomialForm
            grid={p.grid}
            multinomialParams={params.multinomial}
            setMultinomialParams={setSlice('multinomial')}
          />
        );
      case 'glmm':
        return (
          <GlmmForm
            grid={p.grid}
            glmmParams={params.glmm}
            setGlmmParams={setSlice('glmm')}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
          />
        );
      case 'pls':
        return (
          <PlsForm grid={p.grid} params={params.pls} setParams={setSlice('pls')} />
        );
      case 'mars':
        return (
          <MarsForm grid={p.grid} params={params.mars} setParams={setSlice('mars')} />
        );
      case 'iv':
        return (
          <IvForm grid={p.grid} params={params.iv} setParams={setSlice('iv')} />
        );
      case 'panel':
        return (
          <PanelForm grid={p.grid} params={params.panel} setParams={setSlice('panel')} />
        );
      case 'selection':
        return (
          <SelectionForm
            grid={p.grid}
            params={params.selection}
            setParams={setSlice('selection')}
          />
        );
      case 'mediation':
        return (
          <MediationForm
            grid={p.grid}
            params={params.mediation}
            setParams={setSlice('mediation')}
          />
        );
      case 'propensity':
        return (
          <PropensityForm
            grid={p.grid}
            params={params.propensity}
            setParams={setSlice('propensity')}
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
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
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
      case 'loglinear':
        return (
          <LoglinearForm
            loglinearParams={params.loglinear}
            setLoglinearParams={setSlice('loglinear')}
          />
        );
      case 'partition':
        return (
          <PartitionForm
            grid={p.grid}
            partitionParams={params.partition}
            setPartitionParams={setSlice('partition')}
          />
        );
      case 'quality':
        return (
          <QualityForm
            grid={p.grid}
            qualityParams={params.quality}
            setQualityParams={setSlice('quality')}
          />
        );
      case 'cluster':
        return (
          <ClusterForm
            grid={p.grid}
            clusterParams={params.cluster}
            setClusterParams={setSlice('cluster')}
          />
        );
      case 'canonical':
        return (
          <CanonicalForm
            grid={p.grid}
            canonicalParams={params.canonical}
            setCanonicalParams={setSlice('canonical')}
          />
        );
      case 'mds':
        return (
          <MdsForm
            grid={p.grid}
            mdsParams={params.mds}
            setMdsParams={setSlice('mds')}
          />
        );
      case 'correspondence':
        return (
          <CorrespondenceForm
            correspondenceParams={params.correspondence}
            setCorrespondenceParams={setSlice('correspondence')}
          />
        );
      case 'sem':
        return (
          <SemForm
            grid={p.grid}
            semParams={params.sem}
            setSemParams={setSlice('sem')}
          />
        );
      case 'latentclass':
        return (
          <LatentClassForm
            grid={p.grid}
            latentClassParams={params.latentclass}
            setLatentClassParams={setSlice('latentclass')}
          />
        );
      case 'irt':
        return (
          <IrtForm
            grid={p.grid}
            irtParams={params.irt}
            setIrtParams={setSlice('irt')}
          />
        );
      case 'conjoint':
        return (
          <ConjointForm
            grid={p.grid}
            conjointParams={params.conjoint}
            setConjointParams={setSlice('conjoint')}
          />
        );
      case 'discriminant':
        return (
          <DiscriminantForm
            grid={p.grid}
            discriminantParams={params.discriminant}
            setDiscriminantParams={setSlice('discriminant')}
          />
        );
      case 'doe':
        return (
          <DoeForm
            grid={p.grid}
            doeParams={params.doe}
            setDoeParams={setSlice('doe')}
          />
        );
      case 'competing':
        return (
          <CompetingForm
            grid={p.grid}
            competingParams={params.competing}
            setCompetingParams={setSlice('competing')}
          />
        );
      case 'recurrent':
        return (
          <RecurrentForm
            grid={p.grid}
            recurrentParams={params.recurrent}
            setRecurrentParams={setSlice('recurrent')}
          />
        );
      case 'alt':
        return (
          <AltForm
            grid={p.grid}
            altParams={params.alt}
            setAltParams={setSlice('alt')}
          />
        );
      case 'reliability':
        return (
          <ReliabilityForm
            grid={p.grid}
            reliabilityParams={params.reliability}
            setReliabilityParams={setSlice('reliability')}
          />
        );
      case 'var':
        return (
          <VarForm grid={p.grid} varParams={params.var} setVarParams={setSlice('var')} />
        );
      case 'garch':
        return (
          <GarchForm
            grid={p.grid}
            garchParams={params.garch}
            setGarchParams={setSlice('garch')}
          />
        );
      case 'statespace':
        return (
          <StateSpaceForm
            grid={p.grid}
            stateSpaceParams={params.statespace}
            setStateSpaceParams={setSlice('statespace')}
          />
        );
      case 'survey':
        return (
          <SurveyForm
            grid={p.grid}
            surveyParams={params.survey}
            setSurveyParams={setSlice('survey')}
          />
        );
      case 'ml':
        return (
          <MlForm grid={p.grid} mlParams={params.ml} setMlParams={setSlice('ml')} />
        );
      case 'text':
        return (
          <TextForm
            grid={p.grid}
            textParams={params.text}
            setTextParams={setSlice('text')}
          />
        );
      case 'choice':
        return (
          <ChoiceForm
            grid={p.grid}
            choiceParams={params.choice}
            setChoiceParams={setSlice('choice')}
          />
        );
      case 'meta':
        return (
          <MetaForm
            grid={p.grid}
            metaParams={params.meta}
            setMetaParams={setSlice('meta')}
          />
        );
      case 'bayes':
        return (
          <BayesForm
            grid={p.grid}
            bayesParams={params.bayes}
            setBayesParams={setSlice('bayes')}
          />
        );
      case 'spatial':
        return (
          <SpatialForm
            grid={p.grid}
            spatialParams={params.spatial}
            setSpatialParams={setSlice('spatial')}
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