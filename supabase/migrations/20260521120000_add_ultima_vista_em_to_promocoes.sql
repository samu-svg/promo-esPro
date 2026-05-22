alter table public.promocoes
  add column if not exists ultima_vista_em timestamptz;

update public.promocoes
set ultima_vista_em = coalesce(criada_em, now())
where ultima_vista_em is null;

alter table public.promocoes
  alter column ultima_vista_em set default now();

alter table public.promocoes
  alter column ultima_vista_em set not null;
