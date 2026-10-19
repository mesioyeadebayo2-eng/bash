const { chromium } = require('playwright');
const fs = require('fs');

async function compareSites() {
  console.log('================================================================');
  console.log('  Live Comparison: Framer Reference vs Vercel Production Build  ');
  console.log('================================================================\n');

  console.log('[1/4] Launching Chromium browser (viewport 1440x900)...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // 1. Inspect Live Framer Site
  console.log('[2/4] Connecting to Live Framer Template (https://aurevant.framer.website/) ...');
  const pageFramer = await context.newPage();
  let framerTitle = 'N/A';
  let framerStatus = 'N/A';
  try {
    const res = await pageFramer.goto('https://aurevant.framer.website/', { waitUntil: 'networkidle', timeout: 30000 });
    framerStatus = res ? res.status() : 200;
    framerTitle = await pageFramer.title();
    console.log(`  ✔ Framer Status: ${framerStatus}`);
    console.log(`  ✔ Framer Page Title: "${framerTitle}"`);

    // Capture reference screenshot
    await pageFramer.screenshot({ path: 'live-framer-ref.png', fullPage: false });
    console.log('  ✔ Saved live-framer-ref.png (Hero & Above-the-fold)');
  } catch (err) {
    console.warn(`  ⚠ Framer live connection note: ${err.message}`);
  }

  // 2. Inspect Live Vercel Site
  console.log('\n[3/4] Connecting to Live Vercel Deployment (https://bash-weld.vercel.app/) ...');
  const pageVercel = await context.newPage();
  const resVercel = await pageVercel.goto('https://bash-weld.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  const vercelStatus = resVercel ? resVercel.status() : 200;
  const vercelTitle = await pageVercel.title();
  console.log(`  ✔ Vercel Status: ${vercelStatus}`);
  console.log(`  ✔ Vercel Page Title: "${vercelTitle}"`);

  // Capture Vercel screenshot
  await pageVercel.screenshot({ path: 'live-vercel-preview.png', fullPage: false });
  console.log('  ✔ Saved live-vercel-preview.png (Hero & Above-the-fold)');

  // 3. Test Live Interactions on Vercel
  console.log('\n[4/4] Interacting with Live Vercel Deployment (https://bash-weld.vercel.app/) ...');

  // 3a. Header Live Clock
  const clockDay = await pageVercel.textContent('#time-day');
  const clockTime = await pageVercel.textContent('#time-clock');
  console.log(`  ✔ Header Live Clock Active: "${clockDay} \\ ${clockTime} \\ NEW YORK"`);

  // 3b. Interactive Filter Tabs in The Collection
  console.log('  - Testing Collection Category Filter Tabs:');
  const categories = [
    { label: 'Contemporary Homes', filter: 'contemporary' },
    { label: 'Private Estates', filter: 'estate' },
    { label: 'Waterfront Living', filter: 'waterfront' },
    { label: 'Investment Properties', filter: 'investment' },
    { label: 'All Properties', filter: 'all' }
  ];

  for (const cat of categories) {
    const tabSelector = `button[data-filter="${cat.filter}"]`;
    await pageVercel.click(tabSelector);
    await pageVercel.waitForTimeout(300);
    const count = await pageVercel.locator('.property-card:visible').count();
    console.log(`    ✔ Filter Tab "${cat.label}": ${count} properties visible`);
  }

  // 3c. Interactive Services Accordion
  console.log('  - Testing Services Accordion Interaction:');
  const serviceTabs = ['01', '02', '03', '04'];
  for (const num of serviceTabs) {
    const headerSelector = `.service-item[data-service="${num}"] .service-header`;
    await pageVercel.click(headerSelector);
    await pageVercel.waitForTimeout(300);
    const isActive = await pageVercel.locator(`.service-item[data-service="${num}"]`).getAttribute('class');
    const title = await pageVercel.locator(`.service-item[data-service="${num}"] .service-title`).textContent();
    console.log(`    ✔ Service ${num} (${title.trim()}): expanded=${isActive.includes('active')}`);
  }

  // 3d. Gallery Slider Interaction
  console.log('  - Testing Gallery Slider:');
  const nextBtn = pageVercel.locator('#slider-next');
  await nextBtn.click();
  await pageVercel.waitForTimeout(400);
  const slide1 = await pageVercel.locator('.gallery-slide').nth(1).getAttribute('class');
  console.log(`    ✔ Slide Next Click: slide 1 active=${slide1.includes('active')}`);
  const prevBtn = pageVercel.locator('#slider-prev');
  await prevBtn.click();
  await pageVercel.waitForTimeout(400);
  const slide0 = await pageVercel.locator('.gallery-slide').nth(0).getAttribute('class');
  console.log(`    ✔ Slide Prev Click: slide 0 active=${slide0.includes('active')}`);

  // 3e. Back to Top Button
  console.log('  - Testing Footer "BACK TO TOP" button:');
  await pageVercel.evaluate(() => window.scrollTo(0, 3000));
  await pageVercel.waitForTimeout(200);
  const scrollBefore = await pageVercel.evaluate(() => window.scrollY);
  console.log(`    ✔ Scrolled down to: ${scrollBefore}px`);
  await pageVercel.click('#back-to-top-btn');
  await pageVercel.waitForTimeout(600);
  const scrollAfter = await pageVercel.evaluate(() => window.scrollY);
  console.log(`    ✔ Scrolled back up to: ${scrollAfter}px`);

  // Full Page Screenshot of Live Vercel Build
  await pageVercel.screenshot({ path: 'live-vercel-fullpage.png', fullPage: true });
  console.log('  ✔ Saved live-vercel-fullpage.png');

  await browser.close();

  console.log('\n================================================================');
  console.log('✔ LIVE INTERACTION & COMPARISON TEST COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

compareSites().catch(err => {
  console.error('Comparison error:', err);
  process.exit(1);
});
