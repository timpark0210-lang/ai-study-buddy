const https = require('https');

const testUrls = [
  'https://good.r1.gts.sdk.c2sp.org',
  'https://good.r2.gts.sdk.c2sp.org'
];

console.log("=== Starting GTS Root CA Compatibility Verification ===");

let completed = 0;
let errors = 0;

testUrls.forEach(url => {
  https.get(url, (res) => {
    console.log(`[SUCCESS] Connected to ${url}. HTTP Status: ${res.statusCode}`);
    checkDone();
  }).on('error', (err) => {
    console.error(`[ERROR] Connection failed to ${url}. Details:`, err.message);
    errors++;
    checkDone();
  });
});

function checkDone() {
  completed++;
  if (completed === testUrls.length) {
    console.log("\n=== GTS verification completed. ===");
    if (errors === 0) {
      console.log("STATUS: PASS - Environment fully trusts Google GTS CA certificates.");
    } else {
      console.log("STATUS: FAIL - GTS Root CA certificates are not trusted by this environment.");
    }
  }
}
