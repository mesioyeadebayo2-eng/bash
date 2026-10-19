const { chromium } = require('playwright');
const fs = require('fs');

async function scrape() {
  console.log('Launching browser to inspect https://aurevant.framer.website/ ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to page...');
  await page.goto('https://aurevant.framer.website/', { waitUntil: 'networkidle', timeout: 30000 });

  // Take screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'aurevant-screenshot.png', fullPage: true });

  // Extract structured details
  const data = await page.evaluate(() => {
    // Collect all image sources
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      className: img.className
    }));

    // Collect all background images
    const allElements = Array.from(document.querySelectorAll('*'));
    const bgImages = [];
    allElements.forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg.startsWith('url(') && !bg.includes('data:')) {
        bgImages.push(bg);
      }
    });

    // Extract all text and links
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(l => l.text);

    // Extract headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      tag: h.tagName,
      text: h.innerText.trim()
    }));

    // Extract text blocks
    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);

    // Extract fonts and styles
    const bodyStyles = window.getComputedStyle(document.body);
    const cssVars = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const sheet = document.styleSheets[i];
        for (let r = 0; r < sheet.cssRules.length; r++) {
          const rule = sheet.cssRules[r];
          if (rule.style) {
            for (let prop of rule.style) {
              if (prop.startsWith('--token-') || prop.startsWith('--')) {
                cssVars[prop] = rule.style.getPropertyValue(prop);
              }
            }
          }
        }
      } catch (e) {}
    }

    return {
      title: document.title,
      images,
      bgImages: Array.from(new Set(bgImages)),
      links,
      headings,
      paragraphs,
      cssVars,
      bodyText: document.body.innerText
    };
  });

  fs.writeFileSync('scraped-data.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Saved scraped-data.json and aurevant-screenshot.png successfully!');
  await browser.close();
}

scrape().catch(err => {
  console.error('Scrape error:', err);
  process.exit(1);
});
