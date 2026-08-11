import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('cms_session')?.value;
    
    if (session !== 'unlocked_session_active' && table !== 'homepage_config') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, table, data, id, ids, eqCol = 'id', eqVal } = body;
    
    const supabase = getSupabaseServerClient();

    // Special Relational Fetching for Orders to support 4-Table Schema & Legacy Table Seamlessly
    if (action === 'select' && (table === 'orders' || table === 'checkout_orders')) {
      try {
        const { data: normOrders, error: normErr } = await supabase
          .from('checkout_orders')
          .select(`
            *,
            items:checkout_order_items(*),
            addresses:checkout_order_addresses(*),
            shipments:checkout_shipments(*)
          `)
          .order('created_at', { ascending: false });

        if (!normErr && normOrders && normOrders.length > 0) {
          const mapped = normOrders.map(o => {
            const shipAddr = (o.addresses || []).find(a => a.address_type === 'shipping') || (o.addresses || [])[0] || {};
            const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
            const shipment = (o.shipments || [])[0] || {};

            const rawOrderId = o.fastrr_order_id || o.shiprocket_order_id || (o.legacy_id ? String(o.legacy_id) : String(o.id));

            return {
              id: rawOrderId,
              dbId: o.legacy_id || o.id,
              uuid: o.id,
              shiprocket_order_id: o.shiprocket_order_id || '',
              fastrr_order_id: o.fastrr_order_id || rawOrderId,
              customer_name: o.customer_name,
              email: o.customer_email,
              phone: o.customer_phone,
              address: fullAddress,
              shipping_line1: shipAddr.address_line1 || '',
              shipping_line2: shipAddr.address_line2 || '',
              shipping_city: shipAddr.city || '',
              shipping_state: shipAddr.state || '',
              shipping_pincode: shipAddr.pincode || '',
              subtotal: Number(o.sub_total || 0),
              tax: Number(o.tax_amount || 0),
              discount: Number(o.discount_amount || 0),
              total: Number(o.total_amount || 0),
              payment_method: (
                String(o.payment_method || '').toUpperCase().includes('PREPAID') || 
                String(o.payment_method || '').toUpperCase().includes('ONLINE') || 
                String(o.payment_method || '').toUpperCase().includes('UPI') || 
                String(o.payment_method || '').toUpperCase().includes('CARD') || 
                String(o.payment_method || '').toUpperCase().includes('PAYU') || 
                String(o.financial_status || '').toLowerCase() === 'paid'
              ) ? 'Prepaid' : 'COD',
              payment_status: o.financial_status || 'pending',
              order_status: o.order_status || 'Pending',
              courier_name: shipment.courier_name || '',
              awb_code: shipment.awb_code || '',
              tracking_url: shipment.tracking_url || '',
              created_at: o.created_at,
              items: (o.items || []).map(i => ({
                id: i.product_id ? `NSY${String(i.product_id).padStart(4, '0')}` : (i.id ? `NSY${String(i.id).replace(/\D/g, '').padStart(4, '0')}` : 'NSY0001'),
                numericId: i.product_id || i.id,
                name: i.product_name,
                qty: i.quantity,
                price: Number(i.unit_price || 0),
                image: i.image_url,
                color: i.color || '',
                skuId: i.sku || 'N/A'
              }))
            };
          });

          return NextResponse.json({ success: true, data: mapped });
        }
      } catch (normException) {
        console.warn('CMS DB proxy 4-table orders select fallback:', normException.message);
      }
    }
    
    // Auto-resolve collection_id for products table to ensure Shiprocket catalog sync works
    if (table === 'products' && data && (action === 'insert' || action === 'update' || action === 'upsert')) {
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.type && (item.collection_id === undefined || item.collection_id === null)) {
          const typeStr = String(item.type).trim();
          if (typeStr) {
            const { data: cols } = await supabase
              .from('collections')
              .select('id')
              .ilike('title', typeStr)
              .limit(1);

            if (cols && cols.length > 0) {
              item.collection_id = cols[0].id;
            } else {
              const handle = typeStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const { data: newCol } = await supabase
                .from('collections')
                .insert({
                  title: typeStr,
                  handle: handle,
                  body_html: `<p>Exquisite selection of handcrafted ${typeStr} sarees.</p>`
                })
                .select('id')
                .single();

              if (newCol) {
                item.collection_id = newCol.id;
              }
            }
          }
        }
      }
    }

    let result;
    
    if (action === 'select') {
      let query = supabase.from(table).select(data || '*');
      if (body.order) {
        query = query.order(body.order.column, { ascending: body.order.ascending });
      }
      result = await query;
    } else if (action === 'insert') {
      result = await supabase.from(table).insert(data).select();
    } else if (action === 'update') {
      result = await supabase.from(table).update(data).eq(eqCol, eqVal !== undefined ? eqVal : id);

      // Also update checkout_orders / orders synchronously when order_status changes
      if (data && data.order_status) {
        try {
          const statusToSet = data.order_status;
          const fId = body.fastrrOrderId || (typeof id === 'string' && id.startsWith('FAST') ? id : null);
          const sId = body.shiprocketOrderId || null;

          if (table === 'orders') {
            if (fId) await supabase.from('checkout_orders').update({ order_status: statusToSet }).eq('fastrr_order_id', fId);
            if (sId) await supabase.from('checkout_orders').update({ order_status: statusToSet }).eq('shiprocket_order_id', String(sId));
            if (id && !isNaN(Number(id))) await supabase.from('checkout_orders').update({ order_status: statusToSet }).eq('legacy_id', Number(id));
          } else if (table === 'checkout_orders') {
            if (fId) await supabase.from('orders').update({ order_status: statusToSet }).eq('fastrr_order_id', fId);
            if (sId) await supabase.from('orders').update({ order_status: statusToSet }).eq('shiprocket_order_id', String(sId));
            if (id && !isNaN(Number(id))) await supabase.from('orders').update({ order_status: statusToSet }).eq('id', Number(id));
          }
        } catch (uErr) {
          console.warn('Non-fatal order status cross-table sync error:', uErr.message);
        }
      }
    } else if (action === 'delete') {
      if (ids) {
        result = await supabase.from(table).delete().in(eqCol, ids);
      } else {
        result = await supabase.from(table).delete().eq(eqCol, id);
      }
    } else if (action === 'upsert') {
      const onConflictCol = body.onConflict || (table === 'homepage_config' ? 'key' : undefined);
      result = onConflictCol 
        ? await supabase.from(table).upsert(data, { onConflict: onConflictCol }).select()
        : await supabase.from(table).upsert(data).select();
    } else {
      return NextResponse.json({ error: 'Invalid DB action requested.' }, { status: 400 });
    }
    
    if (result.error) {
      console.error(`CMS DB proxy error [${action} on ${table}]:`, result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("CMS DB proxy exception:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
