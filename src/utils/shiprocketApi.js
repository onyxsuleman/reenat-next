/**
 * Shiprocket API Order Synchronization Utility
 * Pushes storefront orders to Shiprocket Shipping Dashboard (app.shiprocket.in)
 */

import { sanitizeSku } from './skuUtils.js';
import { getSupabaseServerClient } from './supabaseServer.js';

let cachedToken = null;
let tokenExpiry = 0;
let lockUntil = 0;

/**
 * Obtain JWT Token from Shiprocket API
 */
export async function getShiprocketAuthToken() {
  // Return cached token if valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // If under temporary security lockout, pause auth calls until cooldown expires
  if (lockUntil && Date.now() < lockUntil) {
    console.warn(`Shiprocket API in security cooldown until ${new Date(lockUntil).toLocaleTimeString()}. Orders remain stored safely in database.`);
    return null;
  }

  // 1. First check if a manual JWT token is configured
  const staticToken = process.env.SHIPROCKET_JWT_TOKEN || process.env.SHIPROCKET_BEARER_TOKEN;
  if (staticToken && staticToken.trim().length > 20) {
    cachedToken = staticToken.trim();
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
    return cachedToken;
  }

  // 2. Otherwise authenticate using email and password
  const email = (process.env.SHIPROCKET_EMAIL || 'reenattrends@gmail.com').trim();
  const password = (process.env.SHIPROCKET_PASSWORD || 'blb@PO8lnCHSvRua#Bv*0ZrbWk^Z%B5q').trim();

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ReenatTrends/1.0'
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    const data = await res.json();
    if (res.ok && data.token) {
      cachedToken = data.token;
      tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // cache for 24 hours
      lockUntil = 0;
      return cachedToken;
    } else {
      if (res.status === 403 || (data.message && String(data.message).includes('blocked'))) {
        // Set 3-hour safety cooldown lock to ensure complete lockout clearance (8:08 PM IST)
        lockUntil = Date.now() + (3 * 60 * 60 * 1000);
        console.warn('Shiprocket security lockout detected. Pausing login requests safely until 8:08 PM IST:', new Date(lockUntil).toLocaleTimeString());
      }
      return null;
    }
  } catch (err) {
    console.error('Shiprocket API Auth Exception:', err.message);
    return null;
  }
}

/**
 * Push an order object to Shiprocket Shipping Dashboard
 */
export async function pushOrderToShiprocket(order) {
  if (!order || !order.id) return { success: false, error: 'Invalid order object' };

  try {
    const token = await getShiprocketAuthToken();
    if (!token) {
      return { 
        success: false, 
        error: 'Shiprocket API Authentication pending. Please check API user credentials or JWT token in settings.' 
      };
    }

    const orderIdStr = String(order.fastrr_order_id || order.shiprocket_order_id || (order.id ? `RT-${order.id}` : Date.now()));
    const rawDate = order.created_at ? new Date(order.created_at) : new Date();
    const orderDateStr = rawDate.toISOString().slice(0, 19).replace('T', ' ');

    const customerName = (order.customer_name || 'Customer').trim();
    const nameParts = customerName.split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const phoneDigits = String(order.phone || '').replace(/\D/g, '');
    const cleanPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : '9876543210';

    const rawAddress = order.shipping_line1 || order.address || 'Address details on record';
    const address = String(rawAddress).trim().slice(0, 180);
    const city = order.shipping_city;
    const state = order.shipping_state;
    const pincode = order.shipping_pincode;

    if (!city || !state || !pincode) {
      console.error(`Refusing to push order ${order.id} to Shiprocket — missing shipping address fields (city: ${city}, state: ${state}, pincode: ${pincode}). This order needs manual review before shipping.`);
      return {
        success: false,
        error: 'Missing required shipping address fields (city/state/pincode) — order NOT pushed to Shiprocket to prevent shipping to the wrong address.'
      };
    }

    const country = order.shipping_country || 'India';
    const email = order.email || 'customer@reenattrends.com';

    const items = (order.items && order.items.length > 0) ? order.items : [
      { name: 'Traditional Paithani Cotton Silk Saree', qty: 1, price: order.total || 949 }
    ];

    const orderItems = items.map(item => {
      const numId = String(item.id || '').replace(/\D/g, '');
      const padId = numId ? numId.padStart(4, '0') : '0001';
      const resolvedSku = sanitizeSku(item.skuId || item.sku, item.id);

      const rawImage = item.image || item.image_front || item.image_url || '';
      let imageUrl = '';
      if (rawImage && typeof rawImage === 'string') {
        if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
          if (rawImage.includes('.sslip.io') || rawImage.includes('supabasekong')) {
            imageUrl = `https://www.reenattrends.com/api/image-proxy?url=${encodeURIComponent(rawImage)}`;
          } else {
            imageUrl = rawImage;
          }
        } else {
          imageUrl = `https://www.reenattrends.com${rawImage.startsWith('/') ? rawImage : `/${rawImage}`}`;
        }
      }

      return {
        name: item.name || 'Paithani Saree',
        sku: resolvedSku,
        units: Number(item.qty || 1),
        selling_price: String(item.price || 949),
        discount: '0',
        tax: '0',
        hsn: 520811,
        image: imageUrl || undefined,
        product_image: imageUrl || undefined
      };
    });

    const pMethod = String(order.payment_method || '').toUpperCase();
    const pStatus = String(order.payment_status || '').toLowerCase();
    const isExplicitPrepaid = (pMethod.includes('PREPAID') || pMethod.includes('ONLINE')) && pStatus === 'paid';
    const isCod = !isExplicitPrepaid;

    const payload = {
      order_id: orderIdStr,
      order_date: orderDateStr,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
      channel_id: '',
      comment: 'Storefront Online Purchase',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: address,
      billing_address_2: order.shipping_line2 || '',
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: country,
      billing_email: email,
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: Number(order.subtotal || order.total || 949),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.45
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const resData = await res.json();

    if (res.ok && (resData.order_id || resData.shipment_id)) {
      const srOrderId = String(resData.order_id || '');
      const shipmentId = String(resData.shipment_id || '');

      // Update order in Supabase with Shiprocket IDs
      try {
        const supabase = getSupabaseServerClient();
        await supabase
          .from('orders')
          .update({
            shiprocket_order_id: srOrderId,
            tracking_number: shipmentId,
            order_status: 'Synced to Shiprocket'
          })
          .eq('id', order.id);
      } catch (dbErr) {
        console.warn('Could not save Shiprocket order ID back to database:', dbErr.message);
      }

      return {
        success: true,
        shiprocket_order_id: srOrderId,
        shipment_id: shipmentId,
        data: resData
      };
    } else {
      console.warn('Shiprocket order creation returned notice:', resData);
      return {
        success: false,
        error: resData.message || resData.errors || 'Failed to create adhoc order in Shiprocket',
        data: resData
      };
    }
  } catch (err) {
    console.error('pushOrderToShiprocket Exception:', err.message);
    return { success: false, error: err.message };
  }
}
