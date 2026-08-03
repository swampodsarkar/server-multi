const DEVICES = [
  { name: 'iPhone 14 Pro', isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'iPhone 13', isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  { name: 'iPhone 12', isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' },
  { name: 'iPhone 11', isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' },
  { name: 'iPhone X', isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1' },
  { name: 'Pixel 8 Pro', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'Pixel 7', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36' },
  { name: 'Galaxy S23 Ultra', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'Galaxy S22', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 13; SM-S906B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36' },
  { name: 'Galaxy S21', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Mobile Safari/537.36' },
  { name: 'Galaxy A54', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36' },
  { name: 'OnePlus 11', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 14; OnePlus 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'Xiaomi 13', isMobile: true, ua: 'Mozilla/5.0 (Linux; Android 14; Xiaomi 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { name: 'iPad Pro 12.9', isMobile: false, ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1' },
  { name: 'iPad Air', isMobile: false, ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1' },
  { name: 'Desktop Chrome', isMobile: false, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Desktop Firefox', isMobile: false, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
];

const LOCALES = ['en-US', 'en-GB', 'hi-IN', 'bn-BD', 'ar-EG', 'es-ES', 'pt-BR', 'ja-JP', 'ko-KR', 'de-DE'];
const TIMEZONES = ['Asia/Dhaka', 'Asia/Kolkata', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Europe/Berlin', 'Australia/Sydney'];

export function getDevicePool() {
  return DEVICES;
}

export function pickRandomDevice(exclude = []) {
  const available = DEVICES.filter((d) => !exclude.includes(d.name));
  return available[Math.floor(Math.random() * available.length)];
}

export function pickRandomLocale() {
  return LOCALES[Math.floor(Math.random() * LOCALES.length)];
}

export function pickRandomTimezone() {
  return TIMEZONES[Math.floor(Math.random() * TIMEZONES.length)];
}

export function randomViewport(isMobile) {
  const mobileViewports = [
    { width: 390, height: 844 },
    { width: 375, height: 667 },
    { width: 412, height: 823 },
    { width: 360, height: 640 },
    { width: 414, height: 896 },
  ];
  const desktopViewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ];
  const pool = isMobile ? mobileViewports : desktopViewports;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomDelay(minMs = 800, maxMs = 3500) {
  return minMs + Math.floor(Math.random() * (maxMs - minMs));
}

export function shouldPause() {
  return Math.random() < 0.15;
}

export function randomScrollAmount() {
  return Math.floor(Math.random() * 20) - 5;
}

export const STEALTH_SCRIPT = `
// Navigator stealth
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

// Chrome runtime stealth
window.chrome = { runtime: {}, loadTimes: function() { return { ttfSpeed: 100 } } };

// WebGL vendor/renderer spoof
const getParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
  if (parameter === 37445) return 'Intel Inc.';
  if (parameter === 37446) return 'Intel Iris OpenGL Engine';
  return getParameter.call(this, parameter);
};

// Canvas fingerprint noise
const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
  const noise = Math.random() * 10;
  return originalToDataURL.call(this, type, quality);
};

// AudioContext spoof
const audioContext = window.AudioContext || window.webkitAudioContext;
if (audioContext) {
  const originalCreate = audioContext.prototype.createOscillator;
  audioContext.prototype.createOscillator = function() {
    const oscillator = originalCreate.call(this);
    return oscillator;
  };
}
`;