import { useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { analysisMeta, familyOf } from '../../analyses/registry';
import { rowMatches } from '../../grid/ops';
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
import type { AnalysisTabProps } from './types';

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="font-mono text-[9px] uppercase tracking-[0.18em] text-text3">{title}</h3>
      {hint && <span className="text-[9px] text-text3/70">{hint}</span>}
    </div>
    {children}
  </section>
);

const inputClass =
  'w-full bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded focus:border-accent focus:outline-none';

/**
 * Setup panel for the active analysis. Forms keep their own controls; the
 * panel supplies the stable frame: title, family, CI, scroll area and Run.
 */
export const AnalysisOptions = (p: AnalysisTabProps) => {
  const meta = analysisMeta(p.activeAnalysis);
  const family = familyOf(p.activeAnalysis);
  const [peek, setPeek] = useState(false);
  const [roleKey, setRoleKey] = useState('');
  const activeRoleKey = p.roles.some(role => role.key === roleKey)
    ? roleKey
    : p.roles[0]?.key ?? '';
  const rowsForAnalysis =
    p.filterAffectsAnalysis && p.activeRowFilter
      ? p.grid.rows.filter(row => rowMatches(p.grid, row, p.activeRowFilter))
      : p.grid.rows;
  const missingCells = p.grid.rows.reduce(
    (count, row) => count + row.filter(cell => String(cell ?? '').trim() === '').length,
    0
  );
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
        return <DescriptiveForm grid={p.grid} descVars={p.descVars} setDescVars={p.setDescVars} />;
      case 'ttest':
        return (
          <TTestForm
            grid={p.grid}
            ttestParams={p.ttestParams}
            setTTestParams={p.setTTestParams}
          />
        );
      case 'anova':
        return (
          <AnovaForm
            grid={p.grid}
            anovaParams={p.anovaParams}
            setAnovaParams={p.setAnovaParams}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
          />
        );
      case 'regression':
        return (
          <RegressionForm
            grid={p.grid}
            regParams={p.regParams}
            setRegParams={p.setRegParams}
          />
        );
      case 'correlation':
        return (
          <CorrelationForm
            grid={p.grid}
            corrParams={p.corrParams}
            setCorrParams={p.setCorrParams}
          />
        );
      case 'chisquare':
        return (
          <ChiSquareForm
            grid={p.grid}
            chisqParams={p.chisqParams}
            setChisqParams={p.setChisqParams}
          />
        );
      case 'timeseries':
        return (
          <TimeSeriesForm
            grid={p.grid}
            timeseriesParams={p.timeseriesParams}
            setTimeseriesParams={p.setTimeseriesParams}
          />
        );
      case 'survival':
        return (
          <SurvivalForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            survivalParams={p.survivalParams}
            setSurvivalParams={p.setSurvivalParams}
          />
        );
      case 'cox':
        return (
          <CoxForm
            grid={p.grid}
            coxParams={p.coxParams}
            setCoxParams={p.setCoxParams}
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
            wizardParams={p.wizardParams}
            setWizardParams={p.setWizardParams}
          />
        );
      case 'logistic':
        return (
          <LogisticForm
            grid={p.grid}
            logisticParams={p.logisticParams}
            setLogisticParams={p.setLogisticParams}
          />
        );
      case 'factorial':
        return (
          <FactorialForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            factorialParams={p.factorialParams}
            setFactorialParams={p.setFactorialParams}
          />
        );
      case 'distfit':
        return (
          <DistributionFitForm
            grid={p.grid}
            distfitParams={p.distfitParams}
            setDistfitParams={p.setDistfitParams}
          />
        );
      case 'samplesize':
        return (
          <SampleSizeForm
            samplesizeParams={p.samplesizeParams}
            setSamplesizeParams={p.setSamplesizeParams}
          />
        );
      case 'ancova':
        return (
          <AncovaForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            ancovaParams={p.ancovaParams}
            setAncovaParams={p.setAncovaParams}
          />
        );
      case 'multivariate':
        return (
          <MultivariateForm
            grid={p.grid}
            multivariateParams={p.multivariateParams}
            setMultivariateParams={p.setMultivariateParams}
          />
        );
      case 'repeatedanova':
        return (
          <RepeatedAnovaForm
            grid={p.grid}
            repeatedAnovaParams={p.repeatedAnovaParams}
            setRepeatedAnovaParams={p.setRepeatedAnovaParams}
          />
        );
      case 'nonparamrm':
        return (
          <NonParamForm
            grid={p.grid}
            onLevels={p.updateColumnLevels}
            onRecode={p.updateColumnRecode}
            nonParamParams={p.nonParamParams}
            setNonParamParams={p.setNonParamParams}
          />
        );
      case 'tdcox':
        return (
          <TdCoxForm
            grid={p.grid}
            tdCoxParams={p.tdCoxParams}
            setTdCoxParams={p.setTdCoxParams}
          />
        );
      case 'stratcox':
        return (
          <StratifiedCoxForm
            grid={p.grid}
            stratCoxParams={p.stratCoxParams}
            setStratCoxParams={p.setStratCoxParams}
          />
        );
      case 'gee':
        return (
          <GeeForm
            grid={p.grid}
            geeParams={p.geeParams}
            setGeeParams={p.setGeeParams}
          />
        );
      case 'resampling':
        return (
          <ResamplingForm
            grid={p.grid}
            resamplingParams={p.resamplingParams}
            setResamplingParams={p.setResamplingParams}
          />
        );
      case 'parametric':
        return (
          <ParametricForm
            grid={p.grid}
            parametricParams={p.parametricParams}
            setParametricParams={p.setParametricParams}
          />
        );
      case 'mixedanova':
        return (
          <MixedAnovaForm
            grid={p.grid}
            mixedAnovaParams={p.mixedAnovaParams}
            setMixedAnovaParams={p.setMixedAnovaParams}
          />
        );
      case 'mi':
        return (
          <MiForm grid={p.grid} miParams={p.miParams} setMiParams={p.setMiParams} />
        );
      case 'ordinal':
        return (
          <OrdinalForm
            grid={p.grid}
            ordinalParams={p.ordinalParams}
            setOrdinalParams={p.setOrdinalParams}
          />
        );
      case 'lmm':
        return (
          <LmmForm grid={p.grid} lmmParams={p.lmmParams} setLmmParams={p.setLmmParams} />
        );
      case 'countreg':
        return (
          <CountForm
            grid={p.grid}
            countParams={p.countParams}
            setCountParams={p.setCountParams}
          />
        );
      case 'agreement':
        return (
          <AgreementForm
            grid={p.grid}
            agreementParams={p.agreementParams}
            setAgreementParams={p.setAgreementParams}
          />
        );
      case 'tost':
        return (
          <TostForm
            grid={p.grid}
            tostParams={p.tostParams}
            setTostParams={p.setTostParams}
          />
        );
      case 'contingency':
        return (
          <ContingencyForm
            contingencyParams={p.contingencyParams}
            setContingencyParams={p.setContingencyParams}
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
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface">
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
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            Missing {missingCells}
          </span>
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
