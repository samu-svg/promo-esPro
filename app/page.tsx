import { PromocoesList } from "@/components/promocoes-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Promocao } from "@/lib/types";

// Renderiza on-demand. Evita pre-render no build (que falharia caso as
// env vars do Supabase ainda não estejam cadastradas na Vercel).
export const dynamic = "force-dynamic";
export const revalidate = 60;

async function buscarPromocoes(): Promise<Promocao[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("promocoes")
    .select("*")
    .eq("aprovada", true)
    .order("criada_em", { ascending: false })
    .limit(120);

  if (error) {
    console.error("[promocoes] erro ao buscar:", error.message);
    return [];
  }
  return (data ?? []) as Promocao[];
}

export default async function HomePage() {
  const promocoes = await buscarPromocoes();

  return (
    <main className="mx-auto min-h-dvh max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-black text-white shadow-lg">
            P
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl">
              PromoçãoPro
            </h1>
            <p className="text-xs text-zinc-500 md:text-sm">
              Ofertas reais do Mercado Livre, curadas por IA.
            </p>
          </div>
        </div>
      </header>

      <PromocoesList promocoesIniciais={promocoes} />

      <footer className="mt-16 border-t border-zinc-200/70 pt-6 text-center text-xs text-zinc-400">
        <p>
          Os preços e a disponibilidade podem mudar a qualquer momento. Confira
          no site antes de comprar.
        </p>
        <p className="mt-1">
          Os links levam ao Mercado Livre e podem gerar comissão para o app.
        </p>
      </footer>
    </main>
  );
}
