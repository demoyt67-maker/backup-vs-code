const puppeteer = require('puppeteer-core');
const http = require('http');

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

  const consoleMessages = [];
  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });

  page.on('pageerror', (err) => {
    consoleMessages.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  try {
    await page.goto(serverUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  await new Promise(r => setTimeout(r, 3000));

  const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
  if (errors.length > 0) {
    console.log('FOUND ERRORS:');
    errors.forEach((e, i) => console.log(`[${i}]`, JSON.stringify(e, null, 2)));
  } else {
    console.log('No console errors found. All messages:');
    consoleMessages.forEach((m, i) => console.log(`[${i}]`, m.type, m.text));
  }

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
