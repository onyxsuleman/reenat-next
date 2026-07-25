/**
 * Shiprocket API Order Synchronization Utility
 * Pushes storefront orders to Shiprocket Shipping Dashboard (app.shiprocket.in)
 */

import { getSupabaseServerClient } from './supabaseServer.js';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Obtain JWT Token from Shiprocket API
 */
export async function getShiprocketAuthToken() {
  // Return cached token if valid (expires in 10 days, we cache for 24h)
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // 1. First check if a manual JWT token is configured
  const staticToken = process.env.SHIPROCKET_JWT_TOKEN || process.env.SHIPROCKET_BEARER_TOKEN;
  if (staticToken && staticToken.trim().length > 20) {
    cachedToken = staticToken.trim();
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
    return cachedToken;
  }

  // 2. Otherwise authenticate using email and password
  const email = (process.env.SHIPROCKET_EMAIL || 'onyxsuleman@gmail.com').trim();
  const password = (process.env.SHIPROCKET_PASSWORD || 'Apple@6003').trim();

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
      return cachedToken;
    } else {
      console.warn('Shiprocket API Login Warning:', data.message || res.statusText);
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

    const orderIdStr = `RT-${order.id}`;
    const rawDate = order.created_at ? new Date(order.created_at) : new Date();
    const orderDateStr = rawDate.toISOString().slice(0, 19).replace('T', ' ');

    const customerName = (order.customer_name || 'Customer').trim();
    const nameParts = customerName.split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const phone = String(order.phone || '').replace(/\D/g, '');
    const cleanPhone = phone.length > 10 ? phone.slice(-10) : (phone || '9876543210');

    const address = order.shipping_line1 || order.address || 'Address details on record';
    const city = order.shipping_city || 'Nashik';
    const state = order.shipping_state || 'Maharashtra';
    const pincode = order.shipping_pincode || '423203';
    const country = order.shipping_country || 'India';
    const email = order.email || 'customer@reenattrends.com';

    const items = (order.items && order.items.length > 0) ? order.items : [
      { name: 'Traditional Paithani Cotton Silk Saree', qty: 1, price: order.total || 949 }
    ];

    const orderItems = items.map(item => {
      const numId = String(item.id || '').replace(/\D/g, '');
      const padId = numId ? numId.padStart(4, '0') : '0001';
      const resolvedSku = item.skuId || item.sku || `NSY${padId}`;

      return {
        name: item.name || 'Paithani Saree',
        sku: resolvedSku,
        units: Number(item.qty || 1),
        selling_price: String(item.price || 949),
        discount: '0',
        tax: '0',
        hsn: 520811
      };
    });

    const isCod = String(order.payment_method || '').toUpperCase().includes('COD');

    const payload = {
      order_id: orderIdStr,
      order_date: orderDateStr,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
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
