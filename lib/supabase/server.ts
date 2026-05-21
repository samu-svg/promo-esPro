import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para Server Components / Route Handlers.
 *
 * Retorna `null` se as env vars não estiverem definidas, em vez de lançar
 * exceção — isso permite que o build prossiga em ambientes ainda sem
 * configuração (ex: primeiro deploy na Vercel antes de cadastrar
 * `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn(
      "[supabase/server] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes — retornando null.",
    );
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
