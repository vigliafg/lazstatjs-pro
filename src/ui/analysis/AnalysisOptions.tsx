import { useEffect, useState, type ReactNode, type SetStateAction } from 'react';
import { Play } from 'lucide-react';
import { analysisMeta, familyOf } from '../../analyses/registry';
import { rowMatches } from '../../grid/ops';
import { isMissingCell, missingCodeCount } from '../../grid/types';
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
import type { ProjectParams } from '../../io/project';
import type { AnalysisTabProps } from './types';
import { useAnalysisStore } from './store';
import { Section } from '../../components/FormFields';

const inputClass =
  'w-full bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded focus:border-accent focus:outline-none';

/**
 * Setup panel for the active analysis. Forms keep their own controls; the
 * panel supplies the stable frame: title, family, CI, scroll area and Run.
 */
export const AnalysisOptions = (p: AnalysisTabProps & { paneId?: string }) => {
  const { params, dispatch } = useAnalysisStore();
  const setSlice = <K extends keyof ProjectParams>(key: K) =>
    (updater: SetStateAction<ProjectParams[K]>) =>
      dispatch({ type: 'slice', key, updater });
  const meta = analysisMeta(p.activeAnalysis);
  const family = familyOf(p.activeAnalysis);
  const [peek, setPeek] = useState(false);
  const [live, setLive] = useState(false);
  const [livePending, setLivePending] = useState(false);
  const [roleKey, setRoleKey] = useState('');
  const activeRoleKey = p.roles.some(role => role.key === roleKey)
    ? roleKey
    : p.roles[0]?.key ?? '';
  // Live mode recomputes instant procedures after a short pause; heavy ones
  // stay explicit. The previous live card is replaced, not stacked.
  useEffect(() => {
    setLive(false);
  }, [p.activeAnalysis]);

  useEffect(() => {
    if (!live) {
      setLivePending(false);
      return;
    }
    if (p.roleErrors.length > 0) return;
    setLivePending(true);
    const timer = setTimeout(() => {
      p.runAnalysisLive();
      setLivePending(false);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    live,
    params,
    p.grid.rows,
    p.grid.cols,
    p.ciLevel,
    p.roleErrors.length,
    p.activeRowFilter,
    p.filterAffectsAnalysis,
  ]);

  const rowsForAnalysis =
    p.filterAffectsAnalysis && p.activeRowFilter
      ? p.grid.rows.filter(row => rowMatches(p.grid, row, p.activeRowFilter))
      : p.grid.rows;
  const missingCells = p.grid.rows.reduce(
    (count, row) =>
      count + row.filter((cell, column) => isMissingCell(p.grid.cols[column], cell)).length,
    0
  );
  const codeCells = missingCodeCount(p.grid);
  const previewCols = p.grid.cols.slice(0, 6);

  const sectionTitle = (() => {
    switch (p.activeAnalysis) {
      case 'wizard':
        return 'Goal & data';
      case 'samplesize':
        return 'Design & precision';
      case 'contingency':
      case 'chisquare':
        return 'Table & options';
      case 'distfit':
        return 'Variable & distributions';
      case 'timeseries':
        return 'Series & model';
      case 'mi':
        return 'Missing data & pooling';
      case 'multivariate':
        return 'Variables & extraction';
      case 'tost':
        return 'Equivalence margin';
      case 'agreement':
        return 'Measurements & method';
      case 'resampling':
        return 'Resampling plan';
      default:
        return 'Variables & model';
    }
  })();

  const form = (() => {
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
            stratCoxParams={params.stratcox}
            setStratCoxParams={setSlice('stratcox')}
          />
        );
      case 'gee':
        return (
          <GeeForm
            grid={p.grid}
            geeParams={params.gee}
            setGeeParams={setSlice('gee')}
          />
        );
      case 'resampling':
        return (
          <ResamplingForm
            grid={p.grid}
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
          <LmmForm grid={p.grid} lmmParams={params.lmm} setLmmParams={setSlice('lmm')} />
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
            <p className="text-[11px] text-text2">This analysis has no setup form yet.</p>
          </div>
        );
    }
  })();

  return (
    <aside
      id={p.paneId}
      tabIndex={-1}
      aria-label="Analysis setup"
      className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface outline-none"
    >
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent2">
            {family?.label ?? 'Analysis'}
          </span>
          {meta?.cost === 'heavy' && (
            <span className="rounded border border-yellow/25 bg-yellow/5 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow/80">
              heavy computation
            </span>
          )}
        </div>
        <h2 className="text-[15px] font-semibold text-text">{meta?.label ?? p.activeAnalysis}</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-text3">
          {meta?.description ?? 'Configure the analysis and run it on the current dataset.'}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            Rows {p.filterAffectsAnalysis ? `${p.visibleRowCount}/${p.grid.rows.length}` : p.grid.rows.length}
          </span>
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            Variables {p.grid.cols.length}
          </span>
          <span
            className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3"
            title={codeCells > 0 ? `${codeCells} cells carry declared missing codes` : 'Blank cells only'}
          >
            Missing {missingCells}
          </span>
          {codeCells > 0 && (
            <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
              Codes {codeCells}
            </span>
          )}
          {p.filterAffectsAnalysis && (
            <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
              analysis filter
            </span>
          )}
        </div>
        {p.focusedColumn !== null && p.grid.cols[p.focusedColumn] && (
          <div className="mt-2 flex flex-col gap-1 rounded border border-border bg-surface3/50 px-2 py-1">
            <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-wider text-text3">
              Focused: <span className="text-text2">{p.grid.cols[p.focusedColumn]?.label?.trim() || p.grid.cols[p.focusedColumn]?.name}</span>
            </span>
            {p.roles.length > 1 ? (
              <div className="flex items-center gap-1">
                <select
                  aria-label="Role to assign the focused column to"
                  className="min-w-0 flex-1 rounded border border-border2 bg-surface3 p-1 text-[10px] text-text"
                  value={activeRoleKey}
                  onChange={event => setRoleKey(event.target.value)}
                >
                  {p.roles.map(role => (
                    <option key={role.key} value={role.key}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => p.onAssignRole(p.focusedColumn as number, activeRoleKey)}
                  className="tb-btn shrink-0 px-2 py-0.5 text-[10px]"
                  title="Assign the focused column to the selected role"
                >
                  Assign
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => p.onAssignPrimary(p.focusedColumn as number)}
                className="tb-btn px-2 py-0.5 text-[10px]"
                title="Assign the focused grid column to the primary role of this analysis"
              >
                Use in analysis
              </button>
            )}
          </div>
        )}
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => setPeek(value => !value)}
            className={`tb-btn px-2 py-0.5 text-[10px] ${peek ? 'border-accent bg-accent/10 text-text' : ''}`}
          >
            {peek ? 'Hide data peek' : 'Data peek'}
          </button>
          {meta?.cost === 'instant' && (
            <button
              type="button"
              onClick={() => setLive(value => !value)}
              aria-pressed={live}
              aria-label="Live run"
              title="Re-run this analysis automatically when the data or its parameters change"
              className={`tb-btn px-2 py-0.5 text-[10px] ${live ? 'border-accent bg-accent/10 text-text' : ''}`}
            >
              {live ? (livePending ? 'Live · syncing…' : 'Live · on') : 'Live'}
            </button>
          )}
          <button
            type="button"
            onClick={() => p.setActiveTab('data')}
            className="tb-btn px-2 py-0.5 text-[10px]"
          >
            Open data
          </button>
        </div>
      </div>

      <div
        key={p.activeAnalysis}
        className="min-h-0 flex-1 overflow-auto scrollbar p-4"
      >
        <div className="flex flex-col gap-5">
          {peek && (
            <div className="rounded border border-border bg-surface3/40 p-2">
              <div className="overflow-x-auto scrollbar">
                <table className="w-full border-collapse text-[9px]">
                  <thead>
                    <tr>
                      <th className="border border-border bg-surface2 px-1 py-0.5 text-left font-mono text-text3">
                        #
                      </th>
                      {previewCols.map((col, index) => (
                        <th
                          key={col.id ?? index}
                          className="border border-border bg-surface2 px-1 py-0.5 text-left font-mono text-accent2"
                        >
                          {col.label?.trim() || col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowsForAnalysis.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="border border-border px-1 py-0.5 font-mono text-text3">
                          {rowIndex + 1}
                        </td>
                        {previewCols.map((_, columnIndex) => (
                          <td
                            key={columnIndex}
                            className="max-w-[90px] truncate border border-border px-1 py-0.5 font-mono text-text2"
                          >
                            {row[columnIndex] ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-1 text-[9px] text-text3">
                First {Math.min(5, rowsForAnalysis.length)} of {rowsForAnalysis.length} rows ·{' '}
                {p.filterAffectsAnalysis ? 'analysis filter active' : 'view filter only'}
              </p>
              {p.roles.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.roles.map(role => {
                    const names = role.columns
                      .filter(column => column >= 0)
                      .map(column => p.grid.cols[column]?.label?.trim() || p.grid.cols[column]?.name)
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <span
                        key={role.key}
                        className="rounded border border-border2 bg-surface2 px-1.5 py-0.5 font-mono text-[9px] text-text3"
                        title={role.label}
                      >
                        {role.label.split(': ')[1] ?? role.label}: {names || '—'}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {p.roleErrors.length > 0 && (
            <div className="rounded border border-yellow/30 bg-yellow/5 p-3">
              <p className="font-mono text-[9px] uppercase tracking-widest text-yellow">
                Reselect variables
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-text2">
                A column edit removed or transformed a variable used by this analysis.
                Choose the affected fields again before running.
              </p>
              <ul className="mt-1.5 list-disc pl-4 text-[10px] text-text3">
                {p.roleErrors.slice(0, 4).map(label => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          )}

          <Section title="Confidence level" hint="Applies to every estimate">
            <select
              className={inputClass}
              value={p.ciLevel}
              onChange={event => p.setCiLevel(parseInt(event.target.value, 10))}
            >
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>
          </Section>

          <Section
            title={sectionTitle}
            hint={p.activeAnalysis === 'wizard' ? 'Guided' : undefined}
          >
            <div className="flex flex-col gap-3">{form}</div>
          </Section>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface2/60 p-3">
        <button
          type="button"
          onClick={p.runAnalysis}
          disabled={p.roleErrors.length > 0}
          title="Run analysis (Ctrl/Cmd + Enter)"
          className="run-btn flex h-10 w-full items-center justify-center gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          Run analysis
        </button>
        <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-text3">
          <span className="truncate" title={`${p.grid.rows.length} rows · ${p.grid.cols.length} variables`}>
            {p.grid.rows.length} × {p.grid.cols.length}
          </span>
          <span className="shrink-0 text-text3/80" title="Ctrl/Cmd+Enter">
            Ctrl/⌘Enter
          </span>
        </div>
      </div>
    </aside>
  );
};
