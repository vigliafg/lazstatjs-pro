/**
 * Smoke test for the packaged CLI.
 *
 * This deliberately runs `dist-cli/lazstats.mjs`, not the TypeScript entry:
 * it checks the shebang bundle, the sibling worker bundle and the vendored
 * renderers without tsx.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const cli = process.env.LAZSTATS_CLI
  ? resolve(root, process.env.LAZSTATS_CLI)
  : join(root, 'dist-cli', 'lazstats.mjs');
const { version: packageVersion } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const run = args =>
  execFileSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

const version = run(['--version']).trim();
assert.equal(version, packageVersion);
if (process.platform !== 'win32') {
  const direct = execFileSync(cli, ['--version'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(direct, packageVersion);
}

const catalog = JSON.parse(run(['analyses', '--json']));
assert.equal(catalog.total, 71);

const descriptive = JSON.parse(
  run([
    'run',
    '--data',
    'samples/descriptive/iris/data.csv',
    '--analysis',
    'descriptive',
    '--set',
    'descVars=Sepal.Length,Sepal.Width',
  ])
);
assert.equal(descriptive.status, 'ok');
assert.equal(descriptive.result.tables.length, 4);

const heavy = JSON.parse(
  run([
    'run',
    '--data',
    'samples/survival/lung/data.csv',
    '--analysis',
    'cox',
    '--set',
    'cox.timeVariable=Time',
    '--set',
    'cox.eventVariable=Event',
    '--set',
    'cox.covariates=Age,Sex_male',
    '--workers',
    '1',
  ])
);
assert.equal(heavy.status, 'ok');
assert.ok(heavy.result.tables.length > 0);

const directory = mkdtempSync(join(tmpdir(), 'lazstats-smoke-'));
try {
  const output = join(directory, 'report.html');
  run([
    'run',
    '--data',
    'samples/descriptive/iris/data.csv',
    '--analysis',
    'descriptive',
    '--format',
    'html',
    '--out',
    output,
  ]);
  const html = readFileSync(output, 'utf8');
  assert.match(html, /<table>/);
  assert.match(html, /<svg/);
} finally {
  rmSync(directory, { recursive: true, force: true });
}

console.log(`✔ CLI smoke test passed: ${cli}`);
