import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  protocol,
  shell,
  type MenuItemConstructorOptions,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  DesktopCommand,
  DesktopFileFilter,
  DesktopOpenRequest,
  DesktopOpenResult,
  DesktopSaveManyRequest,
  DesktopSaveManyResult,
  DesktopSaveRequest,
  DesktopSaveResult,
  DesktopUpdateStatus,
} from '../src/platform/desktop';

const APP_ID = 'com.lazstats.app';
const APP_ORIGIN = 'app://lazstats';
app.setName('LazStats');
const isDev = process.argv.includes('--dev');
const devUrl = process.env.LAZSTATS_DEV_URL ?? 'http://127.0.0.1:3000';
const distRoot = path.join(__dirname, '..', 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

// A privileged, standard scheme gives Electron a stable origin for
// localStorage and IndexedDB (file:// origins are not guaranteed to persist).
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

let mainWindow: BrowserWindow | null = null;
let manualUpdateCheck = false;

const sendCommand = (command: DesktopCommand): void => {
  mainWindow?.webContents.send('lazstats:command', command);
};

const sendUpdateStatus = (status: DesktopUpdateStatus): void => {
  mainWindow?.webContents.send('lazstats:update-status', status);
};

const isDevOrigin = (value: string): boolean => {
  if (!isDev) return false;
  try {
    return new URL(value).origin === new URL(devUrl).origin;
  } catch {
    return false;
  }
};

const safeFileName = (value: unknown, fallback: string): string => {
  const name = typeof value === 'string' ? path.basename(value.trim()) : '';
  return name && name !== '.' && name !== '..' ? name : fallback;
};

const cleanFilters = (value: unknown): DesktopFileFilter[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const filters = value
    .filter(
      (entry): entry is DesktopFileFilter =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        typeof (entry as DesktopFileFilter).name === 'string' &&
        Array.isArray((entry as DesktopFileFilter).extensions)
    )
    .map(entry => ({
      name: entry.name,
      extensions: entry.extensions.filter(
        extension => typeof extension === 'string' && /^[a-z0-9]+$/i.test(extension)
      ),
    }))
    .filter(entry => entry.extensions.length > 0);
  return filters.length > 0 ? filters : undefined;
};

const targetWindow = (sender: Electron.WebContents): BrowserWindow | undefined =>
  BrowserWindow.fromWebContents(sender) ?? undefined;

const serveRenderer = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    if (url.host !== 'lazstats') return new Response('Not found', { status: 404 });
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = path.normalize(path.join(distRoot, pathname));
    if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${path.sep}`)) {
      return new Response('Not found', { status: 404 });
    }
    const body = await readFile(filePath);
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    return new Response(body, { headers: { 'content-type': type } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0d0f14',
    title: 'LazStats',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    if (url.startsWith(`${APP_ORIGIN}/`)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const current = mainWindow?.webContents.getURL();
    if (url === current) return;
    if (url.startsWith(`${APP_ORIGIN}/`)) return;
    if (isDevOrigin(url)) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) void shell.openExternal(url);
  });

  if (isDev) {
    void mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadURL(`${APP_ORIGIN}/index.html`);
  }
};

const checkForUpdates = async (manual: boolean): Promise<{ ok: boolean; message?: string }> => {
  if (!app.isPackaged) {
    if (manual) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'LazStats updates',
        message: 'Updates are available only in the packaged application.',
      });
    }
    return { ok: false, message: 'not-packaged' };
  }
  manualUpdateCheck = manual;
  sendUpdateStatus({ state: 'checking' });
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendUpdateStatus({ state: 'error', message });
    if (manual) {
      await dialog.showMessageBox({
        type: 'error',
        title: 'LazStats updates',
        message: 'Could not check for updates.',
        detail: message,
      });
    }
    return { ok: false, message };
  }
};

const buildMenu = (): void => {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => sendCommand('new-project') },
        { label: 'Open Project…', accelerator: 'CmdOrCtrl+O', click: () => sendCommand('open-project') },
        { type: 'separator' },
        { label: 'Save Project', accelerator: 'CmdOrCtrl+S', click: () => sendCommand('save-project') },
        {
          label: 'Save Project As…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendCommand('save-project-as'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Settings',
      submenu: [{ label: 'Open Settings', click: () => sendCommand('open-settings') }],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'LazStats Handbook', accelerator: 'F1', click: () => sendCommand('open-help') },
        { label: 'Check for Updates…', click: () => void checkForUpdates(true) },
        {
          label: 'About LazStats',
          click: () =>
            void dialog.showMessageBox({
              type: 'info',
              title: 'About LazStats',
              message: `LazStats ${app.getVersion()}`,
              detail: `Electron ${process.versions.electron} · Chromium ${process.versions.chrome}`,
            }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

ipcMain.handle('lazstats:save-file', async (event, raw: unknown): Promise<DesktopSaveResult> => {
  const request = raw as DesktopSaveRequest;
  if (!request || typeof request.data !== 'string') throw new Error('Invalid save request');
  const window = targetWindow(event.sender);
  const suggestedName = safeFileName(request.suggestedName, 'lazstats-file');
  const options = {
    title: 'Save file',
    defaultPath: suggestedName,
    filters: cleanFilters(request.filters),
  };
  const result = window
    ? await dialog.showSaveDialog(window, options)
    : await dialog.showSaveDialog(options);
  if (result.canceled || !result.filePath) return { canceled: true };
  let filePath = result.filePath;
  const extension = cleanFilters(request.filters)?.[0]?.extensions[0];
  if (extension && !path.extname(filePath)) filePath = `${filePath}.${extension}`;
  const buffer =
    request.encoding === 'base64'
      ? Buffer.from(request.data, 'base64')
      : Buffer.from(request.data, 'utf8');
  await writeFile(filePath, buffer);
  return { canceled: false, filePath };
});

ipcMain.handle('lazstats:save-files', async (event, raw: unknown): Promise<DesktopSaveManyResult> => {
  const request = raw as DesktopSaveManyRequest;
  if (!request || !Array.isArray(request.files) || request.files.length === 0) {
    throw new Error('Invalid batch save request');
  }
  const window = targetWindow(event.sender);
  const options = {
    title: request.directoryName ? `Choose a folder for ${request.directoryName}` : 'Choose a folder',
    properties: ['openDirectory' as const, 'createDirectory' as const],
  };
  const result = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length === 0) return { canceled: true, saved: 0 };
  const directory = result.filePaths[0];
  await mkdir(directory, { recursive: true });
  let saved = 0;
  for (const file of request.files) {
    if (!file || typeof file.data !== 'string') continue;
    const name = safeFileName(file.name, `chart-${saved + 1}.png`);
    const buffer =
      file.encoding === 'base64' ? Buffer.from(file.data, 'base64') : Buffer.from(file.data, 'utf8');
    await writeFile(path.join(directory, name), buffer);
    saved += 1;
  }
  return { canceled: false, directory, saved };
});

ipcMain.handle('lazstats:open-file', async (event, raw: unknown): Promise<DesktopOpenResult> => {
  const request = (raw ?? {}) as DesktopOpenRequest;
  const window = targetWindow(event.sender);
  const options = {
    title: 'Open file',
    properties: ['openFile' as const],
    filters: cleanFilters(request.filters),
  };
  const result = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };
  const filePath = result.filePaths[0];
  const buffer = await readFile(filePath);
  return {
    canceled: false,
    filePath,
    fileName: path.basename(filePath),
    data:
      request.encoding === 'base64'
        ? buffer.toString('base64')
        : buffer.toString('utf8'),
  };
});

ipcMain.handle('lazstats:check-updates', () => checkForUpdates(true));

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', info => {
  sendUpdateStatus({ state: 'available', version: info.version });
});

autoUpdater.on('update-not-available', info => {
  sendUpdateStatus({ state: 'not-available', version: info.version });
  if (manualUpdateCheck) {
    manualUpdateCheck = false;
    void dialog.showMessageBox({
      type: 'info',
      title: 'LazStats updates',
      message: `LazStats ${app.getVersion()} is up to date.`,
    });
  }
});

autoUpdater.on('download-progress', progress => {
  sendUpdateStatus({ state: 'downloading', percent: progress.percent });
});

autoUpdater.on('update-downloaded', info => {
  sendUpdateStatus({ state: 'downloaded', version: info.version });
  manualUpdateCheck = false;
  void dialog
    .showMessageBox({
      type: 'info',
      title: 'LazStats update ready',
      message: `LazStats ${info.version} has been downloaded.`,
      detail: 'Restart now to install it, or keep working and install it when you quit.',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
    })
    .then(result => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', error => {
  const message = error instanceof Error ? error.message : String(error);
  sendUpdateStatus({ state: 'error', message });
  if (manualUpdateCheck) {
    manualUpdateCheck = false;
    void dialog.showMessageBox({
      type: 'error',
      title: 'LazStats updates',
      message: 'The update check failed.',
      detail: message,
    });
  }
});

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    app.setAppUserModelId(APP_ID);
    protocol.handle('app', serveRenderer);
    createWindow();
    buildMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    if (app.isPackaged) {
      setTimeout(() => void checkForUpdates(false), 5000);
    }
  });

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', event => event.preventDefault());
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
