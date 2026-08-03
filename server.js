import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { getDevicePool, pickRandomDevice, pickRandomLocale, pickRandomTimezone, randomViewport, randomDelay, shouldPause, randomScrollAmount, STEALTH_SCRIPT } from './fake-devices.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser = null;
let session = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

app.get('/api/devices', (_req, res) => res.json(getDevicePool().map((d) => ({ name: d.name, isMobile: d.isMobile }))));

app.post('/api/start', async (req, res) => {
  const { targetUrl, numTabs = 4, sessionSeconds = 60, selector = 'video' } = req.body;
  if (!targetUrl || targetUrl.startsWith('REPLACE')) {
    return res.status(400).json({ error: 'targetUrl বসান (ভিডিও পেজ লিংক)' });
  }
  if (session) return res.status(409).json({ error: 'আগের session চলছে — আগে Stop করুন' });

  const b = await getBrowser();
  const devicePool = getDevicePool();
  const usedNames = new Set();
  const created = [];

  for (let i = 0; i < numTabs; i++) {
    const t = {
      device: null,
      page: null,
      context: null,
      info: null,
      lastTime: 0,
      paused: null,
      errors: [],
      startedAt: Date.now(),
      totalWatched: 0,
      lastRecordedTime: 0,
      humanPauses: 0,
      isBotDetected: false,
      viewsCounted: 0,
      viewThresholds: [30, 60, 120, 180, 300],
      reachedThresholds: new Set(),
      isYouTube: targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be'),
    };

    try {
      const device = pickRandomDevice([...usedNames]);
      usedNames.add(device.name);
      t.device = device.name;
      t.isMobile = device.isMobile;

      const context = await browser.newContext({
        userAgent: device.ua,
        viewport: randomViewport(device.isMobile),
        locale: pickRandomLocale(),
        timezoneId: pickRandomTimezone(),
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        javaScriptEnabled: true,
        isMobile: device.isMobile,
        hasTouch: device.isMobile,
        deviceScaleFactor: device.isMobile ? Math.floor(Math.random() * 3) + 1 : 1,
      });

      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      if (t.isYouTube) {
        await sleep(randomDelay(2000, 5000));
        await page.evaluate(() => {
          document.cookie = 'CONSENT=YES; path=/; domain=.youtube.com';
        });
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
      }

      await page.evaluate(STEALTH_SCRIPT);

      if (t.isYouTube) {
        await sleep(randomDelay(1000, 3000));
        await page.evaluate(() => {
          const playBtn = document.querySelector('ytd-player yt-icon-button#button') ||
                          document.querySelector('.ytp-large-play-button') ||
                          document.querySelector('.ytp-play-button');
          if (playBtn) playBtn.click();
        });
      }

      t.context = context;
      t.page = page;
      t.info = await page.evaluate(() => ({
        ua: navigator.userAgent,
        isMobile: 'ontouchstart' in window,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}`,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        webdriver: navigator.webdriver,
        plugins: navigator.plugins?.length || 0,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
      }));
    } catch (e) {
      t.errors.push(String(e));
    }
    created.push(t);
    await sleep(randomDelay(200, 600));
  }

  for (const t of created) {
    if (!t.page) continue;
    try {
      await t.page.evaluate((sel) => {
        const el = document.querySelector(sel) || document.querySelector('video');
        if (!el) return;
        el.muted = true;
        el.volume = 0;
        el.play().catch(() => {});
      }, selector);
    } catch {}
  }

  session = { targetUrl, selector, tabs: created, startedAt: Date.now(), sessionSeconds };

  (async () => {
    const deadline = Date.now() + sessionSeconds * 1000;
    let tick = 0;

    while (Date.now() < deadline) {
      tick++;

      for (const t of created) {
        if (!t.page) continue;
        try {
          if (shouldPause()) {
            await t.page.evaluate((sel) => {
              const el = document.querySelector(sel) || document.querySelector('video');
              if (el && !el.paused) el.pause();
            }, selector);
            t.humanPauses++;
            await sleep(randomDelay(1500, 4000));
            await t.page.evaluate((sel) => {
              const el = document.querySelector(sel) || document.querySelector('video');
              if (el && el.paused && !el.ended) el.play().catch(() => {});
            }, selector);
          }

          if (t.isYouTube && tick % 5 === 0) {
            await t.page.evaluate(() => {
              const thumbnails = document.querySelectorAll('ytd-thumbnail');
              if (thumbnails.length > 0) {
                const idx = Math.floor(Math.random() * thumbnails.length);
                thumbnails[idx].click();
              }
            }).catch(() => {});
            await sleep(randomDelay(3000, 8000));
          }

          const scrollAmt = randomScrollAmount();
          await t.page.evaluate((px) => window.scrollBy(0, px), scrollAmt);

          await t.page.evaluate(() => {
            const evt = new MouseEvent('mousemove', { bubbles: true, clientX: Math.random() * window.innerWidth, clientY: Math.random() * window.innerHeight });
            document.dispatchEvent(evt);
          });

          if (t.isYouTube && Math.random() < 0.1) {
            await t.page.evaluate(() => {
              const likeBtn = document.querySelector('ytd-toggle-button-renderer.like-button') ||
                              document.querySelector('.like-button');
              if (likeBtn) likeBtn.click();
            }).catch(() => {});
          }

          await sleep(randomDelay(1500, 4500));

          const st = await t.page.evaluate((sel) => {
            const el = document.querySelector(sel) || document.querySelector('video');
            if (!el) return null;
            return { t: el.currentTime, d: el.duration, paused: el.paused, ended: el.ended };
          }, selector);

          if (st) {
            if (st.ended) {
              await t.page.evaluate((sel) => {
                const el = document.querySelector(sel) || document.querySelector('video');
                if (el) { el.currentTime = 0; el.play().catch(() => {}); }
              }, selector);
            }
            t.totalWatched = st.t;
            t.lastTime = st.t;
            t.paused = st.paused;

            for (const threshold of t.viewThresholds) {
              if (st.t >= threshold && !t.reachedThresholds.has(threshold)) {
                t.reachedThresholds.add(threshold);
                t.viewsCounted++;
              }
            }
          }
        } catch (e) {
          t.errors.push(e.message);
        }
      }

      await sleep(2000);
    }
  })();

  res.json({ ok: true, tabs: created.length, sessionSeconds });
});

app.post('/api/stop', async (_req, res) => {
  if (!session) return res.json({ ok: true, message: 'কোনো active session নেই' });
  for (const t of session.tabs) {
    try { await t.context?.close(); } catch {}
  }
  const final = session;
  session = null;
  res.json({ ok: true, final });
});

app.get('/api/status', async (_req, res) => {
  if (!session) return res.json({ active: false, tabs: [], totalWatchTime: 0 });

  let total = 0;
  const tabs = session.tabs.map((t) => {
    total += t.lastTime || 0;
    return {
      device: t.device,
      isMobile: t.isMobile,
      ua: t.info?.ua?.slice(0, 100) || 'N/A',
      screen: t.info?.screen || null,
      locale: t.info?.locale || null,
      timezone: t.info?.timezone || null,
      lastTime: t.lastTime,
      paused: t.paused,
      errors: t.errors.length ? t.errors.slice(-2) : null,
      humanPauses: t.humanPauses,
      uptime: Math.round((Date.now() - t.startedAt) / 1000),
      webdriver: t.info?.webdriver ?? null,
      plugins: t.info?.plugins ?? null,
      viewsCounted: t.viewsCounted,
      isYouTube: t.isYouTube,
    };
  });

  res.json({ active: true, tabs, totalWatchTime: Math.round(total * 10) / 10, sessionSeconds: session.sessionSeconds });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Watch-Time Bot running: http://localhost:${PORT}`));