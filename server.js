const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const  controller = require('./controllers/scrapper');

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
    const { q } = req.query;
    await controller(res, q);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
