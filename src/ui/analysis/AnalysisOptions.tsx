import { useEffect, useMemo, useRef, useState, type ReactNode, type SetStateAction } from 'react';
import { analysisMeta, familyOf } from '../../analyses/registry';
import { rowMatches } from '../../grid/ops';
import { isMissingCell, missingCodeCount } from '../../grid/types';
import type { ProjectParams } from '../../io/project';
import type { AnalysisTabProps } from './types';
import { useAnalysisStore } from './store';
import { Field, Section } from '../../components/FormFields';
import { analysisParamsSignature } from '../../analyses/paramsSnapshot';
import { createRunGate } from './liveGate';
import { CodeExport } from './CodeExport';
import { presetsFor } from './presets';
import { RunControl } from './RunControl';
import { t } from '../../i18n';
import { AnalysisHeader } from './AnalysisHeader';
import { ChartOutputs } from './ChartOutputs';
import { AnalysisForm } from './AnalysisForm';

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

  const showCi = p.activeAnalysis !== 'descriptive' && p.activeAnalysis !== 'samplesize';

  const form = <AnalysisForm p={p} params={params} setSlice={setSlice} />;

  const hiddenGroups = p.hiddenChartGroups[p.activeAnalysis] ?? [];
  const latestRun = [...p.outputs]
    .reverse()
    .find(entry => entry.analysisId === p.activeAnalysis && (entry.session?.charts?.length ?? 0) > 0);
  const lastRunCount = latestRun?.session?.charts?.length;

  return (
    <aside
      id={p.paneId}
      tabIndex={-1}
      aria-label={t('analysis.setupAria')}
      className="flex h-full min-h-0 w-full flex-col border-r border-border bg-surface outline-none"
    >
      <div className="shrink-0 border-b border-border p-4">
        <AnalysisHeader meta={meta} family={family} activeAnalysis={p.activeAnalysis} />
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

          {showCi && (
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
          )}

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

          <ChartOutputs
            analysisId={p.activeAnalysis}
            hidden={hiddenGroups}
            lastRunCount={lastRunCount}
            onChange={next => {
              p.setHiddenChartGroups(previous => {
                const updated = { ...previous };
                if (next.length > 0) updated[p.activeAnalysis] = next;
                else delete updated[p.activeAnalysis];
                return updated;
              });
            }}
          />

          <CodeExport
            analysisId={p.activeAnalysis}
            grid={p.grid}
            params={params}
            ciLevel={p.ciLevel}
          />
        </div>
      </div>

      <RunControl
        running={p.analysisRunning}
        phase={p.analysisPhase}
        disabled={p.roleErrors.length > 0}
        rowCount={p.grid.rows.length}
        columnCount={p.grid.cols.length}
        onRun={() => void p.runAnalysis()}
        onCancel={p.cancelAnalysis}
      />
    </aside>
  );
};
