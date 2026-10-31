import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type {
  DesktopCommand,
  DesktopUpdateStatus,
} from '../src/platform/desktop';

/**
 * Minimal, explicit surface for the renderer. Node stays disabled in the
 * window; every privileged operation goes through a named IPC handler.
 */
const bridge = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    node: process.versions.node ?? '',
  },
  saveFile: (request: unknown) => ipcRenderer.invoke('lazstats:save-file', request),
  saveFiles: (request: unknown) => ipcRenderer.invoke('lazstats:save-files', request),
  openFile: (request: unknown) => ipcRenderer.invoke('lazstats:open-file', request),
  checkForUpdates: () => ipcRenderer.invoke('lazstats:check-updates'),
  onCommand: (callback: (command: DesktopCommand) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, command: DesktopCommand) => callback(command);
    ipcRenderer.on('lazstats:command', listener);
    return () => ipcRenderer.removeListener('lazstats:command', listener);
  },
  onUpdateStatus: (callback: (status: DesktopUpdateStatus) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, status: DesktopUpdateStatus) => callback(status);
    ipcRenderer.on('lazstats:update-status', listener);
    return () => ipcRenderer.removeListener('lazstats:update-status', listener);
  },
};

contextBridge.exposeInMainWorld('lazstatsDesktop', bridge);
