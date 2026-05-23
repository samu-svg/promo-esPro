"""Cliente de promoções do Mercado Livre — estratégia via página pública.

A API REST `/sites/MLB/search` exige permissões de PolicyAgent que o
grant `client_credentials` não concede. Este módulo contorna isso
extraindo os dados diretamente da página de ofertas
(mercadolivre.com.br/ofertas), que já entrega preço original, desconto,
avaliações e foto sem autenticação.

Vantagens:
- Não depende de scopes OAuth para busca de produtos.
- A página já filtra itens em promoção (todos têm desconto real).
- Suporta filtro por categoria via query string `?filter=<cat_id>`.
- Retorna até 48 itens por página (padrão da página de ofertas ML).
"""
from __future__ import annotations

import logging
import re
import time
import json
from dataclasses import dataclass, asdict
from typing import Any
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl, urljoin

import requests

from categorias import normalizar_categoria

logger = logging.getLogger(__name__)

_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
_OFERTAS_URL = "https://www.mercadolivre.com.br/ofertas"
_IMG_BASE = "https://http2.mlstatic.com/D_{pic_id}-O.webp"


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
    """Erro genérico ao raspar a página de ofertas do Mercado Livre."""


# ---------------------------------------------------------------------------
# Categorias disponíveis na página de ofertas (descobertas automaticamente
# mas mantidas aqui como fallback para execuções sem rede à página de filtros)
# ---------------------------------------------------------------------------
MLB_CATEGORIAS: list[dict[str, str]] = [
    {"id": "MLB5672",   "name": "Acessórios para Veículos"},
    {"id": "MLB1384",   "name": "Bebês"},
    {"id": "MLB1246",   "name": "Beleza e Cuidado Pessoal"},
    {"id": "MLB1132",   "name": "Brinquedos e Hobbies"},
    {"id": "MLB1430",   "name": "Calçados, Roupas e Bolsas"},
    {"id": "MLB1574",   "name": "Casa, Móveis e Decoração"},
    {"id": "MLB1051",   "name": "Celulares e Telefones"},
    {"id": "MLB1500",   "name": "Construção"},
    {"id": "MLB5726",   "name": "Eletrodomésticos"},
    {"id": "MLB1000",   "name": "Eletrônicos, Áudio e Vídeo"},
    {"id": "MLB1276",   "name": "Esportes e Fitness"},
    {"id": "MLB263532", "name": "Ferramentas"},
    {"id": "MLB1144",   "name": "Games"},
    {"id": "MLB1648",   "name": "Informática"},
    {"id": "MLB3937",   "name": "Joias e Relógios"},
    {"id": "MLB1196",   "name": "Livros, Revistas e Comics"},
    {"id": "MLB1071",   "name": "Pet Shop"},
    {"id": "MLB264586", "name": "Saúde"},
]


