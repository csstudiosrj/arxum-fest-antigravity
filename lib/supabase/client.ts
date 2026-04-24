import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON;
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // No SSR build, não tentamos criar o cliente Supabase.
    return null as unknown as SupabaseClient;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase environment variables are required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
};

// Mantemos essa função apenas para não quebrar as telas que já importaram ela
export const createClient = getSupabaseClient;