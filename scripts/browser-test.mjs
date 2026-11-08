import puppeteer from 'puppeteer-core';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const outDir = process.env.SHOT_DIR || '/tmp/rocket-shots';
const base = 'http://127.0.0.1:4173/rocket-explorer-3d/';
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--hide-scrollbars',
    '--window-size=1440,1000',
  ],
});

const report = [];
function note(ok, message) {
  report.push(`${ok ? 'PASS' : 'FAIL'} ${message}`);
  if (!ok) console.error('FAIL', message);
  else console.log('PASS', message);
}

async function clickText(page, text) {
  const found = await page.evaluate((label) => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').replace(/\s+/g, '').includes(label.replace(/\s+/g, '')));
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
  if (!found) throw new Error(`button not found: ${text}`);
}

async function shot(page, name) {
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function canvasState(page) {
  return page.$eval('canvas[data-rocket-canvas]', (canvas) => ({
    renderer: canvas.dataset.renderer || '',
    model: canvas.dataset.model || '',
    yaw: canvas.dataset.yaw || '',
    pitch: canvas.dataset.pitch || '',
    zoom: canvas.dataset.zoom || '',
    faces: canvas.dataset.faces || '',
    w: canvas.width,
    h: canvas.height,
  }));
}

async function pixelHash(page) {
  const data = await page.$eval('canvas[data-rocket-canvas]', (canvas) => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return null;
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let ink = 0;
    let bright = 0;
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r + g + b > 40) ink += 1;
      if (r + g + b > 180) bright += 1;
    }
    let hash = 2166136261;
    for (let i = 0; i < pixels.length; i += 64) {
      hash ^= pixels[i];
      hash = Math.imul(hash, 16777619);
    }
    return { hash: (hash >>> 0).toString(16), ink, bright, w, h };
  });
  return data;
}

const page = await browser.newPage();
page.setDefaultTimeout(20000);
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: 'networkidle0' });
await page.waitForSelector('canvas[data-rocket-canvas]');
await page.waitForFunction(() => document.querySelector('canvas[data-rocket-canvas]')?.dataset.yaw);
await new Promise((r) => setTimeout(r, 400));

const first = await canvasState(page);
note(first.renderer === 'webgl2' || first.renderer === 'webgl', `renderer ${first.renderer} model ${first.model} faces ${first.faces} buffer ${first.w}x${first.h}`);
note(first.model === 'saturnv', `default model is saturn v (${first.model})`);
note(Number(first.faces) > 1000, `triangle count ${first.faces}`);

const pixels = await pixelHash(page);
note(!!pixels && pixels.ink > 80, `webgl pixels ink=${pixels?.ink} bright=${pixels?.bright} ${pixels?.w}x${pixels?.h}`);
const beforeHash = pixels?.hash;
const beforeYaw = first.yaw;

const resetBox = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '复位');
  const rect = btn?.getBoundingClientRect();
  return { top: rect?.top ?? -1, bottom: rect?.bottom ?? -1, height: window.innerHeight };
});
note(resetBox.top > 80 && resetBox.bottom < resetBox.height - 4, `reset control on first screen (${Math.round(resetBox.top)}-${Math.round(resetBox.bottom)} / ${resetBox.height})`);
await shot(page, 'desktop-saturn-front.png');

const box = await page.$eval('canvas[data-rocket-canvas]', (canvas) => {
  const r = canvas.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
const cx = box.x + box.width * 0.5;
const cy = box.y + box.height * 0.55;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 220, cy + 80, { steps: 15 });
await page.mouse.up();
await new Promise((r) => setTimeout(r, 250));
const dragged = await canvasState(page);
const draggedPixels = await pixelHash(page);
note(dragged.yaw !== beforeYaw, `drag changed yaw ${beforeYaw} -> ${dragged.yaw}`);
note(dragged.pitch !== first.pitch, `drag changed pitch ${first.pitch} -> ${dragged.pitch}`);
note(draggedPixels?.hash !== beforeHash, `drag changed framebuffer ${beforeHash} -> ${draggedPixels?.hash}`);
await shot(page, 'desktop-after-drag.png');

await clickText(page, '看底部喷口');
await new Promise((r) => setTimeout(r, 250));
const bottom = await canvasState(page);
const bottomPixels = await pixelHash(page);
note(Number(bottom.pitch) < -1, `bottom pitch ${bottom.pitch}`);
note(bottomPixels?.hash !== draggedPixels?.hash, 'bottom view framebuffer differs from drag');
await shot(page, 'desktop-bottom-nozzles.png');

await clickText(page, '看顶部');
await new Promise((r) => setTimeout(r, 250));
const top = await canvasState(page);
note(Number(top.pitch) > 1, `top pitch ${top.pitch}`);
await shot(page, 'desktop-top.png');

await clickText(page, '背面');
await new Promise((r) => setTimeout(r, 200));
const back = await canvasState(page);
note(Math.abs(Number(back.yaw) - (0.65 + Math.PI)) < 0.2 || Number(back.yaw) > 3, `back yaw ${back.yaw}`);

await clickText(page, '重型猎鹰');
await new Promise((r) => setTimeout(r, 400));
const heavy = await canvasState(page);
const heavyPixels = await pixelHash(page);
note(heavy.model === 'heavy', `switched to heavy (${heavy.model}) faces ${heavy.faces}`);
note(heavy.faces !== first.faces, 'heavy face count differs from saturn v');
note(heavyPixels?.hash !== beforeHash, 'heavy framebuffer differs from saturn v');
await shot(page, 'desktop-falcon-heavy.png');

await clickText(page, '线框');
await new Promise((r) => setTimeout(r, 200));
const wire = await pixelHash(page);
note(wire?.hash !== heavyPixels?.hash, 'wireframe changes the picture');
await shot(page, 'desktop-wireframe.png');

await clickText(page, '自动旋转');
await new Promise((r) => setTimeout(r, 700));
const spinning = await canvasState(page);
note(spinning.yaw !== heavy.yaw, `auto-rotate moved yaw ${heavy.yaw} -> ${spinning.yaw}`);
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 30, cy, { steps: 4 });
await page.mouse.up();
const spinButton = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('自动旋转'));
  return btn?.getAttribute('aria-pressed') || '';
});
note(spinButton === 'false', `drag stops auto-rotate (aria-pressed=${spinButton})`);

