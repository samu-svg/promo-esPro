"use client";

import clsx from "clsx";

import { useModalDialog } from "@/hooks/use-modal-dialog";
import type { FiltrosAtivos } from "@/lib/types";

type Ordenacao = FiltrosAtivos["ordenacao"];

const OPCOES: { value: Ordenacao; label: string }[] = [
  { value: "desconto", label: "Maior desconto" },
  { value: "preco", label: "Menor preço" },
  { value: "avaliacao", label: "Melhor avaliação" },
  { value: "recente", label: "Mais recentes" },
];

type Props = {
  open: boolean;
  ordenacao: Ordenacao;
  onClose: () => void;
  onSelect: (ordenacao: Ordenacao) => void;
};

export function SortModal({ open, ordenacao, onClose, onSelect }: Props) {
  const { dialogRef, titleId } = useModalDialog(open, onClose);

  function escolher(value: Ordenacao) {
    onSelect(value);
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
          aria-label="Fechar ordenação"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <h2 id={titleId} className="text-base font-semibold text-zinc-900">
              Ordenar por
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
          <ul role="listbox" aria-label="Opções de ordenação">
            {OPCOES.map((op, i) => {
              const ativa = op.value === ordenacao;
              return (
                <li key={op.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={ativa}
                    onClick={() => escolher(op.value)}
                    className={clsx(
                      "flex w-full items-center justify-between px-5 py-3.5 text-left text-sm transition-colors hover:bg-orange-50",
                      i < OPCOES.length - 1 && "border-b border-zinc-100",
                      ativa ? "font-semibold text-orange-500" : "text-zinc-800",
                    )}
                  >
                    {op.label}
                    {ativa && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-orange-500" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
