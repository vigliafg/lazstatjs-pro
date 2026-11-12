#!/usr/bin/env node
import { closeWorkerPool } from '../engine';
import { runCli } from './run';

try {
  process.exitCode = await runCli(process.argv.slice(2));
} finally {
  closeWorkerPool();
}
