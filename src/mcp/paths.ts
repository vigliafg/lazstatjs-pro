import { realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { McpError } from './errors';
import { MAX_BINARY_FILE_BYTES, MAX_TEXT_FILE_BYTES } from './limits';

const TEXT_EXTENSIONS = new Set(['.csv', '.tsv', '.tab', '.txt', '.pipe', '.json', '.lzs']);

const isInside = (root: string, target: string): boolean => {
  const rel = relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

/** Confines every input path to one real root, including through symlinks. */
export class PathGuard {
  readonly root: string;

  constructor(rootInput?: string) {
    const candidate = resolve(rootInput ?? process.cwd());
    try {
      this.root = realpathSync(candidate);
    } catch {
      throw new McpError({
        code: 'E_ARGS',
        kind: 'invalid_root',
        stage: 'args',
        message: `MCP root does not exist: ${candidate}`,
      });
    }
  }

  resolve(input: string): string {
    if (typeof input !== 'string' || input.trim() === '') {
      throw new McpError({
        code: 'E_ARGS',
        kind: 'invalid_value',
        stage: 'args',
        message: 'The path must be a non-empty string',
      });
    }
    const candidate = resolve(this.root, input);
    if (!isInside(this.root, candidate)) {
      throw new McpError({
        code: 'E_DATA',
        kind: 'path_outside_root',
        stage: 'load',
        message: `Path is outside the MCP root: ${input}`,
        details: { path: input, root: this.root },
      });
    }
    let real: string;
    try {
      real = realpathSync(candidate);
    } catch {
      throw new McpError({
        code: 'E_DATA',
        kind: 'file_not_found',
        stage: 'load',
        message: `File not found: ${input}`,
        details: { path: input, root: this.root },
      });
    }
    if (!isInside(this.root, real)) {
      throw new McpError({
        code: 'E_DATA',
        kind: 'path_outside_root',
        stage: 'load',
        message: `Path resolves outside the MCP root: ${input}`,
        details: { path: input, resolved: real, root: this.root },
      });
    }
    const stat = statSync(real);
    if (!stat.isFile()) {
      throw new McpError({
        code: 'E_DATA',
        kind: 'not_a_file',
        stage: 'load',
        message: `Not a regular file: ${input}`,
        details: { path: input },
      });
    }
    const limit = TEXT_EXTENSIONS.has(real.slice(real.lastIndexOf('.')).toLowerCase())
      ? MAX_TEXT_FILE_BYTES
      : MAX_BINARY_FILE_BYTES;
    if (stat.size > limit) {
      throw new McpError({
        code: 'E_DATA',
        kind: 'file_too_large',
        stage: 'load',
        message: `File exceeds the MCP size limit: ${input}`,
        details: { path: input, bytes: stat.size, limit },
      });
    }
    return real;
  }

  display(real: string): string {
    return relative(this.root, real) || '.';
  }
}
