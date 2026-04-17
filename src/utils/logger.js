// src/utils/logger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'execution.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function writeLog(level, message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    fs.appendFileSync(logFile, formattedMessage, 'utf8');
    
    if (level === 'error' || level === 'fatal') {
        console.error(formattedMessage.trim());
    } else {
        console.log(formattedMessage.trim());
    }
}

module.exports = {
    info: (msg) => writeLog('info', msg),
    success: (msg) => writeLog('success', msg),
    warn: (msg) => writeLog('warn', msg),
    error: (msg) => writeLog('error', msg),
    fatal: (msg) => {
        writeLog('fatal', msg);
        process.exit(1);
    }
};