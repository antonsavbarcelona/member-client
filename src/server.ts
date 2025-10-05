import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import runtimeConfig from '../config/ssr-runtime.json';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const fallbackBehaviour = runtimeConfig.http?.fallback ?? 'empty';
const pageTimeoutMs = runtimeConfig.pageResponse?.timeoutMs ?? 10000;

const fallbackIndexHtml = resolve(browserDistFolder, 'index.html');

function renderFallback(res: express.Response) {
  if (res.headersSent) {
    return;
  }

  if (fallbackBehaviour === 'empty') {
    res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send('<app-root></app-root>');
    return;
  }

  res.status(200).sendFile(fallbackIndexHtml);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise;
  }

  return new Promise<T>((resolvePromise, rejectPromise) => {
    const timer = setTimeout(() => {
      rejectPromise(new Error(`SSR render timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolvePromise(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        rejectPromise(error);
      });
  });
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  withTimeout(angularApp.handle(req), pageTimeoutMs)
    .then((response) => {
      if (!response) {
        next();
        return;
      }

      return writeResponseToNodeResponse(response, res);
    })
    .catch((error) => {
      console.error('[SSR] render failed', {
        url: req.originalUrl,
        error,
      });
      renderFallback(res);
    });
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Export app for serverless functions (Vercel, Netlify)
 */
export { app };

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
