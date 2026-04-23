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

        // Conditional routing based on system time (AM = Punch In, PM = Punch Out)
        const currentHour = new Date().getHours();
        // const actionType = currentHour < 14 ? 'Punch In' : 'Punch Out';
        const actionType = 'Punch Out';
        const actionLocator = actionType === 'Punch In' ? locators.dashboard.punchInButton : locators.dashboard.punchOutButton;

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

        logger.info('Dispatching authentication request...');
        await page.locator(locators.auth.loginButton).click();

        logger.info('Polling for secondary bot verification modal...');
        try {
            const botModal = page.locator(locators.auth.botModalOkButton);
            await botModal.waitFor({ state: 'visible', timeout: 5000 }); // Wait max 5 seconds
            logger.warn('Bot validation modal intercepted. Executing bypass click.');
            await botModal.click();
        } catch (e) {
            logger.info('No bot verification modal detected. Proceeding normally.');
        }
        
        logger.info('Awaiting dashboard routing resolution...');
        await page.waitForURL(`**${locators.dashboard.urlRoutingMatch}**`, { timeout: 30000 });

        logger.info(`Validating ${actionType} DOM state...`);
        const actionButton = page.locator(actionLocator);
        await actionButton.waitFor({ state: 'visible', timeout: 15000 });

        logger.info(`Executing ${actionType} interaction...`);
        await actionButton.click();

        logger.info('Awaiting server transaction confirmation...');
        await page.locator(locators.dashboard.successToast).waitFor({ state: 'visible', timeout: 15000 });
        logger.success(`Transaction verified: ${actionType} successful.`);

        logger.info('Initiating session teardown...');
        await page.locator(locators.dashboard.avatarButton).click();
        
        const logoutOption = page.locator(locators.dashboard.logoutMenuOption);
        await logoutOption.waitFor({ state: 'visible' });
        await logoutOption.click();

        logger.info('Awaiting session destruction routing...');
        await page.waitForURL(`**${locators.auth.logoutUrlMatch}**`, { timeout: 15000 });

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