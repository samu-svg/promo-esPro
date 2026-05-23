import { create } from "zustand";

import { storage } from "@/lib/storage";
import type { Promocao } from "@/lib/types";

const STORAGE_KEY = "saved";

type SavedStore = {
  saved: Promocao[];
  isLoaded: boolean;
  load: () => void;
  toggle: (promo: Promocao) => void;
  isSaved: (id: string) => boolean;
  remove: (id: string) => void;
  pruneMissing: (activeIds: string[]) => void;
  syncFromPromo: (promo: Promocao) => void;
};

function persist(saved: Promocao[]) {
  storage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  saved: [],
  isLoaded: false,

  load: () => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const saved: Promocao[] = raw ? (JSON.parse(raw) as Promocao[]) : [];
      set({ saved, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggle: (promo: Promocao) => {
    const { saved } = get();
    const exists = saved.some((p) => p.id === promo.id);
    const next = exists ? saved.filter((p) => p.id !== promo.id) : [promo, ...saved];
    set({ saved: next });
    persist(next);
  },

  isSaved: (id: string) => get().saved.some((p) => p.id === id),

  remove: (id: string) => {
    const next = get().saved.filter((p) => p.id !== id);
    set({ saved: next });
    persist(next);
  },

  pruneMissing: (activeIds) => {
    const active = new Set(activeIds);
    const { saved } = get();
    const next = saved.filter((p) => active.has(p.id));
    if (next.length === saved.length) return;
    set({ saved: next });
    persist(next);
  },

  syncFromPromo: (promo) => {
    const { saved } = get();
    if (!saved.some((p) => p.id === promo.id)) return;
    const next = saved.map((p) =>
      p.id === promo.id
        ? {
            ...p,
            preco_desconto: promo.preco_desconto,
            preco_original: promo.preco_original,
            percentual_desconto: promo.percentual_desconto,
            titulo: promo.titulo,
            foto_url: promo.foto_url,
            link_afiliado: promo.link_afiliado,
            frete_gratis: promo.frete_gratis,
            expires_at: promo.expires_at,
          }
        : p,
    );
    set({ saved: next });
    persist(next);
  },
}));
