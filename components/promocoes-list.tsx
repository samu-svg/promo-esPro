"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryFilter, TODAS_AS_CATEGORIAS } from "@/components/category-filter";
import { PromocaoCard } from "@/components/promocao-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CATEGORIA_TODAS, type Promocao } from "@/lib/types";

type Props = { promocoesIniciais: Promocao[] };

export function PromocoesList({ promocoesIniciais }: Props) {
  const [promocoes, setPromocoes] = useState<Promocao[]>(promocoesIniciais);
  const [categoria, setCategoria] = useState<string>(CATEGORIA_TODAS);
  const [aoVivo, setAoVivo] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("promocoes-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "promocoes" }, (payload) => {
        const nova = payload.new as Promocao;
        if (!nova.aprovada) return;
        setPromocoes((prev) => (prev.some((p) => p.id === nova.id) ? prev : [nova, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "promocoes" }, (payload) => {
        const atualizada = payload.new as Promocao;
        setPromocoes((prev) =>
          atualizada.aprovada
            ? prev.map((p) => (p.id === atualizada.id ? atualizada : p))
            : prev.filter((p) => p.id !== atualizada.id),
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "promocoes" }, (payload) => {
        const removida = payload.old as Promocao;
        setPromocoes((prev) => prev.filter((p) => p.id !== removida.id));
      })
      .subscribe((status) => setAoVivo(status === "SUBSCRIBED"));

    return () => { void supabase.removeChannel(channel); };
  }, []);

  const contagemPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of TODAS_AS_CATEGORIAS) counts[cat] = 0;
    for (const p of promocoes) {
      if (p.categoria && counts[p.categoria] !== undefined) {
        counts[p.categoria] += 1;
      }
    }
    return counts;
  }, [promocoes]);

  const filtradas = useMemo(() => {
    if (categoria === CATEGORIA_TODAS) return promocoes;
    return promocoes.filter((p) => p.categoria === categoria);
  }, [promocoes, categoria]);

  return (
    <>
      {/* Barra de filtros sticky */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-zinc-200/70 bg-white/85 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h2 className="text-sm font-semibold text-zinc-500 md:text-base">
            <span className="text-zinc-900">{filtradas.length}</span>{" "}
            {filtradas.length === 1 ? "promoção" : "promoções"}
            {categoria !== CATEGORIA_TODAS && (
              <span className="text-orange-500"> em {categoria}</span>
            )}
          </h2>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500"
            aria-live="polite"
          >
            <span className={aoVivo ? "h-2 w-2 animate-pulse rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-zinc-300"} />
            {aoVivo ? "ao vivo" : "conectando..."}
          </span>
        </div>

        <CategoryFilter
          categorias={TODAS_AS_CATEGORIAS}
          selecionada={categoria}
          contagemPorCategoria={contagemPorCategoria}
          onSelect={setCategoria}
        />
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-sm font-medium text-zinc-600">
            Nenhuma promoção ativa nesta categoria.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Volte daqui a pouco — buscamos novas ofertas a cada 30 minutos.
          </p>
        </div>
      ) : (
        /* 1 col mobile → 2 tablet → 3 desktop → 4 wide */
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtradas.map((promo) => (
            <li key={promo.id} className="animate-fade-in">
              <PromocaoCard promo={promo} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
