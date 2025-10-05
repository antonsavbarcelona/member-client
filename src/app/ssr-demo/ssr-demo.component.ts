import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer, CommonModule } from '@angular/common';

@Component({
  selector: 'app-ssr-demo',
  imports: [CommonModule],
  template: `
    <div class="ssr-demo">
      <h2>SSR Demo Component</h2>
      
      <div class="info-card">
        <h3>Platform Info</h3>
        <p>
          <strong>Running on:</strong> 
          <span [class.server]="isServer" [class.browser]="isBrowser">
            {{ isServer ? 'Server 🖥️' : 'Browser 🌐' }}
          </span>
        </p>
        <p><strong>Timestamp:</strong> {{ timestamp }}</p>
      </div>

      <div class="info-card" *ngIf="isBrowser">
        <h3>Browser Only Section</h3>
        <p>This section is only visible in the browser!</p>
        <p><strong>Window width:</strong> {{ windowWidth }}px</p>
        <p><strong>User Agent:</strong> {{ userAgent }}</p>
      </div>

      <div class="info-card" *ngIf="isServer">
        <h3>Server Only Section</h3>
        <p>This section is rendered on the server!</p>
        <p>It will be replaced by browser content after hydration.</p>
      </div>

      <div class="info-card">
        <h3>How to verify SSR is working:</h3>
        <ol>
          <li>Build the app: <code>npm run build</code></li>
          <li>Start SSR server: <code>npm run serve:ssr</code></li>
          <li>Open http://localhost:4000</li>
          <li>View page source (Ctrl+U or Cmd+U)</li>
          <li>You should see fully rendered HTML!</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .ssr-demo {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    h2 {
      color: #1976d2;
      text-align: center;
      margin-bottom: 2rem;
    }

    .info-card {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-card h3 {
      margin-top: 0;
      color: #333;
    }

    .info-card p {
      margin: 0.5rem 0;
    }

    .server {
      color: #4caf50;
      font-weight: bold;
    }

    .browser {
      color: #2196f3;
      font-weight: bold;
    }

    code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    ol {
      line-height: 1.8;
    }

    ol li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class SsrDemoComponent {
  private platformId = inject(PLATFORM_ID);
  
  protected isBrowser = isPlatformBrowser(this.platformId);
  protected isServer = isPlatformServer(this.platformId);
  protected timestamp = new Date().toISOString();
  protected windowWidth = 0;
  protected userAgent = '';

  constructor() {
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
      this.userAgent = navigator.userAgent;
      
      // Listen to window resize
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth;
      });
    }
  }
}
