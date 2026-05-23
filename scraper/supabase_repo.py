"""Camada de acesso ao Supabase para a tabela `promocoes`.

Usa a `service_role key` (somente no scraper, NUNCA no front-end), o que
bypassa a RLS e permite inserir/atualizar livremente.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Iterable

from supabase import create_client, Client

from mercado_livre import Promocao

logger = logging.getLogger(__name__)


def _chunks(items: list[str], size: int) -> Iterable[list[str]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


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
    # Insert / update
    # ------------------------------------------------------------------
    def upsert_approved(
        self,
        promo: Promocao,
        titulo: str,
        descricao: str | None,
        categoria: str | None = None,
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
            "categoria": categoria or promo.categoria,
            "avaliacao": promo.avaliacao,
            "aprovada": True,
            "ultima_vista_em": _utc_now_iso(),
        }
        (
            self.client.table(self.TABLE)
            .upsert(row, on_conflict="external_id")
            .execute()
        )
        logger.info("Salvo no Supabase: %s — %s", promo.external_id, titulo)

    def update_prices(self, promo: Promocao) -> None:
        """Atualiza preços de uma promoção já existente (sem passar pela IA)."""
        row = {
            "preco_original": promo.preco_original,
            "preco_desconto": promo.preco_desconto,
            "percentual_desconto": promo.percentual_desconto,
            "avaliacao": promo.avaliacao,
            "ultima_vista_em": _utc_now_iso(),
        }
        (
            self.client.table(self.TABLE)
            .update(row)
            .eq("external_id", promo.external_id)
            .execute()
        )

    def list_approved(self) -> list[dict]:
        """Lista promoções aprovadas (id, titulo, categoria)."""
        rows: list[dict] = []
        offset = 0
        page_size = 200
        while True:
            resp = (
                self.client.table(self.TABLE)
                .select("id, titulo, categoria")
                .eq("aprovada", True)
                .order("criada_em", desc=True)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            batch = resp.data or []
            rows.extend(batch)
            if len(batch) < page_size:
                break
            offset += page_size
        return rows

    def update_categoria(self, promo_id: str, categoria: str) -> None:
        """Atualiza somente a categoria de uma promoção."""
        (
            self.client.table(self.TABLE)
            .update({"categoria": categoria})
            .eq("id", promo_id)
            .execute()
        )

    # ------------------------------------------------------------------
    # Limpeza
    # ------------------------------------------------------------------
    def delete_stale(self, max_age_hours: float) -> int:
        """Apaga promoções que não foram vistas há mais de `max_age_hours`."""
        cutoff = (
            datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
        ).isoformat()

        stale_ids: list[str] = []
        offset = 0
        page_size = 1000
        while True:
            resp = (
                self.client.table(self.TABLE)
                .select("external_id")
                .eq("aprovada", True)
                .not_.is_("external_id", "null")
                .lt("ultima_vista_em", cutoff)
                .range(offset, offset + page_size - 1)
                .execute()
            )
            rows = resp.data or []
            stale_ids.extend(row["external_id"] for row in rows)
            if len(rows) < page_size:
                break
            offset += page_size

        return self.delete_by_external_ids(stale_ids)

    def delete_by_external_ids(self, ids: list[str]) -> int:
        """Remove promoções pelo `external_id`."""
        if not ids:
            return 0
        removed = 0
        for chunk in _chunks(ids, 200):
            (
                self.client.table(self.TABLE)
                .delete()
                .in_("external_id", chunk)
                .execute()
            )
            removed += len(chunk)
        if removed:
            logger.info("Removidas %d promoções obsoletas.", removed)
        return removed
