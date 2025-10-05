import { Route } from '@angular/router';
import { SsrDemoComponent } from './ssr-demo/ssr-demo.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: SsrDemoComponent,
    title: 'Member Client - SSR Demo',
  },
];
