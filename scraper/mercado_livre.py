"""Cliente da API do Mercado Livre para o scraper PromoçãoPro.

Responsabilidades:
- Autenticar via OAuth 2.0 (client_credentials).
- Listar todas as categorias do site informado (default: MLB).
- Buscar ofertas com desconto mínimo em cada categoria.
- Consultar a média de avaliações de cada item.
- Construir o link de afiliado a partir do permalink.
- Expor o pipeline completo via `fetch_promotions(...)`.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, asdict
from typing import Any, Iterable
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

import requests

logger = logging.getLogger(__name__)

API_BASE = "https://api.mercadolibre.com"


@dataclass
class Promocao:
    """Representa uma promoção encontrada (antes da curadoria por IA)."""

    external_id: str
    titulo: str
    preco_original: float
    preco_desconto: float
    percentual_desconto: float
    foto_url: str | None
    link_afiliado: str
    categoria: str | None
    avaliacao: float | None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class MercadoLivreError(RuntimeError):
    """Erro genérico em chamadas à API do Mercado Livre."""


class MercadoLivreClient:
    """Cliente leve para a API pública do Mercado Livre."""

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        affiliate_id: str,
        site_id: str = "MLB",
        timeout: int = 15,
    ) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.affiliate_id = affiliate_id
        self.site_id = site_id
        self.timeout = timeout
        self._session = requests.Session()
        self._token: str | None = None
        self._token_expires_at: float = 0.0

    # ------------------------------------------------------------------
    # Autenticação
    # ------------------------------------------------------------------
    def _get_access_token(self) -> str | None:
        """Retorna um access_token válido, renovando se necessário.

        Endpoints públicos (categories, search, reviews) funcionam sem token,
        porém com token os limites de rate são bem mais altos. Se o token
        falhar, seguimos sem ele (modo público).
        """
        if self._token and time.time() < self._token_expires_at - 60:
            return self._token

        try:
            resp = self._session.post(
                f"{API_BASE}/oauth/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                timeout=self.timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            self._token = data["access_token"]
            self._token_expires_at = time.time() + int(data.get("expires_in", 21600))
            logger.info("Mercado Livre: token OAuth obtido com sucesso.")
            return self._token
        except requests.RequestException as exc:
            logger.warning(
                "Falha ao obter token OAuth (%s). Seguindo em modo público.", exc
            )
            return None

    def _request(self, method: str, path: str, use_token: bool = True, **kwargs: Any) -> Any:
        """Faz uma chamada à API com retry simples em 429/5xx.

        `use_token=False` faz a chamada sem Authorization header — útil para
        endpoints públicos que retornam 403 quando recebem um token com
        scopes insuficientes (ex: /sites/MLB/categories).
        """
        url = f"{API_BASE}{path}"
        headers = kwargs.pop("headers", {}) or {}
        if use_token:
            token = self._get_access_token()
            if token:
                headers["Authorization"] = f"Bearer {token}"

        for attempt in range(3):
            try:
                resp = self._session.request(
                    method, url, headers=headers, timeout=self.timeout, **kwargs
                )
                if resp.status_code == 429 or 500 <= resp.status_code < 600:
                    wait = 2 ** attempt
                    logger.warning(
                        "Mercado Livre %s %s -> %s. Retry em %ss",
                        method,
                        path,
                        resp.status_code,
                        wait,
                    )
                    time.sleep(wait)
                    continue
                # 403 com token: tenta sem token antes de desistir
                if resp.status_code == 403 and use_token:
                    logger.warning(
                        "Mercado Livre 403 em %s com token. Retentando sem token.", path
                    )
                    return self._request(method, path, use_token=False, **kwargs)
                resp.raise_for_status()
                return resp.json()
            except requests.RequestException as exc:
                if attempt == 2:
                    raise MercadoLivreError(
                        f"Falha ao chamar {method} {path}: {exc}"
                    ) from exc
                time.sleep(2 ** attempt)
        raise MercadoLivreError(f"Falha após retries em {method} {path}")

    # ------------------------------------------------------------------
    # Endpoints
    # ------------------------------------------------------------------

    # Categorias principais do MLB — usadas como fallback caso a API
    # esteja indisponível ou retorne erro.
    _MLB_FALLBACK_CATEGORIES: list[dict[str, str]] = [
        {"id": "MLB1000", "name": "Eletrônicos, Áudio e Vídeo"},
        {"id": "MLB1051", "name": "Celulares e Telefones"},
        {"id": "MLB1648", "name": "Computação"},
        {"id": "MLB1144", "name": "Câmeras e Acessórios"},
        {"id": "MLB1246", "name": "TV e Vídeo"},
        {"id": "MLB1430", "name": "Videogames"},
        {"id": "MLB1574", "name": "Eletrodomésticos"},
        {"id": "MLB1499", "name": "Casa e Jardim"},
        {"id": "MLB1276", "name": "Esportes e Fitness"},
        {"id": "MLB1132", "name": "Moda e Acessórios"},
        {"id": "MLB1168", "name": "Beleza e Cuidado Pessoal"},
        {"id": "MLB1196", "name": "Brinquedos e Hobbies"},
        {"id": "MLB1234", "name": "Bebês"},
        {"id": "MLB1403", "name": "Ferramentas"},
        {"id": "MLB1953", "name": "Livros, Revistas e Comics"},
        {"id": "MLB1743", "name": "Instrumentos Musicais"},
        {"id": "MLB3937", "name": "Alimentos e Bebidas"},
        {"id": "MLB1367", "name": "Saúde"},
        {"id": "MLB1071", "name": "Carros, Motos e Outros"},
        {"id": "MLB1500", "name": "Imóveis"},
    ]

    def list_categories(self) -> list[dict[str, str]]:
        """Lista todas as categorias raiz do site (ex: MLB).

        Tenta o endpoint público. Se falhar, usa a lista de fallback
        com as principais categorias do MLB.
        """
        try:
            result = self._request("GET", f"/sites/{self.site_id}/categories")
            if result:
                return result
        except MercadoLivreError as exc:
            logger.warning(
                "Não foi possível listar categorias via API (%s). "
                "Usando fallback com %d categorias.",
                exc,
                len(self._MLB_FALLBACK_CATEGORIES),
            )
        return self._MLB_FALLBACK_CATEGORIES

    def search_offers(
        self,
        category_id: str,
        min_discount_percent: float = 30.0,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Busca itens de uma categoria com desconto >= min_discount_percent.

        Usa o filtro `discount=<min>-100` da API de busca, que já retorna
        apenas itens em promoção dentro da faixa. Retorna a lista bruta.
        """
        min_disc = max(1, int(round(min_discount_percent)))
        params = {
            "category": category_id,
            "discount": f"{min_disc}-100",
            "limit": limit,
            "condition": "new",
        }
        try:
            data = self._request(
                "GET", f"/sites/{self.site_id}/search", params=params
            )
        except MercadoLivreError as exc:
            logger.warning("Busca falhou para categoria %s: %s", category_id, exc)
            return []
        return data.get("results", [])

    def get_item_rating(self, item_id: str) -> float | None:
        """Retorna a média de avaliações (0-5) do item, ou None se indisponível."""
        try:
            data = self._request("GET", f"/reviews/item/{item_id}")
        except MercadoLivreError:
            return None
        rating = data.get("rating_average")
        if isinstance(rating, (int, float)):
            return float(rating)
        return None

    # ------------------------------------------------------------------
    # Afiliado
    # ------------------------------------------------------------------
    def build_affiliate_link(self, permalink: str) -> str:
        """Anexa parâmetros de tracking do programa Afiliados Brasil ao permalink.

        Para tracking completo via short-link oficial, é preciso usar a
        Afiliados API (OAuth da conta de afiliado). Quando você ativar,
        basta trocar esta função pela chamada de geração de short-link.
        """
        if not permalink:
            return permalink
        parsed = urlparse(permalink)
        query = dict(parse_qsl(parsed.query))
        query.update(
            {
                "matt_word": self.affiliate_id,
                "matt_tool": "affiliate",
                "ref": self.affiliate_id,
            }
        )
        return urlunparse(parsed._replace(query=urlencode(query)))

    # ------------------------------------------------------------------
    # Pipeline
    # ------------------------------------------------------------------
    def fetch_promotions(
        self,
        min_discount_percent: float = 30.0,
        min_rating: float = 4.0,
        max_items_per_category: int = 50,
        category_ids: Iterable[str] | None = None,
    ) -> list[Promocao]:
        """Pipeline completo: percorre categorias, filtra por desconto e estrelas."""
        if category_ids is None:
            categories = self.list_categories()
        else:
            categories = [{"id": cid, "name": cid} for cid in category_ids]

        logger.info(
            "Iniciando varredura em %d categorias (desc>=%.0f%%, rating>=%.1f).",
            len(categories),
            min_discount_percent,
            min_rating,
        )

        promotions: list[Promocao] = []
        for category in categories:
            cat_id = category["id"]
            cat_name = category.get("name", cat_id)
            items = self.search_offers(
                cat_id,
                min_discount_percent=min_discount_percent,
                limit=max_items_per_category,
            )
            logger.info("Categoria %s (%s): %d itens.", cat_name, cat_id, len(items))

            for item in items:
                promo = self._parse_item(item, cat_name, min_discount_percent)
                if promo is None:
                    continue

                rating = self.get_item_rating(promo.external_id)
                if rating is None or rating < min_rating:
                    continue
                promo.avaliacao = rating
                promotions.append(promo)

        logger.info(
            "Varredura concluída: %d promoções aprovadas pelos filtros básicos.",
            len(promotions),
        )
        return promotions

    # ------------------------------------------------------------------
    # Helpers internos
    # ------------------------------------------------------------------
    def _parse_item(
        self,
        item: dict[str, Any],
        cat_name: str | None,
        min_discount_percent: float,
    ) -> Promocao | None:
        """Converte um item bruto da API em `Promocao` aplicando o filtro de desconto.

        Retorna None se não tem `original_price` ou se o desconto calculado
        ficou abaixo do mínimo (defensive — a API às vezes ignora o filtro).
        """
        original = item.get("original_price")
        price = item.get("price")
        if not original or not price or original <= price:
            return None

        discount_pct = round((1 - price / original) * 100, 2)
        if discount_pct < min_discount_percent:
            return None

        permalink = item.get("permalink") or ""
        thumbnail = item.get("thumbnail") or ""
        if thumbnail.startswith("http://"):
            thumbnail = "https://" + thumbnail[len("http://") :]

        return Promocao(
            external_id=item["id"],
            titulo=item.get("title") or "",
            preco_original=float(original),
            preco_desconto=float(price),
            percentual_desconto=discount_pct,
            foto_url=thumbnail or None,
            link_afiliado=self.build_affiliate_link(permalink),
            categoria=cat_name,
            avaliacao=None,
        )
