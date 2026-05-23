import { promoMatchesAlert } from "@/lib/alerts";
import { markAlertNotified, wasAlertNotified } from "@/lib/alert-matches";
import { fmtBRL } from "@/lib/format";
import type { Promocao } from "@/lib/types";
import { useAlertsStore } from "@/store/use-alerts-store";
import { useToastStore } from "@/store/use-toast-store";

export function checkAlertsForPromo(promo: Promocao): void {
  if (!promo.aprovada) return;

  const { isLoaded, alertas } = useAlertsStore.getState();
  if (!isLoaded) return;

  const ativos = alertas.filter((a) => a.ativo);
  const pushToast = useToastStore.getState().push;

  for (const alerta of ativos) {
    if (!promoMatchesAlert(promo, alerta)) continue;
    if (wasAlertNotified(alerta.id, promo.id)) continue;

    markAlertNotified(alerta.id, promo.id);
    const desconto = Math.round(promo.percentual_desconto);

    pushToast({
      title: "Alerta encontrado!",
      message: `"${alerta.titulo}": ${promo.titulo} por ${fmtBRL.format(promo.preco_desconto)} (${desconto}% OFF)`,
      link: promo.link_afiliado,
    });
  }
}
