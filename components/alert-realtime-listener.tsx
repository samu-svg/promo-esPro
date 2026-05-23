"use client";

import { useEffect } from "react";

import { checkAlertsForPromo } from "@/lib/check-alerts-for-promo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Promocao } from "@/lib/types";

/** Escuta novas/atualizadas promoções em qualquer rota para disparar toasts de alerta. */
export function AlertRealtimeListener() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("alert-matcher")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "promocoes" }, (payload) => {
        const nova = payload.new as Promocao;
        if (nova.aprovada) checkAlertsForPromo(nova);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "promocoes" }, (payload) => {
        const atualizada = payload.new as Promocao;
        if (atualizada.aprovada) checkAlertsForPromo(atualizada);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
