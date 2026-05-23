"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { normalizarCategoria } from "@/lib/categorias";
import {
  CATEGORIA_TODAS,
  PRECO_MAX_PADRAO,
  TODAS_AS_CATEGORIAS,
  type FiltrosAtivos,
  type Promocao,
} from "@/lib/types";
import { useSavedStore } from "@/store/use-saved-store";

export function usePromocoesFeed(promocoesIniciais: Promocao[], filtros: FiltrosAtivos) {
  const [promocoes, setPromocoes] = useState<Promocao[]>(promocoesIniciais);
  const [aoVivo, setAoVivo] = useState(false);
  const syncFromPromo = useSavedStore((s) => s.syncFromPromo);
  const removeSaved = useSavedStore((s) => s.remove);
  const pruneSaved = useSavedStore((s) => s.pruneMissing);

  useEffect(() => {
    setPromocoes(promocoesIniciais);
  }, [promocoesIniciais]);

  const pruneFromServer = useCallback(async () => {
    const savedIds = useSavedStore.getState().saved.map((p) => p.id);
    if (savedIds.length === 0) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: alive } = await supabase.from("promocoes").select("id").in("id", savedIds);
    pruneSaved((alive ?? []).map((p) => p.id));
  }, [pruneSaved]);

  useEffect(() => {
    void pruneFromServer();
  }, [promocoesIniciais, pruneFromServer]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("promocoes-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "promocoes" }, (payload) => {
        const nova = payload.new as Promocao;
        if (!nova.aprovada) return;
        setPromocoes((prev) => (prev.some((p) => p.id === nova.id) ? prev : [nova, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "promocoes" }, (payload) => {
        const atualizada = payload.new as Promocao;
        if (!atualizada.aprovada) removeSaved(atualizada.id);
        else syncFromPromo(atualizada);
        setPromocoes((prev) =>
          atualizada.aprovada
            ? prev.map((p) => (p.id === atualizada.id ? atualizada : p))
            : prev.filter((p) => p.id !== atualizada.id),
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "promocoes" }, (payload) => {
        const removida = payload.old as Promocao;
        removeSaved(removida.id);
        setPromocoes((prev) => prev.filter((p) => p.id !== removida.id));
      })
      .subscribe((status) => setAoVivo(status === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [syncFromPromo, removeSaved]);

  const contagemPorCategoria = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of TODAS_AS_CATEGORIAS) counts[cat] = 0;
    for (const p of promocoes) {
      const cat = normalizarCategoria(p.categoria);
      if (cat) counts[cat] += 1;
    }
    return counts;
  }, [promocoes]);

  const filtradas = useMemo(() => {
    let lista = [...promocoes];

    const catsAtivas =
      filtros.categorias.length > 0
        ? filtros.categorias
        : filtros.categoria !== CATEGORIA_TODAS
          ? [filtros.categoria]
          : [];

    if (catsAtivas.length > 0) {
      lista = lista.filter((p) => {
        const cat = normalizarCategoria(p.categoria);
        return cat != null && catsAtivas.includes(cat);
      });
    }

    if (filtros.freteGratis) {
      lista = lista.filter((p) => p.frete_gratis === true);
    }
    if (filtros.descontoMinimo > 0) {
      lista = lista.filter((p) => p.percentual_desconto >= filtros.descontoMinimo);
    }
    if (filtros.precoMin > 0) {
      lista = lista.filter((p) => p.preco_desconto >= filtros.precoMin);
    }
    if (filtros.precoMax < PRECO_MAX_PADRAO) {
      lista = lista.filter((p) => p.preco_desconto <= filtros.precoMax);
    }

    switch (filtros.ordenacao) {
      case "desconto":
        lista.sort((a, b) => b.percentual_desconto - a.percentual_desconto);
        break;
      case "preco":
        lista.sort((a, b) => a.preco_desconto - b.preco_desconto);
        break;
      case "avaliacao":
        lista.sort((a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0));
        break;
      case "recente":
        lista.sort((a, b) => new Date(b.criada_em).getTime() - new Date(a.criada_em).getTime());
        break;
    }

    return lista;
  }, [promocoes, filtros]);

  return {
    promocoes: filtradas,
    total: promocoes.length,
    contagemPorCategoria,
    aoVivo,
  };
}
