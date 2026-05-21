import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso em Server Components / Route Handlers.
 * Como o front-end é somente leitura e a RLS já filtra `aprovada=true`,
 * podemos usar o cliente direto com a chave publishable, sem cookies.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes no .env.local",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
