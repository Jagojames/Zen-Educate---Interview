import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = `file://${__dirname}/presentation-screens.html`;
const outDir = `${__dirname}/exported-screens`;

const screens = [
  { label: '1-the-nudge',  index: 0 },
  { label: '2-wrap-up',    index: 1 },
  { label: '3-whats-next', index: 2 },
  { label: '4-one-tap',    index: 3 },
  { label: '5-lined-up',   index: 4 },
];

import { mkdirSync } from 'fs';
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

// High-res viewport so the phones look sharp
await page.setViewport({ width: 1800, height: 900, deviceScaleFactor: 3 });
await page.goto(file, { waitUntil: 'networkidle0' });

await page.evaluate(() => {
  document.body.style.background = 'transparent';
  document.documentElement.style.background = 'transparent';
});


const cols = await page.$$('.phone-col');
if (cols.length !== 5) throw new Error(`Expected 5 phone columns, found ${cols.length}`);

for (const { label, index } of screens) {
  const col = cols[index];
  // Get just the .device element inside this col for a tighter crop
  const device = await col.$('.device');
  const box = await device.boundingBox();

  const clip = {
    x: Math.max(0, box.x),
    y: Math.max(0, box.y),
    width: box.width,
    height: box.height,
  };

  const outPath = `${outDir}/zen-screen-${label}.png`;
  await page.screenshot({
    path: outPath,
    clip,
    omitBackground: true,
  });
  console.log(`✓ ${outPath}`);
}

await browser.close();
console.log('\nAll 5 screens exported to exported-screens/');
