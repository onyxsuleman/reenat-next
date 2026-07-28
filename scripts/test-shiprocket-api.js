/**
 * Test script: Check Shiprocket API Authentication and Order Creation
 */

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

// Shiprocket API Login check
async function testShiprocketAuth() {
  console.log('=== Testing Shiprocket API Connection ===');
  
  // Try logging in with user credentials if available or check API keys
  console.log('Checking env vars...');
  const apiKey = process.env.SHIPROCKET_API_KEY || 'src_reenat_prod_key_9f8d7c6b5a';
  const merchantKey = process.env.SHIPROCKET_MERCHANT_API_KEY || 'ID12gSEcGkJ5t77y';
  const merchantSecret = process.env.SHIPROCKET_MERCHANT_SECRET_KEY || 'IH1WLhuUkNaLrUBuOns4JJe53tdsGCMr';

  console.log('API Key:', apiKey);
  console.log('Merchant Key:', merchantKey);

  // Shiprocket auth payload accepts email/password or bearer token
  const email = process.env.SHIPROCKET_EMAIL || 'onyxsuleman@gmail.com';
  const password = process.env.SHIPROCKET_PASSWORD || '';

  if (email && password) {
    try {
      const res = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        console.log('✅ Shiprocket JWT Token obtained successfully!');
        return data.token;
      } else {
        console.log('❌ Login failed:', data);
      }
    } catch (err) {
      console.error('Auth request error:', err.message);
    }
  } else {
    console.log('ℹ️ SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD not set in env. Required for API order push token.');
  }
  return null;
}

testShiprocketAuth();
