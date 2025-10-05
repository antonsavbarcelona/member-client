# Browser-only APIs Audit

- `src/app/ssr-demo/ssr-demo.component.ts`
  - Uses `window`, `navigator` inside constructor.
  - Guard: checks `isBrowser` (via `isPlatformBrowser`) before accessing APIs; listeners registered only in browser branch.
- No other occurrences of `window`, `document`, or `localStorage` detected in `src/`.
