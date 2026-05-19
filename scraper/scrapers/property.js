const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function randomDelay(min = 2000, max = 5000) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function createBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1920,1080',
    ],
  });
}

async function scrapeSahibindenProperty(city, district) {
  const browser = await createBrowser();
  const page = await browser.newPage();
  
  await page.setUserAgent(randomUA());
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  });

  const results = [];
  
  try {
    const searchQuery = city + ' ' + district + ' satilik konut';
    const url = 'https://www.sahibinden.com/satilik/konut?queryText=' + encodeURIComponent(searchQuery);
    
    console.log('  -> Sahibinden.com: ' + searchQuery);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(3000, 5000);

    const listings = await page.evaluate(() => {
      const items = [];
      const rows = document.querySelectorAll('.searchResultsItem');
      
      rows.forEach((row, index) => {
        if (index >= 20) return;
        
        const priceEl = row.querySelector('.searchResultsPriceValue');
        const areaEl = row.querySelector('.classifiedInfoDetail .value');
        const titleEl = row.querySelector('.classifiedTitle');
        
        if (priceEl && areaEl) {
          const priceText = priceEl.textContent.trim().replace(/[.\s]/g, '');
          const price = parseInt(priceText);
          const areaText = areaEl.textContent.trim().replace(' m', '').replace('m', '');
          const area = parseInt(areaText);
          const title = titleEl ? titleEl.textContent.trim() : '';
          
          if (price && area && price > 100000) {
            items.push({ price, area, title });
          }
        }
      });
      
      return items;
    });

    results.push(...listings);
    console.log('  -> Sahibinden: ' + listings.length + ' ilan bulundu');
  } catch (e) {
    console.log('  -> Sahibinden hata: ' + e.message);
  }

  await browser.close();
  return results;
}

async function scrapeHepsiEmlak(city, district) {
  const browser = await createBrowser();
  const page = await browser.newPage();
  
  await page.setUserAgent(randomUA());

  const results = [];
  
  try {
    const url = 'https://www.hepsiemlak.com/satilik/konut-listesi?il=' + encodeURIComponent(city) + '&ilce=' + encodeURIComponent(district);
    
    console.log('  -> Hepsie');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(3000, 5000);

    const listings = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('.list-view-content .card-list-container .card');
      
      cards.forEach((card, index) => {
        if (index >= 15) return;
        
        const priceEl = card.querySelector('.price');
        const areaEl = card.querySelector('.info-area');
        
        if (priceEl) {
          const priceText = priceEl.textContent.trim().replace(/[.\sTL]/g, '');
          const price = parseInt(priceText);
          const areaText = areaEl ? areaEl.textContent.trim().replace(' m2', '').replace('m2', '') : '0';
          const area = parseInt(areaText);
          
          if (price && price > 100000) {
            items.push({ price, area: area || 100 });
          }
        }
      });
      
      return items;
    });

    results.push(...listings);
    console.log('  -> Hepsie');
  } catch (e) {
    console.log('  -> Hepsie');
  }

  await browser.close();
  return results;
}

async function scrapeArabamVehicle(brand, model, year) {
  const browser = await createBrowser();
  const page = await browser.newPage();
  
  await page.setUserAgent(randomUA());

  const results = [];
  
  try {
    const url = 'https://www.arabam.com/ikinci-el?brand=' + encodeURIComponent(brand) + '&model=' + encodeURIComponent(model) + '&yearFrom=' + (year - 1) + '&yearTo=' + (year + 1);
    
    console.log('  -> Arabam.com: ' + brand + ' ' + model);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(3000, 5000);

    const listings = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('.car-card');
      
      cards.forEach((card, index) => {
        if (index >= 20) return;
        
        const priceEl = card.querySelector('.car-price');
        const kmEl = card.querySelector('.car-km');
        const yearEl = card.querySelector('.car-year');
        
        if (priceEl) {
          const priceText = priceEl.textContent.trim().replace(/[.\sTL]/g, '');
          const price = parseInt(priceText);
          const kmText = kmEl ? kmEl.textContent.trim().replace(/[.\s]/g, '') : '0';
          const km = parseInt(kmText);
          
          if (price && price > 50000) {
            items.push({ price, km: km || 0 });
          }
        }
      });
      
      return items;
    });

    results.push(...listings);
    console.log('  -> Arabam: ' + listings.length + ' ilan bulundu');
  } catch (e) {
    console.log('  -> Arabam hata: ' + e.message);
  }

  await browser.close();
  return results;
}

async function scrapeSahibindenVehicle(brand, model, year) {
  const browser = await createBrowser();
  const page = await browser.newPage();
  
  await page.setUserAgent(randomUA());

  const results = [];
  
  try {
    const searchQuery = brand + ' ' + model + ' ' + year;
    const url = 'https://www.sahibinden.com/otomobil?queryText=' + encodeURIComponent(searchQuery);
    
    console.log('  -> Sahibinden.com: ' + searchQuery);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(3000, 5000);

    const listings = await page.evaluate(() => {
      const items = [];
      const rows = document.querySelectorAll('.searchResultsItem');
      
      rows.forEach((row, index) => {
        if (index >= 20) return;
        
        const priceEl = row.querySelector('.searchResultsPriceValue');
        const yearEl = row.querySelector('.classifiedInfoDetail .value');
        
        if (priceEl) {
          const priceText = priceEl.textContent.trim().replace(/[.\s]/g, '');
          const price = parseInt(priceText);
          
          if (price && price > 50000) {
            items.push({ price });
          }
        }
      });
      
      return items;
    });

    results.push(...listings);
    console.log('  -> Sahibinden: ' + listings.length + ' ilan bulundu');
  } catch (e) {
    console.log('  -> Sahibinden hata: ' + e.message);
  }

  await browser.close();
  return results;
}

module.exports = {
  scrapeSahibindenProperty,
  scrapeHepsiEmlak,
  scrapeArabamVehicle,
  scrapeSahibindenVehicle,
  randomDelay,
};
