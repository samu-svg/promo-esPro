"use client";

import clsx from "clsx";

import { CATEGORIA_TODAS, ICONES_CATEGORIA, TODAS_AS_CATEGORIAS } from "@/lib/types";

export { TODAS_AS_CATEGORIAS };

type Props = {
  categorias: readonly string[];
  selecionada: string;
  contagemPorCategoria: Record<string, number>;
  onSelect: (categoria: string) => void;
};

export function CategoryFilter({
  categorias,
  selecionada,
  contagemPorCategoria,
  onSelect,
}: Props) {
  const lista = [CATEGORIA_TODAS, ...categorias];

  return (
    <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:flex-wrap md:overflow-visible md:px-0">
      {lista.map((cat) => {
        const ativa = cat === selecionada;
        const qtd = cat === CATEGORIA_TODAS
          ? Object.values(contagemPorCategoria).reduce((a, b) => a + b, 0)
          : (contagemPorCategoria[cat] ?? 0);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 md:text-sm",
              ativa
                ? "border-orange-500 bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-orange-400/50 hover:bg-orange-50 hover:text-zinc-900",
            )}
          >
            <span role="img" aria-label={cat} className="text-sm leading-none">
              {ICONES_CATEGORIA[cat] ?? "🛍️"}
            </span>
            <span>{cat}</span>
            {qtd > 0 && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  ativa ? "bg-white/25 text-white" : "bg-zinc-100 text-zinc-500",
                )}
              >
                {qtd}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
