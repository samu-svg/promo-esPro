"use client";

import clsx from "clsx";
import Image from "next/image";

import { ShareButton } from "@/components/share-button";
import { fmtBRL } from "@/lib/format";
import type { Promocao } from "@/lib/types";

function StarRating({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  const rounded = Math.round(rating * 10) / 10;
  return (
    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M9.05 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118L10 15.347l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.65 9.354c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.7-3.927z" />
      </svg>
      {rounded.toFixed(1)}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

type Props = {
  promo: Promocao;
  salvo?: boolean;
  onToggleSalvo?: (promo: Promocao) => void;
};

export function PromocaoCard({ promo, salvo = false, onToggleSalvo }: Props) {
  const desconto = Math.round(promo.percentual_desconto);
  const economia = promo.preco_original - promo.preco_desconto;

  function handleToggleSalvo() {
    onToggleSalvo?.(promo);
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        {promo.foto_url ? (
          <Image
            src={promo.foto_url}
            alt={promo.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            sem imagem
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white shadow">
          -{desconto}%
        </span>
        {promo.avaliacao != null && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 shadow backdrop-blur-sm">
            <StarRating rating={promo.avaliacao} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-zinc-900">
          {promo.titulo}
        </h3>

        {promo.descricao && (
          <p className="line-clamp-2 text-xs text-zinc-500">{promo.descricao}</p>
        )}

        <div className="mt-auto space-y-0.5">
          <p className="text-xs text-zinc-400 line-through">{fmtBRL.format(promo.preco_original)}</p>
          <p className="text-2xl font-extrabold tracking-tight text-orange-500">
            {fmtBRL.format(promo.preco_desconto)}
          </p>
          <p className="text-xs font-medium text-green-600">economize {fmtBRL.format(economia)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {promo.frete_gratis ? (
            <span className="text-xs font-medium text-green-600">Frete grátis</span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">
            <ShareButton promo={promo} />
            <button
              type="button"
              onClick={handleToggleSalvo}
              disabled={!onToggleSalvo}
              className={clsx(
                "flex min-h-6 min-w-6 items-center justify-center rounded-md p-1 transition-colors",
                salvo ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500 hover:bg-orange-100",
                !onToggleSalvo && "cursor-not-allowed opacity-50",
              )}
              aria-label={salvo ? "Remover dos salvos" : "Salvar promoção"}
              aria-pressed={salvo}
            >
              <HeartIcon filled={salvo} />
            </button>
          </div>
        </div>

        <a
          href={promo.link_afiliado}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-1 flex h-11 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-[0_0_14px_rgba(249,115,22,0.3)] transition-all duration-200 hover:bg-orange-400 hover:shadow-[0_0_22px_rgba(249,115,22,0.5)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Ver oferta →
        </a>
      </div>
    </article>
  );
}
