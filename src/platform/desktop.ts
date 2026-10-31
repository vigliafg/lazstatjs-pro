/**
 * Typed bridge between the renderer and the Electron main process.
 *
 * The same application still runs in a normal browser: every helper degrades to
 * the existing download/upload path when `window.lazstatsDesktop` is absent.
 */

export interface DesktopFileFilter {
  name: string;
  extensions: string[];
}

export type DesktopEncoding = 'utf8' | 'base64';

export interface DesktopSaveRequest {
  suggestedName: string;
  data: string;
  encoding?: DesktopEncoding;
  filters?: DesktopFileFilter[];
}

export interface DesktopSaveResult {
  canceled: boolean;
  filePath?: string;
}

export interface DesktopOpenRequest {
  filters?: DesktopFileFilter[];
  encoding?: DesktopEncoding;
}

export interface DesktopOpenResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  data?: string;
}

export interface DesktopFilePayload {
  name: string;
  data: string;
  encoding?: DesktopEncoding;
}

export interface DesktopSaveManyRequest {
  files: DesktopFilePayload[];
  directoryName?: string;
}

export interface DesktopSaveManyResult {
  canceled: boolean;
  directory?: string;
  saved: number;
}

export type DesktopCommand =
  | 'new-project'
  | 'open-project'
  | 'save-project'
  | 'save-project-as'
  | 'open-help'
  | 'open-settings';

export type DesktopUpdateState =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface DesktopUpdateStatus {
  state: DesktopUpdateState;
  version?: string;
  percent?: number;
  message?: string;
}

export interface DesktopBridge {
  platform: string;
  versions: { electron: string; chrome: string; node: string };
  saveFile(request: DesktopSaveRequest): Promise<DesktopSaveResult>;
  saveFiles(request: DesktopSaveManyRequest): Promise<DesktopSaveManyResult>;
  openFile(request: DesktopOpenRequest): Promise<DesktopOpenResult>;
  checkForUpdates(): Promise<{ ok: boolean; message?: string }>;
  onCommand(callback: (command: DesktopCommand) => void): () => void;
  onUpdateStatus(callback: (status: DesktopUpdateStatus) => void): () => void;
}

declare global {
  interface Window {
    lazstatsDesktop?: DesktopBridge;
  }
}

export const desktopBridge = (): DesktopBridge | undefined =>
  typeof window === 'undefined' ? undefined : window.lazstatsDesktop;

export const isDesktop = (): boolean => Boolean(desktopBridge());

/** Convert bytes to base64 without exceeding the argument limit of `btoa`. */
export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
};

export const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

export const openDesktopFile = async (
  request: DesktopOpenRequest
): Promise<DesktopOpenResult> => {
  const bridge = desktopBridge();
  if (!bridge) return { canceled: true };
  try {
    return await bridge.openFile(request);
  } catch {
    return { canceled: true };
  }
};

export const onDesktopCommand = (callback: (command: DesktopCommand) => void): (() => void) =>
  desktopBridge()?.onCommand(callback) ?? (() => {});

export const onDesktopUpdateStatus = (
  callback: (status: DesktopUpdateStatus) => void
): (() => void) => desktopBridge()?.onUpdateStatus(callback) ?? (() => {});
