"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function readEnv(value: string | undefined): string | null {
  if (!value) return null;
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "") || null;
}

function normalizeUrl(value: string): string {
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
 * Singleton do cliente Supabase para Client Components (Realtime).
 *
 * Retorna `null` quando as env vars estão ausentes/inválidas para que os
 * componentes apenas pulem a assinatura Realtime sem quebrar a página.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (_client) return _client;
  const rawUrl = readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!rawUrl || !key) {
    console.warn("[supabase/client] env vars ausentes — Realtime off.");
    return null;
  }
  const url = normalizeUrl(rawUrl);
  if (!isValidHttpUrl(url)) {
    console.error(`[supabase/client] URL inválida após sanitização: ${url}`);
    return null;
  }

  try {
    _client = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
    return _client;
  } catch (err) {
    console.error("[supabase/client] createClient falhou:", err);
    return null;
  }
}
