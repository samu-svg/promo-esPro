"use client";

import { useToastStore } from "@/store/use-toast-store";

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:max-w-sm"
      aria-live="polite"
      aria-relevant="additions"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto overflow-hidden rounded-xl border border-orange-200 bg-white shadow-lg ring-1 ring-black/5"
          role="status"
        >
          <div className="border-b border-orange-100 bg-orange-50 px-4 py-2">
            <p className="text-sm font-semibold text-orange-800">{toast.title}</p>
          </div>
          <div className="px-4 py-3">
            <p className="line-clamp-3 text-sm text-zinc-700">{toast.message}</p>
            <div className="mt-3 flex items-center gap-2">
              {toast.link && (
                <a
                  href={toast.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  Ver oferta
                </a>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
