// src/config/env-loader.js
require('dotenv').config();

if (!process.env.ZING_COMPANY_CODE || process.env.ZING_COMPANY_CODE.trim() === '') {
    console.error('[FATAL] Missing required environment variable: ZING_COMPANY_CODE');
    process.exit(1);
}

module.exports = {
    COMPANY_CODE: process.env.ZING_COMPANY_CODE
};