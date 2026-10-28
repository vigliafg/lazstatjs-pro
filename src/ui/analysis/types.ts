import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { RowFilter } from '../../grid/ops';
import type { RoleState } from '../../analyses/roles';
import type { OutputEntry } from '../OutputConsole';
import type {
  AgreementParams,
  AncovaParams,
  AnovaParams,
  ChiSqParams,
  ContingencyParams,
  CorrParams,
  CountParams,
  CoxParams,
  DistributionFitParams,
  FactorialParams,
  GeeParams,
  LmmParams,
  LogisticParams,
  MiParams,
  MixedAnovaParams,
  MultivariateParams,
  NonParamParams,
  OrdinalParams,
  ParametricSurvivalParams,
  RegParams,
  RepeatedAnovaParams,
  ResamplingParams,
  SampleSizeParams,
  StratifiedCoxParams,
  SurvivalParams,
  TdCoxParams,
  TimeSeriesParams,
  TostParams,
  TTestParams,
  WizardParams,
} from '../../io/project';

/**
 * State and callbacks that the analysis workspace needs.
 *
 * The App still owns the parameter slices (they are persisted as one project),
 * so the workspace receives the same contract the old tab used. Keeping it in
 * one type avoids re-declaring the 30 parameter pairs in each child component.
 */
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
  countParams: CountParams;
  setCountParams: Dispatch<SetStateAction<CountParams>>;
  lmmParams: LmmParams;
  setLmmParams: Dispatch<SetStateAction<LmmParams>>;
  ordinalParams: OrdinalParams;
  setOrdinalParams: Dispatch<SetStateAction<OrdinalParams>>;
  miParams: MiParams;
  setMiParams: Dispatch<SetStateAction<MiParams>>;
  mixedAnovaParams: MixedAnovaParams;
  setMixedAnovaParams: Dispatch<SetStateAction<MixedAnovaParams>>;
  parametricParams: ParametricSurvivalParams;
  setParametricParams: Dispatch<SetStateAction<ParametricSurvivalParams>>;
  resamplingParams: ResamplingParams;
  setResamplingParams: Dispatch<SetStateAction<ResamplingParams>>;
  geeParams: GeeParams;
  setGeeParams: Dispatch<SetStateAction<GeeParams>>;
  stratCoxParams: StratifiedCoxParams;
  setStratCoxParams: Dispatch<SetStateAction<StratifiedCoxParams>>;
  tdCoxParams: TdCoxParams;
  setTdCoxParams: Dispatch<SetStateAction<TdCoxParams>>;
  grid: GridData;
  outputs: OutputEntry[];
  dataRevision: number;
  datasetId: string;
  roleErrors: string[];
  filterAffectsAnalysis: boolean;
  visibleRowCount: number;
  activeRowFilter: RowFilter | null;
  filterSignature: string;
  focusedColumn: number | null;
  onAssignPrimary: (column: number) => void;
  roles: RoleState[];
  onAssignRole: (column: number, roleKey: string) => void;
  removeOutput: (index: number) => void;
  clearOutput: () => void;
  copyOutput: () => void;
  exportChartPngs: () => void;
  exportReportHtml: () => void;
  exportResultsXlsx: () => void;
  setActiveTab: Dispatch<SetStateAction<'data' | 'analysis' | 'settings' | 'help'>>;
  runAnalysis: () => boolean;
  updateColumnLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  updateColumnRecode: (column: number, mapping: Record<string, string>) => void;
}
