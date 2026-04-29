const fs = require('fs');
const path = require('path');
const env = require('../config/env-loader');
const shiftConfig = require('../config/shift-config');
const { updateState } = require('../utils/state-manager');
const { executePunch } = require('./execute-punch');
const { launchBrowser } = require('../core/browser-factory');
const logger = require('../utils/logger');

const usersFile = path.join(__dirname, '../../data/users.json');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getCurrentHHMM() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

async function startBatch() {
    const currentHHMM = getCurrentHHMM();
    logger.info(`Batch Orchestrator triggered at ${currentHHMM}`);

    if (!fs.existsSync(usersFile)) {
        logger.fatal('users.json not found.');
        return;
    }

    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const activeUsers = users.filter(u => u.isPresent);

    const browser = await launchBrowser();

    for (const user of activeUsers) {
        const shift = shiftConfig[user.shift];
        if (!shift) continue;

        let actionType = null;
        if (currentHHMM.startsWith(shift.punchInTarget.split(':')[0])) {
            actionType = 'Punch In';
        } else if (currentHHMM.startsWith(shift.punchOutTarget.split(':')[0])) {
            actionType = 'Punch Out';
        }

        if (actionType) {
            const delayMs = Math.floor(Math.random() * (120000 - 30000) + 30000); 
            logger.info(`[${user.empCode}] Throttle active. Sleeping for ${(delayMs / 1000).toFixed(1)}s to mitigate POST rate limits.`);
            await sleep(delayMs);

            try {
                await executePunch(browser, env.COMPANY_CODE, user.empCode, user.empPassword, actionType);
                updateState(user.empCode, actionType, new Date().toISOString());
            } catch (err) {
                logger.error(`[${user.empCode}] Batch execution aborted.`);
            }
        }
    }

    await browser.close();
}

startBatch();