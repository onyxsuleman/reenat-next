/**
 * Test script to verify Meesho-style 3-pillar product resolution
 */
const { getSupabaseServerClient } = require('../src/utils/supabaseServer');

async function testResolution() {
  console.log('=== TESTING MEESHO-STYLE PRODUCT IDENTITY RESOLUTION ===');
  const supabase = getSupabaseServerClient();

  // Test cases: simulating incoming SKU strings from Fastrr webhook
  const testSkus = [
    'M3||B Green & Red Pai X13 - NSY0042',
    'Tussar R Brown X1 - NSY0076',
    'NSY0076',
    'M4||Black Gold Pai P1'
  ];

  for (const rawSku of testSkus) {
    let targetDbId = null;
    if (rawSku && rawSku.includes('NSY')) {
      const match = rawSku.match(/NSY(\d+)/i);
      if (match && match[1]) {
        targetDbId = parseInt(match[1], 10);
      }
    }

    let dbProduct = null;
    if (targetDbId) {
      const { data } = await supabase
        .from('products')
        .select('id, name, color, styleid, catalog_id')
        .eq('id', targetDbId)
        .maybeSingle();
      dbProduct = data;
    }

    if (!dbProduct && rawSku) {
      const { data } = await supabase
        .from('products')
        .select('id, name, color, styleid, catalog_id')
        .eq('styleid', rawSku)
        .maybeSingle();
      dbProduct = data;
    }

    if (dbProduct) {
      console.log(`✅ Incoming SKU: "${rawSku}" -> RESOLVED EXACT PRODUCT! ID: ${dbProduct.id} (NSY${String(dbProduct.id).padStart(4, '0')}), Catalog: ${dbProduct.catalog_id}, Color: ${dbProduct.color}, Name: "${dbProduct.name.substring(0, 45)}..."`);
    } else {
      console.log(`❌ Incoming SKU: "${rawSku}" -> No exact match found.`);
    }
  }
}

testResolution().catch(err => console.error('Test error:', err));
