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

## Estrutura do repositório

```
promoçõesPro/
├── app/                    ← Next.js App Router (front-end)
├── components/
├── lib/
├── public/
├── scraper/                ← Python: busca + curadoria + persistência
│   ├── main.py
│   ├── mercado_livre.py
│   ├── claude_curator.py
│   ├── supabase_repo.py
│   ├── config.py
│   ├── requirements.txt
│   └── .env.example
├── .github/workflows/      ← cron do scraper a cada 30 min
├── package.json
├── tsconfig.json
└── next.config.ts
```

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

## Status das etapas

- [x] **Etapa 1** — Tabela `promocoes` no Supabase (com RLS + Realtime)
- [x] **Etapa 2** — Scraper Python: busca ofertas no Mercado Livre
- [x] **Etapa 3** — Filtro com Claude Haiku + persistência no Supabase
- [x] **Etapa 4** — Front-end Next.js com Realtime
- [x] **Etapa 5** — Deploy no Vercel + cron do GitHub Actions (veja [`DEPLOY.md`](./DEPLOY.md))

## Como rodar o front-end localmente

```bash
npm install
npm run dev
# abra http://localhost:3000
```

O `.env.local` na raiz já está preenchido com `NEXT_PUBLIC_SUPABASE_URL` e a publishable key.

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
