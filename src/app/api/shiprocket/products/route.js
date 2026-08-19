import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../../utils/supabaseServer';

// Helper to hash any string consistently into a unique positive integer (fallback for standalones)
function getNumericId(str) {
  if (!str) return 0;
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

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
    const collectionId = searchParams.get('collection_id');

    // 3. Fetch all products from Supabase (new schema: product_id PK)
    const supabase = getSupabaseServerClient();
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .order('product_id', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 4. Handle Collection Filtering directly using the database column
    const filteredDbProducts = collectionId
      ? dbProducts.filter(p => String(p.collection_id) === String(collectionId))
      : dbProducts;

    // 5. Group products by catalog_code (was catalog_id)
    const productsMap = {};
    for (const row of filteredDbProducts) {
      const groupKey = row.catalog_code && row.catalog_code.trim() !== ''
        ? row.catalog_code.trim()
        : `standalone_${row.product_id}`;
      
      if (!productsMap[groupKey]) {
        productsMap[groupKey] = [];
      }
      productsMap[groupKey].push(row);
    }

    // 6. Format products to Shiprocket JSON schema
    const formattedProducts = [];
    for (const [groupKey, variants] of Object.entries(productsMap)) {
      const mainVariant = variants.find(v => !v.linked_to) || variants[0];
      const productId = getNumericId(groupKey);
      
      const title = mainVariant.name || 'Reenat Saree';
      const handle = (mainVariant.name || 'saree')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Combine descriptive attributes as tags
      const tagsList = [];
      if (mainVariant.type) tagsList.push(mainVariant.type);
      if (mainVariant.craft) tagsList.push(mainVariant.craft);
      if (mainVariant.occasion) tagsList.push(mainVariant.occasion);
      if (mainVariant.fabric) tagsList.push(mainVariant.fabric);
      if (mainVariant.loom) tagsList.push(mainVariant.loom);
      const tags = tagsList.join(', ');

      const fallbackImage = 'https://www.reenattrends.com/saree_kanjivaram.png';

      const formattedVariants = variants.map(v => {
        let dbWeight = parseFloat(v.weight || '0.85'); // default 850g if empty
        let weightKg;
        let grams;
        if (dbWeight > 10) {
          // Stored in grams (e.g., 450)
          weightKg = dbWeight / 1000;
          grams = Math.round(dbWeight);
        } else {
          // Stored in kg (e.g., 0.45)
          weightKg = dbWeight;
          grams = Math.round(dbWeight * 1000);
        }
        
        let rawVariantImage = v.image || '';
        let variantImage = '';

        if (rawVariantImage) {
          if (rawVariantImage.startsWith('/')) {
            variantImage = `https://www.reenattrends.com${rawVariantImage}`;
          } else if (rawVariantImage.startsWith('http://') || rawVariantImage.startsWith('https://')) {
            if (rawVariantImage.includes('localhost') || rawVariantImage.includes('127.0.0.1')) {
              variantImage = fallbackImage;
            } else if (rawVariantImage.includes('.sslip.io') || rawVariantImage.includes('supabasekong')) {
              variantImage = `https://www.reenattrends.com/api/image-proxy?url=${encodeURIComponent(rawVariantImage)}`;
            } else {
              variantImage = rawVariantImage;
            }
          }
        }

        if (!variantImage) {
          variantImage = fallbackImage;
        }

        return {
          id: v.product_id,
          title: v.color || 'Default',
          price: parseFloat(v.price || '0').toFixed(2),
          compare_at_price: v.mrp ? parseFloat(v.mrp).toFixed(2) : null,
          sku: v.sku || v.product_id,
          quantity: parseInt(v.stock_qty !== undefined ? v.stock_qty : 10, 10),
          created_at: v.created_at || new Date().toISOString(),
          updated_at: v.updated_at || v.created_at || new Date().toISOString(),
          taxable: true,
          option_values: {
            Color: v.color || 'Default'
          },
          grams: grams,
          weight: weightKg,
          weight_unit: 'kg',
          image: {
            src: variantImage
          }
        };
      });

      const optionColors = Array.from(new Set(variants.map(v => v.color || 'Default')));

      let mainImage = mainVariant.image || '';
      if (mainImage.startsWith('/')) {
        mainImage = `https://www.reenattrends.com${mainImage}`;
      } else if (mainImage.includes('.sslip.io') || mainImage.includes('supabasekong')) {
        mainImage = `https://www.reenattrends.com/api/image-proxy?url=${encodeURIComponent(mainImage)}`;
      } else if (!mainImage || mainImage.includes('localhost') || mainImage.includes('127.0.0.1')) {
        mainImage = fallbackImage;
      }

      formattedProducts.push({
        id: productId,
        title: title,
        body_html: `<p>${mainVariant.desc_text || ''}</p>`,
        vendor: mainVariant.brand || 'REENAT TRENDS',
        product_type: mainVariant.type || 'Saree',
        created_at: mainVariant.created_at || new Date().toISOString(),
        updated_at: mainVariant.updated_at || mainVariant.created_at || new Date().toISOString(),
        handle: handle,
        tags: tags,
        status: 'active',
        variants: formattedVariants,
        image: {
          src: mainImage
        },
        options: [
          {
            name: 'Color',
            values: optionColors
          }
        ]
      });
    }

    // 7. Paginate results
    const total = formattedProducts.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = formattedProducts.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: {
        total: total,
        products: paginatedProducts
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
