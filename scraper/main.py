"""Entry-point do scraper PromoçãoPro (Etapa 3 — pipeline completo).

Fluxo de cada execução:
1. Busca promoções no Mercado Livre (desconto>=30%, rating>=4 estrelas).
2. Filtra as que já estão no Supabase (dedup por `external_id`).
3. Novos itens: curadoria completa (FAST_SYNC=false) ou título ML + categoria via IA (FAST_SYNC=true).
4. Salva no Supabase as aprovadas, com `titulo`, `descricao` e `categoria`.
5. Atualiza preços das promoções que ainda aparecem na fonte.
6. Apaga promoções que não foram vistas há STALE_PROMO_HOURS horas.

Modos:
    python main.py            # loop infinito a cada SCRAPER_INTERVAL_MINUTES
    python main.py --once     # uma única execução (use no GitHub Actions cron)
    python main.py --once --provider anthropic  # força Claude Haiku
"""
from __future__ import annotations

import argparse
import logging
import sys
import time

from categorias import normalizar_categoria
from config import Settings, load_settings
from curator_factory import create_curator, resolve_provider, validate_curator_settings
from curator_types import CuratorProtocol
from mercado_livre import MercadoLivreClient, Promocao
from supabase_repo import PromocoesRepo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("promocaopro.scraper")


AI_THROTTLE_SECONDS = 0.4


def _validate_settings_for_pipeline(settings: Settings, provider: str) -> None:
    missing: list[str] = []
    if not settings.supabase_url:
        missing.append("SUPABASE_URL")
    if not settings.supabase_service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        raise RuntimeError(
            "Variáveis obrigatórias para a Etapa 3 ausentes: "
            + ", ".join(missing)
            + ". Preencha-as no .env antes de rodar o pipeline."
        )
    if not settings.fast_sync or settings.ai_classify:
        validate_curator_settings(settings, provider)


def _resolve_categoria(
    curator: CuratorProtocol | None,
    promo: Promocao,
    *,
    use_ai: bool,
) -> str | None:
    """Resolve categoria: IA (prompt leve) com fallback no mapa ML → app."""
    map_categoria = normalizar_categoria(promo.categoria)
    if not use_ai or curator is None:
        return map_categoria

    ia_categoria = curator.classify_category(promo.titulo, map_categoria)
    time.sleep(AI_THROTTLE_SECONDS)
    if ia_categoria:
        if map_categoria and ia_categoria != map_categoria:
            logger.info(
                "Categoria IA [%s]: %s → %s",
                promo.external_id,
                map_categoria,
                ia_categoria,
            )
        return ia_categoria

    if map_categoria:
        logger.warning(
            "IA sem categoria, fallback mapa ML [%s]: %s",
            promo.external_id,
            map_categoria,
        )
        return map_categoria
    return None


def _sync_existing_prices(repo: PromocoesRepo, promocoes: list[Promocao], ja_existentes: set[str]) -> int:
    """Atualiza preços e marca `ultima_vista_em` das promoções já salvas."""
    atualizadas = 0
    for promo in promocoes:
        if promo.external_id not in ja_existentes:
            continue
        try:
            repo.update_prices(promo)
            atualizadas += 1
        except Exception:
            logger.exception(
                "Falha ao atualizar preços da promoção %s.", promo.external_id
            )
    return atualizadas


