import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint de diagnóstico: confirma que as env vars públicas chegaram
 * corretamente e que o cliente Supabase consegue contar linhas da
 * tabela `promocoes`.
 *
 * Não vaza segredos — `NEXT_PUBLIC_SUPABASE_URL` é público por design,
 * e o anon key NUNCA é retornado, apenas seu comprimento.
 */
export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        reason: "supabase_client_indisponivel",
        env: {
          url_presente: Boolean(rawUrl),
          url_tamanho: rawUrl?.length ?? 0,
          url_prefixo: rawUrl?.slice(0, 30) ?? null,
          key_presente: Boolean(rawKey),
          key_tamanho: rawKey?.length ?? 0,
        },
      },
      { status: 500 },
    );
  }

  const { count, error } = await supabase
    .from("promocoes")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        reason: "consulta_falhou",
        message: error.message,
        env: {
          url_presente: Boolean(rawUrl),
          url_tamanho: rawUrl?.length ?? 0,
          url_prefixo: rawUrl?.slice(0, 30) ?? null,
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    promocoes_aprovadas: count ?? 0,
    env: {
      url_presente: Boolean(rawUrl),
      url_tamanho: rawUrl?.length ?? 0,
      url_prefixo: rawUrl?.slice(0, 30) ?? null,
    },
  });
}
