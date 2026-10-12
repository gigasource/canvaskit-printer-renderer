#!/usr/bin/env node

/**
 * Autonomous Notification Hook
 * Sends webhook notifications upon agent task completion or critical failures.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const configPath = path.join(__dirname, '..', 'notifications.json');
let config = {};
try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.error('Failed to parse notifications.json');
}

function notify(message) {
  if (!config.webhookUrl) return;
  
  const payload = JSON.stringify({ text: message });
  const url = new URL(config.webhookUrl);
  
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(options);
  req.on('error', (error) => {
    console.error('Notification failed:', error.message);
  });
  
  req.write(payload);
  req.end();
}

const message = process.argv[2];
if (message) {
  notify(message);
}
