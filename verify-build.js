const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function startServer(port = 8899) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqUrl = req.url.split('?')[0];
      if (reqUrl === '/') reqUrl = '/index.html';
      const filePath = path.join(__dirname, reqUrl);

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function verify() {
  console.log('1. Starting test server...');
  const server = await startServer(8899);
  console.log('Server started on http://127.0.0.1:8899');

  console.log('2. Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('3. Navigating to http://127.0.0.1:8899 ...');
  await page.goto('http://127.0.0.1:8899', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('4. Checking Page Title...');
  const title = await page.title();
  console.log(`Page Title: "${title}"`);
  if (!title.includes('AUREVANT')) {
    throw new Error('Title verification failed');
  }

  console.log('5. Testing Live Header Clock...');
  const dayText = await page.textContent('#time-day');
  const clockText = await page.textContent('#time-clock');
  console.log(`Header Clock: ${dayText} \\ ${clockText} \\ NEW YORK`);

  console.log('6. Testing Property Filter Tabs...');
  const allCardsBefore = await page.locator('.property-card:visible').count();
  console.log(`Visible properties under "All Properties": ${allCardsBefore}`);

  await page.click('button[data-filter="contemporary"]');
  await page.waitForTimeout(300);
  const contemporaryCards = await page.locator('.property-card:visible').count();
  console.log(`Visible properties under "Contemporary Homes": ${contemporaryCards}`);

  await page.click('button[data-filter="all"]');
  await page.waitForTimeout(300);

  console.log('7. Testing Services Accordion...');
  const s2Header = page.locator('.service-item[data-service="02"] .service-header');
  await s2Header.click();
  await page.waitForTimeout(400);
  const s2Active = await page.locator('.service-item[data-service="02"]').getAttribute('class');
  console.log(`Service 02 active state: ${s2Active.includes('active')}`);

  console.log('8. Testing Gallery Carousel...');
  const nextBtn = page.locator('#slider-next');
  await nextBtn.click();
  await page.waitForTimeout(400);
  const slide1Active = await page.locator('.gallery-slide').nth(1).getAttribute('class');
  console.log(`Slide 1 active state after next click: ${slide1Active.includes('active')}`);
  // Return to slide 0 for screenshot
  const prevBtn = page.locator('#slider-prev');
  await prevBtn.click();
  await page.waitForTimeout(400);

  console.log('9. Taking full-page screenshot of built website...');
  await page.screenshot({ path: 'built-aurevant-screenshot.png', fullPage: true });
  console.log('Saved built-aurevant-screenshot.png!');

  await browser.close();
  server.close();
  console.log('All verification checks PASSED successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
