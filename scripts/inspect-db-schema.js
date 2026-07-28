const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { createClient } = require('@supabase/supabase-js');

async function inspectSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Connecting to:", url);

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const schema = await res.json();
    console.log("Schema Keys:", Object.keys(schema));
    if (schema.definitions && schema.definitions.products) {
      console.log("Products Table Definition columns:");
      const productsDef = schema.definitions.products;
      const required = productsDef.required || [];
      for (const [colName, colInfo] of Object.entries(productsDef.properties)) {
        const isRequired = required.includes(colName);
        console.log(`- ${colName}: type=${colInfo.type}, format=${colInfo.format || ''}, required=${isRequired}`);
      }
    } else {
      console.log("No definitions found for products in schema.");
    }
  } catch (err) {
    console.error("Failed to fetch OpenAPI schema:", err.message);
  }
}

inspectSchema();
