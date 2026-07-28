import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../utils/supabaseServer';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone parameter is required.' }, { status: 400 });
    }
    
    const supabase = getSupabaseServerClient();
    
    // Attempt 1: Query 4-Table Architecture (checkout_orders + items + addresses + shipments)
    try {
      let normQuery = supabase
        .from('checkout_orders')
        .select(`
          *,
          items:checkout_order_items(*),
          addresses:checkout_order_addresses(*),
          shipments:checkout_shipments(*)
        `)
        .order('created_at', { ascending: false });

      const normConditions = [];
      if (email) {
        normConditions.push(`customer_email.eq.${email.trim()}`);
      }
      if (phone) {
        normConditions.push(`customer_phone.eq.${phone.trim()}`);
        const clean = phone.replace(/\D/g, '');
        const tenDigit = clean.length > 10 ? clean.slice(-10) : clean;
        normConditions.push(`customer_phone.eq.${tenDigit}`);
        normConditions.push(`customer_phone.eq.+91${tenDigit}`);
        normConditions.push(`customer_phone.eq.91${tenDigit}`);
      }

      normQuery = normQuery.or(normConditions.join(','));
      const { data: normData, error: normErr } = await normQuery;

      if (!normErr && normData && normData.length > 0) {
        // Map 4-table relational structure into frontend component format
        const formattedOrders = normData.map(o => {
          const shipAddr = (o.addresses || []).find(a => a.address_type === 'shipping') || (o.addresses || [])[0] || {};
          const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();

          const shipment = (o.shipments || [])[0] || {};

          return {
            id: o.legacy_id || o.id,
            uuid: o.id,
            fastrr_order_id: o.fastrr_order_id,
            shiprocket_order_id: o.shiprocket_order_id,
            customer_name: o.customer_name,
            email: o.customer_email,
            phone: o.customer_phone,
            address: fullAddress,
            shipping_line1: shipAddr.address_line1 || '',
            shipping_line2: shipAddr.address_line2 || '',
            shipping_city: shipAddr.city || '',
            shipping_state: shipAddr.state || '',
            shipping_pincode: shipAddr.pincode || '',
            shipping_country: shipAddr.country || 'India',
            subtotal: Number(o.sub_total || 0),
            tax: Number(o.tax_amount || 0),
            discount: Number(o.discount_amount || 0),
            total: Number(o.total_amount || 0),
            payment_method: String(o.payment_method || '').toUpperCase() === 'PREPAID' ? 'Prepaid' : 'COD',
            payment_status: o.financial_status || 'pending',
            order_status: o.order_status || 'Pending',
            courier_name: shipment.courier_name || '',
            awb_code: shipment.awb_code || '',
            tracking_url: shipment.tracking_url || '',
            created_at: o.created_at,
            items: (o.items || []).map(i => ({
              id: i.product_id || i.id,
              name: i.product_name,
              qty: i.quantity,
              price: Number(i.unit_price || 0),
              image: i.image_url,
              color: i.color || '',
              skuId: i.sku || 'N/A'
            }))
          };
        });

        return NextResponse.json(formattedOrders);
      }
    } catch (normException) {
      console.warn('Normalized orders GET fetch fallback to legacy orders table:', normException.message);
    }

    // Attempt 2: Fallback to Legacy 'orders' Table
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    const conditions = [];
    if (email) {
      conditions.push(`email.eq.${email.trim()}`);
    }
    if (phone) {
      conditions.push(`phone.eq.${phone.trim()}`);
      const clean = phone.replace(/\D/g, '');
      const tenDigit = clean.length > 10 ? clean.slice(-10) : clean;
      conditions.push(`phone.eq.${tenDigit}`);
      conditions.push(`phone.eq.+91${tenDigit}`);
      conditions.push(`phone.eq.91${tenDigit}`);
    }
    
    query = query.or(conditions.join(','));
    const { data, error } = await query;
      
    if (error) {
      console.error("Fetch orders backend error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch orders backend exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
