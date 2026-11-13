/**
 * End-to-end packaging smoke test for the MCP server.
 *
 * Packs `dist-mcp`, checks the tarball, installs it in a temporary prefix,
 * verifies the generated `lazstats-mcp` bin and runs the full MCP smoke test
 * against the installed bundle.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
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

const runSmoke = server =>
  execFileSync(process.execPath, [join(root, 'scripts', 'smoke-mcp.mjs')], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, LAZSTATS_MCP: server, NO_COLOR: '1' },
  });

const runHelp = command =>
  execFileSync(command, ['--help'], {
    cwd: root,
    encoding: 'utf8',
    shell: isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const temp = mkdtempSync(join(tmpdir(), 'lazstats-mcp-package-smoke-'));
try {
  const packDirectory = join(temp, 'pack');
  const installPrefix = join(temp, 'install');
  mkdirSync(packDirectory, { recursive: true });

  const packed = JSON.parse(
    runNpm(['pack', './dist-mcp', '--pack-destination', packDirectory, '--json', '--silent'])
  )[0];
  const tarball = join(packDirectory, packed.filename);
  const packedFiles = packed.files.map(file => file.path).sort();
  assert.deepEqual(packedFiles, ['lazstats-mcp.mjs', 'package.json', 'worker-entry.mjs']);
  assert.equal(packed.name, 'lazstats-mcp');

  runNpm(['install', '--prefix', installPrefix, '--no-audit', '--no-fund', tarball]);
  const installedPackage = join(installPrefix, 'node_modules', 'lazstats-mcp');
  const installedMcp = join(installedPackage, 'lazstats-mcp.mjs');
  const installedBin = join(
    installPrefix,
    'node_modules',
    '.bin',
    isWindows ? 'lazstats-mcp.cmd' : 'lazstats-mcp'
  );
  runHelp(installedBin);
  console.log(`✔ installed tarball: ${runSmoke(installedMcp).trim()}`);

  assert.equal(readdirSync(packDirectory).filter(name => name.endsWith('.tgz')).length, 1);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`✔ MCP package smoke test passed (npm pack + install, version ${packageJson.version})`);
