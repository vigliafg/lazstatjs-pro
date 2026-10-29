import { useEffect, useMemo, useRef, useState, type ReactNode, type SetStateAction } from 'react';
import { Play } from 'lucide-react';
import { analysisDescription, analysisLabel, analysisMeta, familyLabel, familyOf } from '../../analyses/registry';
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
import { Field, Section } from '../../components/FormFields';
import { analysisParamsSignature } from '../../analyses/paramsSnapshot';
import { createRunGate } from './liveGate';
import { CodeExport } from './CodeExport';
import { presetsFor } from './presets';
import { t } from '../../i18n';
import { HelpButton } from '../../help/HelpButton';
import { topicForAnalysis } from '../../help/book';

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
  const presets = presetsFor(p.activeAnalysis);
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
  const runGate = useRef(createRunGate()).current;
  const liveRunRef = useRef(p.runAnalysisLive);
  const activeParamsSignature = analysisParamsSignature(p.activeAnalysis, params);

  // Keep the latest runner closure without restarting the debounce when only
  // an unrelated parameter slice changes.
  useEffect(() => {
    liveRunRef.current = p.runAnalysisLive;
  });

  useEffect(() => {
    setLive(false);
    runGate.invalidate();
    setLivePending(false);
  }, [p.activeAnalysis, runGate]);

  useEffect(() => {
    if (!live) {
      runGate.invalidate();
      setLivePending(false);
      return;
    }
    if (p.roleErrors.length > 0) {
      runGate.invalidate();
      setLivePending(false);
      return;
    }
    const token = runGate.next();
    setLivePending(true);
    const timer = setTimeout(() => {
      void liveRunRef.current(() => runGate.isCurrent(token)).finally(() => {
        if (runGate.isCurrent(token)) setLivePending(false);
      });
    }, 500);
    return () => {
      clearTimeout(timer);
      if (runGate.isCurrent(token)) runGate.invalidate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    live,
    activeParamsSignature,
    p.grid,
    p.ciLevel,
    p.roleErrors.length,
    p.filterSignature,
    p.activeAnalysis,
  ]);

  const rowFilter = p.activeRowFilter;
  const rowsForAnalysis = useMemo(
    () =>
      p.filterAffectsAnalysis && rowFilter
        ? p.grid.rows.filter(row => rowMatches(p.grid, row, rowFilter))
        : p.grid.rows,
    [p.filterAffectsAnalysis, rowFilter, p.grid]
  );
  const missingCells = useMemo(
    () =>
      p.grid.rows.reduce(
        (count, row) =>
          count + row.filter((cell, column) => isMissingCell(p.grid.cols[column], cell)).length,
        0
      ),
    [p.grid]
  );
  const codeCells = useMemo(() => missingCodeCount(p.grid), [p.grid]);
  const previewCols = useMemo(() => p.grid.cols.slice(0, 6), [p.grid.cols]);

  const sectionTitle = (() => {
    switch (p.activeAnalysis) {
      case 'wizard':
        return t('analysis.section.goal');
      case 'samplesize':
        return t('analysis.section.design');
      case 'contingency':
      case 'chisquare':
        return t('analysis.section.table');
      case 'distfit':
        return t('analysis.section.variable');
      case 'timeseries':
        return t('analysis.section.series');
      case 'mi':
        return t('analysis.section.missing');
      case 'multivariate':
        return t('analysis.section.extraction');
      case 'tost':
        return t('analysis.section.margin');
      case 'agreement':
        return t('analysis.section.measurements');
      case 'resampling':
        return t('analysis.section.resampling');
      default:
        return t('analysis.section.model');
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
            <p className="text-[11px] text-text2">{t('analysis.noForm')}</p>
          </div>
        );
    }
  })();

  return (
    <aside
      id={p.paneId}
      tabIndex={-1}
      aria-label={t('analysis.setupAria')}
      className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface outline-none"
    >
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent2">
            {family ? familyLabel(family) : t('analysis.familyFallback')}
          </span>
          {meta?.cost === 'heavy' && (
            <span className="rounded border border-yellow/25 bg-yellow/5 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-yellow/80">
              {t('analysis.heavyBadge')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <h2 className="text-[15px] font-semibold text-text">{meta ? analysisLabel(meta.id) : p.activeAnalysis}</h2>
          {meta && <HelpButton topicId={topicForAnalysis(meta.id)} />}
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-text3">
          {meta ? analysisDescription(meta) : t('analysis.descriptionFallback')}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            {t('analysis.rows')} {p.filterAffectsAnalysis ? `${p.visibleRowCount}/${p.grid.rows.length}` : p.grid.rows.length}
          </span>
          <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
            {t('analysis.variables')} {p.grid.cols.length}
          </span>
          <span
            className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3"
            title={codeCells > 0 ? `${codeCells} ${t('analysis.missingCodesTitle')}` : t('analysis.blankOnly')}
          >
            {t('analysis.missing')} {missingCells}
          </span>
          {codeCells > 0 && (
            <span className="rounded border border-border2 bg-surface3 px-1.5 py-0.5 font-mono text-[9px] text-text3">
              {t('analysis.codes')} {codeCells}
            </span>
          )}
          {p.filterAffectsAnalysis && (
            <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
              {t('analysis.analysisFilter')}
            </span>
          )}
        </div>
        {p.focusedColumn !== null && p.grid.cols[p.focusedColumn] && (
          <div className="mt-2 flex flex-col gap-1 rounded border border-border bg-surface3/50 px-2 py-1">
            <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-wider text-text3">
              {t('analysis.focused')}: <span className="text-text2">{p.grid.cols[p.focusedColumn]?.label?.trim() || p.grid.cols[p.focusedColumn]?.name}</span>
            </span>
            {p.roles.length > 1 ? (
              <div className="flex items-center gap-1">
                <select
                  aria-label={t('analysis.assignRole')}
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
                  title={t('analysis.assignRoleTitle')}
                >
                  {t('analysis.assign')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => p.onAssignPrimary(p.focusedColumn as number)}
                className="tb-btn px-2 py-0.5 text-[10px]"
                title={t('analysis.assignPrimaryTitle')}
              >
                {t('analysis.useInAnalysis')}
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
            {peek ? t('analysis.hideDataPeek') : t('analysis.dataPeek')}
          </button>
          {meta?.cost === 'instant' && (
            <button
              type="button"
              onClick={() => setLive(value => !value)}
              aria-pressed={live}
              aria-label={t('analysis.liveAria')}
              title={t('analysis.liveTitle')}
              className={`tb-btn px-2 py-0.5 text-[10px] ${live ? 'border-accent bg-accent/10 text-text' : ''}`}
            >
              {live ? (livePending ? t('analysis.liveSyncing') : t('analysis.liveOn')) : t('analysis.live')}
            </button>
          )}
          <button
            type="button"
            onClick={() => p.setActiveTab('data')}
            className="tb-btn px-2 py-0.5 text-[10px]"
          >
            {t('analysis.openData')}
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
                {t('analysis.peekFirst')} {Math.min(5, rowsForAnalysis.length)} {t('analysis.peekOf')} {rowsForAnalysis.length} {t('data.rowsUnit')} ·{' '}
                {p.filterAffectsAnalysis ? t('analysis.filterActive') : t('analysis.filterView')}
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
                {t('analysis.reselectTitle')}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-text2">
                {t('analysis.reselectBody')}
              </p>
              <ul className="mt-1.5 list-disc pl-4 text-[10px] text-text3">
                {p.roleErrors.slice(0, 4).map(label => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          )}

          <Section title={t('analysis.confidence')} hint={t('analysis.confidenceHint')}>
            <select
              aria-label={t('analysis.confidence')}
              className={inputClass}
              value={p.ciLevel}
              onChange={event => p.setCiLevel(parseInt(event.target.value, 10))}
            >
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>
          </Section>

          {presets.length > 0 && (
            <Field label={t('analysis.preset')}>
              <select
                aria-label={t('analysis.preset')}
                className={inputClass}
                value=""
                onChange={event => {
                  const preset = presets.find(item => item.id === event.target.value);
                  if (preset) dispatch({ type: 'replace', params: preset.apply(params) });
                }}
              >
                <option value="">—</option>
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Section
            title={sectionTitle}
            hint={p.activeAnalysis === 'wizard' ? t('analysis.guided') : undefined}
          >
            <div className="flex flex-col gap-3">{form}</div>
          </Section>

          <CodeExport
            analysisId={p.activeAnalysis}
            grid={p.grid}
            params={params}
            ciLevel={p.ciLevel}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface2/60 p-3">
        <button
          type="button"
          onClick={() => void p.runAnalysis()}
          disabled={p.roleErrors.length > 0}
          title={t('analysis.runTitle')}
          className="run-btn flex h-10 w-full items-center justify-center gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          {t('analysis.run')}
        </button>
        <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-text3">
          <span className="truncate" title={`${p.grid.rows.length} ${t('data.rowsUnit')} · ${p.grid.cols.length} ${t('analysis.variablesLower')}`}>
            {p.grid.rows.length} × {p.grid.cols.length}
          </span>
          <span className="shrink-0 text-text3/80" title={t('analysis.shortcut')}>
            {t('analysis.shortcut')}
          </span>
        </div>
      </div>
    </aside>
  );
};
