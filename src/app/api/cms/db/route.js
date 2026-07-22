import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('cms_session')?.value;
    
    if (session !== 'unlocked_session_active') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action, table, data, id, ids, eqCol = 'id', eqVal } = body;
    
    const supabase = getSupabaseServerClient();
    
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
    } else if (action === 'delete') {
      if (ids) {
        result = await supabase.from(table).delete().in(eqCol, ids);
      } else {
        result = await supabase.from(table).delete().eq(eqCol, id);
      }
    } else if (action === 'upsert') {
      result = await supabase.from(table).upsert(data).select();
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
