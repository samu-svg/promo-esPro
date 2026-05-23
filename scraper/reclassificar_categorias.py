"""Reclassifica categorias das promoções já aprovadas no Supabase via IA.

Uso:
    python reclassificar_categorias.py
    python reclassificar_categorias.py --dry-run
    python reclassificar_categorias.py --provider anthropic
"""
from __future__ import annotations

import argparse
import logging
import sys
import time

from config import load_settings
from curator_factory import create_curator, resolve_provider, validate_curator_settings
from supabase_repo import PromocoesRepo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger("reclassificar")

THROTTLE_SECONDS = 0.4


def run(dry_run: bool = False, provider: str | None = None) -> None:
    settings = load_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.")

    resolved_provider = resolve_provider(provider, settings)
    validate_curator_settings(settings, resolved_provider)

    repo = PromocoesRepo(
        url=settings.supabase_url,
        service_role_key=settings.supabase_service_role_key,
    )
    curator = create_curator(settings, provider=resolved_provider)
    logger.info("Reclassificação via provider: %s", resolved_provider)

    promos = repo.list_approved()
    logger.info("Encontradas %d promoções aprovadas.", len(promos))

    if not promos:
        return

    alteradas = 0
    iguais = 0
    falhas = 0

    for i, row in enumerate(promos, start=1):
        promo_id = row["id"]
        titulo = row["titulo"]
        categoria_atual = row.get("categoria")

        nova = curator.classify_category(titulo, categoria_atual)
        if not nova:
            falhas += 1
            logger.warning("[%d/%d] Falha: %s", i, len(promos), titulo[:50])
            time.sleep(THROTTLE_SECONDS)
            continue

        if nova == categoria_atual:
            iguais += 1
            logger.info("[%d/%d] OK (sem mudança): %s → %s", i, len(promos), titulo[:40], nova)
        else:
            alteradas += 1
            logger.info(
                "[%d/%d] %s → %s: %s",
                i,
                len(promos),
                categoria_atual or "(vazio)",
                nova,
                titulo[:50],
            )
            if not dry_run:
                repo.update_categoria(promo_id, nova)

        time.sleep(THROTTLE_SECONDS)

    logger.info("=" * 60)
    logger.info(
        "Concluído: total=%d | alteradas=%d | iguais=%d | falhas=%d%s",
        len(promos),
        alteradas,
        iguais,
        falhas,
        " (dry-run)" if dry_run else "",
    )
    logger.info("=" * 60)


def main() -> None:
    parser = argparse.ArgumentParser(description="Reclassifica categorias via IA")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Só simula, não grava no Supabase",
    )
    parser.add_argument(
        "--provider",
        choices=["openai", "anthropic"],
        help="Provider de IA (sobrescreve CURATOR_PROVIDER do .env).",
    )
    args = parser.parse_args()
    try:
        run(dry_run=args.dry_run, provider=args.provider)
    except RuntimeError as exc:
        logger.error("%s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
