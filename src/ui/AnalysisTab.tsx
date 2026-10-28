import type { Dispatch, ReactNode, SetStateAction } from 'react';
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
import { AncovaAnalysis } from '../analyses/AncovaAnalysis';
import { ContingencyAnalysis } from '../analyses/ContingencyAnalysis';
import { CoxAnalysis } from '../analyses/CoxAnalysis';
import { FactorialAnovaAnalysis } from '../analyses/FactorialAnovaAnalysis';
import { LogisticAnalysis } from '../analyses/LogisticAnalysis';
import { MultivariateAnalysis } from '../analyses/MultivariateAnalysis';
import { NonParamRepeatedAnalysis } from '../analyses/NonParamRepeatedAnalysis';
import { RepeatedAnovaAnalysis } from '../analyses/RepeatedAnovaAnalysis';
import { SurvivalAnalysis } from '../analyses/SurvivalAnalysis';
import { TimeSeriesAnalysis } from '../analyses/TimeSeriesAnalysis';
import { WizardAnalysis } from '../analyses/WizardAnalysis';
import { OutputConsole, type OutputEntry } from './OutputConsole';
import type { ReportSpec } from '../stats/report';
import type { CategoryLevel, GridData } from '../grid/types';
import type { AnovaParams, ChiSqParams, CorrParams, DistributionFitParams, RegParams, SampleSizeParams, TTestParams } from '../io/project';

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
  runSignal: number;
  pushOutput: (node: ReactNode, report: ReportSpec | null) => void;
  showToast: (title: string, msg: string, type?: 'ok' | 'warn' | 'error') => void;
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
  runSignal,
  pushOutput,
  showToast,
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
        <TimeSeriesAnalysis
          runSignal={runSignal}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'survival' && (
        <SurvivalAnalysis
          runSignal={runSignal}
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
          runSignal={runSignal}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'wizard' && (
        <WizardAnalysis
          runSignal={runSignal}
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
          runSignal={runSignal}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'factorial' && (
        <FactorialAnovaAnalysis
          runSignal={runSignal}
          grid={grid}
          onLevels={updateColumnLevels}
          onRecode={updateColumnRecode}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
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
        <AncovaAnalysis
          runSignal={runSignal}
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
          runSignal={runSignal}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'repeatedanova' && (
        <RepeatedAnovaAnalysis
          runSignal={runSignal}
          grid={grid}
          ciLevel={ciLevel}
          onOutput={pushOutput}
          onError={(message) => showToast('Error', message, 'error')}
        />
      )}

      {activeAnalysis === 'nonparamrm' && (
        <NonParamRepeatedAnalysis
          runSignal={runSignal}
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
          runSignal={runSignal}
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
