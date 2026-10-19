const http = require('http');
const { chromium } = require('playwright');

/**
 * Creates a lightweight local HTTP server serving a test website
 * to test real HTTP navigation, titles, and rich browser interactions.
 */
function startLocalServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Playwright Test Suite - Interactive Web Test</title>
            <style>
              body { font-family: sans-serif; margin: 40px; }
              .card { padding: 20px; border: 1px solid #ccc; border-radius: 8px; max-width: 500px; }
              .status-ok { color: green; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Playwright Test Bed</h1>
            <div class="card">
              <label for="username">Username:</label>
              <input id="username" type="text" placeholder="Enter name" />

              <div style="margin-top: 10px;">
                <label>
                  <input id="agree-checkbox" type="checkbox" /> I agree to terms
                </label>
              </div>

              <div style="margin-top: 10px;">
                <button id="counter-btn">Clicks: <span id="click-count">0</span></button>
                <button id="submit-btn">Submit Form</button>
              </div>

              <div id="output" style="margin-top: 15px; padding: 10px; background: #f0f0f0;">Awaiting submission</div>
              <div style="margin-top: 15px;">
                <a id="nav-link" href="/about">Go to About Page</a>
              </div>
            </div>

            <script>
              let count = 0;
              const counterBtn = document.getElementById('counter-btn');
              const clickCount = document.getElementById('click-count');
              const submitBtn = document.getElementById('submit-btn');
              const usernameInput = document.getElementById('username');
              const agreeCheckbox = document.getElementById('agree-checkbox');
              const output = document.getElementById('output');

              counterBtn.addEventListener('click', () => {
                count++;
                clickCount.textContent = count;
              });

              submitBtn.addEventListener('click', () => {
                if (!agreeCheckbox.checked) {
                  output.textContent = 'Error: Must agree to terms';
                  output.className = 'status-err';
                  return;
                }
                output.textContent = 'Welcome, ' + usernameInput.value + '! Clicks: ' + count;
                output.className = 'status-ok';
                output.setAttribute('data-tested', 'true');
              });
            </script>
          </body>
          </html>
        `);
      } else if (req.url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>About - Playwright Test Bed</title>
          </head>
          <body>
            <h1>About Page</h1>
            <p id="about-info">Navigation successful! You are on the About page.</p>
            <a id="back-link" href="/">Back to Home</a>
          </body>
          </html>
        `);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('  Playwright Setup & Browser Interaction Test Suite ');
  console.log('====================================================\n');

  let localServerInfo = null;
  let browser = null;
  const errors = [];

  try {
    // 1. Verify Local Server setup
    console.log('[Step 1] Starting local test server...');
    localServerInfo = await startLocalServer(0); // auto-assign free port
    console.log(`✔ Local server running at: ${localServerInfo.url}\n`);

    // 2. Launch Chromium
    console.log('[Step 2] Launching Chromium browser (headless)...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    console.log(`✔ Chromium launched successfully (Browser version: ${browser.version()})\n`);

    const context = await browser.newContext();
    const page = await context.newPage();

    // 3. Navigate to test website
    console.log(`[Step 3] Navigating to test website: ${localServerInfo.url} ...`);
    const response = await page.goto(localServerInfo.url, { waitUntil: 'domcontentloaded' });
    console.log(`✔ Navigated successfully with HTTP status: ${response.status()}`);

    // 4. Inspect Page Title
    console.log('\n[Step 4] Inspecting page title and header...');
    const pageTitle = await page.title();
    console.log(`✔ Page Title: "${pageTitle}"`);
    if (pageTitle !== 'Playwright Test Suite - Interactive Web Test') {
      throw new Error(`Unexpected page title: "${pageTitle}"`);
    }

    const headingText = await page.locator('h1').textContent();
    console.log(`✔ Header: "${headingText.trim()}"`);

    // 5. Test Browser Interactions (Typing, clicking, checking, validating DOM mutation)
    console.log('\n[Step 5] Testing browser interactions...');

    // 5a. Typing into input
    console.log('  - Typing into #username...');
    await page.fill('#username', 'PlaywrightTester');
    const enteredValue = await page.inputValue('#username');
    console.log(`    ✔ Value in input: "${enteredValue}"`);

    // 5b. Clicking button (counter)
    console.log('  - Clicking #counter-btn twice...');
    await page.click('#counter-btn');
    await page.click('#counter-btn');
    const clickCount = await page.textContent('#click-count');
    console.log(`    ✔ Counter updated to: ${clickCount}`);
    if (clickCount !== '2') {
      throw new Error(`Counter mismatch. Expected 2, got ${clickCount}`);
    }

    // 5c. Checking checkbox
    console.log('  - Checking #agree-checkbox...');
    await page.check('#agree-checkbox');
    const isChecked = await page.isChecked('#agree-checkbox');
    console.log(`    ✔ Checkbox checked: ${isChecked}`);

    // 5d. Submitting form and verifying dynamic state change
    console.log('  - Submitting form via #submit-btn...');
    await page.click('#submit-btn');
    const outputText = await page.textContent('#output');
    console.log(`    ✔ Form response output: "${outputText.trim()}"`);
    const dataTested = await page.getAttribute('#output', 'data-tested');
    console.log(`    ✔ DOM attribute data-tested: "${dataTested}"`);
    if (!outputText.includes('Welcome, PlaywrightTester! Clicks: 2')) {
      throw new Error(`Unexpected form output: "${outputText}"`);
    }

    // 5e. Navigation interaction (click link and wait for new page)
    console.log('\n[Step 6] Testing in-page link navigation to About page...');
    await Promise.all([
      page.waitForURL('**/about'),
      page.click('#nav-link')
    ]);
    const aboutTitle = await page.title();
    console.log(`✔ New Page URL: ${page.url()}`);
    console.log(`✔ New Page Title: "${aboutTitle}"`);
    if (aboutTitle !== 'About - Playwright Test Bed') {
      throw new Error(`Unexpected About page title: "${aboutTitle}"`);
    }
    const aboutInfo = await page.locator('#about-info').textContent();
    console.log(`✔ Content: "${aboutInfo.trim()}"`);

    // 6. Optional / Online website check (if internet connection is available)
    console.log('\n[Step 7] Checking external web navigation (https://example.com)...');
    try {
      const extResponse = await page.goto('https://example.com', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      const extTitle = await page.title();
      console.log(`✔ External URL: https://example.com`);
      console.log(`✔ External Status: ${extResponse ? extResponse.status() : 'OK'}`);
      console.log(`✔ External Page Title: "${extTitle}"`);

      // Locate link and test interaction
      const link = page.locator('a');
      const linkText = await link.textContent();
      console.log(`✔ Found external link: "${linkText.trim()}"`);
    } catch (netErr) {
      console.warn(`⚠ Note: External web navigation skipped or encountered network limit (${netErr.message})`);
      errors.push({ step: 'External Web Navigation', error: netErr.message });
    }

    await context.close();
    console.log('\n✔ All interactive browser steps executed successfully!');
  } catch (err) {
    console.error('\n✖ Fatal Error in Playwright Test Suite:');
    console.error(err);
    errors.push({ step: 'Fatal Execution', error: err.message });
  } finally {
    if (browser) {
      await browser.close();
      console.log('✔ Chromium browser closed.');
    }
    if (localServerInfo && localServerInfo.server) {
      localServerInfo.server.close();
      console.log('✔ Local test server closed.');
    }
  }

  console.log('\n====================================================');
  if (errors.length === 0) {
    console.log('✔ VERIFICATION SUMMARY: All tests passed with 0 errors.');
    console.log('====================================================');
    process.exit(0);
  } else if (errors.every(e => e.step === 'External Web Navigation')) {
    console.log('✔ VERIFICATION SUMMARY: Core Playwright & browser interaction passed.');
    console.log('  (External network navigation note: offline or restricted network)');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.log(`✖ VERIFICATION SUMMARY: Failed with ${errors.length} error(s).`);
    console.log('====================================================');
    process.exit(1);
  }
}

runVerification();
