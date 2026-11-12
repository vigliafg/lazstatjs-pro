import { parentPort } from 'node:worker_threads';
import { runAnalysis } from '../run';
import { serializeError, type WorkerRequest, type WorkerResponse } from './protocol';

if (!parentPort) {
  throw new Error('The LazStats worker must run in a worker thread');
}

const post = (message: WorkerResponse): void => {
  parentPort?.postMessage(message);
};

parentPort.on('message', (request: WorkerRequest) => {
  try {
    post({ id: request.id, ok: true, result: runAnalysis(request.options) });
  } catch (error) {
    post({ id: request.id, ok: false, error: serializeError(error) });
  }
});
