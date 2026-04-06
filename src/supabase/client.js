import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabaseClient() {
  if (_client) return _client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key || url.startsWith('your_') || key.startsWith('your_')) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }

  _client = createClient(url, key);
  return _client;
}
