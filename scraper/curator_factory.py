"""Factory para escolher o provider de curadoria (OpenAI ou Anthropic)."""

from __future__ import annotations

from claude_curator import ClaudeCurator
from config import Settings
from curator_types import CuratorProtocol
from openai_curator import OpenAICurator

VALID_PROVIDERS = frozenset({"openai", "anthropic"})


def resolve_provider(explicit: str | None, settings: Settings) -> str:
    provider = (explicit or settings.curator_provider).strip().lower()
    if provider not in VALID_PROVIDERS:
        raise RuntimeError(
            f"CURATOR_PROVIDER inválido: {provider!r}. "
            f"Use: {', '.join(sorted(VALID_PROVIDERS))}"
        )
    return provider


def validate_curator_settings(settings: Settings, provider: str) -> None:
    if provider == "anthropic" and not settings.anthropic_api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY ausente. Preencha no .env ou use CURATOR_PROVIDER=openai."
        )
    if provider == "openai" and not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY ausente. Preencha no .env ou use CURATOR_PROVIDER=anthropic."
        )


def create_curator(settings: Settings, provider: str | None = None) -> CuratorProtocol:
    resolved = resolve_provider(provider, settings)
    validate_curator_settings(settings, resolved)

    if resolved == "anthropic":
        return ClaudeCurator(
            api_key=settings.anthropic_api_key,  # type: ignore[arg-type]
            model=settings.anthropic_model,
        )

    return OpenAICurator(
        api_key=settings.openai_api_key,  # type: ignore[arg-type]
        model=settings.openai_model,
    )
