"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSavedStore } from "@/store/use-saved-store";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/salvos", label: "Salvos" },
  { href: "/alertas", label: "Alertas" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const savedCount = useSavedStore((s) => s.saved.length);

  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-black text-white shadow-[0_0_14px_rgba(249,115,22,0.3)]">
            P
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">PromoçãoPro</span>
        </Link>

        <nav className="hide-scrollbar flex max-w-[60vw] items-center gap-1 overflow-x-auto sm:max-w-none" aria-label="Principal">
          {LINKS.map(({ href, label }) => {
            const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const badge = href === "/salvos" && savedCount > 0 ? savedCount : null;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  ativo
                    ? "bg-orange-50 text-orange-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                )}
                aria-current={ativo ? "page" : undefined}
              >
                {label}
                {badge != null && (
                  <span className="ml-1.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
