import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

export async function GET(request) {
  try {
    // 1. Verify Authorization
    const apiKeyHeader = request.headers.get('x-api-key') || '';
    const cleanKey = apiKeyHeader.replace('Bearer ', '').trim();
    const expectedKey = process.env.SHIPROCKET_API_KEY;

    if (!expectedKey || cleanKey !== expectedKey) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing X-Api-Key' },
        { status: 511 }
      );
    }

    // 2. Parse Query Params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '100', 10));

    // 3. Fetch collections directly from Supabase
    const supabase = getSupabaseServerClient();
    const { data: dbCollections, error } = await supabase
      .from('collections')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 4. Format to Shiprocket Collections schema
    const formattedCollections = dbCollections.map(collection => ({
      id: collection.id,
      title: collection.title,
      handle: collection.handle,
      body_html: collection.body_html || `<p>Exquisite selection of handcrafted ${collection.title} sarees.</p>`,
      updated_at: collection.created_at || new Date().toISOString(),
      created_at: collection.created_at || new Date().toISOString(),
      image: collection.image_url ? { src: collection.image_url } : null
    }));

    // 5. Paginate results
    const total = formattedCollections.length;
    const startIndex = (page - 1) * limit;
    const paginatedCollections = formattedCollections.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: {
        total: total,
        collections: paginatedCollections
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
