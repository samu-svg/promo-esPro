"use client";

import Link from "next/link";

import { PromocaoCard } from "@/components/promocao-card";
import { useSavedStore } from "@/store/use-saved-store";

export function SavedList() {
  const { saved, toggle, isSaved, remove } = useSavedStore();

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-4xl" aria-hidden>
          🤍
        </p>
        <h2 className="mt-3 text-base font-semibold text-zinc-800">
          Nenhuma promoção salva ainda
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Toque no coração em qualquer oferta para salvar aqui.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
        >
          Ver promoções
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {saved.map((promo) => (
        <li key={promo.id} className="flex flex-col gap-1.5">
          <PromocaoCard promo={promo} salvo={isSaved(promo.id)} onToggleSalvo={toggle} />
          <button
            type="button"
            onClick={() => remove(promo.id)}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Remover
          </button>
        </li>
      ))}
    </ul>
  );
}
