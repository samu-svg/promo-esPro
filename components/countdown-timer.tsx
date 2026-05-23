"use client";

import { useEffect, useState } from "react";

type Props = {
  expiresAt: string | null | undefined;
  className?: string;
};

function calcRestante(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "expirado";
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

export function CountdownTimer({ expiresAt, className }: Props) {
  const [texto, setTexto] = useState(expiresAt ? calcRestante(expiresAt) : "");

  useEffect(() => {
    if (!expiresAt) return;
    setTexto(calcRestante(expiresAt));
    const id = setInterval(() => setTexto(calcRestante(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt || !texto) return null;

  return (
    <span className={className} aria-live="polite">
      {texto}
    </span>
  );
}
