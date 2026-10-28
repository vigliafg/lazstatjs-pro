import type { Dispatch, SetStateAction } from 'react';
import { Play } from 'lucide-react';
import { ANALYSIS_TABS } from '../analyses/registry';
import { DescriptiveForm } from '../analyses/descriptive/Form';
import { TTestForm } from '../analyses/ttest/Form';
import { AnovaForm } from '../analyses/anova/Form';
import { RegressionForm } from '../analyses/regression/Form';
import { CorrelationForm } from '../analyses/correlation/Form';
import { ChiSquareForm } from '../analyses/chisquare/Form';
import { SampleSizeForm } from '../analyses/samplesize/Form';
import { DistributionFitForm } from '../analyses/distfit/Form';
import { LogisticForm } from '../analyses/logistic/Form';
import { CoxForm } from '../analyses/cox/Form';
import { SurvivalForm } from '../analyses/survival/Form';
import { TimeSeriesForm } from '../analyses/timeseries/Form';
import { ContingencyForm } from '../analyses/contingency/Form';
import { AncovaForm } from '../analyses/ancova/Form';
import { FactorialForm } from '../analyses/factorial/Form';
import { RepeatedAnovaForm } from '../analyses/repeatedanova/Form';
import { MultivariateForm } from '../analyses/multivariate/Form';
import { NonParamForm } from '../analyses/nonparamrm/Form';
import { WizardForm } from '../analyses/wizard/Form';
import { TostForm } from '../analyses/tost/Form';
import { AgreementForm } from '../analyses/agreement/Form';
import { OutputConsole, type OutputEntry } from './OutputConsole';
import type { CategoryLevel, GridData } from '../grid/types';
import type { AncovaParams, AnovaParams, ChiSqParams, ContingencyParams, CorrParams, CoxParams, DistributionFitParams, FactorialParams, LogisticParams, MultivariateParams, NonParamParams, RegParams, RepeatedAnovaParams, SampleSizeParams, SurvivalParams, TimeSeriesParams, AgreementParams, TostParams, TTestParams, WizardParams } from '../io/project';

export interface AnalysisTabProps {
  activeAnalysis: string;
  setActiveAnalysis: Dispatch<SetStateAction<string>>;
  ciLevel: number;
  setCiLevel: Dispatch<SetStateAction<number>>;
  descVars: number[];
  setDescVars: Dispatch<SetStateAction<number[]>>;
  ttestParams: TTestParams;
  setTTestParams: Dispatch<SetStateAction<TTestParams>>;
  anovaParams: AnovaParams;
  setAnovaParams: Dispatch<SetStateAction<AnovaParams>>;
  regParams: RegParams;
  setRegParams: Dispatch<SetStateAction<RegParams>>;
  corrParams: CorrParams;
  setCorrParams: Dispatch<SetStateAction<CorrParams>>;
  chisqParams: ChiSqParams;
  setChisqParams: Dispatch<SetStateAction<ChiSqParams>>;
  samplesizeParams: SampleSizeParams;
  setSamplesizeParams: Dispatch<SetStateAction<SampleSizeParams>>;
  distfitParams: DistributionFitParams;
  setDistfitParams: Dispatch<SetStateAction<DistributionFitParams>>;
  logisticParams: LogisticParams;
  setLogisticParams: Dispatch<SetStateAction<LogisticParams>>;
  coxParams: CoxParams;
  setCoxParams: Dispatch<SetStateAction<CoxParams>>;
  survivalParams: SurvivalParams;
  setSurvivalParams: Dispatch<SetStateAction<SurvivalParams>>;
  timeseriesParams: TimeSeriesParams;
  setTimeseriesParams: Dispatch<SetStateAction<TimeSeriesParams>>;
  contingencyParams: ContingencyParams;
  setContingencyParams: Dispatch<SetStateAction<ContingencyParams>>;
  ancovaParams: AncovaParams;
  setAncovaParams: Dispatch<SetStateAction<AncovaParams>>;
  factorialParams: FactorialParams;
  setFactorialParams: Dispatch<SetStateAction<FactorialParams>>;
  repeatedAnovaParams: RepeatedAnovaParams;
  setRepeatedAnovaParams: Dispatch<SetStateAction<RepeatedAnovaParams>>;
  multivariateParams: MultivariateParams;
  setMultivariateParams: Dispatch<SetStateAction<MultivariateParams>>;
  nonParamParams: NonParamParams;
  setNonParamParams: Dispatch<SetStateAction<NonParamParams>>;
  wizardParams: WizardParams;
  setWizardParams: Dispatch<SetStateAction<WizardParams>>;
  tostParams: TostParams;
  setTostParams: Dispatch<SetStateAction<TostParams>>;
  agreementParams: AgreementParams;
  setAgreementParams: Dispatch<SetStateAction<AgreementParams>>;
  grid: GridData;
  outputs: OutputEntry[];
  removeOutput: (index: number) => void;
  clearOutput: () => void;
  copyOutput: () => void;
  exportChartPngs: () => void;
  exportReportHtml: () => void;
  exportResultsXlsx: () => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  runAnalysis: () => void;
  updateColumnLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (column: number, mapping: Record<string, string>) => void;
}

