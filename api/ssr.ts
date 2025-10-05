import { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';

let cachedHandler: ((req: IncomingMessage, res: ServerResponse) => Promise<unknown> | unknown) | null = null;

async function loadHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const serverModulePath = join(
    process.cwd(),
    'dist',
    'apps',
    'member-client',
    'server',
    'server.mjs'
  );

  const module = await import(serverModulePath);
  const handler = module.reqHandler ?? module.default;

  if (typeof handler !== 'function') {
    throw new Error('SSR handler not found in dist/apps/member-client/server/server.mjs');
  }

  cachedHandler = handler;
  return handler;
}

export default async function vercelHandler(req: IncomingMessage, res: ServerResponse) {
  const handler = await loadHandler();
  return handler(req, res);
}
