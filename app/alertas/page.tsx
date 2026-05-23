import type { Metadata } from "next";

import { AlertsList } from "@/components/alerts-list";

export const metadata: Metadata = {
  title: "Alertas",
  description: "Alertas de preço personalizados no PromoçãoPro.",
  openGraph: {
    title: "Alertas — PromoçãoPro",
    description: "Seja avisado quando uma promoção bater com seus critérios.",
  },
};

export default function AlertasPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 md:px-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Alertas de preço</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Avise-me quando aparecer uma promoção que combine com o que procuro. Os avisos aparecem
          como toast enquanto você usa o site (sem push).
        </p>
      </div>
      <AlertsList />
    </main>
  );
}
