const logger = require('../utils/logger');
const { createContext } = require('../core/browser-factory');
const locators = require('../locators/zing-selectors');

async function executePunch(browser, companyCode, empCode, password, actionType) {
    let executionContext;
    try {
        logger.info(`[${empCode}] Initializing execution sequence for ${actionType}...`);
        const { context, page } = await createContext(browser);
        executionContext = context;

        const actionLocator = actionType === 'Punch In' ? locators.dashboard.punchInButton : locators.dashboard.punchOutButton;

        await page.goto(locators.auth.url, { waitUntil: 'domcontentloaded' });

        await page.evaluate(({ latId, longId }) => {
            document.getElementById(latId).value = '18.739500';
            document.getElementById(longId).value = '73.843417';
        }, { latId: locators.auth.hiddenLatitudeId, longId: locators.auth.hiddenLongitudeId });

        await page.locator(locators.auth.companyCodeInput).fill(companyCode);
        await page.locator(locators.auth.empCodeInput).fill(empCode);
        await page.locator(locators.auth.passwordInput).fill(password);
        await page.locator(locators.auth.loginButton).click();

        try {
            const botModal = page.locator(locators.auth.botModalOkButton);
            await botModal.waitFor({ state: 'visible', timeout: 5000 });
            await botModal.click();
            await botModal.waitFor({ state: 'hidden' });
            await page.locator(locators.auth.loginButton).click({ force: true });
        } catch (e) {}
        
        await page.waitForURL(`**${locators.dashboard.urlRoutingMatch}**`, { timeout: 30000 });

        const actionButton = page.locator(actionLocator);
        await actionButton.waitFor({ state: 'visible', timeout: 15000 });
        await actionButton.click();

        await page.locator(locators.dashboard.successToast).waitFor({ state: 'visible', timeout: 15000 });
        logger.success(`[${empCode}] Transaction verified: ${actionType} successful.`);

        await page.locator(locators.dashboard.avatarButton).click();
        const logoutOption = page.locator(locators.dashboard.logoutMenuOption);
        await logoutOption.waitFor({ state: 'visible' });
        await logoutOption.click();

        await page.waitForURL(`**${locators.auth.logoutUrlMatch}**`, { timeout: 15000 });
        return true;
    } catch (error) {
        logger.error(`[${empCode}] Execution failed: ${error.message}`);
        throw error;
    } finally {
        if (executionContext) {
            await executionContext.close();
        }
    }
}

module.exports = { executePunch };