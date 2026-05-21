export type Promocao = {
  id: string;
  external_id: string | null;
  titulo: string;
  descricao: string | null;
  preco_original: number;
  preco_desconto: number;
  percentual_desconto: number;
  foto_url: string | null;
  link_afiliado: string;
  categoria: string | null;
  avaliacao: number | null;
  aprovada: boolean;
  criada_em: string;
};

export const CATEGORIA_TODAS = "Todas";
