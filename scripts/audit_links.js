/**
 * RVITM LINK INTEGRITY & AUDIT SCRIPT
 * Validates all URLs, PDFs, and official links in rvitm-knowledge-base.js
 */

const https = require('https');
const http = require('http');
const KB = require('../rvitm-knowledge-base.js');

function extractAllUrls(obj, urls = new Set()) {
  if (!obj) return urls;
  if (typeof obj === 'string') {
    if (obj.startsWith('http://') || obj.startsWith('https://')) {
      urls.add(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => extractAllUrls(item, urls));
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(val => extractAllUrls(val, urls));
  }
  return urls;
}

const allUrls = Array.from(extractAllUrls(KB));
console.log(`🔍 Discovered ${allUrls.length} unique URLs in RVITM Knowledge Base.\n`);

async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', ok: false }); });
    req.end();
  });
}

async function runAudit() {
  console.log(`Checking link availability in batches...`);
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < allUrls.length; i += batchSize) {
    const chunk = allUrls.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(checkUrl));
    results.push(...chunkResults);
    process.stdout.write(`Processed ${Math.min(i + batchSize, allUrls.length)} / ${allUrls.length} links\r`);
  }

  console.log('\n\n=== AUDIT SUMMARY ===');
  let okCount = 0;
  let failCount = 0;

  results.forEach(r => {
    if (r.ok) {
      okCount++;
    } else {
      failCount++;
      console.log(`❌ [${r.status}] ${r.url}`);
    }
  });

  console.log(`\n✅ Healthy Links: ${okCount}`);
  console.log(`⚠️ Unreachable/Failed Links: ${failCount}`);
  console.log(`Total Verified: ${results.length}`);
}

runAudit();
