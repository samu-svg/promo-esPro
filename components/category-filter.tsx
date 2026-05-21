"use client";

import clsx from "clsx";

import { CATEGORIA_TODAS } from "@/lib/types";

type Props = {
  categorias: string[];
  selecionada: string;
  onSelect: (categoria: string) => void;
};

export function CategoryFilter({ categorias, selecionada, onSelect }: Props) {
  const lista = [CATEGORIA_TODAS, ...categorias];
  return (
    <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:flex-wrap md:overflow-visible md:px-0">
      {lista.map((cat) => {
        const ativa = cat === selecionada;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={clsx(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all md:text-sm",
              ativa
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
