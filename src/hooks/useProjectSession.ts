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
import { nonEmptyRowCount, type GridData } from '../grid/types';
import { restoredOutputs, type OutputEntry } from '../ui/OutputConsole';
import type { Toast } from './useToasts';

interface UseProjectSessionOptions {
  /** Snapshot ripristinato all'avvio (autosave), già letto una volta. */
  boot: ProjectSnapshot | null;
  grid: GridData;
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
  const autosaveWarned = useRef(false);
  // Canonical serialization of what is already stored: avoids redundant
  // writes on mount/StrictMode re-runs and keeps mounts from clobbering a
  // newer tab with identical content.
  const lastSavedProject = useRef<string | null>(boot ? serializeProject(boot) : null);

  const buildProject = (): ProjectSnapshot =>
    createProjectSnapshot({ grid, prefs, settings, params, outputs });

  useEffect(() => {
    const timer = setTimeout(() => {
      const snapshot = buildProject();
      const json = serializeProject(snapshot);
      if (json === lastSavedProject.current) return;
      if (saveAutosaveText(json)) {
        lastSavedProject.current = json;
        autosaveWarned.current = false;
        setLastAutosave(new Date().toLocaleTimeString());
      } else if (!autosaveWarned.current) {
        // Quota exceeded or oversized grid: warn once, not on every keystroke.
        autosaveWarned.current = true;
        setLastAutosave(null);
        showToast('Autosave', 'Autosave unavailable (storage full or data too large) — use Save project', 'warn');
      }
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, prefs, settings, params, outputs]);

  const bootNoticeShown = useRef(false);
  useEffect(() => {
    if (bootNoticeShown.current) return;
    bootNoticeShown.current = true;
    if (boot) {
      showToast('Session', `Restored ${nonEmptyRowCount(boot.grid.rows)} rows from the last session`, 'ok');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyProject = (project: ProjectSnapshot) => {
    restore(project);
    savePrefs(project.prefs);
    setLastAutosave(new Date().toLocaleTimeString());
    showToast(
      'Project',
      `Loaded ${nonEmptyRowCount(project.grid.rows)} rows and ${restoredOutputs(project.outputs).length} result block(s)`,
      'ok'
    );
  };

  const saveProjectFile = () => {
    downloadText(
      serializeProject(buildProject()),
      'lazstats-project.lzs',
      'application/json;charset=utf-8'
    );
    showToast('Project', 'Project saved as .lzs', 'ok');
  };

  const openProjectFile = async (file: File) => {
    try {
      if (file.size > 25_000_000) throw new Error('The project file is too large');
      const project = parseProject(await file.text());
      if (!window.confirm(`Load "${file.name}"? The current grid will be replaced and the output console cleared.`)) {
        return;
      }
      applyProject(project);
    } catch (error) {
      showToast('Project', error instanceof Error ? error.message : 'Could not read the project', 'error');
    }
  };

  return { projectInputRef, lastAutosave, saveProjectFile, openProjectFile };
};
