const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

const USER_DATA_DIR = process.env.CHROME_USER_DATA
  ? path.resolve(process.env.CHROME_USER_DATA)
  : path.join(__dirname, '..', 'chrome-data');

function randomUA() { return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]; }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const LAUNCH_ARGS = [
  '--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled',
  '--disable-infobars', '--window-size=1920,1080', '--lang=tr-TR,tr',
  '--disable-gpu', '--disable-dev-shm-usage', '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process',
];

async function createPage() {
  const isHeadless = process.env.HEADLESS !== 'false';
  const browser = await puppeteer.launch({
    headless: isHeadless ? 'new' : false,
    userDataDir: USER_DATA_DIR,
    args: LAUNCH_ARGS,
  });
  const page = await browser.newPage();
  await page.setUserAgent(randomUA());
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8' });
  await page.setBypassCSP(true);
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en'] });
  });
  return { browser, page };
}

function closePage(browser, page) {
  try { page.close().catch(() => {}); } catch(e) {}
  try { browser.close().catch(() => {}); } catch(e) {}
}

async function trySelectors(page, selectors) {
  for (const sel of selectors) {
    const els = await page.$$(sel);
    if (els.length > 0) return sel;
  }
  return null;
}

const EMLAKJET_SELECTORS = [
  'a[href*="ilan"]', '[class*="card__"]', '[class*="listingWrapper"]',
  '.listing-card', '.listing-item', '.property-card',
  '[class*="listing-card"]', '[class*="listing-item"]', '[class*="property-card"]',
  '.card', '[class*="ilan"]', '[class*="list-item"]',
];

async function scrapeEmlakjet(city, district, onProgress) {
  const { browser, page } = await createPage();
  const results = [];

  try {
    const url = 'https://www.emlakjet.com/satilik-konut/' + encodeURIComponent(city.toLowerCase() + '-' + district.toLowerCase()) + '?page=1';
    if (onProgress) onProgress('emlakjet.com taranıyor...', 10);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await delay(1000);

    const matched = await trySelectors(page, EMLAKJET_SELECTORS);
    if (!matched) {
      const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
      console.log('emlakjet: no matching selectors, sample HTML:', html.substring(0, 300));
      return results;
    }

    const listings = await page.evaluate((cardSel) => {
      const items = [];
      const cards = document.querySelectorAll(cardSel);
      cards.forEach((card, i) => {
        if (i >= 15) return;
        const text = card.textContent.replace(/\s+/g, ' ').trim();
        const priceMatch = text.match(/([\d.]+)\s*TL/);
        const areaMatch = text.match(/([\d.]+)\s*m²/i);
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/\./g, ''));
          const area = areaMatch ? parseInt(areaMatch[1].replace(/\./g, '')) : 100;
          if (price > 100000) items.push({ price, area: area > 10 ? area : 100 });
        }
      });
      return items;
    }, matched);

    results.push(...listings);
    if (onProgress) onProgress('emlakjet.com: ' + listings.length + ' ilan', 50);
  } catch (e) {
    console.log('emlakjet error:', e.message);
  } finally {
    closePage(browser, page);
  }
  return results;
}

const HEPSIEMLAK_SELECTORS = [
  '[class*="card-link"]', '.listingView__card-link', '[class*="realty-card"]',
  '.list-view-line', '[class*="listingView"]',
  '[class*="listing-card"]', '[class*="property-card"]',
];

async function scrapeHepsiemlak(city, district, onProgress) {
  const { browser, page } = await createPage();
  const results = [];

  try {
    const url = 'https://www.hepsiemlak.com/' + encodeURIComponent(district.toLowerCase()) + '-satilik-konut';
    if (onProgress) onProgress('hepsiemlak.com taranıyor...', 55);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    try { await page.waitForFunction(() => !document.querySelector('#challenge-error-text'), { timeout: 10000 }); } catch(e) {}
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await delay(1000);

    const matched = await trySelectors(page, HEPSIEMLAK_SELECTORS);
    if (!matched) {
      const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
      console.log('hepsiemlak: no matching selectors, sample HTML:', html.substring(0, 300));
      return results;
    }

    const listings = await page.evaluate((cardSel) => {
      const items = [];
      const cards = document.querySelectorAll(cardSel);
      cards.forEach((card, i) => {
        if (i >= 15) return;
        const text = card.textContent.replace(/\s+/g, ' ').trim();
        const priceMatch = text.match(/([\d.]+)\s*TL/);
        const areaMatch = text.match(/m²\s*(\d+)/) || text.match(/(\d+)\s*m²/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/\./g, ''));
          const area = areaMatch ? parseInt(areaMatch[1]) : 100;
          if (price > 100000) items.push({ price, area: area > 10 ? area : 100 });
        }
      });
      return items;
    }, matched);

    results.push(...listings);
    if (onProgress) onProgress('hepsiemlak.com: ' + listings.length + ' ilan', 80);
  } catch (e) {
    console.log('hepsiemlak error:', e.message);
  } finally {
    closePage(browser, page);
  }
  return results;
}

const SAHIBINDEN_SELECTORS = [
  '.searchResultsItem', '.search-result-item', '.listing-item',
  '[class*="searchResultsItem"]', '[class*="ilan-card"]', '[class*="listing"]',
  '.vitrin-ilan', '.ilan-container', '[class*="ilan"]',
  '[class*="searchResult"]', '[class*="classified"]',
];

