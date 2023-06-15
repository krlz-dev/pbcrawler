const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const sites = [
    "https://pb.proxybay.cas"
];

async function fetchProxyUrls() {
    const fetch = await import('node-fetch');
    const response = await fetch.default('https://emulatorclub.com/the-pirate-bay-proxy-list/');
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

async function scrapeWebsite(site, searchValue) {
    const results = [];
    try {
        let success = false;
        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();

        const endpoints = [
            `${site}/search.php?q=${searchValue}&cat=0`,
            `${site}/s/?q=${searchValue}&cat=0`
        ];

        for (const endpoint of endpoints) {
            await page.goto(endpoint, {timeout: 3000}); // Set timeout to 3 seconds
            const html = await page.content();

            const $ = cheerio.load(html);
            const links = $('a[href^="magnet:?"]');

            if (links.length > 0) {
                success = true;
                links.each((index, element) => {
                    const parentList = $(element).parents('li');
                    const vipImage = parentList.find('img[src="/static/images/vip.gif"][alt="VIP"]');

                    if (vipImage.length > 0) {
                        const href = $(element).attr('href');
                        const descriptionLink = parentList.find('a[href^="/description.php"]');
                        const descriptionText = descriptionLink.text().trim();

                        results.push({magnet: href, description: descriptionText});
                    }
                });
                return results;
            }
        }

        if (!success) {
            console.log(`${site} - No results found`);
            return results;
        }

        await page.close();
        await browser.close();
    } catch (error) {
        console.error(`Error scraping ${site}:`, error.message);
        return results;
    }
}

async function scrapeWebsites(res, searchValue) {
    const fetchedSites = await fetchProxyUrls();
    const cleanedSites = fetchedSites.map((site) => site.replace(/\/$/, '')); // Remove trailing slashes
    const allSites = [...sites, ...cleanedSites];

    for (const site of allSites) {
        const someResults = await scrapeWebsite(site, searchValue);
        if (someResults.length > 0) {
            return someResults;
        }
    }
    return [];
}

async function controller(res, searchValue) {
    const results = await scrapeWebsites(res, searchValue);
    res.json(results);
}

module.exports = controller;
