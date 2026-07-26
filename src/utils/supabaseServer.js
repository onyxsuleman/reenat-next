import { createClient } from '@supabase/supabase-js';

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabasekong-k5c5eki60wb4hz51es45rv2b.200.97.166.100.sslip.io';
  // Use Service Role Key for admin backend queries to bypass RLS, fallback to Anon Key in local environment
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4MzcxOTM2MCwiZXhwIjo0OTM5MzkyOTYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.Y_XFn94-KVl9eH-1s5GCnmWyfMNol0lJajPe5aqD9Qo';
  
  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
}
