import { InjectionToken } from '@angular/core';
import runtimeConfig from '../../../config/ssr-runtime.json';

type HttpFallback = 'empty' | 'skeleton' | 'none';

export interface SsrHttpConfig {
  timeoutMs: number;
  retryCount: number;
  fallback: HttpFallback;
}

export interface SsrRuntimeConfig {
  http: SsrHttpConfig;
  pageResponse: {
    timeoutMs: number;
  };
}

const normalizedConfig: SsrRuntimeConfig = {
  http: {
    timeoutMs: runtimeConfig.http?.timeoutMs ?? 5000,
    retryCount: runtimeConfig.http?.retryCount ?? 0,
    fallback: (runtimeConfig.http?.fallback as HttpFallback) ?? 'empty',
  },
  pageResponse: {
    timeoutMs: runtimeConfig.pageResponse?.timeoutMs ?? 10000,
  },
};

export const SSR_RUNTIME_CONFIG = new InjectionToken<SsrRuntimeConfig>(
  'SSR_RUNTIME_CONFIG',
  {
    providedIn: 'root',
    factory: () => normalizedConfig,
  }
);
