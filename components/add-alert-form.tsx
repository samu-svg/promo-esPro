"use client";

import { useState } from "react";

import { useAlertsStore } from "@/store/use-alerts-store";

type Props = {
  onSuccess?: () => void;
};

export function AddAlertForm({ onSuccess }: Props) {
  const [titulo, setTitulo] = useState("");
  const [precoStr, setPrecoStr] = useState("");
  const [descontoStr, setDescontoStr] = useState("");
  const [ativo, setAtivo] = useState(true);
  const adicionar = useAlertsStore((s) => s.adicionar);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;

    const preco = precoStr.trim() ? parseFloat(precoStr.replace(",", ".")) : null;
    const desconto = descontoStr.trim() ? parseInt(descontoStr, 10) : 0;

    if (precoStr.trim() && (preco == null || isNaN(preco) || preco <= 0)) return;
    if (descontoStr.trim() && (isNaN(desconto) || desconto < 0 || desconto > 90)) return;

    adicionar({
      titulo: titulo.trim(),
      precoMaximo: preco,
      descontoMinimo: desconto,
      ativo,
    });

    setTitulo("");
    setPrecoStr("");
    setDescontoStr("");
    setAtivo(true);
    onSuccess?.();
  }

  return (
    <form
      onSubmit={submit}
      className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:p-5"
    >
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">Novo alerta</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nome do produto ou categoria"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          required
        />
        <input
          type="text"
          inputMode="decimal"
          value={precoStr}
          onChange={(e) => setPrecoStr(e.target.value)}
          placeholder="Preço máximo em R$ (opcional)"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <input
          type="text"
          inputMode="numeric"
          value={descontoStr}
          onChange={(e) => setDescontoStr(e.target.value)}
          placeholder="Desconto mínimo em % (opcional)"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <label className="flex items-center justify-between gap-3 text-sm text-zinc-800">
          Ativar alerta
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-semibold text-white hover:bg-orange-400"
        >
          Criar alerta
        </button>
      </div>
    </form>
  );
}
