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
    const fallbackImage = 'https://www.reenattrends.com/saree_kanjivaram.png';
    const items = cart.map(item => {
      const rawIdStr = String(item.id || '').replace(/\D/g, '');
      const numId = rawIdStr ? parseInt(rawIdStr, 10) : 1;
      const formattedProductId = numId >= 1000000 ? `NSY${numId}` : `NSY${String(1000000 + numId)}`;
      const catalog = item.catalog_id || item.catalogId || '';

      // 1. Resolve SKU cleanly: Strip any catalog prefix (e.g. M5||) and format strictly as "Seller SKU - NSY100000xx"
      let rawSellerSku = [item.skuId, item.sku, item.styleid, item.styleId]
        .map(s => (typeof s === 'string' ? s.trim() : ''))
        .find(s => s.length > 0) || '';

      // Strip catalog prefix like "M5||" or "M4||"
      let cleanSellerSku = rawSellerSku.replace(/^[A-Z0-9]+\|\|/i, '').trim();

      if (!cleanSellerSku) {
        cleanSellerSku = item.color ? `${item.color} Pai` : 'Saree';
      }

      // Ensure Product ID is present at the end
      let resolvedSku = cleanSellerSku;
      if (!resolvedSku.includes(formattedProductId)) {
        resolvedSku = `${cleanSellerSku} - ${formattedProductId}`;
      }

      // 2. Resolve Image URL cleanly
      let rawImage = item.image || item.image_front || item.image_url || item.image1 || item.image2 || item.image3 || item.image4 || '';
      let imageUrl = '';

      if (rawImage && typeof rawImage === 'string') {
        rawImage = rawImage.trim();
        if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
          if (rawImage.includes('localhost') || rawImage.includes('127.0.0.1')) {
            imageUrl = fallbackImage;
          } else {
            imageUrl = rawImage;
          }
        } else {
          const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
          imageUrl = `https://www.reenattrends.com${cleanPath}`;
        }
      }

      if (!imageUrl) {
        imageUrl = fallbackImage;
      }

      const cleanTitle = item.name || 'Saree';
      const cleanId = String(numId);

      return {
        id: cleanId,
        variant_id: cleanId,
        product_id: cleanId,
        title: cleanTitle,
        name: cleanTitle,
        quantity: Number(item.qty) || 1,
        price: parseFloat(item.price || '0').toFixed(2),
        sku: resolvedSku,
        sku_id: resolvedSku,
        styleid: resolvedSku,
        style_id: resolvedSku,
        catalog_id: catalog,
        image: imageUrl,
        image_url: imageUrl,
        product_image: imageUrl,
        src: imageUrl
      };
    });

    // 2. Calculate subtotal & total
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    // 3. Build cart_data payload
    const cart_data = {
      items: items,
      total_price: parseFloat(subtotal).toFixed(2),
      subtotal_price: parseFloat(subtotal).toFixed(2),
      currency: 'INR',
      cod_available: true,
      is_cod_available: true,
      allow_cod: true,
      payment_methods: ['COD', 'PREPAID', 'ONLINE']
    };

    if (customer && typeof customer === 'object') {
      const rawName = typeof customer.name === 'string' ? customer.name : '';
      const nameParts = (rawName || 'Guest Customer').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      const email = typeof customer.email === 'string' ? customer.email : '';
      const phone = typeof customer.phone === 'string' ? customer.phone : '';

      cart_data.customer_details = {
        email: email,
        phone: phone,
        first_name: firstName,
        last_name: lastName
      };
    }

    // 4. Build root payload with required parameters
    const host = request.headers.get('host') || 'reenattrends.com';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const redirect_url = `${proto}://${host}/cart`;

    const payload = {
      cart_data: cart_data,
      redirect_url: redirect_url,
      timestamp: Math.floor(Date.now() / 1000)
    };

    // 5. Calculate HMAC SHA256 signature in Base64
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
      const detailError = resData.message || (resData.error && typeof resData.error === 'string' ? resData.error : '') || JSON.stringify(resData);
      return NextResponse.json({ error: `Shiprocket API: ${detailError}` }, { status: response.status });
    }

    // Return the response data containing token details
    return NextResponse.json(resData);
  } catch (err) {
    console.error('Token generation server error:', err);
    return NextResponse.json({ error: `Server exception: ${err.message}` }, { status: 500 });
  }
}
