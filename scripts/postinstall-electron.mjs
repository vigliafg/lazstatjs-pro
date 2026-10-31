/**
 * Electron 45 ships its binary through a separate `install.js` entry point.
 * Some npm versions no longer run package install scripts automatically, so the
 * app downloads the runtime once, quietly, during `npm install`.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const installer = join(root, 'node_modules', 'electron', 'install.js');
const marker = join(root, 'node_modules', 'electron', 'path.txt');

if (process.env.ELECTRON_SKIP_BINARY_DOWNLOAD === '1') process.exit(0);
if (!existsSync(installer) || existsSync(marker)) process.exit(0);

console.log('LazStats: downloading the Electron runtime…');
const result = spawnSync(process.execPath, [installer], { stdio: 'inherit', cwd: root });
process.exit(result.status ?? 1);
