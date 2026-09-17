import puppeteer from 'puppeteer-core';
import http from 'http';

const port = 9222;
const serverUrl = 'http://localhost:5173';

async function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 500));
    try {
      await new Promise((resolve, reject) => {
        http.get(url, (res) => resolve(res)).on('error', reject);
      });
      return;
    } catch {}
  }
  throw new Error('Server did not start');
}

(async () => {
  await waitForServer(serverUrl);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${port}`,
    ],
  });

  const page = await browser.newPage();

  const errors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text, location: msg.location() });
    }
  });

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  await page.evaluate(() => {
    window.__capturedErrors = [];
    window.onerror = (message, url, line, column, error) => {
      window.__capturedErrors.push({ type: 'onerror', message, url, line, column, stack: error?.stack });
    };
    window.addEventListener('unhandledrejection', (event) => {
      window.__capturedErrors.push({ type: 'unhandledrejection', reason: event.reason?.message || String(event.reason) });
    });
  });

  await new Promise(r => setTimeout(r, 5000));

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => 'N/A');
  console.log('Body text:', JSON.stringify(bodyText.substring(0, 500)));

  const hasErrorOverlay = await page.evaluate(() => {
    const errorOverlay = document.querySelector('iframe[src*="react-error-overlay"]');
    const errorDiv = document.querySelector('[data-reactroot] > div');
    const rootChildren = document.querySelector('#root')?.children.length || 0;
    return {
      errorOverlay: !!errorOverlay,
      errorDiv: !!errorDiv,
      rootChildren,
      rootHTML: document.querySelector('#root')?.innerHTML?.substring(0, 500) || ''
    };
  });

  console.log('DOM check:', JSON.stringify(hasErrorOverlay, null, 2));

  const captured = await page.evaluate(() => window.__capturedErrors || []);
  const allErrors = [...errors, ...captured];
  if (allErrors.length > 0) {
    console.log('FOUND ERRORS:');
    allErrors.forEach((e, i) => console.log(`[${i}]`, JSON.stringify(e, null, 2)));
  } else {
    console.log('No errors found.');
  }

  await page.screenshot({ path: '/tmp/page.png', fullPage: true });
  console.log('Screenshot saved to /tmp/page.png');

  await browser.close();
  process.exit(0);
})().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
