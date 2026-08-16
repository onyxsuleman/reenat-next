import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '../../utils/supabaseServer';
import ProductClient from './ProductClient';

// mapRawProduct mirrors the normalization done in AppContext.js so ProductClient
// receives the same camelCase-fielded objects it was already built around.
function mapRawProduct(raw) {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    color: raw.color,
    price: Number(raw.price) || 0,
    originalPrice: Number(raw.originalprice || raw.originalPrice) || 0,
    image: raw.image || '/saree_kanjivaram.png',
    image2: raw.image2 || '',
    image3: raw.image3 || '',
    image4: raw.image4 || '',
    image5: raw.image5 || '',
    image6: raw.image6 || '',
    videoUrl: raw.video_url || raw.videoUrl || '',
    stockQty: raw.stock_qty !== undefined ? raw.stock_qty : (raw.stockQty || 50),
    origin: raw.origin || 'India',
    craft: raw.craft || 'Handloom',
    desc: raw.desc || '',
    gst: raw.gst || '5',
    hsn: raw.hsn || '520811',
    weight: raw.weight || 450,
    styleId: raw.styleid || raw.styleId || '',
    styleid: raw.styleid || raw.styleId || '',
    skuId: raw.styleid || raw.styleId || '',
    blouseLen: raw.blouselen || raw.blouseLen || '0.8',
    sareeLen: raw.sareelen || raw.sareeLen || '5.5',
    blouseType: raw.blousetype || raw.blouseType || 'Zari Woven',
    blouseColor: raw.blousecolor || raw.blouseColor || '',
    transparency: raw.transparency || 'No',
    fabric: raw.fabric || 'Cotton Silk',
    border: raw.border || 'Zari',
    occasion: raw.occasion || 'Traditional',
    loom: raw.loom || 'Handloom',
    brand: raw.brand || 'REENAT TRENDS',
    linkedTo: raw.linked_to || raw.linkedTo || '',
    linked_to: raw.linked_to || raw.linkedTo || '',
    catalogId: raw.catalog_id || raw.catalogId || '',
    catalog_id: raw.catalog_id || raw.catalogId || '',
    rating: Number(raw.rating) || 4.5,
  };
}

// Resolve a numeric DB row ID from the NSY-prefixed product URL param.
// Accepts both "NSY0042" and raw numeric strings.
function resolveNumericId(idParam) {
  if (!idParam) return null;
  const cleaned = String(idParam).replace(/^NSY0*/i, '').replace(/^0+/, '') || '0';
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const idParam = params?.id;
  const numId = resolveNumericId(idParam);
  if (!numId) return { title: 'Product Not Found | Reenat Trends' };

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from('products')
      .select('name, color, type, craft, image')
      .eq('id', numId)
      .single();

    if (!data) return { title: 'Product Not Found | Reenat Trends' };

    const title = `${data.name} | Reenat Trends`;
    const description = `Shop ${data.color || ''} ${data.type || 'saree'} handcrafted with ${data.craft || 'traditional handloom'} techniques. Free shipping & 7-day returns.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: data.image ? [{ url: data.image, width: 800, height: 1067 }] : [],
      },
    };
  } catch {
    return { title: 'Saree Details | Reenat Trends' };
  }
}

export default async function ProductDetailsPage({ searchParams }) {
  const params = await searchParams;
  const idParam = params?.id;
  const numId = resolveNumericId(idParam);

  if (!numId) notFound();

  const supabase = getSupabaseServerClient();

  // 1. Fetch the requested product
  const { data: rawProduct, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', numId)
    .single();

  if (productError || !rawProduct) notFound();

  const product = mapRawProduct(rawProduct);
  const catalogId = product.catalogId || '';

  // 2. Fetch all products in the same catalog group (color variants).
  //    Fall back to just the current product if no catalogId is set.
  let colorVariants = [product];
  if (catalogId) {
    const { data: variantRows } = await supabase
      .from('products')
      .select('*')
      .eq('catalog_id', catalogId)
      .order('id', { ascending: true });

    if (variantRows && variantRows.length > 0) {
      // De-duplicate by id (safety guard for linked_to variants)
      const seen = new Set();
      colorVariants = variantRows
        .map(mapRawProduct)
        .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
    }
  }

  // 3. Fetch recommended products — different catalogs, limit 30.
  //    Exclude current catalog to prevent duplicates.
  let recommended = [];
  try {
    const { data: allProducts } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })
      .limit(200);

    if (allProducts && allProducts.length > 0) {
      const seenCatalogs = new Set();
      if (catalogId) seenCatalogs.add(catalogId.toLowerCase());

      recommended = allProducts
        .map(mapRawProduct)
        .filter(p => {
          if (String(p.id) === String(product.id)) return false;
          const cid = p.catalogId ? p.catalogId.toLowerCase() : '';
          if (cid && seenCatalogs.has(cid)) return false;
          if (cid) seenCatalogs.add(cid);
          return true;
        })
        .slice(0, 30);
    }
  } catch (err) {
    console.warn('[product/page.js] Failed to fetch recommended products:', err.message);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <ProductClient
        product={product}
        colorVariants={colorVariants}
        recommended={recommended}
      />
    </div>
  );
}
