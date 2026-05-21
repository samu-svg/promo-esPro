"""Curador de promoções baseado no Claude Haiku.

Recebe uma `Promocao` (resultado da varredura no Mercado Livre) e devolve
uma decisão `CuratorDecision` com `aprovada`, `titulo` e `descricao`
gerados pela IA conforme o system prompt definido pelo produto.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass

from anthropic import Anthropic, APIError

from mercado_livre import Promocao

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = (
    "Você é um curador de promoções brasileiro. Analise o produto recebido e "
    "decida se vale a pena divulgar. Aprove apenas se o desconto for real e "
    "relevante, o produto tiver boa reputação e o preço final for competitivo "
    "no mercado brasileiro. Se aprovado, escreva um título curto e atraente "
    "com no máximo 10 palavras, e uma descrição animada com no máximo 2 "
    "linhas destacando o desconto e o benefício. Responda apenas em JSON "
    "com os campos: aprovada (boolean), titulo, descricao."
)


@dataclass(frozen=True)
class CuratorDecision:
    aprovada: bool
    titulo: str | None
    descricao: str | None
    raw_response: str


class ClaudeCurator:
    """Wrapper síncrono sobre a API Anthropic Messages para curadoria."""

    def __init__(self, api_key: str, model: str = "claude-haiku-4-5") -> None:
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def curate(self, promo: Promocao) -> CuratorDecision:
        """Envia uma promoção para o Claude Haiku e devolve a decisão."""
        payload = {
            "titulo_original": promo.titulo,
            "categoria": promo.categoria,
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
            response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )
        except APIError as exc:
            logger.warning("Claude API falhou para %s: %s", promo.external_id, exc)
            return CuratorDecision(False, None, None, raw_response=str(exc))

        text_blocks = [b.text for b in response.content if getattr(b, "type", "") == "text"]
        raw = "\n".join(text_blocks).strip()

        decision = self._parse(raw)
        logger.debug(
            "Claude decidiu %s para %s (titulo=%r)",
            decision.aprovada,
            promo.external_id,
            decision.titulo,
        )
        return decision

    # ------------------------------------------------------------------
    # Parsing
    # ------------------------------------------------------------------
    @staticmethod
    def _parse(raw: str) -> CuratorDecision:
        """Extrai o JSON da resposta do Claude, tolerando code fences."""
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

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("Claude devolveu JSON inválido: %r", raw[:200])
            return CuratorDecision(False, None, None, raw_response=raw)

        return CuratorDecision(
            aprovada=bool(data.get("aprovada")),
            titulo=(data.get("titulo") or "").strip() or None,
            descricao=(data.get("descricao") or "").strip() or None,
            raw_response=raw,
        )
