"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { CountdownTimer } from "@/components/countdown-timer";
import { ShareButton } from "@/components/share-button";
import { fmtBRL } from "@/lib/format";
import type { Promocao } from "@/lib/types";

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

      <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-2 sm:px-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-orange-500" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
        <span className="text-xs font-medium text-orange-800">Melhor oferta do dia</span>
        {promo.expires_at && (
          <>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-orange-800">
              expira em{" "}
              <CountdownTimer expiresAt={promo.expires_at} className="font-semibold" />
            </span>
          </>
        )}
        <span className="flex-1" />
        <ShareButton promo={promo} />
      </div>

      <div
        className={`flex flex-col gap-4 p-5 transition-all duration-300 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
          saindo ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
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
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
              sem imagem
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            -{desconto}%
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 sm:text-lg">
            {promo.titulo}
          </h3>
          {promo.frete_gratis && (
            <span className="self-center text-xs font-medium text-green-600 sm:self-start">
              Frete grátis
            </span>
          )}
          <div className="flex flex-wrap items-baseline justify-center gap-2 sm:justify-start">
            <span className="text-sm text-zinc-400 line-through">
              {fmtBRL.format(promo.preco_original)}
            </span>
            <span className="text-2xl font-extrabold text-orange-500 sm:text-3xl">
              {fmtBRL.format(promo.preco_desconto)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <a
              href={promo.link_afiliado}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(249,115,22,0.35)] transition-all hover:bg-orange-400 hover:shadow-[0_0_26px_rgba(249,115,22,0.5)]"
            >
              Ver oferta →
            </a>
            <ShareButton promo={promo} variant="pill" />
          </div>
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
