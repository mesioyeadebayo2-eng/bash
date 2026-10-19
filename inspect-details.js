const { chromium } = require('playwright');
const fs = require('fs');

async function inspectDetails() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://aurevant.framer.website/', { waitUntil: 'networkidle' });

  // Scroll down smoothly to trigger any scroll effects and measure sections
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });

  await page.waitForTimeout(1000);

  // Take screenshot with all elements triggered
  await page.screenshot({ path: 'aurevant-scrolled-full.png', fullPage: true });

  const sectionDetails = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, [data-framer-name], header, footer')).map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        name: el.getAttribute('data-framer-name'),
        id: el.id,
        className: el.className,
        width: rect.width,
        height: rect.height,
        background: style.backgroundColor,
        color: style.color,
        fontFamily: style.fontFamily
      };
    });

    // Check header
    const nav = document.querySelector('nav') || document.querySelector('header');
    
    return {
      title: document.title,
      sections: sections.filter(s => s.height > 100).slice(0, 30)
    };
  });

  fs.writeFileSync('detailed-inspection.json', JSON.stringify(sectionDetails, null, 2));
  console.log('Inspection complete! aurevant-scrolled-full.png saved.');
  await browser.close();
}

inspectDetails().catch(console.error);
