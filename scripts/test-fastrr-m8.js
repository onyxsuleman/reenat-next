const crypto = require('crypto');
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

const merchantApiKey = env.SHIPROCKET_MERCHANT_API_KEY;
const merchantSecretKey = env.SHIPROCKET_MERCHANT_SECRET_KEY;

console.log('API Key:', merchantApiKey);
console.log('Secret Key:', merchantSecretKey);

async function runTest() {
  const items = [
    {
      id: "100",
      variant_id: "100",
      title: "Hathi Raja Latest Design Saree",
      quantity: 1,
      price: "949.00",
      sku: "M8||Pink Black Hathi Raja",
      image_url: "https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io/storage/v1/object/public/saree-images/saree_1784652238005_xed8kfz.png"
    }
  ];

  const cartData = {
    items: items,
    total_price: "949.00",
    subtotal_price: "949.00",
    currency: "INR",
    customer_details: {
      email: "guest@example.com",
      phone: "9876543210",
      first_name: "Guest",
      last_name: "Customer"
    }
  };

  const redirectUrl = "https://reenattrends.com/cart";

  const payload = {
    cart_data: cartData,
    redirect_url: redirectUrl,
    timestamp: Math.floor(Date.now() / 1000)
  };

  const payloadString = JSON.stringify(payload);
  console.log('Sending Payload:', payloadString);

  const signature = crypto
    .createHmac('sha256', merchantSecretKey)
    .update(payloadString)
    .digest('base64');

  console.log('Signature:', signature);

  try {
    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': merchantApiKey,
        'X-Api-HMAC-SHA256': signature
      },
      body: payloadString
    });

    const status = response.status;
    const resData = await response.json();
    console.log('Status:', status);
    console.log('Response:', JSON.stringify(resData, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

runTest();
