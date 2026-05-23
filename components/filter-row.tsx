"use client";

import clsx from "clsx";

type Props = {
  freteGratis: boolean;
  filtrosAtivos: boolean;
  onToggleFrete: () => void;
  onOpenFiltros: () => void;
  onOpenOrdenar: () => void;
};

type ChipProps = {
  label: string;
  icon: React.ReactNode;
  ativo?: boolean;
  badge?: boolean;
  onClick: () => void;
};

function FilterChip({ label, icon, ativo, badge, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
        ativo
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-orange-300 hover:bg-orange-50",
      )}
    >
      {icon}
      {label}
      {badge && !ativo && (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500" aria-hidden />
      )}
    </button>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path strokeLinecap="round" d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path strokeLinecap="round" d="M4 14h16M12 12h8M4 6h8" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18H9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16" />
    </svg>
  );
}

export function FilterRow({
  freteGratis,
  filtrosAtivos,
  onToggleFrete,
  onOpenFiltros,
  onOpenOrdenar,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="hide-scrollbar flex flex-1 gap-2 overflow-x-auto pb-1">
        <FilterChip
          label="Filtrar"
          badge={filtrosAtivos}
          icon={<SlidersIcon className="h-3.5 w-3.5" />}
          onClick={onOpenFiltros}
        />
        <FilterChip
          label="Frete grátis"
          ativo={freteGratis}
          icon={<TruckIcon className={clsx("h-3.5 w-3.5", freteGratis ? "text-white" : "text-zinc-500")} />}
          onClick={onToggleFrete}
        />
      </div>
      <button
        type="button"
        onClick={onOpenOrdenar}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-orange-300 hover:bg-orange-50"
      >
        <SortIcon className="h-3.5 w-3.5" />
        Ordenar
      </button>
    </div>
  );
}
