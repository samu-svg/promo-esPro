"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Promocao } from "@/lib/types";

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Props = { promocoes: Promocao[] };

export function BannerRotativo({ promocoes }: Props) {
  const destaques = promocoes.slice(0, 5);
  const [atual, setAtual] = useState(0);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (destaques.length <= 1) return;
    const id = setInterval(() => {
      setSaindo(true);
      setTimeout(() => {
        setAtual((prev) => (prev + 1) % destaques.length);
        setSaindo(false);
      }, 280);
    }, 5000);
    return () => clearInterval(id);
  }, [destaques.length]);

  if (destaques.length === 0) return null;

  const promo = destaques[atual];
  const desconto = Math.round(promo.percentual_desconto);

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      <div
        className={`flex flex-col gap-4 p-5 transition-all duration-300 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
          saindo ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-zinc-50 sm:mx-0 sm:h-40 sm:w-40">
          {promo.foto_url ? (
            <Image
              src={promo.foto_url}
              alt={promo.titulo}
              fill
              sizes="160px"
              className="object-contain p-3"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
              sem imagem
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            -{desconto}%
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
            🔥 Oferta em destaque
          </span>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg">
            {promo.titulo}
          </h3>
          <div className="flex flex-wrap items-baseline gap-2 justify-center sm:justify-start">
            <span className="text-sm text-zinc-400 line-through">
              {fmt.format(promo.preco_original)}
            </span>
            <span className="text-2xl font-extrabold text-orange-500 sm:text-3xl">
              {fmt.format(promo.preco_desconto)}
            </span>
          </div>
          <a
            href={promo.link_afiliado}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-2 inline-flex items-center justify-center gap-2 self-center rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(249,115,22,0.35)] transition-all hover:bg-orange-400 hover:shadow-[0_0_26px_rgba(249,115,22,0.5)] sm:self-start"
          >
            Ver oferta →
          </a>
        </div>
      </div>

      {destaques.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-4">
          {destaques.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para oferta ${i + 1}`}
              onClick={() => setAtual(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === atual ? "w-6 bg-orange-500" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
