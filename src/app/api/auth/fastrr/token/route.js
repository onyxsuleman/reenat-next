import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const merchantApiKey = process.env.SHIPROCKET_MERCHANT_API_KEY;
    const merchantSecretKey = process.env.SHIPROCKET_MERCHANT_SECRET_KEY;

    if (!merchantApiKey || !merchantSecretKey) {
      return NextResponse.json(
        { error: 'Shiprocket merchant credentials are not configured.' },
        { status: 500 }
      );
    }

    const payload = {
      address: true,
      timestamp: new Date().toISOString()
    };

    const payloadString = JSON.stringify(payload);

    const signature = crypto
      .createHmac('sha256', merchantSecretKey)
      .update(payloadString)
      .digest('base64');

    const response = await fetch('https://checkout-api.shiprocket.com/api/v1/access-token/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': merchantApiKey,
        'X-Api-HMAC-SHA256': signature
      },
      body: payloadString
    });

    const resData = await response.json();

    if (!response.ok || resData.ok === false) {
      console.error('Shiprocket Fastrr Login token generation failed:', resData);
      const detailError =
        resData.message ||
        resData.error ||
        (resData.errors ? JSON.stringify(resData.errors) : '') ||
        'Failed to generate Fastrr login token';
      return NextResponse.json(
        { error: `Shiprocket API: ${detailError}` },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json(resData);
  } catch (err) {
    console.error('Fastrr token generation exception:', err);
    return NextResponse.json({ error: `Server exception: ${err.message}` }, { status: 500 });
  }
}