def run_once(provider: str | None = None) -> dict[str, int]:
    """Executa uma varredura completa e devolve estatísticas."""
    settings = load_settings()
    resolved_provider = resolve_provider(provider, settings)
    _validate_settings_for_pipeline(settings, resolved_provider)

    meli = MercadoLivreClient(
        client_id=settings.meli_client_id,
        client_secret=settings.meli_client_secret,
        affiliate_id=settings.meli_affiliate_id,
        site_id=settings.meli_site_id,
    )
    repo = PromocoesRepo(
        url=settings.supabase_url,  # type: ignore[arg-type]
        service_role_key=settings.supabase_service_role_key,  # type: ignore[arg-type]
    )
    use_ai_classify = settings.fast_sync and settings.ai_classify
    if settings.fast_sync:
        curator = (
            create_curator(settings, provider=resolved_provider)
            if settings.ai_classify
            else None
        )
        if settings.ai_classify:
            logger.info(
                "Modo FAST_SYNC + IA: título ML, categoria via %s.",
                resolved_provider,
            )
        else:
            logger.info("Modo FAST_SYNC: novos itens entram sem IA.")
    else:
        curator = create_curator(settings, provider=resolved_provider)
        logger.info("Curadoria completa via provider: %s", resolved_provider)

    stats = {
        "fetched": 0,
        "novos": 0,
        "aprovados": 0,
        "rejeitados": 0,
        "atualizadas": 0,
        "removidas": 0,
    }

    promocoes = meli.fetch_promotions(
        min_discount_percent=settings.min_discount_percent,
        min_rating=settings.min_rating,
        max_items_per_category=settings.max_items_per_category,
    )
    stats["fetched"] = len(promocoes)

    if not promocoes:
        logger.info(
            "Nenhuma promoção encontrada nesta varredura — limpeza ignorada."
        )
        return stats

    ja_existentes = repo.existing_external_ids(
        [p.external_id for p in promocoes]
    )
    novos = [p for p in promocoes if p.external_id not in ja_existentes]
    logger.info(
        "%d promoções encontradas | %d já no banco | %d novas.",
        len(promocoes),
        len(ja_existentes),
        len(novos),
    )

    stats["atualizadas"] = _sync_existing_prices(repo, promocoes, ja_existentes)
    if stats["atualizadas"]:
        logger.info("%d promoções existentes tiveram preços atualizados.", stats["atualizadas"])

    stats["novos"] = len(novos)
    for promo in novos:
        if settings.fast_sync:
            categoria = _resolve_categoria(
                curator,
                promo,
                use_ai=use_ai_classify,
            )
            if not categoria:
                stats["rejeitados"] += 1
                logger.warning(
                    "Sem categoria mapeada, ignorado: [%s] %s",
                    promo.external_id,
                    _truncate(promo.titulo, 60),
                )
                continue
            try:
                repo.upsert_approved(
                    promo,
                    titulo=promo.titulo,
                    descricao=(
                        f"{promo.percentual_desconto:.0f}% OFF · "
                        f"de R$ {promo.preco_original:.2f} por R$ {promo.preco_desconto:.2f}"
                    ),
                    categoria=categoria,
                )
                stats["aprovados"] += 1
            except Exception:
                logger.exception(
                    "Falha ao gravar promoção %s no Supabase.", promo.external_id
                )
            continue

        decision = curator.curate(promo)
        if not decision.aprovada or not decision.titulo:
            stats["rejeitados"] += 1
            logger.info(
                "Rejeitado pela IA (%s): [%s] %s",
                resolved_provider,
                promo.external_id,
                _truncate(promo.titulo, 60),
            )
            time.sleep(AI_THROTTLE_SECONDS)
            continue

        categoria = decision.categoria or promo.categoria
        if not categoria:
            stats["rejeitados"] += 1
            logger.warning(
                "Aprovado sem categoria válida, ignorado: [%s] %s",
                promo.external_id,
                _truncate(promo.titulo, 60),
            )
            time.sleep(AI_THROTTLE_SECONDS)
            continue

        try:
            repo.upsert_approved(
                promo,
                titulo=decision.titulo,
                descricao=decision.descricao,
                categoria=categoria,
            )
            stats["aprovados"] += 1
        except Exception:
            logger.exception(
                "Falha ao gravar promoção %s no Supabase.", promo.external_id
            )
        time.sleep(AI_THROTTLE_SECONDS)

    try:
        stats["removidas"] = repo.delete_stale(settings.stale_promo_hours)
    except Exception:
        logger.exception("Falha ao remover promoções obsoletas.")

    logger.info("=" * 70)
    logger.info(
        "Resumo: encontradas=%d | novas=%d | aprovadas=%d | rejeitadas=%d | "
        "atualizadas=%d | removidas=%d",
        stats["fetched"],
        stats["novos"],
        stats["aprovados"],
        stats["rejeitados"],
        stats["atualizadas"],
        stats["removidas"],
    )
    logger.info("=" * 70)
    return stats


def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 3] + "..."


def main() -> None:
    parser = argparse.ArgumentParser(description="PromoçãoPro scraper")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Roda uma única vez e sai (usado pelo cron do GitHub Actions).",
    )
    parser.add_argument(
        "--provider",
        choices=["openai", "anthropic"],
        help="Provider de IA (sobrescreve CURATOR_PROVIDER do .env).",
    )
    args = parser.parse_args()

    settings = load_settings()

    if args.once:
        run_once(provider=args.provider)
        return

    interval_seconds = settings.scraper_interval_minutes * 60
    logger.info(
        "Modo loop: rodando a cada %d minutos. Ctrl+C para parar.",
        settings.scraper_interval_minutes,
    )

    while True:
        try:
            run_once(provider=args.provider)
        except Exception:
            logger.exception("Erro na execução — seguindo o loop.")
        logger.info(
            "Próxima execução em %d minutos.", settings.scraper_interval_minutes
        )
        time.sleep(interval_seconds)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Encerrado pelo usuário.")
        sys.exit(0)
