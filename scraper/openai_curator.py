"""Curador de promoções baseado no GPT-4o mini (OpenAI)."""

from __future__ import annotations

import json
import logging

from openai import APIError, OpenAI

from curator_parsing import parse_categoria_only, parse_curator_response
from curator_prompts import CLASSIFY_PROMPT, SYSTEM_PROMPT
from curator_types import CuratorDecision
from mercado_livre import Promocao

logger = logging.getLogger(__name__)


class OpenAICurator:
    """Wrapper síncrono sobre a API OpenAI Chat Completions para curadoria."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def curate(self, promo: Promocao) -> CuratorDecision:
        payload = {
            "titulo_original": promo.titulo,
            "categoria_ml": promo.categoria,
            "preco_original": promo.preco_original,
            "preco_atual": promo.preco_desconto,
            "percentual_desconto": promo.percentual_desconto,
            "avaliacao_estrelas": promo.avaliacao,
        }
        user_message = (
            "Avalie este produto e responda apenas com o JSON solicitado:\n\n"
            + json.dumps(payload, ensure_ascii=False, indent=2)
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=512,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
            )
        except APIError as exc:
            logger.warning("OpenAI API falhou para %s: %s", promo.external_id, exc)
            return CuratorDecision(False, None, None, None, raw_response=str(exc))

        raw = (response.choices[0].message.content or "").strip()
        decision = parse_curator_response(raw, provider="OpenAI")
        logger.debug(
            "OpenAI decidiu %s para %s (titulo=%r, categoria=%r)",
            decision.aprovada,
            promo.external_id,
            decision.titulo,
            decision.categoria,
        )
        return decision

    def classify_category(
        self,
        titulo: str,
        categoria_atual: str | None = None,
    ) -> str | None:
        payload = {
            "titulo": titulo,
            "categoria_atual": categoria_atual,
        }
        user_message = (
            "Classifique este produto e responda apenas com o JSON solicitado:\n\n"
            + json.dumps(payload, ensure_ascii=False, indent=2)
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=64,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": CLASSIFY_PROMPT},
                    {"role": "user", "content": user_message},
                ],
            )
        except APIError as exc:
            logger.warning("OpenAI classify falhou para %r: %s", titulo[:40], exc)
            return None

        raw = (response.choices[0].message.content or "").strip()
        return parse_categoria_only(raw, provider="OpenAI")
