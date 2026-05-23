"""Parsing de respostas JSON dos curadores."""

from __future__ import annotations

import json
import logging
import re

from categorias import validar_categoria_app
from curator_types import CuratorDecision

logger = logging.getLogger(__name__)


def _extract_json_object(raw: str) -> str:
    cleaned = raw.strip()
    fence = re.match(
        r"^```(?:json)?\s*(?P<body>.+?)\s*```$",
        cleaned,
        flags=re.DOTALL,
    )
    if fence:
        cleaned = fence.group("body").strip()
    if not cleaned.startswith("{"):
        obj_match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if obj_match:
            cleaned = obj_match.group(0)
    return cleaned


def parse_categoria_only(raw: str, provider: str = "IA") -> str | None:
    cleaned = _extract_json_object(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("%s classify JSON inválido: %r", provider, raw[:200])
        return None

    categoria_raw = (data.get("categoria") or "").strip() or None
    categoria = validar_categoria_app(categoria_raw)
    if categoria_raw and not categoria:
        logger.warning("%s classify categoria inválida: %r", provider, categoria_raw)
    return categoria


def parse_curator_response(raw: str, provider: str = "IA") -> CuratorDecision:
    cleaned = _extract_json_object(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("%s devolveu JSON inválido: %r", provider, raw[:200])
        return CuratorDecision(False, None, None, None, raw_response=raw)

    categoria_raw = (data.get("categoria") or "").strip() or None
    categoria = validar_categoria_app(categoria_raw)
    if categoria_raw and not categoria:
        logger.warning("%s devolveu categoria inválida: %r", provider, categoria_raw)

    return CuratorDecision(
        aprovada=bool(data.get("aprovada")),
        titulo=(data.get("titulo") or "").strip() or None,
        descricao=(data.get("descricao") or "").strip() or None,
        categoria=categoria,
        raw_response=raw,
    )
