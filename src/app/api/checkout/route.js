import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';

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
      paymentMethod, 
      captchaToken 
    } = body;

    // 1. Basic Field Validation
    if (!fullName || !email || !phone || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid checkout fields.' }, { status: 400 });
    }

    // 2. Cloudflare Turnstile CAPTCHA Validation (if configured)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && captchaToken) {
      try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: captchaToken,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 });
        }
      } catch (captchaErr) {
        console.error("CAPTCHA verification connection error:", captchaErr);
        // Fail-safe logic: log and proceed if Turnstile API itself is down, or return 400
        return NextResponse.json({ error: 'Verification service unreachable.' }, { status: 500 });
      }
    } else if (turnstileSecret && !captchaToken) {
      return NextResponse.json({ error: 'CAPTCHA verification token is missing.' }, { status: 400 });
    }

    // 3. Connect to Supabase
    const supabase = getSupabaseServerClient();

    // 4. Server-side Validation of Pricing and Stock levels
    let subtotal = 0;
    const verifiedOrderItems = [];
    const stockUpdates = [];

    for (const item of cart) {
      if (!item.id || String(item.id).startsWith('temp-')) {
        // Handle temp/mock products locally
        const mockPrice = Number(item.price) || 0;
        const qty = Number(item.qty) || 1;
        subtotal += mockPrice * qty;
        verifiedOrderItems.push({
          id: item.id,
          name: item.name,
          price: mockPrice,
          qty: qty,
          image: item.image,
          color: item.color || '',
          skuId: item.skuId || item.styleId || ''
        });
        continue;
      }

      // Fetch the product from Supabase to guarantee actual price and stock
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('id, name, price, stock_qty, image, styleid, catalog_id')
        .eq('id', item.id)
        .single();

      if (fetchErr || !product) {
        console.error(`Failed to fetch product ID ${item.id}:`, fetchErr);
        return NextResponse.json({ error: `Product '${item.name}' was not found in our catalog.` }, { status: 400 });
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
        id: product.id,
        name: product.name,
        price: dbPrice,
        qty: qty,
        image: product.image,
        color: item.color || '',
        skuId: product.styleid || ''
      });

      // Prepare stock update
      stockUpdates.push({
        id: product.id,
        new_stock: Math.max(0, dbStock - qty)
      });
    }

    // 5. Promo Discount Code Validation
    let discountRate = 0;
    if (promoCode && promoCode.trim().toUpperCase() === 'WELCOME10') {
      discountRate = 0.10;
    }
    const discountAmount = subtotal * discountRate;

    // 6. Tax and Total Calculations
    const taxRate = 0.08; // 8% sales tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discountAmount;

    // 7. Insert the Order
    const paymentStatus = paymentMethod === 'Pay Online' ? 'paid' : 'pending';
    const { data: order, error: insertErr } = await supabase
      .from('orders')
      .insert({
        customer_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        subtotal: Math.round(subtotal),
        tax: Math.round(tax),
        discount: Math.round(discountAmount),
        total: Math.round(total),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: 'Pending',
        items: verifiedOrderItems
      })
      .select();

    if (insertErr) {
      console.error("Database order insertion failed:", insertErr.message);
      return NextResponse.json({ error: 'Failed to record the order in our database.' }, { status: 500 });
    }

    // 8. Decrement Stock Levels
    for (const update of stockUpdates) {
      const { error: stockErr } = await supabase
        .from('products')
        .update({ stock_qty: update.new_stock })
        .eq('id', update.id);
      
      if (stockErr) {
        // Log stock decrement failures but don't crash checkout
        console.error(`Failed to update stock quantity for product ID ${update.id}:`, stockErr.message);
      }
    }

    return NextResponse.json({ success: true, order: order[0] });

  } catch (err) {
    console.error("Checkout route general exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
