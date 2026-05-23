"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

import { AddAlertForm } from "@/components/add-alert-form";
import { formatAlertCondicao, formatAlertStatus } from "@/lib/alerts";
import { useAlertsStore } from "@/store/use-alerts-store";

export function AlertsList() {
  const { alertas, toggleAtivo, remover } = useAlertsStore();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500 text-orange-500 hover:bg-orange-50"
          aria-label={showForm ? "Fechar formulário" : "Novo alerta"}
          aria-expanded={showForm}
        >
          {showForm ? (
            <span className="text-lg leading-none">×</span>
          ) : (
            <span className="text-lg leading-none">+</span>
          )}
        </button>
      </div>

      {showForm && <AddAlertForm onSuccess={() => setShowForm(false)} />}

      {alertas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <p className="text-4xl" aria-hidden>
            🔔
          </p>
          <h2 className="mt-3 text-base font-semibold text-zinc-800">Nenhum alerta criado</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Crie um alerta para ser avisado quando uma promoção bater com seus critérios (com a aba
            aberta).
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            Ver promoções
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alertas.map((item) => (
            <li
              key={item.id}
              className={clsx(
                "flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4",
                !item.ativo && "opacity-55",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">{item.titulo}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{formatAlertCondicao(item)}</p>
                <span
                  className={clsx(
                    "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    item.ativo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {formatAlertStatus(item.ativo)}
                </span>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={item.ativo}
                  onChange={() => toggleAtivo(item.id)}
                  className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                  aria-label={`${item.ativo ? "Desativar" : "Ativar"} alerta ${item.titulo}`}
                />
              </label>
              <button
                type="button"
                onClick={() => remover(item.id)}
                className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`Remover alerta ${item.titulo}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
