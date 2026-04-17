// src/core/browser-factory.js
const { chromium } = require('playwright');

async function createBrowserContext() {
    const browser = await chromium.launch({
        headless: false,
        channel: 'msedge',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.newContext({
        geolocation: { latitude: 18.7557, longitude: 73.8777 },
        permissions: ['geolocation']
    });

    const page = await context.newPage();

    return { browser, context, page };
}

module.exports = { createBrowserContext };