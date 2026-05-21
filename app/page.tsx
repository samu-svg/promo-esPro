import { BannerRotativo } from "@/components/banner-rotativo";
import { PromocoesList } from "@/components/promocoes-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Promocao } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function buscarPromocoes(): Promise<Promocao[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("aprovada", true)
    .order("percentual_desconto", { ascending: false })
    .limit(120);

  if (error) {
    console.error("[promocoes] erro ao buscar:", error.message);
    return [];
  }
  return (data ?? []) as Promocao[];
}

function UpdateTime() {
  const agora = new Date();
  return (
    <time dateTime={agora.toISOString()}>
      {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      {" – "}
      {agora.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
    </time>
  );
}

export default async function HomePage() {
  const promocoes = await buscarPromocoes();

  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-10">

        {/* Header */}
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-xl font-black text-white shadow-[0_0_20px_rgba(249,115,22,0.35)]">
                <span>P</span>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-orange-400/30" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl">
                  PromoçãoPro
                </h1>
                <p className="text-xs text-zinc-500 md:text-sm">
                  Ofertas reais do Mercado Livre, curadas por IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-orange-500/20 bg-orange-50 px-4 py-2 sm:self-auto">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="text-sm font-semibold text-orange-600">
                {promocoes.length}{" "}
                {promocoes.length === 1 ? "promoção" : "promoções"} disponíveis
              </span>
            </div>
          </div>
        </header>

        {/* Banner rotativo com as 5 maiores promoções */}
        <BannerRotativo promocoes={promocoes.slice(0, 5)} />

        {/* Grade de promoções com filtro por categoria */}
        <PromocoesList promocoesIniciais={promocoes} />

        {/* Rodapé */}
        <footer className="mt-16 border-t border-zinc-200 pt-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-zinc-400"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Última atualização: <UpdateTime /></span>
            </div>
            <p className="text-xs text-zinc-500">
              Os preços e a disponibilidade podem mudar a qualquer momento. Confira no site antes de comprar.
            </p>
            <p className="text-xs text-zinc-500">
              Os links levam ao Mercado Livre e podem gerar comissão para o app.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
