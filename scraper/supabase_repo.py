"""Camada de acesso ao Supabase para a tabela `promocoes`.

Usa a `service_role key` (somente no scraper, NUNCA no front-end), o que
bypassa a RLS e permite inserir/atualizar livremente.
"""
from __future__ import annotations

import logging
from typing import Iterable

from supabase import create_client, Client

from mercado_livre import Promocao

logger = logging.getLogger(__name__)


def _chunks(items: list[str], size: int) -> Iterable[list[str]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


class PromocoesRepo:
    """Operações de leitura/escrita sobre `public.promocoes`."""

    TABLE = "promocoes"

    def __init__(self, url: str, service_role_key: str) -> None:
        self.client: Client = create_client(url, service_role_key)

    # ------------------------------------------------------------------
    # Dedup
    # ------------------------------------------------------------------
    def existing_external_ids(self, ids: list[str]) -> set[str]:
        """Retorna o subconjunto de `external_id` que já está no banco."""
        if not ids:
            return set()
        found: set[str] = set()
        for chunk in _chunks(ids, 200):
            resp = (
                self.client.table(self.TABLE)
                .select("external_id")
                .in_("external_id", chunk)
                .execute()
            )
            found.update(row["external_id"] for row in resp.data or [])
        return found

    # ------------------------------------------------------------------
    # Insert
    # ------------------------------------------------------------------
    def upsert_approved(
        self,
        promo: Promocao,
        titulo: str,
        descricao: str | None,
    ) -> None:
        """Insere (ou atualiza) uma promoção aprovada pelo curador."""
        row = {
            "external_id": promo.external_id,
            "titulo": titulo,
            "descricao": descricao,
            "preco_original": promo.preco_original,
            "preco_desconto": promo.preco_desconto,
            "percentual_desconto": promo.percentual_desconto,
            "foto_url": promo.foto_url,
            "link_afiliado": promo.link_afiliado,
            "categoria": promo.categoria,
            "avaliacao": promo.avaliacao,
            "aprovada": True,
        }
        (
            self.client.table(self.TABLE)
            .upsert(row, on_conflict="external_id")
            .execute()
        )
        logger.info("Salvo no Supabase: %s — %s", promo.external_id, titulo)
