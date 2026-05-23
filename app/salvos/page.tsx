import type { Metadata } from "next";

import { SavedList } from "@/components/saved-list";

export const metadata: Metadata = {
  title: "Salvos",
  description: "Suas promoções favoritas salvas no PromoçãoPro.",
  openGraph: {
    title: "Salvos — PromoçãoPro",
    description: "Promoções que você marcou com o coração.",
  },
};

export default function SalvosPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-2xl">Salvos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Promoções que você marcou com o coração
          </p>
        </div>
      </div>
      <SavedList />
    </main>
  );
}
