"""Configuração centralizada do scraper.

Carrega variáveis de ambiente do `.env` e expõe valores tipados.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Variável de ambiente obrigatória ausente: {name}. "
            f"Verifique seu arquivo .env (use .env.example como base)."
        )
    return value


def _int(name: str, default: int) -> int:
    raw = os.getenv(name)
    return int(raw) if raw else default


def _float(name: str, default: float) -> float:
    raw = os.getenv(name)
    return float(raw) if raw else default


@dataclass(frozen=True)
class Settings:
    # Mercado Livre
    meli_client_id: str
    meli_client_secret: str
    meli_affiliate_id: str
    meli_site_id: str

    # Filtros
    min_discount_percent: float
    min_rating: float
    max_items_per_category: int

    # Loop
    scraper_interval_minutes: int

    # Limpeza de promoções que sumiram da fonte
    stale_promo_hours: float

    # Supabase (usado na Etapa 3)
    supabase_url: str | None
    supabase_service_role_key: str | None

    # Curadoria IA (Etapa 3)
    curator_provider: str
    openai_api_key: str | None
    openai_model: str
    anthropic_api_key: str | None
    anthropic_model: str


def load_settings() -> Settings:
    return Settings(
        meli_client_id=_required("MELI_CLIENT_ID"),
        meli_client_secret=_required("MELI_CLIENT_SECRET"),
        meli_affiliate_id=os.getenv("MELI_AFFILIATE_ID", "andeciofmendes"),
        meli_site_id=os.getenv("MELI_SITE_ID", "MLB"),
        min_discount_percent=_float("MIN_DISCOUNT_PERCENT", 30.0),
        min_rating=_float("MIN_RATING", 4.0),
        max_items_per_category=_int("MAX_ITEMS_PER_CATEGORY", 50),
        scraper_interval_minutes=_int("SCRAPER_INTERVAL_MINUTES", 30),
        stale_promo_hours=_float("STALE_PROMO_HOURS", 2.0),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        curator_provider=os.getenv("CURATOR_PROVIDER", "openai"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5"),
    )
