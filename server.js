const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

app.set('view engine', 'ejs');

// Define a route that renders the "hello" view
app.get('/', (req, res) => {
    const viewModel = {
        message: 'Hello, world!',
        results: [] // Initialize results as an empty array
    };
    res.render('hello', viewModel);
});


app.get('/scrape', async (req, res) => {
    const sites = [
        "https://pb.proxybay.ca"
    ];

    async function fetchProxyUrls() {
        try {
            const proxyUrls = ["https://pb.proxybay.ca"];
            return proxyUrls;
        } catch (error) {
            console.error('Error:', error.message);
            return [];
        }
    }

    async function scrapeWebsites() {
        try {
            const browser = await puppeteer.launch({ headless: "new" });

            const additionalSites = await fetchProxyUrls();
            sites.push(...additionalSites);

            const result = [];

            for (const site of sites) {
                try {
                    const page = await browser.newPage();
                    await page.goto(`${site}/search.php?q=java&cat=0`);
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
                            result.push({ magnetLink: href, description: descriptionText });
                        }
                    });

                    await page.close();
                } catch (error) {
                    console.error(`Error: ${site} not found`);
                }
            }

            await browser.close();

            res.json(result);
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    scrapeWebsites();
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
