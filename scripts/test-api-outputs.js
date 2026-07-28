const fs = require('fs');
const path = require('path');

// Read env variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const apiKey = env.SHIPROCKET_API_KEY;
console.log('Shared Secret X-Api-Key:', apiKey);

async function testEndpoints() {
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  };

  const domain = 'http://localhost:3000'; // Just test using mock server client logic directly, or fetch from running local next instance if active

  console.log('Testing collections output structure directly using internal API functions or route files...');
  
  // Since running fetch against localhost:3000 might fail if next dev isn't running, we can import/mock the request, 
  // or we can launch next dev. But let's just inspect the output format.
  // Actually, we can use the environment key and test via public API if we want, but let's test by starting local dev server
  // and sending request if possible, or just look at the route code. We already verified the route code.
  // Let's run a fetch to reenattrends.com if we want, but we don't have internet requests allowed without unsandboxed/custom or direct fetch.
  // Oh, wait! The curl tool/fetch is allowed in run_command tool!
  // Let's query the live website: reenattrends.com/api/shiprocket/collections and reenattrends.com/api/shiprocket/products?collection_id=5
  // using fetch in this script. Let's do that!
  try {
    const resCol = await fetch('https://reenattrends.com/api/shiprocket/collections', { headers });
    console.log('Collections status:', resCol.status);
    const colData = await resCol.json();
    console.log('Collections:', JSON.stringify(colData, null, 2));

    const resProd = await fetch('https://reenattrends.com/api/shiprocket/products?collection_id=5', { headers });
    console.log('Products for Collection 5 status:', resProd.status);
    const prodData = await resProd.json();
    console.log('Products:', JSON.stringify(prodData, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testEndpoints();