const SAHIBINDEN_PRICE_SELECTORS = []
const SAHIBINDEN_AREA_SELECTORS = []

async function scrapeSahibindenProperty(city, district, onProgress) {
  const { browser, page } = await createPage();
  const results = [];

  try {
    const searchQuery = city.toLowerCase() + ' ' + district.toLowerCase() + ' satilik konut';
    const url = 'https://www.sahibinden.com/satilik/konut?queryText=' + encodeURIComponent(searchQuery);
    if (onProgress) onProgress('sahibinden.com bağlanıyor...', 20);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000);

    // Cloudflare JS challenge bekle
    for (let i = 0; i < 30; i++) {
      const title = await page.title();
      if (!title.includes('Just a moment') && !title.includes('dakika')) break;
      await delay(2000);
    }

    // PerimeterX captcha otomatik çözüm dene
    const pxCaptcha = await page.$('#px-captcha');
    if (pxCaptcha) {
      try {
        const box = await pxCaptcha.boundingBox();
        if (box && box.width > 0) {
          for (let i = 1; i <= 5; i++) {
            await page.mouse.move(box.x + box.width * i / 6, box.y + box.height / 2, { steps: 3 });
          }
          await delay(200);
          await page.mouse.down();
          await delay(4000);
          await page.mouse.up();
          await delay(3000);
        }
      } catch(e) {}
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await delay(1000);
    await page.evaluate(() => window.scrollBy(0, 500));
    await delay(1000);

    const matched = await trySelectors(page, SAHIBINDEN_SELECTORS);
    if (!matched) {
      const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
      console.log('sahibinden: no selectors matched, HTML:', html.substring(0, 300));
      console.log('sahibinden: captcha cozulemedi. HEADLESS=false ile calistirip manuel cozun.');
      return results;
    }

    const listings = await page.evaluate((cardSel) => {
      const items = [];
      const rows = document.querySelectorAll(cardSel);
      rows.forEach((row, i) => {
        if (i >= 15) return;
        const text = row.textContent.replace(/\s+/g, ' ').trim();
        const priceMatch = text.match(/([\d.]+)\s*TL/);
        const areaMatch = text.match(/([\d.]+)\s*m²/i);
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/\./g, ''));
          const area = areaMatch ? parseInt(areaMatch[1].replace(/\./g, '')) : 100;
          if (price > 100000) items.push({ price, area: area > 10 ? area : 100 });
        }
      });
      return items;
    }, matched);

    results.push(...listings);
    if (onProgress) onProgress('sahibinden.com: ' + listings.length + ' ilan', 45);
  } catch (e) {
    console.log('sahibinden error:', e.message);
  } finally {
    closePage(browser, page);
  }
  return results;
}

const ARABAM_SELECTORS = [
  '.car-card', '.js-listing-item', '.listing-item', '.vehicle-card',
  '[class*="car-card"]', '[class*="listing"]', '[class*="vehicle-card"]',
  '.card', '.ilan-card', '[class*="ilan"]',
];

const ARABAM_PRICE_SELECTORS = [
  '.car-price', '.price', '.listing-price', '.vehicle-price',
  '[class*="price"]', '[class*="fiyat"]', '[class*="tl"]',
];

async function scrapeArabam(brand, model, year, onProgress) {
  const { browser, page } = await createPage();
  const results = [];

  try {
    const b = brand.toLowerCase().replace(/\s+/g, '-');
    const m = model.toLowerCase().replace(/\s+/g, '-');
    const url = 'https://www.arabam.com/ikinci-el/otomobil/' + encodeURIComponent(b) + '/' + encodeURIComponent(m) + '?year=' + year;
    if (onProgress) onProgress('arabam.com taranıyor...', 10);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await delay(3000);

    // Cloudflare challenge bekle
    try { await page.waitForFunction(() => !document.querySelector('#challenge-error-text'), { timeout: 10000 }); } catch(e) {}

    // React hidrasyonu bekle
    for (let i = 0; i < 20; i++) {
      const html = await page.evaluate(() => document.body.innerText.substring(0, 500));
      if (html.includes('TL') || html.includes('ilan')) break;
      await delay(1000);
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await delay(1000);
    const matched = await trySelectors(page, ARABAM_SELECTORS);
    if (!matched) {
      const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
      console.log('arabam: no selectors matched, HTML:', html.substring(0, 300));
      return results;
    }

    const listings = await page.evaluate((cardSel, priceSel) => {
      const items = [];
      const cards = document.querySelectorAll(cardSel);
      cards.forEach((card, i) => {
        if (i >= 15) return;
        let price = 0;
        for (const sel of priceSel) {
          const el = card.querySelector(sel);
          if (el) { const t = el.textContent.replace(/[^0-9]/g, ''); price = parseInt(t); if (price > 50000) break; }
        }
        if (price > 50000) items.push({ price });
      });
      return items;
    }, matched, ARABAM_PRICE_SELECTORS);

    results.push(...listings);
    if (onProgress) onProgress('arabam.com: ' + listings.length + ' ilan', 50);
  } catch (e) {
    console.log('arabam error:', e.message);
  } finally {
    closePage(browser, page);
  }
  return results;
}

module.exports = { scrapeEmlakjet, scrapeArabam, scrapeHepsiemlak, scrapeSahibindenProperty };
