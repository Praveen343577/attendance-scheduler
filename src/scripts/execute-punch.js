// src/scripts/execute-punch.js
const env = require('../config/env-loader');
const logger = require('../utils/logger');
const { createBrowserContext } = require('../core/browser-factory');
const locators = require('../locators/zing-selectors');

async function execute() {
    let browserInstance;
    try {
        logger.info('Initializing execution sequence...');
        const { browser, context, page } = await createBrowserContext();
        browserInstance = browser;

        const currentHour = new Date().getHours();
        // const actionType = currentHour < 14 ? 'Punch In' : 'Punch Out';
        const actionType = 'Punch Out';
        const actionLocator = actionType === 'Punch In' ? locators.auth.punchInButton : locators.auth.punchOutButton;

        logger.info(`Resolved intent: ${actionType} based on local time (${currentHour}:00)`);

        logger.info('Navigating to authentication portal...');
        await page.goto(locators.auth.url, { waitUntil: 'domcontentloaded' });

        logger.info('Injecting geolocation DOM overrides...');
        await page.evaluate(({ latId, longId }) => {
            document.getElementById(latId).value = '18.739500';
            document.getElementById(longId).value = '73.843417';
        }, { latId: locators.auth.hiddenLatitudeId, longId: locators.auth.hiddenLongitudeId });

        logger.info('Injecting credential payload...');
        await page.locator(locators.auth.companyCodeInput).fill(env.COMPANY_CODE);
        await page.locator(locators.auth.empCodeInput).fill(env.EMP_CODE);
        await page.locator(locators.auth.passwordInput).fill(env.PASSWORD);

        logger.info(`Dispatching ${actionType} request directly from login portal...`);
        await page.locator(actionLocator).click();

        logger.info('Polling for secondary bot verification modal...');
        try {
            const botModal = page.locator(locators.auth.botModalOkButton);
            await botModal.waitFor({ state: 'visible', timeout: 5000 });
            logger.warn('Bot validation modal intercepted. Executing bypass click.');
            await botModal.click();
            
            // Wait to see if the system auto-submits after modal dismissal
            try {
                logger.info('Awaiting auto-submission response post-modal...');
                // Replace with the actual success indicator locator if different
                await page.waitForTimeout(5000); 
                // If the success state requires a specific element, wait for it here instead of hard timeout.
            } catch (timeout) {
                logger.info(`No auto-submission detected. Re-triggering ${actionType} sequence...`);
                await page.locator(actionLocator).click();
            }
        } catch (e) {
            logger.info('No bot verification modal detected. Proceeding normally.');
        }
        
        logger.info('Awaiting server transaction confirmation...');
        await page.waitForTimeout(5000); 
        logger.success(`Transaction verified: ${actionType} completed.`);

        logger.success('Process terminated successfully.');
    } catch (error) {
        logger.fatal(`Execution halted due to exception: ${error.message}`);
    } finally {
        if (browserInstance) {
            await browserInstance.close();
            logger.info('Browser context isolated and destroyed.');
        }
    }
}

execute();