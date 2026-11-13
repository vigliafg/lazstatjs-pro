import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLI_VERSION } from './cli/run';
import { MCP_VERSION } from './mcp/limits';

test('runtime versions stay aligned with the package version', () => {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    version: string;
  };
  assert.equal(CLI_VERSION, packageJson.version);
  assert.equal(MCP_VERSION, packageJson.version);
});
