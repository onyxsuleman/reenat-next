import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utqweirxeimfolchyskv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6XCmyw3Zyi_xuno3lC0_Dw_yvHZgwjM';

export const supabase = createClient(supabaseUrl, supabaseKey);
