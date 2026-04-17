// src/config/env-loader.js
require('dotenv').config();

const requiredEnvVars = [
    'ZING_COMPANY_CODE',
    'ZING_EMP_CODE',
    'ZING_PASSWORD'
];

const missingVars = requiredEnvVars.filter(key => !process.env[key] || process.env[key].trim() === '');

if (missingVars.length > 0) {
    console.error(`[FATAL] Missing or empty required environment variables: ${missingVars.join(', ')}`);
    console.error('Execution halted. Populate the .env file before restarting.');
    process.exit(1);
}

module.exports = {
    COMPANY_CODE: process.env.ZING_COMPANY_CODE,
    EMP_CODE: process.env.ZING_EMP_CODE,
    PASSWORD: process.env.ZING_PASSWORD
};