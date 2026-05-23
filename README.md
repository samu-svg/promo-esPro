# PromoçãoPro

Aplicativo de curadoria automatizada de promoções do Mercado Livre, filtradas
por IA (Claude Haiku) e exibidas em uma interface web com atualização em
tempo real via Supabase.

## Arquitetura

```
┌──────────────────┐    a cada 30 min    ┌─────────────────┐
│ Mercado Livre API│ ──────────────────▶ │  scraper (Py)   │
└──────────────────┘                     └────────┬────────┘
                                                  │ filtra desc>=30% e ★>=4
                                                  ▼
                                         ┌─────────────────┐
                                         │  Claude Haiku   │ (curadoria + reescrita)
                                         └────────┬────────┘
                                                  │ aprovada=true
                                                  ▼
                                         ┌─────────────────┐
                                         │   Supabase DB   │ (Realtime)
                                         └────────┬────────┘
                                                  │ subscribe
                                                  ▼
                                         ┌─────────────────┐
                                         │  Next.js (Web)  │
                                         └─────────────────┘
```

## Rotas do site (Next.js)

| Rota | Descrição |
|------|-----------|
| `/` | Feed de promoções, busca inteligente, filtros e banner em destaque |
| `/salvos` | Favoritos persistidos no navegador (`localStorage`) |
| `/alertas` | Alertas de preço locais + toast in-app via Realtime |

## Funcionalidades web

- **Realtime** — lista atualiza ao vivo (INSERT/UPDATE/DELETE no Supabase)
- **Busca inteligente** — sinônimos + RPC `buscar_promocoes` + fallback `ilike`
- **Filtros avançados** — categoria, frete grátis, faixa de preço, desconto mínimo, ordenação
- **Favoritos** — coração nos cards, sincronização de preços via Realtime
- **Compartilhar** — WhatsApp, copiar link, Web Share API
- **Alertas** — critérios por termo/preço/desconto; toast quando houver match (aba aberta)

O app mobile Expo (`promocaopro-mobile`) consome o mesmo Supabase; o web não usa push nativo.

## Estrutura do repositório

```
promoçõesPro/
├── app/                    ← Next.js App Router
│   ├── page.tsx            ← home
│   ├── salvos/
│   └── alertas/
├── components/
├── hooks/
├── store/                  ← zustand (salvos, alertas, toasts)
├── lib/
├── supabase/migrations/
├── scraper/                ← Python: busca + curadoria + persistência
├── .github/workflows/      ← cron do scraper a cada 30 min
├── package.json
└── next.config.ts
```

## Como rodar o front-end localmente

```bash
npm install
npm run dev
# abra http://localhost:3000
```

### Variáveis de ambiente (`.env.local`)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/public (nunca use `service_role` no front) |

Copie de `.env.local.example` e preencha a anon key.

## Como rodar o scraper localmente

```bash
cd scraper
python -m venv .venv
.venv\Scripts\activate         # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env          # preencha MELI_CLIENT_SECRET, etc.
python main.py --once           # execução única
python main.py                  # loop infinito a cada 30 min
```

## Migrations Supabase relevantes

- `20260521120000_add_ultima_vista_em_to_promocoes.sql`
- `20260523120000_frete_expires_buscar_promocoes.sql` — colunas `frete_gratis`, `expires_at` e RPC de busca

## Status das etapas

- [x] **Etapa 1** — Tabela `promocoes` no Supabase (com RLS + Realtime)
- [x] **Etapa 2** — Scraper Python: busca ofertas no Mercado Livre
- [x] **Etapa 3** — Filtro com Claude Haiku + persistência no Supabase
- [x] **Etapa 4** — Front-end Next.js com Realtime
- [x] **Etapa 5** — Deploy no Vercel + cron do GitHub Actions (veja [`DEPLOY.md`](./DEPLOY.md))
- [x] **Etapa 6** — Paridade web/mobile: busca, filtros, salvos, alertas, compartilhar

## Variáveis de ambiente do scraper (.env)

| Variável | Onde pegar |
|---|---|
| `MELI_CLIENT_ID` | Painel Mercado Livre Developers → suas credenciais |
| `MELI_CLIENT_SECRET` | Painel Mercado Livre Developers → suas credenciais |
| `MELI_AFFILIATE_ID` | seu user no programa Afiliados Brasil (ex: `andeciofmendes`) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` (segredo!) |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5` (padrão) |
