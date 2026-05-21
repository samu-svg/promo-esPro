"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Cliente Supabase para Client Components (singleton — evita abrir
 * múltiplos sockets Realtime).
 *
 * Retorna `null` quando as env vars não estão presentes, permitindo que
 * os componentes degradem graciosamente em vez de quebrar a página.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn(
      "[supabase/client] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes — Realtime desabilitado.",
    );
    return null;
  }
  _client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return _client;
}
