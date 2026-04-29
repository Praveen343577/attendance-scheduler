// src/utils/state-manager.js
const fs = require('fs');
const path = require('path');

const stateFile = path.join(__dirname, '../../data/state.json');

function readState() {
    if (!fs.existsSync(stateFile)) return {};
    const raw = fs.readFileSync(stateFile, 'utf8');
    return JSON.parse(raw);
}

function updateState(empCode, actionType, timestamp) {
    const state = readState();
    if (!state[empCode]) state[empCode] = {};
    
    if (actionType === 'Punch In') {
        state[empCode].lastPunchIn = timestamp;
    } else {
        state[empCode].lastPunchOut = timestamp;
    }
    
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
}

module.exports = { readState, updateState };