export const AnalysisTab = ({
  activeAnalysis,
  setActiveAnalysis,
  ciLevel,
  setCiLevel,
  descVars,
  setDescVars,
  ttestParams,
  setTTestParams,
  anovaParams,
  setAnovaParams,
  regParams,
  setRegParams,
  corrParams,
  setCorrParams,
  chisqParams,
  setChisqParams,
  samplesizeParams,
  setSamplesizeParams,
  distfitParams,
  setDistfitParams,
  logisticParams,
  setLogisticParams,
  coxParams,
  setCoxParams,
  survivalParams,
  setSurvivalParams,
  timeseriesParams,
  setTimeseriesParams,
  contingencyParams,
  setContingencyParams,
  ancovaParams,
  setAncovaParams,
  factorialParams,
  setFactorialParams,
  repeatedAnovaParams,
  setRepeatedAnovaParams,
  multivariateParams,
  setMultivariateParams,
  nonParamParams,
  setNonParamParams,
  wizardParams,
  setWizardParams,
  tostParams,
  setTostParams,
  agreementParams,
  setAgreementParams,
  grid,
  outputs,
  removeOutput,
  clearOutput,
  copyOutput,
  exportChartPngs,
  exportReportHtml,
  exportResultsXlsx,
  setActiveTab,
  runAnalysis,
  updateColumnLevels,
  updateColumnRecode,
}: AnalysisTabProps) => (
  <>
<div className="flex-1 flex flex-col overflow-hidden">
  <div className="bg-surface border-b border-border shrink-0">
    <div className="flex overflow-x-auto scrollbar">
      {ANALYSIS_TABS.map(a => (
        <button 
          key={a.id}
          onClick={() => setActiveAnalysis(a.id)}
          className={`atab ${activeAnalysis === a.id ? 'active' : ''}`}
        >
          {a.label}
        </button>
      ))}
    </div>
    
    <div className="p-4 flex flex-wrap gap-6 items-start">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">CI Level</label>
        <select
          className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[90px]"
          value={ciLevel}
          onChange={(e) => setCiLevel(parseInt(e.target.value))}
        >
          <option value={90}>90%</option>
          <option value={95}>95%</option>
          <option value={99}>99%</option>
        </select>
      </div>
      {activeAnalysis === 'descriptive' && (
        <DescriptiveForm grid={grid} descVars={descVars} setDescVars={setDescVars} />
      )}

      {activeAnalysis === 'ttest' && (
        <TTestForm grid={grid} ttestParams={ttestParams} setTTestParams={setTTestParams} />
      )}

      {activeAnalysis === 'anova' && (
        <AnovaForm grid={grid} anovaParams={anovaParams} setAnovaParams={setAnovaParams} onLevels={updateColumnLevels} onRecode={updateColumnRecode} />
      )}

      {activeAnalysis === 'regression' && (
        <RegressionForm grid={grid} regParams={regParams} setRegParams={setRegParams} />
      )}

      {activeAnalysis === 'correlation' && (
        <CorrelationForm grid={grid} corrParams={corrParams} setCorrParams={setCorrParams} />
      )}

      {activeAnalysis === 'chisquare' && (
        <ChiSquareForm grid={grid} chisqParams={chisqParams} setChisqParams={setChisqParams} />
      )}

      {activeAnalysis === 'timeseries' && (
        <TimeSeriesForm
          grid={grid}
          timeseriesParams={timeseriesParams}
          setTimeseriesParams={setTimeseriesParams}
        />
      )}

      {activeAnalysis === 'survival' && (
        <SurvivalForm
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          survivalParams={survivalParams}
          setSurvivalParams={setSurvivalParams}
        />
      )}

      {activeAnalysis === 'cox' && (
        <CoxForm
          grid={grid}
          coxParams={coxParams}
          setCoxParams={setCoxParams}
        />
      )}

      {activeAnalysis === 'wizard' && (
        <WizardForm
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          onOpenAnalysis={analysisId => setActiveAnalysis(analysisId)}
          ciLevel={ciLevel}
          wizardParams={wizardParams}
          setWizardParams={setWizardParams}
        />
      )}

      {activeAnalysis === 'logistic' && (
        <LogisticForm
          grid={grid}
          logisticParams={logisticParams}
          setLogisticParams={setLogisticParams}
        />
      )}

      {activeAnalysis === 'factorial' && (
        <FactorialForm
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          factorialParams={factorialParams}
          setFactorialParams={setFactorialParams}
        />
      )}

      {activeAnalysis === 'distfit' && (
        <DistributionFitForm
          grid={grid}
          distfitParams={distfitParams}
          setDistfitParams={setDistfitParams}
        />
      )}

      {activeAnalysis === 'samplesize' && (
        <SampleSizeForm
          samplesizeParams={samplesizeParams}
          setSamplesizeParams={setSamplesizeParams}
        />
      )}

      {activeAnalysis === 'ancova' && (
        <AncovaForm
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ancovaParams={ancovaParams}
          setAncovaParams={setAncovaParams}
        />
      )}

      {activeAnalysis === 'multivariate' && (
        <MultivariateForm
          grid={grid}
          multivariateParams={multivariateParams}
          setMultivariateParams={setMultivariateParams}
        />
      )}

      {activeAnalysis === 'repeatedanova' && (
        <RepeatedAnovaForm
          grid={grid}
          repeatedAnovaParams={repeatedAnovaParams}
          setRepeatedAnovaParams={setRepeatedAnovaParams}
        />
      )}

      {activeAnalysis === 'nonparamrm' && (
        <NonParamForm
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          nonParamParams={nonParamParams}
          setNonParamParams={setNonParamParams}
        />
      )}

      {activeAnalysis === 'agreement' && (
        <AgreementForm grid={grid} agreementParams={agreementParams} setAgreementParams={setAgreementParams} />
      )}

      {activeAnalysis === 'tost' && (
        <TostForm
          grid={grid}
          tostParams={tostParams}
          setTostParams={setTostParams}
        />
      )}

      {activeAnalysis === 'contingency' && (
        <ContingencyForm
          contingencyParams={contingencyParams}
          setContingencyParams={setContingencyParams}
        />
      )}

      <button className="run-btn h-9 self-end" onClick={runAnalysis}>
        <Play className="w-3 h-3 inline mr-2" />
        Run Analysis
      </button>
    </div>
  </div>

  <OutputConsole
    outputs={outputs}
    onRemove={removeOutput}
    onClear={clearOutput}
    onCopy={copyOutput}
    onExportCharts={exportChartPngs}
    onExportReport={exportReportHtml}
    onExportXlsx={exportResultsXlsx}
    onBackToData={() => setActiveTab('data')}
  />
</div>
  </>
);
