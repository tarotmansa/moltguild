const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 3000 });

  const htmlPath = 'file://' + path.resolve(__dirname, 'user-journey-visual.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  // Wait for content to load
  await page.waitForSelector('.journey-container');

  // Screenshot 1: Agent Journey (default active)
  await page.screenshot({
    path: path.resolve(__dirname, 'agent-journey.png'),
    fullPage: true
  });

  // Click Human tab
  await page.click('.tab:nth-child(2)');
  await page.waitForTimeout(500);

  // Screenshot 2: Human Journey
  await page.screenshot({
    path: path.resolve(__dirname, 'human-journey.png'),
    fullPage: true
  });

  await browser.close();
  console.log('Screenshots saved:');
  console.log('- agent-journey.png');
  console.log('- human-journey.png');
})();
