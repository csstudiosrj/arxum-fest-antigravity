import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Suporta tanto o nome da variável que usamos no AXON Core quanto a que o outro modelo usou
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON || '';

// Cria a conexão clássica e à prova de falhas
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Mantemos essa função apenas para não quebrar as telas que já importaram ela
export const createClient = () => supabase;