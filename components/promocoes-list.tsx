"use client";

import { useState } from "react";

import { CategoryFilter, TODAS_AS_CATEGORIAS } from "@/components/category-filter";
import { FilterModal } from "@/components/filter-modal";
import { FilterRow } from "@/components/filter-row";
import { PromocaoCard } from "@/components/promocao-card";
import { SortModal } from "@/components/sort-modal";
import { usePromocoesFeed } from "@/hooks/use-promocoes-feed";
import { hasFiltrosModalAtivos } from "@/lib/filters";
import {
  CATEGORIA_TODAS,
  FILTROS_PADRAO,
  type FiltrosAtivos,
  type Promocao,
} from "@/lib/types";
import { useSavedStore } from "@/store/use-saved-store";

type Props = { promocoesIniciais: Promocao[] };

export function PromocoesList({ promocoesIniciais }: Props) {
  const [filtros, setFiltros] = useState<FiltrosAtivos>(FILTROS_PADRAO);
  const [modalFiltros, setModalFiltros] = useState(false);
  const [modalOrdenar, setModalOrdenar] = useState(false);

  const { promocoes, total, contagemPorCategoria, aoVivo } = usePromocoesFeed(
    promocoesIniciais,
    filtros,
  );

  const toggle = useSavedStore((s) => s.toggle);
  const isSaved = useSavedStore((s) => s.isSaved);

  const filtrosModalAtivos = hasFiltrosModalAtivos(filtros);

  function setCategoria(cat: string) {
    setFiltros((prev) => ({ ...prev, categoria: cat, categorias: [] }));
  }

  function toggleFrete() {
    setFiltros((prev) => ({ ...prev, freteGratis: !prev.freteGratis }));
  }

  function aplicarFiltrosModal(
    patch: Pick<FiltrosAtivos, "precoMin" | "precoMax" | "descontoMinimo" | "categorias">,
  ) {
    setFiltros((prev) => ({
      ...prev,
      ...patch,
      categoria: patch.categorias.length > 0 ? CATEGORIA_TODAS : prev.categoria,
    }));
  }

  const labelCategoria =
    filtros.categoria !== CATEGORIA_TODAS
      ? filtros.categoria
      : filtros.categorias.length === 1
        ? filtros.categorias[0]
        : filtros.categorias.length > 1
          ? `${filtros.categorias.length} categorias`
          : null;

  return (
    <>
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-zinc-200/70 bg-white/85 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-0">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h2 className="text-sm font-semibold text-zinc-500 md:text-base">
            <span className="text-zinc-900">{promocoes.length}</span>{" "}
            {promocoes.length === 1 ? "promoção" : "promoções"}
            {labelCategoria && (
              <span className="text-orange-500"> em {labelCategoria}</span>
            )}
            {filtros.freteGratis && (
              <span className="text-orange-500"> · frete grátis</span>
            )}
          </h2>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500"
            aria-live="polite"
          >
            <span
              className={
                aoVivo
                  ? "h-2 w-2 animate-pulse rounded-full bg-green-500"
                  : "h-2 w-2 rounded-full bg-zinc-300"
              }
            />
            {aoVivo ? "ao vivo" : "conectando..."}
          </span>
        </div>

        <div className="mb-4">
          <CategoryFilter
            categorias={TODAS_AS_CATEGORIAS}
            selecionada={filtros.categoria}
            contagemPorCategoria={contagemPorCategoria}
            onSelect={setCategoria}
          />
        </div>

        <FilterRow
          freteGratis={filtros.freteGratis}
          filtrosAtivos={filtrosModalAtivos}
          onToggleFrete={toggleFrete}
          onOpenFiltros={() => setModalFiltros(true)}
          onOpenOrdenar={() => setModalOrdenar(true)}
        />

        {total > 0 && promocoes.length !== total && (
          <p className="mt-2 text-xs text-zinc-400">
            Mostrando {promocoes.length} de {total} promoções
          </p>
        )}
      </div>

      {promocoes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-sm font-medium text-zinc-600">
            Nenhuma promoção encontrada com esses filtros.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Ajuste os filtros ou volte daqui a pouco — buscamos novas ofertas a cada 30 minutos.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {promocoes.map((promo) => (
            <li key={promo.id} className="animate-fade-in">
              <PromocaoCard
                promo={promo}
                salvo={isSaved(promo.id)}
                onToggleSalvo={toggle}
              />
            </li>
          ))}
        </ul>
      )}

      <FilterModal
        open={modalFiltros}
        filtros={filtros}
        onClose={() => setModalFiltros(false)}
        onApply={aplicarFiltrosModal}
      />
      <SortModal
        open={modalOrdenar}
        ordenacao={filtros.ordenacao}
        onClose={() => setModalOrdenar(false)}
        onSelect={(ordenacao) => setFiltros((prev) => ({ ...prev, ordenacao }))}
      />
    </>
  );
}
