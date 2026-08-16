import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient } from '../../../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../../../utils/shiprocketApi';
import { sendMetaCapiEvent } from '../../../../../utils/metaPixel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-api-hmac-sha256') || request.headers.get('X-Api-Hmac-Sha256') || '';

    const merchantSecretKey = process.env.SHIPROCKET_MERCHANT_SECRET_KEY;

    // Cryptographic validation of incoming webhook
    if (merchantSecretKey && hmacHeader) {
      const calculatedHmac = crypto
        .createHmac('sha256', merchantSecretKey)
        .update(rawBody)
        .digest('base64');

      if (hmacHeader !== calculatedHmac) {
        console.warn('Webhook signature verification failed. HMAC mismatch.');
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    } else if (!hmacHeader) {
      console.warn('Incoming webhook missing x-api-hmac-sha256 header. Proceeding with warning.');
    }

    const payload = rawBody ? JSON.parse(rawBody) : {};

    // Validation ping check
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: true, message: 'Webhook validation ping successful' });
    }

    // Details extraction
    const customerDetails = payload.customer_details || payload.customer || {};
    const shippingAddress = payload.shipping_address || payload.shipping_line1 || {};
    const billingAddress = payload.billing_address || {};

    const shiprocketOrderId = String(payload.shiprocket_order_id || payload.order_id || payload.id || payload.transaction_id || '');
    const fastrrOrderId = String(payload.fastrr_order_id || payload.fastrr_id || `FAST-${shiprocketOrderId || Date.now()}`);
    
    const customerName = payload.customer_name || 
                         payload.billing_name || 
                         (customerDetails.first_name ? `${customerDetails.first_name} ${customerDetails.last_name || ''}`.trim() : '') ||
                         (shippingAddress && typeof shippingAddress === 'object' ? shippingAddress.name || (shippingAddress.first_name ? `${shippingAddress.first_name} ${shippingAddress.last_name || ''}`.trim() : '') : '') ||
                         (billingAddress.name ? billingAddress.name : '') || 
                         'Customer';

    const email = payload.customer_email || 
                  payload.email || 
                  customerDetails.email || 
                  (shippingAddress && typeof shippingAddress === 'object' ? shippingAddress.email : '') || 
                  billingAddress.email || 
                  '';

    const phone = payload.customer_phone || 
                  payload.phone || 
                  customerDetails.phone || 
                  (shippingAddress && typeof shippingAddress === 'object' ? shippingAddress.phone : '') || 
                  billingAddress.phone || 
                  '';

    // Structured Address Fields
    let shippingLine1 = '';
    let shippingLine2 = '';
    let shippingCity = '';
    let shippingState = '';
    let shippingPincode = '';
    let shippingCountry = 'India';

    const cleanStr = (val) => (typeof val === 'string' ? val : (typeof val === 'number' ? String(val) : ''));

    if (shippingAddress && typeof shippingAddress === 'object') {
      shippingLine1 = cleanStr(shippingAddress.address1 || shippingAddress.line1);
      shippingLine2 = cleanStr(shippingAddress.address2 || shippingAddress.line2);
      shippingCity = cleanStr(shippingAddress.city);
      shippingState = cleanStr(shippingAddress.state);
      shippingPincode = cleanStr(shippingAddress.zip || shippingAddress.pincode);
      shippingCountry = cleanStr(shippingAddress.country) || 'India';
    } else if (typeof shippingAddress === 'string') {
      shippingLine1 = shippingAddress;
      shippingLine2 = cleanStr(payload.shipping_address_2 || payload.shipping_line2);
      shippingCity = cleanStr(payload.shipping_city || payload.city);
      shippingState = cleanStr(payload.shipping_state || payload.state);
      shippingPincode = cleanStr(payload.shipping_pincode || payload.pincode);
      shippingCountry = cleanStr(payload.shipping_country || payload.country) || 'India';
    }
    
    const fullAddress = `${shippingLine1} ${shippingLine2}, ${shippingCity}, ${shippingState} - ${shippingPincode}, ${shippingCountry}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();

    // Financials
    const total = Math.round(Number(payload.total_price || payload.total || 0));
    const subtotal = Math.round(Number(payload.subtotal_price || payload.subtotal || total));
    const tax = Math.round(Number(payload.tax_price || payload.tax || 0));
    const discount = Math.round(Number(payload.discount_amount || payload.discount || 0));

    // Payment Gateway Mode
    const rawPaymentMode = String(
      payload.payment_method || 
      payload.payment_mode || 
      payload.payment_type || 
      (payload.payment_info && payload.payment_info.payment_mode) || 
      ''
    ).trim().toUpperCase();

    const rawPaymentStatus = String(
      payload.payment_status || 
      (payload.payment_info && payload.payment_info.payment_status) || 
      ''
    ).trim().toLowerCase();

    const rawGateway = String(payload.payment_gateway || (payload.payment_info && payload.payment_info.payment_gateway) || '').trim().toLowerCase();

    const isExplicitPrepaid = (rawPaymentMode === 'PREPAID' || rawPaymentMode === 'ONLINE' || rawPaymentMode === 'PAY ONLINE') || rawPaymentStatus === 'paid';
    const isCod = !isExplicitPrepaid;

    const paymentMethod = isCod ? 'COD' : 'Prepaid';
    const normalizedPaymentMethod = isCod ? 'cod' : 'prepaid';
    const paymentGateway = rawGateway || (isCod ? 'cod' : 'payu');
    const paymentStatus = isCod ? (rawPaymentStatus || 'pending') : (rawPaymentStatus || 'paid');
    const financialStatus = paymentStatus === 'paid' ? 'paid' : 'pending';
    const orderStatus = payload.order_status || 'Pending';

    const supabase = getSupabaseServerClient();

    // Parse Line Items with Self-Healing Product Lookup by Unique Product ID (NSY00xx) or SKU
    const rawItems = payload.items || payload.line_items || [];
    const orderItems = await Promise.all(rawItems.map(async item => {
      const rawSku = [item.sku, item.sku_id, item.styleid, item.styleId, item.style_id]
        .map(s => (typeof s === 'string' ? s.trim() : ''))
        .find(s => s.length > 0 && s !== 'N/A') || '';
      
      // 1. Try extracting 8-digit or standard NSY Product ID from SKU string (e.g. "Grey Black - NSY10000090" -> 90)
      let targetDbId = null;
      if (rawSku && rawSku.includes('NSY')) {
        const match = rawSku.match(/NSY(\d+)/i);
        if (match && match[1]) {
          const parsedVal = parseInt(match[1], 10);
          targetDbId = parsedVal >= 1000000 ? (parsedVal - 1000000) : parsedVal;
        }
      }

      // 2. Try variant_id or product_id if provided explicitly
      if (!targetDbId) {
        const candidateId = item.variant_id || item.product_id || item.variantId || item.productId || '';
        if (candidateId) {
          const cleanDigits = String(candidateId).replace(/\D/g, '');
          if (cleanDigits) {
            const parsedVal = parseInt(cleanDigits, 10);
            targetDbId = parsedVal >= 1000000 ? (parsedVal - 1000000) : parsedVal;
          }
        }
      }

      let dbProduct = null;

      // Primary Lookup: Direct lookup by candidate Product ID in products table
      if (targetDbId) {
        try {
          const { data: idProd } = await supabase
            .from('products')
            .select('id, name, image, color, styleid, catalog_id')
            .eq('id', targetDbId)
            .maybeSingle();

          if (idProd) {
            dbProduct = idProd;
          }
        } catch (idErr) {
          console.error('Direct Product ID lookup error in webhook:', idErr);
        }
      }

      // Secondary Lookup: Direct SKU lookup if Product ID missed or candidate ID was invalid
      if (!dbProduct && rawSku && rawSku !== 'N/A') {
        try {
          const cleanRawSku = rawSku.replace(/^[A-Z0-9]+\|\|/i, '').trim();
          const sellerSkuOnly = cleanRawSku.replace(/\s*-\s*NSY\d+/i, '').trim();

          const { data: skuProd } = await supabase
            .from('products')
            .select('id, name, image, color, styleid, catalog_id')
            .or(`styleid.eq.${rawSku},styleid.eq.${cleanRawSku},styleid.eq.${sellerSkuOnly},styleid.ilike.%${sellerSkuOnly}%`)
            .limit(1)
            .maybeSingle();

          if (skuProd) {
            dbProduct = skuProd;
            targetDbId = dbProduct.id;
          }
        } catch (skuErr) {
          console.error('SKU lookup error in webhook:', skuErr);
        }
      }

      // Strip catalog prefix like "M5||", old NSY tags, and leading dashes from rawSku
      let cleanSkuBase = rawSku
        .replace(/^[A-Z0-9]+\|\|/i, '')
        .replace(/\s*-\s*NSY\d+/ig, '')
        .replace(/^NSY\d+/ig, '')
        .replace(/^[\s\-\|]+/, '')
        .trim();

      if (!cleanSkuBase && dbProduct && dbProduct.styleid) {
        cleanSkuBase = String(dbProduct.styleid)
          .replace(/^[A-Z0-9]+\|\|/i, '')
          .replace(/\s*-\s*NSY\d+/ig, '')
          .replace(/^NSY\d+/ig, '')
          .replace(/^[\s\-\|]+/, '')
          .trim();
      }

      if (!cleanSkuBase && dbProduct) {
        const prodColor = dbProduct.color || '';
        if (prodColor) {
          cleanSkuBase = prodColor.toLowerCase().includes('pai') ? prodColor : `${prodColor} Pai`;
        }
      }

      // IF dbProduct was found, ALWAYS use dbProduct's verified name, image, color & ID!
      const finalDbId = dbProduct ? dbProduct.id : (rawSku.includes('NSY') ? targetDbId : null);
      
      let resolvedSku = cleanSkuBase;
      if (finalDbId) {
        const formattedIdStr = `NSY${String(1000000 + finalDbId)}`;
        resolvedSku = cleanSkuBase 
          ? (cleanSkuBase.includes(formattedIdStr) ? cleanSkuBase : `${cleanSkuBase} - ${formattedIdStr}`) 
          : formattedIdStr;
      } else if (!resolvedSku) {
        resolvedSku = 'NSY10000001';
      }

      let resolvedImage = dbProduct ? dbProduct.image : (
        item.image || item.image_url || item.product_image || item.src || item.image_front || item.image1 || item.thumbnail || ''
      );

      const fallbackImg = 'https://www.reenattrends.com/saree_kanjivaram.png';
      if (!resolvedImage || typeof resolvedImage !== 'string' || resolvedImage.includes('localhost')) {
        resolvedImage = fallbackImg;
      } else if (resolvedImage.startsWith('/')) {
        resolvedImage = `https://www.reenattrends.com${resolvedImage}`;
      }

      return {
        id: dbProduct ? dbProduct.id : (finalDbId || item.id || 1),
        name: dbProduct ? dbProduct.name : (item.title || item.name || 'Saree'),
        qty: Number(item.quantity || item.qty || 1),
        price: Number(item.price || 0),
        image: resolvedImage,
        color: dbProduct ? dbProduct.color : (item.color || ''),
        skuId: resolvedSku,
        variantId: dbProduct ? dbProduct.id : (item.variant_id || item.variantId || '')
      };
    }));

    // Update Customer Profile
    if (email) {
      const nameParts = customerName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await supabase
        .from('customers')
        .upsert({
          email: email.trim(),
          phone: phone.trim(),
          first_name: firstName,
          last_name: lastName,
          default_address: fullAddress
        }, { onConflict: 'email' })
        .catch(err => console.error('Customer upsert non-fatal error:', err));
    }

    // 1. Dual-Write Target: Save/Update in Legacy 'orders' Table for 100% Backward Compatibility
    const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
    let existingQuery = supabase
      .from('orders')
      .select('id, shiprocket_order_id, created_at')
      .gte('created_at', twoMinutesAgo);

    if (shiprocketOrderId && shiprocketOrderId.length > 0) {
      existingQuery = existingQuery.eq('shiprocket_order_id', shiprocketOrderId);
    } else if (phone && phone.trim()) {
      existingQuery = existingQuery.eq('phone', phone.trim()).eq('total', total);
    }

    const { data: existingOrders } = await existingQuery.limit(1);
    let legacyInsertedOrder = null;

    if (existingOrders && existingOrders.length > 0) {
      const existingId = existingOrders[0].id;
      const { data: updatedData } = await supabase
        .from('orders')
        .update({
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          order_status: orderStatus,
          items: orderItems,
          address: fullAddress,
          shiprocket_order_id: String(shiprocketOrderId || existingOrders[0].shiprocket_order_id || '')
        })
        .eq('id', existingId)
        .select();

      legacyInsertedOrder = updatedData;
    } else {
      const { data: newOrder } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          shipping_line1: shippingLine1,
          shipping_line2: shippingLine2,
          shipping_city: shippingCity,
          shipping_state: shippingState,
          shipping_pincode: shippingPincode,
          shipping_country: shippingCountry,
          shiprocket_order_id: String(shiprocketOrderId),
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          total: total,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          order_status: orderStatus,
          items: orderItems
        })
        .select();

      legacyInsertedOrder = newOrder;
    }

    // 2. Primary 4-Table Normalized Write: checkout_orders, items, addresses, shipments
    try {
      const mainOrderPayload = {
        fastrr_order_id: fastrrOrderId,
        shiprocket_order_id: String(shiprocketOrderId),
        customer_name: customerName,
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        financial_status: financialStatus,
        payment_method: normalizedPaymentMethod,
        payment_gateway: paymentGateway,
        sub_total: subtotal,
        tax_amount: tax,
        discount_amount: discount,
        total_amount: total,
        order_status: orderStatus,
        legacy_id: legacyInsertedOrder && legacyInsertedOrder[0] ? legacyInsertedOrder[0].id : null
      };

      const { data: newCheckoutOrder, error: mainErr } = await supabase
        .from('checkout_orders')
        .upsert(mainOrderPayload, { onConflict: 'fastrr_order_id' })
        .select();

      if (!mainErr && newCheckoutOrder && newCheckoutOrder[0]) {
        const checkoutOrderId = newCheckoutOrder[0].id;

        // Write Line Items to checkout_order_items
        const itemRows = orderItems.map(item => ({
          order_id: checkoutOrderId,
          product_id: typeof item.id === 'number' ? item.id : null,
          sku: item.skuId || item.sku || 'N/A',
          variant_id: item.variantId || '',
          product_name: item.name || 'Saree',
          image_url: item.image || '',
          color: item.color || '',
          unit_price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
          total_price: Number((item.price || 0) * (item.qty || 1))
        }));

        if (itemRows.length > 0) {
          await supabase.from('checkout_order_items').insert(itemRows);
        }

        // Write Address to checkout_order_addresses
        await supabase.from('checkout_order_addresses').insert({
          order_id: checkoutOrderId,
          address_type: 'shipping',
          full_name: customerName,
          phone: phone.trim(),
          email: email.trim(),
          address_line1: shippingLine1,
          address_line2: shippingLine2,
          city: shippingCity,
          state: shippingState,
          pincode: shippingPincode,
          country: shippingCountry
        });

        // Write Shipment Metadata to checkout_shipments
        const shipmentData = payload.shipment_details || {};
        await supabase.from('checkout_shipments').insert({
          order_id: checkoutOrderId,
          shipment_id: String(shipmentData.shipment_id || shiprocketOrderId),
          courier_name: shipmentData.courier_name || '',
          awb_code: shipmentData.awb_code || '',
          pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
          tracking_status: shipmentData.tracking_status || 'MANIFESTED',
          tracking_url: shipmentData.tracking_url || ''
        });

        console.log(`✅ 4-Table Normalized Order Save Successful! (Checkout Order UUID: ${checkoutOrderId})`);
      }
    } catch (normErr) {
      console.warn('4-Table normalized write fallback warning (table may not exist yet):', normErr.message);
    }

    // 3. Stock Control Decrement
    for (const item of orderItems) {
      if (item.id && !String(item.id).startsWith('temp-')) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('id', item.id)
          .single();

        if (product) {
          const currentStock = Number(product.stock_qty || 10);
          const newStock = Math.max(0, currentStock - item.qty);

          await supabase
            .from('products')
            .update({ stock_qty: newStock })
            .eq('id', item.id);
        }
      }
    }

    // Send Meta Conversions API (CAPI) Server-Side Purchase Event
    try {
      const eventId = `purchase_${shiprocketOrderId || fastrrOrderId}`;
      sendMetaCapiEvent({
        eventName: 'Purchase',
        eventId: eventId,
        email: email,
        phone: phone,
        fullName: customerName,
        city: shippingCity,
        state: shippingState,
        zipcode: shippingPincode,
        country: shippingCountry,
        value: total,
        currency: 'INR',
        items: orderItems,
        eventSourceUrl: 'https://www.reenattrends.com/cart'
      }).catch(capiErr => {
        console.warn('Meta CAPI send warning in webhook:', capiErr.message);
      });
    } catch (capiOutErr) {
      console.warn('Meta CAPI trigger warning:', capiOutErr.message);
    }

    console.log(`✅ Order synced successfully to CMS Database! (Fastrr Order ID: ${fastrrOrderId}, Shiprocket Order ID: ${shiprocketOrderId})`);

    return NextResponse.json({ success: true, shiprocket_order_id: shiprocketOrderId, fastrr_order_id: fastrrOrderId });
  } catch (err) {
    console.error('Webhook execution crashed:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
