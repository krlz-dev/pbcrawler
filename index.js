const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWebsite() {
  try {
    const response = await axios.get('https://pb.proxybay.ca/search.php?q=filmora&cat=0');
    const html = response.data;
    const $ = cheerio.load(html);
    console.log(html);
    // Find the ol element with id "torrents"
    const torrentsList = $('#torrents');

    // Find all the anchor tags that start with "/description?"
    console.log(torrentsList)
    const links = torrentsList.find('a[href^="/description?"]');

    // Iterate over each link and print its href attribute
    links.each((index, element) => {
      const href = $(element).attr('href');
      console.log(href);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrapeWebsite();