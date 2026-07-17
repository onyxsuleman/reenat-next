import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let anonTest = 'NOT TESTED';
  let serviceTest = 'NOT TESTED';

  if (url && anonKey) {
    try {
      const client = createClient(url, anonKey);
      const { data, error } = await client.from('products').select('id').limit(1);
      if (error) {
        anonTest = `FAILED: ${error.message} (${error.details})`;
      } else {
        anonTest = `SUCCESS (Found ${data.length} products)`;
      }
    } catch (e) {
      anonTest = `ERROR: ${e.message}`;
    }
  }

  if (url && serviceRoleKey) {
    try {
      const client = createClient(url, serviceRoleKey);
      const { data, error } = await client.from('products').select('id').limit(1);
      if (error) {
        serviceTest = `FAILED: ${error.message} (${error.details})`;
      } else {
        serviceTest = `SUCCESS (Found ${data.length} products)`;
      }
    } catch (e) {
      serviceTest = `ERROR: ${e.message}`;
    }
  }

  return NextResponse.json({
    url,
    anonKeySnippet: anonKey ? `${anonKey.substring(0, 10)}...${anonKey.substring(anonKey.length - 10)}` : null,
    serviceRoleKeySnippet: serviceRoleKey ? `${serviceRoleKey.substring(0, 10)}...${serviceRoleKey.substring(serviceRoleKey.length - 10)}` : null,
    anonTest,
    serviceTest
  });
}
