import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('cms_session')?.value;
    
    const body = await request.json();
    const { action, table, data, id, ids, eqCol = 'id', eqVal } = body;
    
    if (session !== 'unlocked_session_active' && table !== 'homepage_config') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = getSupabaseServerClient();

    // Special Relational Fetching for Orders — unified table with joins
    if (action === 'select' && table === 'orders') {
      try {
        const { data: ordersData, error: ordErr } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*),
            addresses:order_addresses(*),
            shipments:order_shipments(*)
          `)
          .order('created_at', { ascending: false });

        if (!ordErr && ordersData && ordersData.length > 0) {
          const mapped = ordersData.map(o => {
            const shipAddr = (o.addresses || []).find(a => a.address_type === 'shipping') || (o.addresses || [])[0] || {};
            const fullAddress = `${shipAddr.address_line1 || ''} ${shipAddr.address_line2 || ''}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pincode || ''}`.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
            const shipment = (o.shipments || [])[0] || {};

            const rawOrderId = o.fastrr_order_id || o.shiprocket_order_id || String(o.id);

            return {
              id: rawOrderId,
              dbId: o.legacy_order_ref || o.id,
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
              tax: 0,
              discount: Number(o.discount_amount || 0),
              total: Number(o.total_amount || 0),
              payment_method: (
                String(o.payment_method || '').toUpperCase().includes('PREPAID') || 
                String(o.payment_method || '').toUpperCase().includes('ONLINE') || 
                String(o.payment_method || '').toUpperCase().includes('UPI') || 
                String(o.payment_method || '').toUpperCase().includes('CARD') || 
                String(o.payment_method || '').toUpperCase().includes('PAYU') || 
                String(o.payment_gateway || '').toLowerCase().includes('payu') ||
                String(o.payment_gateway || '').toLowerCase().includes('razorpay') ||
                String(o.payment_gateway || '').toLowerCase().includes('cashfree') ||
                ['paid', 'captured', 'success', 'successful', 'completed', 'authorized'].includes(String(o.financial_status || '').toLowerCase())
              ) ? 'Prepaid' : 'COD',
              payment_status: o.financial_status || 'pending',
              order_status: o.order_status || 'Pending',
              courier_name: shipment.courier_name || '',
              awb_code: shipment.awb_code || '',
              tracking_url: shipment.tracking_url || '',
              created_at: o.created_at,
              items: (o.items || []).map(i => ({
                id: i.product_id || String(i.id),
                numericId: i.id,
                name: i.name_snapshot,
                qty: i.quantity,
                price: Number(i.unit_price || 0),
                color: i.color_snapshot || '',
                skuId: i.sku_snapshot || 'N/A'
              }))
            };
          });

          return NextResponse.json({ success: true, data: mapped });
        }
      } catch (normException) {
        console.warn('CMS DB proxy orders select error:', normException.message);
      }
    }
    
    // Auto-resolve and normalize products table payload
    if (table === 'products' && data && (action === 'insert' || action === 'update' || action === 'upsert')) {
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        // Normalize column renames:
        if (item.catalog_id && !item.catalog_code) {
          item.catalog_code = String(item.catalog_id).trim().toUpperCase().substring(0, 2);
          delete item.catalog_id;
        }
        if (item.catalog_code) {
          item.catalog_code = String(item.catalog_code).trim().toUpperCase().substring(0, 2);
        }
        if (item.styleid !== undefined && item.sku === undefined) {
          item.sku = item.styleid;
          delete item.styleid;
        }
        if (item.originalprice !== undefined && item.mrp === undefined) {
          item.mrp = item.originalprice ? Number(item.originalprice) : null;
          delete item.originalprice;
        }
        if (item.desc !== undefined && item.desc_text === undefined) {
          item.desc_text = item.desc;
          delete item.desc;
        }
        if (item.border !== undefined && item.border_type === undefined) {
          item.border_type = item.border;
          delete item.border;
        }

        // Auto-seed catalogs table to prevent FK constraint failures
        if (item.catalog_code && (action === 'insert' || action === 'upsert')) {
          try {
            const catCode = item.catalog_code;
            const { data: existingCat } = await supabase
              .from('catalogs')
              .select('catalog_code')
              .eq('catalog_code', catCode)
              .maybeSingle();

            if (!existingCat) {
              await supabase
                .from('catalogs')
                .insert({
                  catalog_code: catCode,
                  category_code: '9',
                  display_name: `Catalog ${catCode}`
                });
            }
          } catch (catErr) {
            console.warn('Auto catalog seeding notice:', catErr.message);
          }
        }

        // Auto-resolve collection_id for Shiprocket catalog sync
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

    // For products table, map eqCol 'id' to 'product_id' (new PK is text)
    let resolvedEqCol = eqCol;
    if (table === 'products' && eqCol === 'id') {
      resolvedEqCol = 'product_id';
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
      result = await supabase.from(table).update(data).eq(resolvedEqCol, eqVal !== undefined ? eqVal : id);

      // Sync order_status across related tables when status changes
      if (table === 'orders' && data && data.order_status) {
        // No cross-table sync needed — single unified orders table
      }
    } else if (action === 'delete') {
      if (ids) {
        result = await supabase.from(table).delete().in(resolvedEqCol, ids);
      } else {
        result = await supabase.from(table).delete().eq(resolvedEqCol, id);
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
