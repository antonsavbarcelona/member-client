import { spawn } from 'node:child_process';
import process from 'node:process';
import { performance } from 'node:perf_hooks';

const port = process.env.SSR_SMOKE_PORT ?? '4210';
const host = '127.0.0.1';
const serverUrl = `http://${host}:${port}/`;
const expectedMarker = 'Angular SSR Demo';
const startTimeoutMs = 8000;
const responseTimeoutMs = 8000;

const serverEnv = {
  ...process.env,
  PORT: port,
};

const serverProcess = spawn('node', ['dist/apps/member-client/server/server.mjs'], {
  env: serverEnv,
  stdio: ['ignore', 'pipe', 'pipe'],
});

function cleanup() {
  if (!serverProcess.killed) {
    serverProcess.kill('SIGTERM');
  }
}

serverProcess.stdout.on('data', (chunk) => {
  process.stdout.write(`[ssr-server] ${chunk}`);
});

serverProcess.stderr.on('data', (chunk) => {
  process.stderr.write(`[ssr-server] ${chunk}`);
});

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(143);
});

async function waitForServer() {
  const started = performance.now();
  let lastError = null;

  while (performance.now() - started < startTimeoutMs) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(serverUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(
    `SSR server did not start within ${startTimeoutMs} ms. Last error: ${lastError?.message ?? 'unknown'}`
  );
}

try {
  await waitForServer();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), responseTimeoutMs);
  const response = await fetch(serverUrl, { signal: controller.signal });
  clearTimeout(timer);

  if (!response.ok) {
    throw new Error(`SSR smoke: non-OK status ${response.status}`);
  }

  const html = await response.text();
  if (!html.includes(expectedMarker)) {
    throw new Error(
      `SSR smoke: expected marker "${expectedMarker}" missing in response.`
    );
  }

  console.log('SSR smoke test passed.');
  cleanup();
  process.exit(0);
} catch (error) {
  console.error('SSR smoke test failed:', error);
  cleanup();
  const exitCode = serverProcess.exitCode ?? 1;
  process.exit(exitCode === 0 ? 1 : exitCode);
}
