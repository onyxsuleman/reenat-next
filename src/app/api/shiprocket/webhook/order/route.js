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

    // Extract Order Identifiers with complete Fastrr / Shiprocket coverage
    const clientOrderId = String(
      payload.client_order_id || 
      payload.clientOrderId || 
      (payload.order_details && payload.order_details.client_order_id) ||
      (payload.order && payload.order.client_order_id) ||
      ''
    ).trim();

    const shiprocketOrderIdRaw = String(
      payload.shiprocket_order_id || 
      payload.order_id || 
      payload.id || 
      payload.transaction_id || 
      payload.orderId || 
      clientOrderId ||
      ''
    ).trim();

    const fastrrOrderIdRaw = String(
      payload.fastrr_order_id || 
      payload.fastrr_id || 
      payload.fastrrOrderId || 
      clientOrderId ||
      ''
    ).trim();

    const shiprocketOrderId = shiprocketOrderIdRaw || clientOrderId || '';
    const effectiveId = fastrrOrderIdRaw || shiprocketOrderId || '';
    const fastrrOrderId = effectiveId 
      ? (effectiveId.startsWith('FAST-') ? effectiveId : `FAST-${effectiveId}`) 
      : `FAST-${Date.now()}`;
    
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
    const total = Math.round(Number(
      payload.total_price || 
      payload.total_amount || 
      payload.payment_total || 
      payload.total || 
      payload.amount || 
      (payload.payment_details && (payload.payment_details.amount || payload.payment_details.total)) ||
      0
    ));
    const subtotal = Math.round(Number(
      payload.subtotal_price || 
      payload.sub_total || 
      payload.subtotal || 
      total
    ));
    const tax = Math.round(Number(payload.tax_price || payload.tax_amount || payload.tax || 0));
    const discount = Math.round(Number(
      payload.discount_amount || 
      payload.discount || 
      payload.total_discount || 
      (subtotal > total ? subtotal - total : 0)
    ));

    // Deep Extraction of Payment Fields
    const paymentInfo = payload.payment_info || payload.payment_details || payload.payment || {};

    const rawPaymentMode = String(
      payload.payment_mode || 
      payload.payment_method || 
      payload.payment_type || 
      paymentInfo.payment_mode || 
      paymentInfo.mode || 
      paymentInfo.type || 
      paymentInfo.method || 
      payload.mode || 
      ''
    ).trim().toUpperCase();

    const rawPaymentStatus = String(
      payload.payment_status || 
      payload.financial_status || 
      paymentInfo.payment_status || 
      paymentInfo.status || 
      payload.status || 
      ''
    ).trim().toLowerCase();

    const rawGateway = String(
      payload.payment_gateway || 
      payload.gateway || 
      paymentInfo.payment_gateway || 
      paymentInfo.gateway || 
      paymentInfo.pg || 
      ''
    ).trim().toLowerCase();

    const rawPgTxnId = String(
      payload.pg_transaction_id || 
      payload.transaction_id || 
      payload.pg_txnid || 
      payload.pg_txn_id || 
      paymentInfo.pg_transaction_id || 
      paymentInfo.transaction_id || 
      paymentInfo.pg_txnid || 
      paymentInfo.pg_txn_id || 
      ''
    ).trim();

    // Comprehensive Prepaid Validation
    const isPaidStatus = [
      'captured',
      'paid',
      'success',
      'successful',
      'completed',
      'complete',
      'authorized',
      'settled'
    ].includes(rawPaymentStatus);

    const isOnlineGateway = [
      'payu',
      'razorpay',
      'cashfree',
      'phonepe',
      'paytm',
      'stripe',
      'ccavenue',
      'billdesk',
      'upi',
      'card',
      'netbanking',
      'wallet'
    ].some(g => rawGateway.includes(g) || rawPaymentMode.toLowerCase().includes(g));

    const isPrepaidMode = (
      rawPaymentMode.includes('PREPAID') || 
      rawPaymentMode.includes('ONLINE') || 
      rawPaymentMode.includes('PAY ONLINE') || 
      rawPaymentMode.includes('UPI') || 
      rawPaymentMode.includes('CARD') || 
      rawPaymentMode.includes('NETBANKING') || 
      rawPaymentMode.includes('WALLET') ||
      rawPaymentMode.includes('PAYU')
    );

    const isExplicitCod = (
      (rawPaymentMode === 'COD' || rawPaymentMode === 'CASH' || rawPaymentMode === 'CASH ON DELIVERY') &&
      !isPaidStatus &&
      !isOnlineGateway &&
      !rawPgTxnId
    );

    const isPrepaid = (isPrepaidMode || isPaidStatus || isOnlineGateway || (Boolean(rawPgTxnId) && !isExplicitCod)) && !isExplicitCod;

    const paymentMethod = isPrepaid ? 'Prepaid' : 'COD';
    const normalizedPaymentMethod = isPrepaid ? 'prepaid' : 'cod';
    const paymentGateway = rawGateway || (isPrepaid ? 'payu' : 'cod');
    const paymentStatus = isPrepaid ? (rawPaymentStatus || 'captured') : (rawPaymentStatus || 'pending');
    const financialStatus = (isPrepaid || isPaidStatus) ? 'paid' : 'pending';
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

      // Primary Lookup: Try product_id (new text PK) first, then legacy_id (old numeric)
      if (targetDbId) {
        try {
          // Try as text product_id first (e.g. NSY9M1001)
          const { data: idProd } = await supabase
            .from('products')
            .select('product_id, legacy_id, name, image, color, sku, catalog_code')
            .eq('product_id', String(targetDbId))
            .maybeSingle();

          if (idProd) {
            dbProduct = idProd;
          } else {
            // Fallback: try as legacy_id (old numeric id)
            const numericId = parseInt(String(targetDbId).replace(/\D/g, ''), 10);
            if (!isNaN(numericId)) {
              const { data: legacyProd } = await supabase
                .from('products')
                .select('product_id, legacy_id, name, image, color, sku, catalog_code')
                .eq('legacy_id', numericId)
                .maybeSingle();

          if (legacyProd) {
                dbProduct = legacyProd;
              }
            }
          }
        } catch (idErr) {
          console.error('Product lookup error in webhook:', idErr);
        }
      }

      // Secondary Lookup: Direct SKU lookup if Product ID missed or candidate ID was invalid
      if (!dbProduct && rawSku && rawSku !== 'N/A') {
        try {
          const cleanRawSku = rawSku.replace(/^[A-Z0-9]+\|\|/i, '').trim();
          const sellerSkuOnly = cleanRawSku.replace(/\s*-\s*NSY\d+/i, '').trim();

          const { data: skuProd } = await supabase
            .from('products')
            .select('product_id, legacy_id, name, image, color, sku, catalog_code')
            .or(`sku.eq.${rawSku},sku.eq.${cleanRawSku},sku.eq.${sellerSkuOnly},sku.ilike.%${sellerSkuOnly}%`)
            .limit(1)
            .maybeSingle();

          if (skuProd) {
            dbProduct = skuProd;
            targetDbId = dbProduct.product_id;
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

      if (!cleanSkuBase && dbProduct && dbProduct.sku) {
        cleanSkuBase = String(dbProduct.sku)
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
      const finalProductId = dbProduct ? dbProduct.product_id : (rawSku.includes('NSY') ? String(targetDbId) : null);
      
      let resolvedSku = cleanSkuBase;
      if (finalProductId) {
        const formattedIdStr = finalProductId;
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
        id: dbProduct ? dbProduct.product_id : (finalProductId || item.id || 'unknown'),
        name: dbProduct ? dbProduct.name : (item.title || item.name || 'Saree'),
        qty: Number(item.quantity || item.qty || 1),
        price: Number(item.price || 0),
        image: resolvedImage,
        color: dbProduct ? dbProduct.color : (item.color || ''),
        skuId: resolvedSku,
        variantId: dbProduct ? dbProduct.product_id : (item.variant_id || item.variantId || '')
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

    // Unified Order Write: Single orders table + order_items + order_addresses + order_shipments
    const idempotencyKey = `webhook:${fastrrOrderId}:${shiprocketOrderId}`;
    
    // Check for existing order (deduplication)
    const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
    let existingOrder = null;
    
    if (shiprocketOrderId) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('shiprocket_order_id', shiprocketOrderId)
        .limit(1);
      if (existing && existing.length > 0) existingOrder = existing[0];
    }

    if (!existingOrder && fastrrOrderId) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('fastrr_order_id', fastrrOrderId)
        .limit(1);
      if (existing && existing.length > 0) existingOrder = existing[0];
    }

    if (!existingOrder && phone && phone.trim()) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_phone', phone.trim())
        .gte('created_at', twoMinutesAgo)
        .limit(1);
      if (existing && existing.length > 0) existingOrder = existing[0];
    }

    let orderUuid = null;

    if (existingOrder) {
      // Update existing order status/payment without duplicating items or stock decrement
      orderUuid = existingOrder.id;
      await supabase
        .from('orders')
        .update({
          payment_method: normalizedPaymentMethod,
          financial_status: financialStatus,
          order_status: orderStatus,
          shiprocket_order_id: String(shiprocketOrderId || '')
        })
        .eq('id', orderUuid);

      // Update shipment if provided
      const shipmentData = payload.shipment_details || {};
      if (shipmentData.shipment_id || shipmentData.awb_code) {
        await supabase.from('order_shipments').insert({
          order_id: orderUuid,
          shipment_id: String(shipmentData.shipment_id || shiprocketOrderId),
          courier_name: shipmentData.courier_name || '',
          awb_code: shipmentData.awb_code || '',
          pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
          tracking_status: shipmentData.tracking_status || 'MANIFESTED',
          tracking_url: shipmentData.tracking_url || ''
        });
      }

      console.log(`Duplicate webhook order attempt detected. Updated existing order #${orderUuid} successfully.`);
      return NextResponse.json({ success: true, message: 'Existing order updated', order_id: orderUuid });
    }

    // Insert new order
    const needsAddressReview = !shippingCity || !shippingState || !shippingPincode;
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        idempotency_key: idempotencyKey,
        fastrr_order_id: fastrrOrderId,
        shiprocket_order_id: String(shiprocketOrderId),
        customer_name: customerName,
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        financial_status: financialStatus,
        payment_method: normalizedPaymentMethod,
        payment_gateway: paymentGateway,
        sub_total: subtotal,
        discount_amount: discount,
        total_amount: total,
        order_status: orderStatus,
        needs_address_review: needsAddressReview
      })
      .select();

    if (!orderErr && newOrder && newOrder[0]) {
      orderUuid = newOrder[0].id;
    }

    if (orderUuid) {
      // Write Line Items to order_items
      const itemRows = orderItems.map(item => ({
        order_id: orderUuid,
        product_id: typeof item.id === 'string' && item.id.startsWith('NSY') ? item.id : null,
        sku_snapshot: item.skuId || item.sku || 'N/A',
        name_snapshot: item.name || 'Saree',
        color_snapshot: item.color || '',
        unit_price: Number(item.price || 0),
        quantity: Number(item.qty || 1),
        total_price: Number((item.price || 0) * (item.qty || 1))
      }));

      if (itemRows.length > 0) {
        await supabase.from('order_items').insert(itemRows);
      }

      // Write Address to order_addresses
      await supabase.from('order_addresses').insert({
        order_id: orderUuid,
        full_name: customerName,
        phone: phone.trim(),
        email: email.trim(),
        address_line1: shippingLine1,
        address_line2: shippingLine2,
        city: shippingCity,
        state: shippingState,
        pincode: shippingPincode,
        country: shippingCountry || 'India'
      });

      // Write Shipment Metadata to order_shipments
      const shipmentData = payload.shipment_details || {};
      await supabase.from('order_shipments').insert({
        order_id: orderUuid,
        shipment_id: String(shipmentData.shipment_id || shiprocketOrderId),
        courier_name: shipmentData.courier_name || '',
        awb_code: shipmentData.awb_code || '',
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
        tracking_status: shipmentData.tracking_status || 'MANIFESTED',
        tracking_url: shipmentData.tracking_url || ''
      });

      console.log(`✅ Unified Order Save Successful! (Order UUID: ${orderUuid})`);
    }

    // 3. Stock Control Decrement
    for (const item of orderItems) {
      const itemPid = item.id || item.product_id;
      if (itemPid && !String(itemPid).startsWith('temp-') && String(itemPid).startsWith('NSY')) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_qty')
          .eq('product_id', itemPid)
          .single();

        if (product) {
          const currentStock = Number(product.stock_qty || 10);
          const newStock = Math.max(0, currentStock - item.qty);

          await supabase
          .from('products')
          .update({ stock_qty: newStock })
          .eq('product_id', itemPid);
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
