import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  if (typeof window === 'undefined') {
    // Seguro durante prerender — nunca executa no browser
    return null as never;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON!
  );
}