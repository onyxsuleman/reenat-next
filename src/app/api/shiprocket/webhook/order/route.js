import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient } from '../../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-api-hmac-sha256') || request.headers.get('X-Api-Hmac-Sha256') || '';

    const merchantSecretKey = process.env.SHIPROCKET_MERCHANT_SECRET_KEY;

    // Cryptographic validation of incoming webhook (if secret is configured)
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

    // If it's an empty validation ping from Shiprocket/Fastrr, return success immediately
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: true, message: 'Webhook validation ping successful' });
    }

    // Extracting details from Shiprocket's order payload.
    const customerDetails = payload.customer_details || payload.customer || {};
    const shippingAddress = payload.shipping_address || payload.shipping_line1 || {};
    const billingAddress = payload.billing_address || {};

    const shiprocketOrderId = String(payload.shiprocket_order_id || payload.order_id || payload.id || payload.transaction_id || '');
    
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

    // Addresses
    let shippingLine1 = '';
    let shippingLine2 = '';
    let shippingCity = '';
    let shippingState = '';
    let shippingPincode = '';
    let shippingCountry = 'India';

    if (shippingAddress && typeof shippingAddress === 'object') {
      shippingLine1 = shippingAddress.address1 || shippingAddress.line1 || '';
      shippingLine2 = shippingAddress.address2 || shippingAddress.line2 || '';
      shippingCity = shippingAddress.city || '';
      shippingState = shippingAddress.state || '';
      shippingPincode = String(shippingAddress.zip || shippingAddress.pincode || '');
      shippingCountry = shippingAddress.country || 'India';
    } else if (typeof shippingAddress === 'string') {
      shippingLine1 = shippingAddress;
      shippingLine2 = payload.shipping_address_2 || payload.shipping_line2 || '';
      shippingCity = payload.shipping_city || payload.city || '';
      shippingState = payload.shipping_state || payload.state || '';
      shippingPincode = String(payload.shipping_pincode || payload.pincode || '');
      shippingCountry = payload.shipping_country || payload.country || 'India';
    }
    
    // Concatenate full address
    const fullAddress = `${shippingLine1} ${shippingLine2}, ${shippingCity}, ${shippingState} - ${shippingPincode}, ${shippingCountry}`.replace(/\s+/g, ' ').trim();

    // Financials
    const total = Math.round(Number(payload.total_price || payload.total || 0));
    const subtotal = Math.round(Number(payload.subtotal_price || payload.subtotal || total));
    const tax = Math.round(Number(payload.tax_price || payload.tax || 0));
    const discount = Math.round(Number(payload.discount_amount || payload.discount || 0));

    let paymentMethod = 'Pay Online';
    const rawPayment = payload.payment_method || payload.payment_type || payload.payment_mode || '';
    if (rawPayment) {
      const pmUpper = String(rawPayment).toUpperCase();
      if (pmUpper === 'COD' || pmUpper === 'CASH ON DELIVERY' || pmUpper === 'CASH_ON_DELIVERY') {
        paymentMethod = 'COD';
      } else if (pmUpper === 'PREPAID' || pmUpper === 'ONLINE' || pmUpper === 'PAY ONLINE' || pmUpper === 'PAY_ONLINE') {
        paymentMethod = 'Pay Online';
      } else {
        paymentMethod = rawPayment;
      }
    }
    const paymentStatus = payload.payment_status || (paymentMethod === 'COD' ? 'pending' : 'paid');
    const orderStatus = payload.order_status || 'Pending';

    const supabase = getSupabaseServerClient();

    // Parse Line items with self-healing DB lookup
    const rawItems = payload.items || payload.line_items || [];
    const orderItems = await Promise.all(rawItems.map(async item => {
      let localId = item.id || item.product_id || '';
      const sku = item.sku || item.sku_id || item.styleid || item.styleId || item.style_id || '';
      
      // If local ID is not numeric or seems like a Shiprocket internal ID, try extracting from SKU (e.g. "NSY0042" -> "42")
      if (sku && sku.startsWith('NSY')) {
        const parsedId = parseInt(sku.replace('NSY', ''), 10);
        if (!isNaN(parsedId)) {
          localId = parsedId;
        }
      }

      let dbProduct = null;
      if (sku || localId) {
        try {
          const query = supabase.from('products').select('id, name, image, color, styleid');
          if (sku && localId && !isNaN(Number(localId))) {
            query.or(`styleid.eq."${sku}",id.eq.${localId}`);
          } else if (sku) {
            query.eq('styleid', sku);
          } else if (localId && !isNaN(Number(localId))) {
            query.eq('id', localId);
          }
          const { data: prodData } = await query.maybeSingle();
          if (prodData) {
            dbProduct = prodData;
          }
        } catch (dbErr) {
          console.error('Failed to lookup product details from db for webhook item:', dbErr);
        }
      }

      return {
        id: dbProduct ? dbProduct.id : localId,
        name: dbProduct ? dbProduct.name : (item.title || item.name || 'Saree'),
        qty: Number(item.quantity || item.qty || 1),
        price: Number(item.price || 0),
        image: dbProduct ? dbProduct.image : (item.image_url || item.image || ''),
        color: dbProduct ? dbProduct.color : (item.color || ''),
        skuId: dbProduct ? dbProduct.styleid : sku
      };
    }));

    // 1. Insert/Update customer profile if email is present
    if (email) {
      const nameParts = customerName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { error: customerErr } = await supabase
        .from('customers')
        .upsert({
          email: email.trim(),
          phone: phone.trim(),
          first_name: firstName,
          last_name: lastName,
          default_address: fullAddress
        }, { onConflict: 'email' });

      if (customerErr) {
        console.error('Failed to update customer profile in webhook:', customerErr.message);
      }
    }

    // 2. Insert order details in orders database table
    const { data: insertedOrder, error: orderErr } = await supabase
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

    if (orderErr) {
      console.error('Failed to write order from webhook payload:', orderErr.message);
      return NextResponse.json({ error: 'Database order save failed' }, { status: 500 });
    }

    // 3. Decrement stock levels for purchased items
    for (const item of orderItems) {
      if (item.id && !String(item.id).startsWith('temp-')) {
        // Fetch current stock
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

    return NextResponse.json({ success: true, order: insertedOrder[0] });
  } catch (err) {
    console.error('Webhook execution crashed:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
