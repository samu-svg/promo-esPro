-- Colunas usadas pelo app mobile e web (filtros + countdown)
alter table public.promocoes
  add column if not exists frete_gratis boolean not null default false,
  add column if not exists expires_at timestamptz;

comment on column public.promocoes.frete_gratis is 'Indica frete grátis na oferta (preenchido pelo scraper quando disponível)';
comment on column public.promocoes.expires_at is 'Expiração da promoção, se informada pela origem';

-- Busca por termo (usada pela barra de busca; FTS pode evoluir depois)
create or replace function public.buscar_promocoes(
  termo text,
  limite int default 50,
  offset_val int default 0
)
returns setof public.promocoes
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.promocoes
  where aprovada = true
    and (
      titulo ilike '%' || termo || '%'
      or descricao ilike '%' || termo || '%'
      or categoria ilike '%' || termo || '%'
    )
  order by criada_em desc
  limit greatest(limite, 0)
  offset greatest(offset_val, 0);
$$;

grant execute on function public.buscar_promocoes(text, int, int) to anon, authenticated;
