const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const sites = [
  "https://pb.proxybay.ca"
];

async function fetchProxyUrls() {
  const response = await fetch('https://emulatorclub.com/the-pirate-bay-proxy-list/');
  const html = await response.text();
  const $ = cheerio.load(html);

  const urls = [];
  $('ul li').each((index, element) => {
    const text = $(element).text();
    if (text.startsWith('https://')) {
      urls.push(text);
    }
  });

  return urls;
}

async function scrapeWebsite(site) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const endpoints = [
      `${site}/search.php?q=filmora&cat=0`,
      `${site}/s/?q=filmora&cat=0`
    ];

    let success = false;
    for (const endpoint of endpoints) {
      await page.goto(endpoint);
      const html = await page.content();

      const $ = cheerio.load(html);
      const links = $('a[href^="magnet:?"]');

      if (links.length > 0) {
        success = true;
        links.each((index, element) => {
          const href = $(element).attr('href');
          const description = $(element).text();
          console.log('Magnet Link:', href);
          console.log('Description:', description);
        });
        break;
      }
    }

    if (!success) {
      console.log(`${site} - No results found`);
    }

    await browser.close();
  } catch (error) {
    console.error(`Error scraping ${site}:`, error.message);
  }
}

async function scrapeWebsites() {
  const fetchedSites = await fetchProxyUrls();
  const cleanedSites = fetchedSites.map((site) => site.replace(/\/$/, '')); // Remove trailing slashes

  const allSites = [...sites, ...cleanedSites];

  for (const site of allSites) {
    await scrapeWebsite(site);
  }
}

scrapeWebsites();
