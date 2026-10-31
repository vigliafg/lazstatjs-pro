/**
 * Electron smoke test: boots the desktop shell and verifies that the renderer,
 * the preload bridge, the native menu command channel and the help book work.
 *
 * Usage:
 *   npm run test:electron
 *   LAZSTATS_ELECTRON_EXECUTABLE=release/linux-unpacked/lazstats npm run test:electron
 *
 * On a headless Linux box run it through `xvfb-run -a`.
 */
import { _electron as electron } from 'playwright';

const executablePath = process.env.LAZSTATS_ELECTRON_EXECUTABLE;
const app = await electron.launch({
  ...(executablePath ? { executablePath } : {}),
  args: executablePath ? ['--no-sandbox'] : ['.', '--no-sandbox'],
});

try {
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);

  const title = await page.title();
  const bridge = await page.evaluate(() => Boolean(window.lazstatsDesktop));
  const platform = await page.evaluate(() => window.lazstatsDesktop?.platform);
  if (title !== 'LazStats') throw new Error(`unexpected title: ${title}`);
  if (!bridge) throw new Error('preload bridge is missing');

  // The privileged app:// origin must keep storage across a reload.
  await page.evaluate(() => localStorage.setItem('lazstats-smoke', '1'));
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  const persisted = await page.evaluate(() => localStorage.getItem('lazstats-smoke'));
  if (persisted !== '1') throw new Error('localStorage did not persist across reload');
  await page.evaluate(() => localStorage.removeItem('lazstats-smoke'));

  // The native File/Help menu talks to the renderer through this channel.
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('lazstats:command', 'open-settings');
  });
  await page.getByRole('heading', { name: 'Session', exact: true }).waitFor({ timeout: 5000 });

  // The generated handbook must be reachable through the same relative URLs
  // used by the packaged `file://` renderer.
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('lazstats:command', 'open-help');
  });
  const help = page.frameLocator('iframe[title="Help handbook"]');
  await help.locator('h1').waitFor({ timeout: 5000 });
  const helpTitle = await help.locator('h1').innerText();
  if (helpTitle !== 'LazStats Handbook') {
    throw new Error(`unexpected help title: ${helpTitle}`);
  }

  console.log(`Electron smoke OK: ${title} on ${platform}`);
} finally {
  await app.close();
}
