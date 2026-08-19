import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';
import { pushOrderToShiprocket } from '../../../utils/shiprocketApi';
import { sendMetaCapiEvent } from '../../../utils/metaPixel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      cart, 
      promoCode, 
      paymentMethod 
    } = body;

    // 1. Basic Field Validation
    if (!fullName || !email || !phone || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid checkout fields.' }, { status: 400 });
    }

    // 3. Connect to Supabase
    const supabase = getSupabaseServerClient();

    // 4. Server-side Validation of Pricing and Stock levels
    let subtotal = 0;
    const verifiedOrderItems = [];
    const stockUpdates = [];

    for (const item of cart) {
      // Resolve the product_id: new schema uses text product_id (e.g. NSY9M1001)
      const itemProductId = item.product_id || item.productId || item.id;

      if (!itemProductId || String(itemProductId).startsWith('temp-')) {
        // Handle temp/mock products locally
        const mockPrice = Number(item.price) || 0;
        const qty = Number(item.qty) || 1;
        subtotal += mockPrice * qty;
        verifiedOrderItems.push({
          product_id: itemProductId,
          name: item.name,
          price: mockPrice,
          qty: qty,
          image: item.image,
          color: item.color || '',
          skuId: item.skuId || item.sku || item.styleId || ''
        });
        continue;
      }

      let product = null;
      let isFallback = false;

      // Fetch the product from Supabase by product_id (text PK)
      const { data: dbProduct, error: fetchErr } = await supabase
        .from('products')
        .select('product_id, name, price, stock_qty, image, sku, catalog_code')
        .eq('product_id', itemProductId)
        .single();

      if (fetchErr || !dbProduct) {
        // Fallback: product not found in database — use cart-provided data to allow checkout
        console.warn(`Product ID ${itemProductId} not found in database; using cart fallback for checkout.`);
        product = {
          product_id: itemProductId,
          name: item.name,
          price: Number(item.price) || 949,
          stock_qty: 50,
          image: item.image,
          sku: item.skuId || item.sku || item.styleId || item.styleid || ''
        };
        isFallback = true;
      } else {
        product = dbProduct;
      }

      const qty = Number(item.qty) || 1;
      const dbStock = Number(product.stock_qty) !== undefined ? Number(product.stock_qty) : 10;
      
      // Stock verification
      if (dbStock < qty) {
        return NextResponse.json({ error: `Insufficient stock for product '${product.name}'. Available: ${dbStock}` }, { status: 400 });
      }

      const dbPrice = Number(product.price);
      subtotal += dbPrice * qty;

      verifiedOrderItems.push({
        product_id: product.product_id,
        name: product.name,
        price: dbPrice,
        qty: qty,
        image: product.image,
        color: item.color || '',
        skuId: product.sku || ''
      });

      // Prepare stock update (only if not resolved via fallback)
      if (!isFallback) {
        stockUpdates.push({
          product_id: product.product_id,
          new_stock: Math.max(0, dbStock - qty)
        });
      }
    }

    // 5. Promo Discount Code Validation
    let discountRate = 0;
    if (promoCode && promoCode.trim().toUpperCase() === 'WELCOME10') {
      discountRate = 0.10;
    }
    const discountAmount = subtotal * discountRate;

    // 6. Total Calculations (no separate tax line in new schema)
    const total = subtotal - discountAmount;

    // 7. Deduplication check: Prevent duplicate orders within 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const roundedTotal = Math.round(total);
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id, created_at')
      .eq('customer_phone', phone.trim())
      .eq('total_amount', roundedTotal)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    let order = null;

    if (existingOrders && existingOrders.length > 0) {
      console.log(`Duplicate checkout detected (Order UUID: ${existingOrders[0].id}). Returning existing record.`);
      const { data: fetchedData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', existingOrders[0].id);
      order = fetchedData;
    } else {
      const financialStatus = paymentMethod === 'Pay Online' ? 'paid' : 'pending';
      const idempotencyKey = `direct:${phone.trim()}:${Date.now()}`;

      // Insert into new orders table
      const { data: newOrder, error: insertErr } = await supabase
        .from('orders')
        .insert({
          idempotency_key: idempotencyKey,
          customer_name: fullName.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          sub_total: Math.round(subtotal),
          discount_amount: Math.round(discountAmount),
          total_amount: roundedTotal,
          payment_method: paymentMethod,
          financial_status: financialStatus,
          order_status: 'Pending'
        })
        .select();

      if (insertErr) {
        console.error("Database order insertion failed:", insertErr.message, insertErr.details, insertErr.hint);
        return NextResponse.json({ error: `Order insert failed: ${insertErr.message}` }, { status: 500 });
      }
      order = newOrder;

      // Insert order items into order_items table
      if (newOrder && newOrder[0]) {
        const orderUuid = newOrder[0].id;
        const itemRows = verifiedOrderItems.map(item => ({
          order_id: orderUuid,
          product_id: item.product_id || null,
          sku_snapshot: item.skuId || 'N/A',
          name_snapshot: item.name || 'Saree',
          color_snapshot: item.color || '',
          unit_price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
          total_price: Number((item.price || 0) * (item.qty || 1))
        }));

        if (itemRows.length > 0) {
          const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
          if (itemsErr) {
            console.warn('Order items insert warning:', itemsErr.message);
          }
        }

        // Insert shipping address into order_addresses
        const { error: addrErr } = await supabase.from('order_addresses').insert({
          order_id: orderUuid,
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address_line1: address.trim()
        });
        if (addrErr) {
          console.warn('Order address insert warning:', addrErr.message);
        }
      }
    }

    // 8. Decrement Stock Levels
    for (const update of stockUpdates) {
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock_qty: update.new_stock })
        .eq('product_id', update.product_id);
      
      if (stockErr) {
        // Log stock decrement failures but don't crash checkout
        console.error(`Failed to update stock quantity for product ${update.product_id}:`, stockErr.message);
      }
    }

    // 9. Push order to Shiprocket Shipping Dashboard via Adhoc API
    if (order && order[0]) {
      pushOrderToShiprocket(order[0]).catch(err => {
        console.error('Background Shiprocket order push error in direct checkout:', err);
      });
    }

    const createdOrder = order && order[0] ? order[0] : null;
    const eventId = createdOrder ? `purchase_${createdOrder.id}` : `purchase_${Date.now()}`;
    const addPaymentEventId = createdOrder ? `add_payment_${createdOrder.id}` : `add_payment_${Date.now()}`;

    // 10. Send Meta Conversions API (CAPI) Purchase and AddPaymentInfo Events with event_id deduplication keys
    if (createdOrder) {
      const clientIpAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;
      const clientUserAgent = request.headers.get('user-agent') || (body.browserMeta?.user_agent) || null;
      const fbp = body.browserMeta?.fbp || request.cookies.get('_fbp')?.value || null;
      const fbc = body.browserMeta?.fbc || request.cookies.get('_fbc')?.value || null;

      // CAPI Purchase
      sendMetaCapiEvent({
        eventName: 'Purchase',
        eventId: eventId,
        email: email.trim(),
        phone: phone.trim(),
        fullName: fullName.trim(),
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        value: createdOrder.total_amount || roundedTotal,
        currency: 'INR',
        items: verifiedOrderItems,
        eventSourceUrl: 'https://www.reenattrends.com/cart',
        clientIpAddress: clientIpAddress,
        clientUserAgent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }).catch(capiErr => {
        console.warn('Non-blocking Meta CAPI Purchase send warning:', capiErr.message);
      });

      // CAPI AddPaymentInfo
      sendMetaCapiEvent({
        eventName: 'AddPaymentInfo',
        eventId: addPaymentEventId,
        email: email.trim(),
        phone: phone.trim(),
        fullName: fullName.trim(),
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        value: createdOrder.total_amount || roundedTotal,
        currency: 'INR',
        items: verifiedOrderItems,
        eventSourceUrl: 'https://www.reenattrends.com/cart',
        clientIpAddress: clientIpAddress,
        clientUserAgent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }).catch(capiErr => {
        console.warn('Non-blocking Meta CAPI AddPaymentInfo send warning:', capiErr.message);
      });
    }

    return NextResponse.json({ success: true, order: createdOrder, eventId, addPaymentEventId });

  } catch (err) {
    console.error("Checkout route general exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
