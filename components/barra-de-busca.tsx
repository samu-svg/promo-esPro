"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { useBuscaInteligente } from "@/hooks/use-busca-inteligente";
import { fmtBRL } from "@/lib/format";
import type { Promocao } from "@/lib/types";

const SUGESTOES_RAPIDAS = ["celular", "notebook", "tv", "tênis", "fone", "tablet", "console", "streaming"];

type Props = {
  onSelecionarPromocao?: (promo: Promocao) => void;
};

export function BarraDeBusca({ onSelecionarPromocao }: Props) {
  const [texto, setTexto] = useState("");
  const [ativa, setAtiva] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { promocoes, carregando, erro, termosExpandidos, totalEncontrado, buscar, limpar } =
    useBuscaInteligente();

  useEffect(() => {
    if (!ativa) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAtiva(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setTexto("");
      limpar();
      setAtiva(false);
      inputRef.current?.blur();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [ativa, limpar]);

  function handleTexto(valor: string) {
    setTexto(valor);
    buscar(valor);
  }

  function handleLimpar() {
    setTexto("");
    limpar();
    inputRef.current?.focus();
  }

  function handleCancelar() {
    setTexto("");
    limpar();
    setAtiva(false);
    inputRef.current?.blur();
  }

  function handleSugestao(s: string) {
    setTexto(s);
    buscar(s);
  }

  function selecionarPromo(promo: Promocao) {
    if (onSelecionarPromocao) {
      onSelecionarPromocao(promo);
    } else {
      window.open(promo.link_afiliado, "_blank", "noopener,noreferrer");
    }
    handleCancelar();
  }

  const mostrarPainel = ativa && (texto.length >= 2 || texto.length === 0);
  const mostrarResultados = ativa && texto.length >= 2;
  const mostrarSugestoes = ativa && texto.length === 0;

  return (
    <div ref={containerRef} className="relative z-20 mb-6">
      <div className="flex items-center gap-2.5">
        <div
          className={clsx(
            "flex flex-1 items-center gap-2 rounded-xl border-2 bg-zinc-50 px-3 py-2.5 transition-colors",
            ativa ? "border-orange-500 bg-white" : "border-transparent",
          )}
        >
          <span className="text-base" aria-hidden>
            🔍
          </span>
          <input
            ref={inputRef}
            type="search"
            value={texto}
            onChange={(e) => handleTexto(e.target.value)}
            onFocus={() => setAtiva(true)}
            placeholder="Buscar promoções..."
            autoCapitalize="off"
            autoCorrect="off"
            className="min-w-0 flex-1 bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400"
            aria-label="Buscar promoções"
            aria-expanded={ativa}
            aria-controls="busca-painel"
          />
          {carregando && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"
              aria-label="Buscando"
            />
          )}
          {texto.length > 0 && !carregando && (
            <button
              type="button"
              onClick={handleLimpar}
              className="rounded p-0.5 text-sm font-semibold text-zinc-400 hover:text-zinc-600"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
        {ativa && (
          <button
            type="button"
            onClick={handleCancelar}
            className="shrink-0 text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            Cancelar
          </button>
        )}
      </div>

      {mostrarResultados && termosExpandidos.length > 1 && (
        <p className="mt-1 text-xs italic text-zinc-500">
          Buscando também: {termosExpandidos.slice(1, 5).join(", ")}
          {termosExpandidos.length > 5 ? "…" : ""}
        </p>
      )}

      {mostrarPainel && (
        <div
          id="busca-painel"
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg"
        >
          {erro && <p className="py-2 text-center text-sm text-red-600">{erro}</p>}

          {mostrarSugestoes && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Categorias populares
              </p>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {SUGESTOES_RAPIDAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSugestao(s)}
                    className="shrink-0 rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mostrarResultados && !carregando && (
            <>
              {totalEncontrado === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-3xl" aria-hidden>
                    🔎
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-800">
                    Nenhuma promoção encontrada para &ldquo;{texto}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Tente termos mais gerais como &ldquo;celular&rdquo; ou &ldquo;tv&rdquo;
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {totalEncontrado} promoções encontradas
                  </p>
                  <ul className="max-h-[min(24rem,60vh)] overflow-y-auto">
                    {promocoes.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => selecionarPromo(p)}
                          className="flex w-full items-center gap-2 border-b border-zinc-100 py-3 text-left last:border-0 hover:bg-orange-50/50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium text-zinc-900">{p.titulo}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {p.categoria && (
                                <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                                  {p.categoria}
                                </span>
                              )}
                              <span className="text-sm font-bold text-green-600">
                                {fmtBRL.format(p.preco_desconto)}
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 text-xl text-zinc-300" aria-hidden>
                            ›
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