const img = await page.$eval('aside img', (el) => ({ w: el.naturalWidth, h: el.naturalHeight, alt: el.alt, src: el.currentSrc }));
note(img.w > 40 && img.h > 40, `comparison photo loaded ${img.w}x${img.h} ${img.alt}`);

const bodyText = await page.evaluate(() => document.body.innerText);
note(bodyText.includes('不是官方工程模型'), 'disclaimer visible');
note(!/grok\/canvas|cursor\.com\/canvas/i.test(bodyText), 'no private canvas link in visible text');
const html = await page.content();
note(!html.includes('grok/canvas'), 'no grok/canvas import in DOM');

await clickText(page, '完整目录');
await page.waitForSelector('#catalog-title');
note((await page.evaluate(() => document.body.innerText)).includes('394'), 'catalog mentions 394');
await page.locator('input[placeholder="中文、英文或别名"]').fill('HASTE');
await new Promise((r) => setTimeout(r, 200));
await page.evaluate(() => {
  const row = [...document.querySelectorAll('button.row')].find((b) => (b.textContent || '').includes('HASTE'));
  row?.click();
});
await new Promise((r) => setTimeout(r, 150));
const haste = await page.evaluate(() => document.body.innerText);
note(haste.includes('未确认入轨'), 'HASTE keeps the unconfirmed-orbit note');
await page.locator('input[placeholder="中文、英文或别名"]').fill('长征二号丙');
await new Promise((r) => setTimeout(r, 200));
await page.evaluate(() => document.querySelector('button.row')?.click());
await new Promise((r) => setTimeout(r, 150));
const cz = await page.evaluate(() => document.body.innerText);
note(cz.includes('记录详情 · 长征二号C'), 'filtered detail follows the visible row');
note(cz.includes('本条尚未建立三维模型'), 'unmodeled record does not claim a mesh');
await shot(page, 'desktop-catalog.png');

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await clickText(page, '三维展馆');
await new Promise((r) => setTimeout(r, 500));
const mobile = await canvasState(page);
note(mobile.renderer === 'webgl2' || mobile.renderer === 'webgl', `mobile renderer ${mobile.renderer}`);
const mobileBox = await page.$eval('canvas[data-rocket-canvas]', (canvas) => {
  const r = canvas.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
note(mobileBox.width > 280 && mobileBox.width < 420 && mobileBox.height > 180, `mobile canvas ${Math.round(mobileBox.width)}x${Math.round(mobileBox.height)}`);
await shot(page, 'mobile-saturn.png');
const tx = mobileBox.x + mobileBox.width * 0.5;
const ty = mobileBox.y + mobileBox.height * 0.45;
const yawBeforeTouch = (await canvasState(page)).yaw;
await page.touchscreen.tap(tx, ty);
await page.mouse.move(tx, ty);
await page.mouse.down();
await page.mouse.move(tx + 90, ty + 40, { steps: 8 });
await page.mouse.up();
await new Promise((r) => setTimeout(r, 200));
const yawAfterTouch = (await canvasState(page)).yaw;
note(yawAfterTouch !== yawBeforeTouch, `mobile drag yaw ${yawBeforeTouch} -> ${yawAfterTouch}`);
await clickText(page, '长征五号B');
await new Promise((r) => setTimeout(r, 350));
const cz5 = await canvasState(page);
note(cz5.model === 'cz5b', `mobile switched to cz5b (${cz5.model})`);
await shot(page, 'mobile-cz5b.png');

await browser.close();
const failed = report.filter((line) => line.startsWith('FAIL'));
console.log(report.join('\n'));
if (failed.length) {
  console.error(`${failed.length} checks failed`);
  process.exit(1);
}
console.log('browser checks ok', outDir);
