const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const sites = [
  "https://pb.proxybay.ca"
];

async function fetchProxyUrls() {
    try {
      const response = await axios.get('https://emulatorclub.com/the-pirate-bay-proxy-list/');
      const html = response.data;
      const $ = cheerio.load(html);
  
      const proxyUrls = [];
  
      // Find all the li elements that start with "https://"
      const links = $('li').filter((index, element) => {
        const text = $(element).text().trim();
        return text.startsWith('https://');
      });
  
      // Iterate over each link and extract the URL
      links.each((index, element) => {
        const url = $(element).text().trim();
        proxyUrls.push(url);
      });
  
      return proxyUrls;
    } catch (error) {
      console.error('Error:', error.message);
      return [];
    }
  }

async function scrapeWebsites() {
  try {
    const browser = await puppeteer.launch();

    const additionalSites = await fetchProxyUrls();
    sites.push(...additionalSites);

    for (const site of sites) {
      try {
        const page = await browser.newPage();
        await page.goto(`${site}/search.php?q=filmora&cat=0`);
        await page.waitForSelector('#torrents');
        const html = await page.content();

        const $ = cheerio.load(html);

        const torrentsList = $('#torrents');
        const links = torrentsList.find('a[href^="magnet:?"]');

        // Iterate over each link and check if it is in a list containing the VIP image
        links.each((index, element) => {
          const parentList = $(element).parents('li');
          const vipImage = parentList.find('img[src="/static/images/vip.gif"][alt="VIP"]');
          if (vipImage.length > 0) {
            const href = $(element).attr('href');
            const descriptionLink = parentList.find('a[href^="/description.php"]');
            const descriptionText = descriptionLink.text().trim();
           // console.log('Magnet Link:', href);
          //  console.log('Description:', descriptionText);
          }
        });

        await page.close();
      } catch (error) {
        console.error(`Error: ${site} not found`);
      }
    }

    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log("END");
}

scrapeWebsites();
