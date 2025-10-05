#!/usr/bin/env node

/**
 * Simple script to check if SSR is working
 * Run: node check-ssr.js
 */

const http = require('http');

const PORT = process.env.PORT || 4000;
const HOST = 'localhost';

console.log('\n🔍 Checking SSR...\n');

const options = {
  hostname: HOST,
  port: PORT,
  path: '/',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Server is responding!\n');
    
    // Check if SSR is working - look for app-root and any Angular components
    const hasAppRoot = data.includes('<app-root');
    const hasNxWelcome = data.includes('<app-nx-welcome') || data.includes('nx-welcome');
    const hasRouterOutlet = data.includes('router-outlet');
    const hasAngularContent = data.includes('ng-version') || data.includes('ng-server-context');
    
    // Check if app-root is empty
    const emptyAppRoot = data.includes('<app-root></app-root>') || 
                         data.includes('<app-root ng-version');
    
    console.log('📊 SSR Check Results:\n');
    console.log(`  ❯ App root found: ${hasAppRoot ? '✅ Yes' : '❌ No'}`);
    console.log(`  ❯ Angular markers found: ${hasAngularContent ? '✅ Yes' : '❌ No'}`);
    console.log(`  ❯ Content rendered: ${(hasNxWelcome || hasRouterOutlet) ? '✅ Yes' : '❌ No'}`);
    console.log(`  ❯ Empty app-root: ${emptyAppRoot ? '❌ Yes (BAD)' : '✅ No (GOOD)'}`);
    
    if (hasAppRoot && hasAngularContent && (hasNxWelcome || hasRouterOutlet) && !emptyAppRoot) {
      console.log('\n🎉 SUCCESS! SSR is working correctly!\n');
      console.log('Your Angular app is being server-side rendered.');
      console.log('\nYou can verify by:');
      console.log(`  1. Open http://${HOST}:${PORT} in browser`);
      console.log('  2. View page source (Ctrl+U or Cmd+U)');
      console.log('  3. Look for rendered HTML inside <app-root>\n');
    } else if (emptyAppRoot) {
      console.log('\n⚠️  WARNING! App root is empty - SSR might not be working!\n');
      console.log('Make sure you:');
      console.log('  1. Built the app: npm run build');
      console.log('  2. Started SSR server: npm run serve:ssr');
      console.log(`  3. Server is running on port ${PORT}\n`);
    } else if (!hasAppRoot) {
      console.log('\n❌ ERROR! App root not found in HTML!\n');
      console.log('This might not be an Angular app or wrong URL.\n');
    } else {
      console.log('\n⚠️  PARTIAL! Some components found but might not be fully rendered\n');
    }

    // Show sample of rendered HTML
    const appRootStart = data.indexOf('<app-root');
    if (appRootStart !== -1) {
      const appRootEnd = data.indexOf('</app-root>', appRootStart);
      const sampleEnd = appRootEnd !== -1 ? appRootEnd + 11 : Math.min(appRootStart + 800, data.length);
      console.log('📄 HTML Sample from <app-root>:\n');
      console.log(data.substring(appRootStart, sampleEnd));
      if (appRootEnd === -1) console.log('...');
      console.log('\n');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR! Could not connect to server!\n');
  console.error(`Error: ${error.message}\n`);
  console.log('Make sure:');
  console.log('  1. You built the app: npm run build');
  console.log('  2. You started the SSR server: npm run serve:ssr');
  console.log(`  3. Server is running on http://${HOST}:${PORT}\n`);
  process.exit(1);
});

req.end();
