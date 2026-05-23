"""Mapeamento de categorias do Mercado Livre para as categorias do app."""

from __future__ import annotations

CATEGORIAS_APP: frozenset[str] = frozenset({
    "Tecnologia",
    "Roupas e Moda",
    "Calçados",
    "Casa e Decoração",
    "Eletrodomésticos",
    "Beleza",
    "Esportes",
    "Brinquedos",
    "Alimentos",
    "Livros",
    "Automotivo",
})

MAPA_CATEGORIAS_ML: dict[str, str] = {
    "Eletrônicos, Áudio e Vídeo": "Tecnologia",
    "Informática": "Tecnologia",
    "Celulares e Telefones": "Tecnologia",
    "Games": "Tecnologia",
    "Esportes e Fitness": "Esportes",
    "Calçados, Roupas e Bolsas": "Roupas e Moda",
    "Casa, Móveis e Decoração": "Casa e Decoração",
    "Beleza e Cuidado Pessoal": "Beleza",
    "Brinquedos e Hobbies": "Brinquedos",
    "Livros, Revistas e Comics": "Livros",
    "Acessórios para Veículos": "Automotivo",
    "Agro": "Alimentos",
    "Alimentos e Bebidas": "Alimentos",
    "Arte, Papelaria e Armarinho": "Casa e Decoração",
    "Câmeras e Acessórios": "Tecnologia",
    "Eletrodomésticos": "Eletrodomésticos",
    "Festas e Lembrancinhas": "Casa e Decoração",
    "Instrumentos Musicais": "Tecnologia",
    "Construção": "Casa e Decoração",
    "Ferramentas": "Automotivo",
    "Joias e Relógios": "Roupas e Moda",
    "Bebês": "Brinquedos",
    "Pet Shop": "Alimentos",
    "Saúde": "Alimentos",
    "Indústria e Comércio": "Casa e Decoração",
}


def normalizar_categoria(categoria: str | None) -> str | None:
    if not categoria:
        return None

    trimmed = categoria.strip()
    if trimmed in CATEGORIAS_APP:
        return trimmed

    mapeada = MAPA_CATEGORIAS_ML.get(trimmed)
    if mapeada and mapeada in CATEGORIAS_APP:
        return mapeada

    return None


def validar_categoria_app(categoria: str | None) -> str | None:
    """Valida categoria retornada pela IA (aceita diferença de maiúsculas)."""
    if not categoria:
        return None

    trimmed = categoria.strip()
    if trimmed in CATEGORIAS_APP:
        return trimmed

    lowered = trimmed.lower()
    for cat in CATEGORIAS_APP:
        if cat.lower() == lowered:
            return cat

    return None
