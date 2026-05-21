# Deploy do PromoçãoPro

Dois componentes a colocar no ar:

1. **Front-end Next.js** → Vercel (CDN global + Realtime via Supabase).
2. **Scraper Python** → GitHub Actions cron a cada 30 min (gratuito, sem servidor).

A estrutura é um **monorepo simples**: Next.js no root, scraper Python em
`scraper/`, workflow do cron em `.github/workflows/scraper.yml`.

---

## Passo 1 — Cadastrar os GitHub Secrets do scraper

No repositório `samu-svg/promo-esPro` no GitHub:

1. **Settings → Secrets and variables → Actions → New repository secret**
2. Crie um secret para cada item abaixo:

   | Secret | Valor |
   |---|---|
   | `MELI_CLIENT_ID` | `3984013574335390` |
   | `MELI_CLIENT_SECRET` | `C6kzRi7mZHH8jtOs5AExa5QLDLYINep3` |
   | `MELI_AFFILIATE_ID` | `andeciofmendes` |
   | `SUPABASE_URL` | `https://xtgnqttklwsyecrutmut.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | (a key `service_role` do Supabase) |
   | `ANTHROPIC_API_KEY` | (a key do Claude) |

3. Vá em **Actions → scraper-promocoes → Enable workflow** (se aparecer botão).
4. Clique em **Run workflow → Run** pra disparar a primeira rodada manualmente.

Depois disso o cron roda sozinho a cada 30 minutos.

> Custo do GitHub Actions: 2 000 min/mês grátis. Cada rodada ~2–4 min,
> então cabe folgado (~1 200–1 400 min/mês).

---

## Passo 2 — Configurar o projeto Vercel

Você já tem o projeto `promo-es-pro` na Vercel ligado ao GitHub. Como
acabamos de **reestruturar o projeto** (Next.js movido pro root), as
próximas deploys vão funcionar sem mexer no Root Directory.

### Variáveis de ambiente

Em https://vercel.com/samu-svgs-projects/promo-es-pro/settings/environment-variables, adicione (Production, Preview, Development):

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xtgnqttklwsyecrutmut.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_IN8XXI5F7uKXGIHG9Zp1tg_0iI9HOeJ` |

### Confirmar que NÃO há Root Directory configurado

Em **Settings → General → Root Directory** deve estar vazio (default = repo root).
Se aparecer `web` lá (de configurações antigas), apague e deixe vazio.

### Apagar o projeto duplicado (opcional)

Você tem um projeto duplicado chamado `promo-es-pro-zefd` que não está
sendo usado. Pode apagar em **Project Settings → Delete Project**.

### Disparar uma nova deploy

Quando o `git push` deste commit chegar no GitHub, a Vercel detecta e
faz deploy sozinha. Se quiser forçar manualmente:
**Deployments → ⋯ no último deploy → Redeploy → Redeploy without cache**.

---

## Passo 3 — Domínio customizado (opcional)

Em Vercel → **Project → Settings → Domains** adicione um domínio
(ex: `promocaopro.com.br`). A Vercel emite SSL automático.

---

## Passo 4 — Validação ponta-a-ponta

1. Dispare o workflow do GitHub Actions manualmente.
2. Aguarde 1–3 minutos. Confira no Supabase Studio que a tabela `promocoes`
   tem registros novos.
3. Abra a URL da Vercel. Deve aparecer o feed.
4. Dispare o workflow de novo: você deve ver **novas ofertas aparecendo
   no browser sem refresh** (Realtime).

---

## Monitoramento e custos estimados

| Item | Custo |
|---|---|
| Vercel (Hobby) | Grátis |
| Supabase (Free) | Grátis até 500 MB |
| GitHub Actions | Grátis até 2 000 min/mês |
| Claude Haiku | ~R$ 7–10/mês em regime estável (só itens novos) |
| **Total** | ~**R$ 7–10/mês** |

Para monitorar:
- **Vercel** → Logs do projeto
- **GitHub Actions** → Aba Actions
- **Supabase** → Database → Logs
- **Anthropic** → Console → Usage

---

## Trocas futuras úteis

- **Afiliado oficial**: trocar `build_affiliate_link()` em
  `scraper/mercado_livre.py` pela chamada ao short-link API do Afiliados
  Brasil quando você ativar.
- **Mais lojas**: replicar o `MercadoLivreClient` em outros módulos
  (`amazon.py`, `shopee.py`) seguindo a mesma interface.
- **Notificações push**: adicionar Web Push ou Telegram quando uma
  promoção entrar com >70% de desconto.
