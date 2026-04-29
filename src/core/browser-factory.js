const { chromium } = require('playwright');

async function launchBrowser() {
    return await chromium.launch({
        headless: false,
        channel: 'msedge',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
}

async function createContext(browser) {
    const context = await browser.newContext({
        geolocation: { latitude: 18.7557, longitude: 73.8777 },
        permissions: ['geolocation']
    });
    const page = await context.newPage();
    return { context, page };
}

module.exports = { launchBrowser, createContext };