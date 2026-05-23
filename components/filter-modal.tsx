"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

import { useModalDialog } from "@/hooks/use-modal-dialog";

import { fmtBRL } from "@/lib/format";
import {
  DESCONTO_MAX_PADRAO,
  PRECO_MAX_PADRAO,
  PRECO_MIN_PADRAO,
  resetFiltrosModal,
} from "@/lib/filters";
import { ICONES_CATEGORIA, TODAS_AS_CATEGORIAS, type FiltrosAtivos } from "@/lib/types";

type Props = {
  open: boolean;
  filtros: FiltrosAtivos;
  onClose: () => void;
  onApply: (patch: Pick<FiltrosAtivos, "precoMin" | "precoMax" | "descontoMinimo" | "categorias">) => void;
};

export function FilterModal({ open, filtros, onClose, onApply }: Props) {
  const { dialogRef, titleId } = useModalDialog(open, onClose);
  const [precoMin, setPrecoMin] = useState(filtros.precoMin);
  const [precoMax, setPrecoMax] = useState(filtros.precoMax);
  const [descontoMinimo, setDescontoMinimo] = useState(filtros.descontoMinimo);
  const [categorias, setCategorias] = useState<string[]>(filtros.categorias);

  useEffect(() => {
    if (!open) return;
    setPrecoMin(filtros.precoMin);
    setPrecoMax(filtros.precoMax);
    setDescontoMinimo(filtros.descontoMinimo);
    setCategorias(filtros.categorias);
  }, [open, filtros]);

  function toggleCategoria(cat: string) {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function handlePrecoMin(v: number) {
    const val = Math.round(v);
    setPrecoMin(val);
    if (val > precoMax) setPrecoMax(val);
  }

  function handlePrecoMax(v: number) {
    const val = Math.round(v);
    setPrecoMax(val);
    if (val < precoMin) setPrecoMin(val);
  }

  function limpar() {
    const reset = resetFiltrosModal();
    setPrecoMin(reset.precoMin);
    setPrecoMax(reset.precoMax);
    setDescontoMinimo(reset.descontoMinimo);
    setCategorias(reset.categorias);
    onApply(reset);
    onClose();
  }

  function aplicar() {
    onApply({ precoMin, precoMax, descontoMinimo, categorias });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/40"
    >
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Fechar filtros"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:max-h-[85vh] sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h2 id={titleId} className="text-base font-semibold text-zinc-900">
              Filtrar promoções
            </h2>
            <button
              type="button"
              data-modal-close
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <section className="mb-6">
              <p className="text-sm font-medium text-zinc-900">Faixa de preço</p>
              <p className="mt-1 text-sm font-semibold text-orange-500">
                {fmtBRL.format(precoMin)} — {fmtBRL.format(precoMax)}
              </p>
              <label className="mt-3 block text-xs text-zinc-500" htmlFor="filtro-preco-min">
                Mínimo
              </label>
              <input
                id="filtro-preco-min"
                type="range"
                min={PRECO_MIN_PADRAO}
                max={PRECO_MAX_PADRAO}
                step={10}
                value={precoMin}
                onChange={(e) => handlePrecoMin(Number(e.target.value))}
                className="mt-1 w-full accent-orange-500"
              />
              <label className="mt-3 block text-xs text-zinc-500" htmlFor="filtro-preco-max">
                Máximo
              </label>
              <input
                id="filtro-preco-max"
                type="range"
                min={PRECO_MIN_PADRAO}
                max={PRECO_MAX_PADRAO}
                step={10}
                value={precoMax}
                onChange={(e) => handlePrecoMax(Number(e.target.value))}
                className="mt-1 w-full accent-orange-500"
              />
            </section>

            <section className="mb-6">
              <p className="text-sm font-medium text-zinc-900">Desconto mínimo</p>
              <p className="mt-1 text-sm font-semibold text-orange-500">{Math.round(descontoMinimo)}%</p>
              <input
                id="filtro-desconto-min"
                type="range"
                aria-label="Desconto mínimo em percentual"
                min={0}
                max={DESCONTO_MAX_PADRAO}
                step={5}
                value={descontoMinimo}
                onChange={(e) => setDescontoMinimo(Number(e.target.value))}
                className="mt-2 w-full accent-orange-500"
              />
            </section>

            <section>
              <p className="text-sm font-medium text-zinc-900">Categorias</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TODAS_AS_CATEGORIAS.map((cat) => {
                  const ativa = categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        ativa
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-orange-300",
                      )}
                    >
                      <span>{ICONES_CATEGORIA[cat]}</span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="flex gap-2 border-t border-zinc-200 px-5 py-4">
            <button
              type="button"
              onClick={limpar}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Limpar filtros
            </button>
            <button
              type="button"
              onClick={aplicar}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-400"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
