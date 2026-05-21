# PromoçõesPro

Projeto novo, separado do antigo **Sistema de Cobrança** (`C:\cobranca sistema 2026`).

## Supabase

| Campo | Valor |
|--------|--------|
| Nome no dashboard | **Promoções** |
| Região | `sa-east-1` |
| Project ref | `xtgnqttklwsyecrutmut` |
| URL da API | `https://xtgnqttklwsyecrutmut.supabase.co` |

O banco `public` ainda está vazio — próximo passo: criar tabelas/migrations.

## App web (Next.js)

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — a página confirma a conexão com o Supabase.

## Configuração local

1. Copie as variáveis (se ainda não tiver `.env`):

   ```powershell
   copy .env.example .env
   ```

2. Instale e teste:

   ```bash
   npm install
   npm run test:supabase
   npm run build
   ```

## Deploy na Vercel

1. Importe **https://github.com/samu-svg/promo-esPro**
2. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy — framework detectado: **Next.js**

3. (Opcional) CLI Supabase para migrations:

   ```bash
   npx supabase login
   npx supabase link --project-ref xtgnqttklwsyecrutmut
   ```

## Uso no código

```ts
import { supabase } from "./lib/supabase.js";
// ou, em scripts Node: import "dotenv/config" antes
```

Chaves ficam só em `.env` (não commitar). Use a chave **publishable** (`sb_publishable_...`) em apps novos quando migrar do anon legado.

## GitHub

O repositório local já tem o commit inicial. Para publicar:

1. Entre na conta **samu-svg** no GitHub CLI:

   ```powershell
   gh auth login -h github.com -p https -w
   ```

   Abra https://github.com/login/device, cole o código de 8 caracteres e autorize como **samu-svg**.

2. Publique o repositório:

   ```powershell
   Set-Location -LiteralPath 'C:\promoçõesPro'
   .\scripts\publish-github.ps1
   ```

   Repositório: **https://github.com/samu-svg/promo-esPro**

**Sincronizar (URL já definida):**

   ```powershell
   Set-Location -LiteralPath 'C:\promoçõesPro'
   .\scripts\sync-github.ps1 -RepoUrl https://github.com/samu-svg/promo-esPro.git
   git push -u origin master
   ```
