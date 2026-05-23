import { create } from "zustand";

import { storage } from "@/lib/storage";
import type { AlertaPreco, NovoAlertaInput } from "@/lib/types";

const STORAGE_KEY = "alerts";

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeAlerta(raw: AlertaPreco): AlertaPreco {
  return {
    ...raw,
    precoMaximo: raw.precoMaximo ?? null,
    descontoMinimo: raw.descontoMinimo ?? 0,
  };
}

function persist(alertas: AlertaPreco[]) {
  storage.setItem(STORAGE_KEY, JSON.stringify(alertas));
}

type AlertsStore = {
  alertas: AlertaPreco[];
  isLoaded: boolean;
  load: () => void;
  adicionar: (input: NovoAlertaInput) => void;
  toggleAtivo: (id: string) => void;
  remover: (id: string) => void;
};

export const useAlertsStore = create<AlertsStore>((set, get) => ({
  alertas: [],
  isLoaded: false,

  load: () => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const alertas: AlertaPreco[] = raw
        ? (JSON.parse(raw) as AlertaPreco[]).map(normalizeAlerta)
        : [];
      set({ alertas, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  adicionar: (input) => {
    const novo: AlertaPreco = {
      id: uuid(),
      titulo: input.titulo.trim(),
      categoria: null,
      precoMaximo: input.precoMaximo ?? null,
      descontoMinimo: input.descontoMinimo ?? 0,
      ativo: input.ativo ?? true,
      criadoEm: new Date().toISOString(),
    };
    const next = [novo, ...get().alertas];
    set({ alertas: next });
    persist(next);
  },

  toggleAtivo: (id) => {
    const next = get().alertas.map((a) => (a.id === id ? { ...a, ativo: !a.ativo } : a));
    set({ alertas: next });
    persist(next);
  },

  remover: (id) => {
    const next = get().alertas.filter((a) => a.id !== id);
    set({ alertas: next });
    persist(next);
  },
}));
