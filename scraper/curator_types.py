"""Tipos compartilhados para curadores de promoções."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from mercado_livre import Promocao


@dataclass(frozen=True)
class CuratorDecision:
    aprovada: bool
    titulo: str | None
    descricao: str | None
    categoria: str | None
    raw_response: str


class CuratorProtocol(Protocol):
    def curate(self, promo: Promocao) -> CuratorDecision: ...

    def classify_category(
        self,
        titulo: str,
        categoria_atual: str | None = None,
    ) -> str | None: ...
