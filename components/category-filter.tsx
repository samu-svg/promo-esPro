"use client";

import clsx from "clsx";

import { CATEGORIA_TODAS } from "@/lib/types";

type Props = {
  categorias: string[];
  selecionada: string;
  onSelect: (categoria: string) => void;
};

const ICONES_CATEGORIAS: Record<string, string> = {
  Todas:             "🏷️",
  Tecnologia:        "💻",
  "Roupas e Moda":   "👕",
  Calçados:          "👟",
  "Casa e Decoração":"🏠",
  Eletrodomésticos:  "🔌",
  Beleza:            "💄",
  Esportes:          "⚽",
  Brinquedos:        "🧸",
  Alimentos:         "🍎",
  Livros:            "📚",
  Automotivo:        "🚗",
};

function getIcone(categoria: string): string {
  return ICONES_CATEGORIAS[categoria] ?? "🛍️";
}

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
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 md:text-sm",
              ativa
                ? "border-orange-500 bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-orange-500/40 hover:bg-orange-50 hover:text-zinc-900",
            )}
          >
            <span role="img" aria-label={cat} className="text-sm">
              {getIcone(cat)}
            </span>
            {cat}
          </button>
        );
      })}
    </div>
  );
}
