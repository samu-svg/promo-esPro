import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env (veja .env.example)"
  );
}

/** Cliente público (anon/publishable) — use no app com RLS ativo nas tabelas. */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
