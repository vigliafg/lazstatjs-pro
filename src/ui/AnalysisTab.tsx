import type { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';
import { Play } from 'lucide-react';
import { ANALYSIS_TABS } from '../analyses/registry';
import { DescriptiveForm } from '../analyses/descriptive/Form';
import { TTestForm } from '../analyses/ttest/Form';
import { AnovaForm } from '../analyses/anova/Form';
import { RegressionForm } from '../analyses/regression/Form';
import { CorrelationForm } from '../analyses/correlation/Form';
import { ChiSquareForm } from '../analyses/chisquare/Form';
import { AncovaAnalysis, type AncovaHandle } from '../analyses/AncovaAnalysis';
import { ContingencyAnalysis, type ContingencyHandle } from '../analyses/ContingencyAnalysis';
import { CoxAnalysis, type CoxHandle } from '../analyses/CoxAnalysis';
import { DistributionFitAnalysis, type DistributionFitHandle } from '../analyses/DistributionFitAnalysis';
import { FactorialAnovaAnalysis, type FactorialAnovaHandle } from '../analyses/FactorialAnovaAnalysis';
import { LogisticAnalysis, type LogisticHandle } from '../analyses/LogisticAnalysis';
import { MultivariateAnalysis, type MultivariateHandle } from '../analyses/MultivariateAnalysis';
import { NonParamRepeatedAnalysis, type NonParamRepeatedHandle } from '../analyses/NonParamRepeatedAnalysis';
import { RepeatedAnovaAnalysis, type RepeatedAnovaHandle } from '../analyses/RepeatedAnovaAnalysis';
import { SampleSizeAnalysis, type SampleSizeHandle } from '../analyses/SampleSizeAnalysis';
import { SurvivalAnalysis, type SurvivalHandle } from '../analyses/SurvivalAnalysis';
import { TimeSeriesAnalysis, type TimeSeriesHandle } from '../analyses/TimeSeriesAnalysis';
import { WizardAnalysis, type WizardHandle } from '../analyses/WizardAnalysis';
import { OutputConsole, type OutputEntry } from './OutputConsole';
import type { ReportSpec } from '../stats/report';
import type { CategoryLevel, GridData } from '../grid/types';
import type { AnovaParams, ChiSqParams, CorrParams, RegParams, TTestParams } from '../io/project';

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
  pushOutput: (node: ReactNode, report: ReportSpec | null) => void;
  showToast: (title: string, msg: string, type?: 'ok' | 'warn' | 'error') => void;
  updateColumnLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (column: number, mapping: Record<string, string>) => void;
  ancovaRef: RefObject<AncovaHandle | null>;
  contingencyRef: RefObject<ContingencyHandle | null>;
  coxRef: RefObject<CoxHandle | null>;
  distFitRef: RefObject<DistributionFitHandle | null>;
  factorialRef: RefObject<FactorialAnovaHandle | null>;
  logisticRef: RefObject<LogisticHandle | null>;
  multivariateRef: RefObject<MultivariateHandle | null>;
  nonParamRepeatedRef: RefObject<NonParamRepeatedHandle | null>;
  repeatedAnovaRef: RefObject<RepeatedAnovaHandle | null>;
  sampleSizeRef: RefObject<SampleSizeHandle | null>;
  survivalRef: RefObject<SurvivalHandle | null>;
  timeSeriesRef: RefObject<TimeSeriesHandle | null>;
  wizardRef: RefObject<WizardHandle | null>;
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
  pushOutput,
  showToast,
  updateColumnLevels,
  updateColumnRecode,
  ancovaRef,
  contingencyRef,
  coxRef,
  distFitRef,
  factorialRef,
  logisticRef,
  multivariateRef,
  nonParamRepeatedRef,
  repeatedAnovaRef,
  sampleSizeRef,
  survivalRef,
  timeSeriesRef,
  wizardRef,
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
        <TimeSeriesAnalysis
          ref={timeSeriesRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'survival' && (
        <SurvivalAnalysis
          ref={survivalRef}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'cox' && (
        <CoxAnalysis
          ref={coxRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'wizard' && (
        <WizardAnalysis
          ref={wizardRef}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onOpenAnalysis={(analysisId) => setActiveAnalysis(analysisId)}
        />
      )}

      {activeAnalysis === 'logistic' && (
        <LogisticAnalysis
          ref={logisticRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'factorial' && (
        <FactorialAnovaAnalysis
          ref={factorialRef}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'distfit' && (
        <DistributionFitAnalysis
          ref={distFitRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'samplesize' && (
        <SampleSizeAnalysis
          ref={sampleSizeRef}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'ancova' && (
        <AncovaAnalysis
          ref={ancovaRef}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'multivariate' && (
        <MultivariateAnalysis
          ref={multivariateRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'repeatedanova' && (
        <RepeatedAnovaAnalysis
          ref={repeatedAnovaRef}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'nonparamrm' && (
        <NonParamRepeatedAnalysis
          ref={nonParamRepeatedRef}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'contingency' && (
        <ContingencyAnalysis
          ref={contingencyRef}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
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
