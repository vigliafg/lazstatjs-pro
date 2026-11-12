import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const waitFor = async (condition: () => boolean, timeoutMs = 8_000): Promise<void> => {
  const started = Date.now();
  while (!condition()) {
    if (Date.now() - started > timeoutMs) throw new Error('Timed out waiting for MCP output');
    await new Promise(resolve => setTimeout(resolve, 25));
  }
};

test('stdout carries only JSON-RPC and the process exits on stdin EOF', async () => {
  const built = join(process.cwd(), 'dist-mcp', 'lazstats-mcp.mjs');
  const useBuilt = existsSync(built);
  const child = spawn(
    process.execPath,
    [useBuilt ? built : join(process.cwd(), 'src/mcp/main.ts'), '--root', process.cwd()],
    {
      cwd: process.cwd(),
      env: useBuilt ? process.env : { ...process.env, NODE_OPTIONS: '--import tsx' },
      stdio: ['pipe', 'pipe', 'pipe'],
    }
  );
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    stdout += chunk;
  });
  child.stderr.on('data', chunk => {
    stderr += chunk;
  });
  const exit = new Promise<number | null>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`MCP process did not exit; stderr=${stderr}`));
    }, 8_000);
    child.once('exit', code => {
      clearTimeout(timer);
      resolve(code);
    });
  });

  child.stdin.write(
    `${JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'stdio-test', version: '1.0.0' },
      },
    })}\n`
  );
  await waitFor(() => stdout.includes('"id":1'));
  child.stdin.write(
    `${JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {},
    })}\n`
  );
  child.stdin.write(
    `${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`
  );
  await waitFor(() => stdout.includes('"id":2'));
  child.stdin.end();
  const code = await exit;

  const lines = stdout.split(/\r?\n/).filter(Boolean);
  assert.ok(lines.length >= 2);
  for (const line of lines) {
    const message = JSON.parse(line) as { jsonrpc?: string; id?: number };
    assert.equal(message.jsonrpc, '2.0');
    assert.ok(message.id === 1 || message.id === 2);
  }
  assert.equal(code, 0);
});
