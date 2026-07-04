import https from 'https';
import http from 'http';

// Configuration: load from environment variables or use fallbacks
const SERVER_URL = process.env.SERVER_URL || 'https://internfill.onrender.com/ping' ;
const INTERVAL_MINUTES = parseInt(process.env.PING_INTERVAL_MINUTES || '10', 10);

console.log(`[Ping Cron] Starting keep-alive cron for: ${SERVER_URL}`);
console.log(`[Ping Cron] Interval: every ${INTERVAL_MINUTES} minutes`);

function ping() {
  console.log(`[Ping Cron] Pinging ${SERVER_URL} at ${new Date().toISOString()}...`);
  
  const client = SERVER_URL.startsWith('https') ? https : http;
  
  client.get(SERVER_URL, (res) => {
    console.log(`[Ping Cron] Response Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Ping Cron] Ping failed: ${err.message}`);
  });
}

// Run immediately on startup
ping();

// Set interval loop
setInterval(ping, INTERVAL_MINUTES * 60 * 1000);
