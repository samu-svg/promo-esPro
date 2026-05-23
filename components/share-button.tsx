"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { copyPromoLink, runShareAction, shareNative, shareOnWhatsApp } from "@/lib/share";
import type { Promocao } from "@/lib/types";

type Props = {
  promo: Promocao;
  variant?: "icon" | "pill";
  className?: string;
};

export function ShareButton({ promo, variant = "icon", className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleCopy() {
    await copyPromoLink(promo.link_afiliado);
    setCopied(true);
    setOpen(false);
  }

  async function handleNative() {
    await shareNative(promo);
    setOpen(false);
  }

  function handleWhatsApp() {
    shareOnWhatsApp(promo);
    setOpen(false);
  }

  const iconContent = copied ? (
    <span className="text-xs font-bold text-green-600">✓</span>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-zinc-500" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );

  const menu = open && (
    <div
      role="menu"
      className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
    >
      <button
        type="button"
        role="menuitem"
        onClick={handleWhatsApp}
        className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-orange-50"
      >
        WhatsApp
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => void handleCopy()}
        className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-orange-50"
      >
        Copiar link
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => void handleNative()}
        className="block w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-orange-50"
      >
        Compartilhar…
      </button>
    </div>
  );

  if (variant === "pill") {
    return (
      <div ref={rootRef} className={clsx("relative", className)}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {copied ? (
            <span className="text-green-600">Copiado!</span>
          ) : (
            <>
              {iconContent}
              Compartilhar
            </>
          )}
        </button>
        {menu}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-6 min-w-6 items-center justify-center rounded-md bg-orange-50 p-1 hover:bg-orange-100"
        aria-label="Compartilhar promoção"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {iconContent}
      </button>
      {menu}
    </div>
  );
}

/** @deprecated Use ShareButton dropdown; mantido para compatibilidade */
export async function openShareMenu(promo: Promocao): Promise<void> {
  if (typeof navigator.share === "function") {
    const ok = await runShareAction("native", promo);
    if (ok) return;
  }
  shareOnWhatsApp(promo);
}
