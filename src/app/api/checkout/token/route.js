import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cart, customer } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty or invalid.' }, { status: 400 });
    }

    const merchantApiKey = process.env.SHIPROCKET_MERCHANT_API_KEY;
    const merchantSecretKey = process.env.SHIPROCKET_MERCHANT_SECRET_KEY;

    if (!merchantApiKey || !merchantSecretKey) {
      return NextResponse.json({ error: 'Merchant credentials are not configured.' }, { status: 500 });
    }

    // 1. Format cart items for Shiprocket
    const items = cart.map(item => ({
      id: String(item.id),
      title: item.name || 'Saree',
      quantity: Number(item.qty) || 1,
      price: parseFloat(item.price || '0').toFixed(2),
      sku: item.skuId || item.styleId || item.styleid || `NSY${String(item.id).padStart(4, '0')}`,
      image_url: item.image || ''
    }));

    // 2. Calculate subtotal & total
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    // 3. Build checkout payload
    const payload = {
      order_details: {
        total_price: parseFloat(subtotal).toFixed(2),
        subtotal_price: parseFloat(subtotal).toFixed(2),
        currency: 'INR',
        items: items
      }
    };

    if (customer) {
      const nameParts = (customer.name || 'Guest Customer').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      payload.customer_details = {
        email: customer.email || '',
        phone: customer.phone || '',
        first_name: firstName,
        last_name: lastName
      };
    }

    // 4. Calculate HMAC SHA256 signature in Base64
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', merchantSecretKey)
      .update(payloadString)
      .digest('base64');

    // 5. Send POST request to Shiprocket token endpoint
    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': merchantApiKey,
        'X-Api-HMAC-SHA256': signature
      },
      body: payloadString
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('Shiprocket token generation failed:', resData);
      return NextResponse.json({ error: resData.message || 'Failed to initialize checkout session.' }, { status: response.status });
    }

    // Return the response data containing token details
    return NextResponse.json(resData);
  } catch (err) {
    console.error('Token generation server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