class MercadoLivreClient:
    """Raspa a página pública de ofertas do Mercado Livre Brasil."""

    def __init__(
        self,
        client_id: str = "",
        client_secret: str = "",
        affiliate_id: str = "andeciofmendes",
        site_id: str = "MLB",
        timeout: int = 20,
    ) -> None:
        # client_id/secret mantidos para compatibilidade com o config.py
        # mas não são usados nesta implementação
        self.affiliate_id = affiliate_id
        self.site_id = site_id
        self.timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": _UA,
            "Accept-Language": "pt-BR,pt;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })

    # ------------------------------------------------------------------
    # Extração de dados da página
    # ------------------------------------------------------------------
    def _fetch_page_data(self, url: str) -> dict[str, Any]:
        """Faz GET na URL e extrai o JSON de dados embutido no HTML."""
        for attempt in range(3):
            try:
                resp = self._session.get(url, timeout=self.timeout)
                resp.raise_for_status()
                break
            except requests.RequestException as exc:
                if attempt == 2:
                    raise MercadoLivreError(f"Falha ao buscar {url}: {exc}") from exc
                wait = 2 ** attempt
                logger.warning("Tentativa %d falhou para %s: %s. Aguardando %ds.", attempt + 1, url, exc, wait)
                time.sleep(wait)

        html = resp.text
        # o JSON fica em um script como: _n.ctx.r={...}; _n.
        scripts = re.findall(r"<script[^>]*>(.*?)</script>", html, re.DOTALL)
        for script in scripts:
            m = re.search(r"_n\.ctx\.r\s*=\s*(\{.*?);\s*_n\.", script, re.DOTALL)
            if not m:
                continue
            try:
                data = json.loads(m.group(1))
                page = (
                    data.get("appProps", {})
                        .get("pageProps", {})
                        .get("data", {})
                )
                if page.get("items"):
                    return page
            except (json.JSONDecodeError, KeyError):
                continue

        return {}

    # ------------------------------------------------------------------
    # Listagem de categorias
    # ------------------------------------------------------------------
    def list_categories(self) -> list[dict[str, str]]:
        """Retorna as categorias disponíveis na página de ofertas."""
        try:
            page = self._fetch_page_data(_OFERTAS_URL)
            cats = []
            for f in page.get("availableFilters", []):
                if f.get("id") == "category":
                    for v in f.get("values", []):
                        cats.append({"id": v["id"], "name": v.get("name", v["id"])})
            if cats:
                logger.info("Categorias obtidas da página: %d", len(cats))
                return cats
        except MercadoLivreError as exc:
            logger.warning("Não foi possível obter categorias da página: %s. Usando fallback.", exc)
        logger.info("Usando lista de categorias fallback (%d).", len(MLB_CATEGORIAS))
        return MLB_CATEGORIAS

    # ------------------------------------------------------------------
    # Busca de ofertas por categoria
    # ------------------------------------------------------------------
    def search_offers(
        self,
        category_id: str,
        min_discount_percent: float = 30.0,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Retorna itens em promoção de uma categoria, já parseados."""
        url = f"{_OFERTAS_URL}?filter={category_id}"
        try:
            page = self._fetch_page_data(url)
        except MercadoLivreError as exc:
            logger.warning("Busca falhou para categoria %s: %s", category_id, exc)
            return []

        raw_items = page.get("items", [])
        result = []
        for raw in raw_items:
            promo = self._parse_item(raw, min_discount_percent)
            if promo is not None:
                result.append(promo)
        return result

    # ------------------------------------------------------------------
    # Afiliado
    # ------------------------------------------------------------------
    def build_affiliate_link(self, permalink: str) -> str:
        """Adiciona parâmetros de tracking do programa Afiliados Brasil."""
        if not permalink:
            return permalink
        if not permalink.startswith("http"):
            permalink = "https://" + permalink
        parsed = urlparse(permalink)
        query = dict(parse_qsl(parsed.query))
        query.update({
            "matt_word": self.affiliate_id,
            "matt_tool": "affiliate",
            "ref": self.affiliate_id,
        })
        return urlunparse(parsed._replace(query=urlencode(query)))

    # ------------------------------------------------------------------
    # Pipeline principal
    # ------------------------------------------------------------------
    def fetch_promotions(
        self,
        min_discount_percent: float = 30.0,
        min_rating: float = 4.0,
        max_items_per_category: int = 50,
        category_ids: list[str] | None = None,
    ) -> list[Promocao]:
        """Percorre categorias e retorna promoções que passam nos filtros."""
        if category_ids is not None:
            categories = [{"id": cid, "name": cid} for cid in category_ids]
        else:
            categories = self.list_categories()

        logger.info(
            "Iniciando varredura em %d categorias (desc>=%.0f%%, rating>=%.1f).",
            len(categories),
            min_discount_percent,
            min_rating,
        )

        promotions: list[Promocao] = []
        for cat in categories:
            cat_id = cat["id"]
            cat_name = cat.get("name", cat_id)

            items = self.search_offers(
                cat_id,
                min_discount_percent=min_discount_percent,
                limit=max_items_per_category,
            )

            aprovados = [
                p for p in items
                if p.avaliacao is not None and p.avaliacao >= min_rating
            ]
            logger.info(
                "Categoria %s (%s): %d itens, %d passaram no rating.",
                cat_name, cat_id, len(items), len(aprovados),
            )

            for p in aprovados:
                p.categoria = normalizar_categoria(cat_name)

            promotions.extend(aprovados)
            # pausa curta entre categorias para não sobrecarregar
            time.sleep(1.5)

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
        raw: dict[str, Any],
        min_discount_percent: float,
    ) -> Promocao | None:
        """Converte um item bruto da página em Promocao."""
        try:
            card = raw["card"]
            comps = {c["type"]: c for c in card["components"]}
            meta = card["metadata"]

            price_data = comps.get("price", {}).get("price", {})
            prev = price_data.get("previous_price", {}).get("value")
            curr = price_data.get("current_price", {}).get("value")

            if not prev or not curr or prev <= curr:
                return None

            pct = round((1 - curr / prev) * 100, 2)
            if pct < min_discount_percent:
                return None

            # avaliação
            rev = comps.get("reviews", {}).get("reviews", {})
            rating = rev.get("rating_average")
            if isinstance(rating, (int, float)):
                rating = float(rating)
            else:
                rating = None

            # foto
            pic_id = card.get("pictures", {}).get("pictures", [{}])[0].get("id", "")
            foto_url = _IMG_BASE.format(pic_id=pic_id) if pic_id else None

            # link e título
            url_path = meta.get("url", "")
            if not url_path.startswith("http"):
                url_path = "https://" + url_path
            affiliate_link = self.build_affiliate_link(url_path)

            titulo = ""
            title_comp = comps.get("title", {}).get("title", {})
            if isinstance(title_comp, dict):
                titulo = title_comp.get("text", "") or title_comp.get("long_title", "")
            elif isinstance(title_comp, list):
                for tc in title_comp:
                    if isinstance(tc, dict):
                        titulo = tc.get("text", "")
                        if titulo:
                            break

            return Promocao(
                external_id=meta["id"],
                titulo=titulo,
                preco_original=float(prev),
                preco_desconto=float(curr),
                percentual_desconto=pct,
                foto_url=foto_url,
                link_afiliado=affiliate_link,
                categoria=None,  # preenchido em fetch_promotions
                avaliacao=rating,
            )
        except (KeyError, TypeError, ValueError) as exc:
            logger.debug("Item ignorado (parse error): %s", exc)
            return None
