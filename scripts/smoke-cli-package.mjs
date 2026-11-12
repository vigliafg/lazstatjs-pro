/**
 * End-to-end packaging smoke test.
 *
 * It packs `dist-cli`, checks that the tarball contains only the CLI, worker
 * and manifest, installs that tarball in a temporary prefix and runs the full
 * CLI smoke test. It then links the repository package into another temporary
 * global prefix and repeats the smoke test through the linked bundle.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmArgs = args => (npmExecPath ? [npmExecPath, ...args] : args);
const isWindows = process.platform === 'win32';

const runNpm = (args, options = {}) =>
  execFileSync(npmCommand, npmArgs(args), {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

const runSmoke = cli =>
  execFileSync(process.execPath, [join(root, 'scripts', 'smoke-cli.mjs')], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, LAZSTATS_CLI: cli, NO_COLOR: '1' },
  });

const runVersion = command =>
  execFileSync(command, ['--version'], {
    cwd: root,
    encoding: 'utf8',
    shell: isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const temp = mkdtempSync(join(tmpdir(), 'lazstats-package-smoke-'));
try {
  const packDirectory = join(temp, 'pack');
  const globalPrefix = join(temp, 'global');
  const installPrefix = join(temp, 'install');
  mkdirSync(packDirectory, { recursive: true });
  mkdirSync(globalPrefix, { recursive: true });

  const packed = JSON.parse(
    runNpm(['pack', './dist-cli', '--pack-destination', packDirectory, '--json', '--silent'])
  )[0];
  const tarball = join(packDirectory, packed.filename);
  const packedFiles = packed.files.map(file => file.path).sort();
  assert.deepEqual(packedFiles, ['lazstats.mjs', 'package.json', 'worker-entry.mjs']);

  runNpm(['install', '--prefix', installPrefix, '--no-audit', '--no-fund', tarball]);
  const installedPackage = join(installPrefix, 'node_modules', packageJson.name);
  const installedCli = join(installedPackage, 'lazstats.mjs');
  assert.equal(runVersion(join(installPrefix, 'node_modules', '.bin', isWindows ? 'lazstats.cmd' : 'lazstats')), packageJson.version);
  console.log(`✔ installed tarball: ${runSmoke(installedCli).trim()}`);

  runNpm(['link'], {
    env: { ...process.env, npm_config_prefix: globalPrefix, NO_COLOR: '1' },
  });
  const linkedCommand = join(
    globalPrefix,
    isWindows ? 'lazstats.cmd' : join('bin', 'lazstats')
  );
  const linkedPackage = join(
    globalPrefix,
    isWindows ? 'node_modules' : join('lib', 'node_modules'),
    packageJson.name
  );
  const linkedCli = join(linkedPackage, 'dist-cli', 'lazstats.mjs');
  assert.equal(runVersion(linkedCommand), packageJson.version);
  console.log(`✔ npm link: ${runSmoke(linkedCli).trim()}`);

  assert.equal(readdirSync(packDirectory).filter(name => name.endsWith('.tgz')).length, 1);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log('✔ CLI package smoke test passed (npm pack + npm link)');
