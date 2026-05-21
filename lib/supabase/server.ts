import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readEnv(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  // Remove whitespace, aspas externas (paste acidental) e barra final.
  return raw.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "") || null;
}

function normalizeUrl(value: string): string {
  // Auto-prefixa https:// se o usuário tiver colado sem o esquema.
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Cliente Supabase para Server Components / Route Handlers.
 *
 * Devolve `null` em vez de lançar quando as env vars estão ausentes ou
 * inválidas — assim a página degrada graciosamente em vez de retornar 500.
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const rawUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!rawUrl || !key) {
    console.warn(
      "[supabase/server] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes.",
    );
    return null;
  }
  const url = normalizeUrl(rawUrl);
  if (!isValidHttpUrl(url)) {
    console.error(
      `[supabase/server] URL inválida após sanitização: ${JSON.stringify(url)} (origem=${JSON.stringify(rawUrl)})`,
    );
    return null;
  }

  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (err) {
    console.error("[supabase/server] createClient falhou:", err);
    return null;
  }
}
