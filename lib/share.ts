import type { Promocao } from "@/lib/types";

export function buildWhatsAppMessage(promo: Promocao): string {
  const desconto = Math.round(promo.percentual_desconto);
  return (
    `🔥 *Oferta imperdível no Mercado Livre!*\n\n` +
    `📦 *${promo.titulo}*\n` +
    `💰 De ~R$${promo.preco_original.toFixed(2)}~ por apenas *R$${promo.preco_desconto.toFixed(2)}*\n` +
    `🏷️ *${desconto}% OFF*\n\n` +
    `👉 ${promo.link_afiliado}\n\n` +
    `_Compartilhado pelo PromoçãoPro_`
  );
}

export function shareOnWhatsApp(promo: Promocao): void {
  const msg = buildWhatsAppMessage(promo);
  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyPromoLink(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}

export async function shareNative(promo: Promocao): Promise<boolean> {
  const desconto = Math.round(promo.percentual_desconto);
  const text = `${promo.titulo} por R$${promo.preco_desconto.toFixed(2)} (${desconto}% OFF) no Mercado Livre: ${promo.link_afiliado}`;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: promo.titulo,
        text,
        url: promo.link_afiliado,
      });
      return true;
    } catch {
      return false;
    }
  }

  await copyPromoLink(promo.link_afiliado);
  return true;
}

export type ShareAction = "whatsapp" | "copy" | "native";

export async function runShareAction(
  action: ShareAction,
  promo: Promocao,
): Promise<boolean> {
  switch (action) {
    case "whatsapp":
      shareOnWhatsApp(promo);
      return true;
    case "copy":
      await copyPromoLink(promo.link_afiliado);
      return true;
    case "native":
      return shareNative(promo);
  }
}
