import { useEffect, useRef, useState } from 'react';
import {
  createProjectSnapshot,
  parseProject,
  saveAutosaveText,
  serializeProject,
  type ProjectParams,
  type ProjectSettings,
  type ProjectSnapshot,
} from '../io/project';
import { savePrefs, type IoPreferences } from '../io/prefs';
import { downloadText } from '../io/writers';
import {
  addRecentProject,
  loadRecentProjects,
  saveRecentProjects,
} from '../io/recent';
import { nonEmptyRowCount, type GridData } from '../grid/types';
import { restoredOutputs, type OutputEntry } from '../ui/OutputConsole';
import type { Toast } from './useToasts';
import { t } from '../i18n';
import { loadBackup, saveBackup } from '../io/backup';

interface UseProjectSessionOptions {
  /** Snapshot ripristinato all'avvio (autosave), già letto una volta. */
  boot: ProjectSnapshot | null;
  grid: GridData;
  datasetId: string;
  dataRevision: number;
  prefs: IoPreferences;
  settings: ProjectSettings;
  params: ProjectParams;
  outputs: OutputEntry[];
  /** Riporta griglia, preferenze, impostazioni, parametri e console al progetto. */
  restore: (project: ProjectSnapshot) => void;
  showToast: (title: string, msg: string, type?: Toast['type']) => void;
}

/**
 * Persistenza del progetto: file `.lzs`, autosave silenzioso e ripristino.
 *
 * Lo stato resta nell'App (che ne è la fonte di verità); qui vivono solo la
 * serializzazione, il confronto con l'ultimo salvataggio e gli effetti
 * collaterali. `settings` e `params` devono avere identità stabile tra render
 * (memoizzati dall'App) per non resettare il timer di autosave.
 */
export const useProjectSession = ({
  boot,
  grid,
  datasetId,
  dataRevision,
  prefs,
  settings,
  params,
  outputs,
  restore,
  showToast,
}: UseProjectSessionOptions) => {
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [lastAutosave, setLastAutosave] = useState<string | null>(() =>
    boot ? new Date(boot.savedAt).toLocaleTimeString() : null
  );
  const [recentProjects, setRecentProjects] = useState<string[]>(() => loadRecentProjects());

  const rememberProject = (name: string) => {
    setRecentProjects(previous => {
      const next = addRecentProject(previous, name);
      saveRecentProjects(next);
      return next;
    });
  };

  const clearRecentProjects = () => {
    setRecentProjects([]);
    saveRecentProjects([]);
  };
  const autosaveWarned = useRef(false);
  // Canonical serialization of what is already stored: avoids redundant
  // writes on mount/StrictMode re-runs and keeps mounts from clobbering a
  // newer tab with identical content.
  const lastSavedProject = useRef<string | null>(boot ? serializeProject(boot) : null);

  const buildProject = (): ProjectSnapshot =>
    createProjectSnapshot({ grid, datasetId, dataRevision, prefs, settings, params, outputs });

  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = buildProject();
      const json = serializeProject(snapshot);
      if (json === lastSavedProject.current) return;
      const local = saveAutosaveText(json);
      // Keep a second copy outside the 5 MB localStorage budget. It is
      // best-effort: failure must never block the local autosave path.
      void saveBackup(json);
      if (local) {
        lastSavedProject.current = json;
        autosaveWarned.current = false;
        setLastAutosave(new Date().toLocaleTimeString());
      } else if (!autosaveWarned.current) {
        // Quota exceeded or oversized grid: warn once, not on every keystroke.
        autosaveWarned.current = true;
        setLastAutosave(null);
        showToast(t('toast.autosave'), t('autosave.unavailable'), 'warn');
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, datasetId, dataRevision, prefs, settings, params, outputs]);

  const bootNoticeShown = useRef(false);
  useEffect(() => {
    if (bootNoticeShown.current) return;
    bootNoticeShown.current = true;
    if (boot) {
      showToast(t('toast.session'), `${t('session.restored')} ${nonEmptyRowCount(boot.grid.rows)} ${t('session.rows')}`, 'ok');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProject = (project: ProjectSnapshot) => {
    restore(project);
    savePrefs(project.prefs);
    setLastAutosave(new Date().toLocaleTimeString());
    showToast(
      t('toast.project'),
      `${t('project.loaded')} ${nonEmptyRowCount(project.grid.rows)} ${t('project.rowsAnd')} ${restoredOutputs(project.outputs).length} ${t('project.resultBlocks')}`,
      'ok'
    );
  };

  const restoreBackup = async () => {
    const text = await loadBackup();
    if (!text) {
      showToast(t('toast.project'), t('settings.noBackup'), 'warn');
      return;
    }
    if (
      typeof window !== 'undefined' &&
      !window.confirm(t('settings.confirmRestore'))
    ) {
      return;
    }
    try {
      applyProject(parseProject(text));
      showToast(t('toast.project'), t('settings.backupRestored'), 'ok');
    } catch (error) {
      showToast(
        t('toast.project'),
        error instanceof Error ? error.message : t('project.readError'),
        'error'
      );
    }
  };

  const saveProjectFile = () => {
    downloadText(
      serializeProject(buildProject()),
      'lazstats-project.lzs',
      'application/json;charset=utf-8'
    );
    showToast(t('toast.project'), t('project.saved'), 'ok');
  };

  const openProjectFile = async (file: File) => {
    try {
      if (file.size > 25_000_000) throw new Error(t('project.tooLarge'));
      const project = parseProject(await file.text());
      if (!window.confirm(t('project.confirmOpen', { name: file.name }))) {
        return;
      }
      applyProject(project);
      rememberProject(file.name);
    } catch (error) {
      showToast(t('toast.project'), error instanceof Error ? error.message : t('project.readError'), 'error');
    }
  };

  return {
    projectInputRef,
    lastAutosave,
    saveProjectFile,
    openProjectFile,
    restoreBackup,
    recentProjects,
    clearRecentProjects,
  };
};
