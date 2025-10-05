import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { SSR_RUNTIME_CONFIG } from './ssr-runtime.token';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

function applyServerGuards(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const { timeoutMs, retryCount } = inject(SSR_RUNTIME_CONFIG).http;

  let stream$ = next(req);

  if (timeoutMs > 0) {
    stream$ = stream$.pipe(timeout({ each: timeoutMs }));
  }

  if (retryCount > 0) {
    stream$ = stream$.pipe(retry({ count: retryCount, resetOnSuccess: true }));
  }

  return stream$.pipe(
    catchError((error) => {
      console.error('[SSR HTTP] request failed', {
        url: req.urlWithParams,
        method: req.method,
        error,
      });

      return of(
        new HttpResponse({
          url: req.urlWithParams,
          status: 204,
          body: null,
        })
      );
    })
  );
}

export const ssrHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  return applyServerGuards(req, next);
};
