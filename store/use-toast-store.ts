import { create } from "zustand";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  link?: string;
};

type ToastStore = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (toast) => {
    const id = uuid();
    set({ toasts: [...get().toasts, { ...toast, id }] });

    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 8000);
  },

  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
