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

## Configuração local

1. Copie as variáveis (se ainda não tiver `.env`):

   ```bash
   copy .env.example .env
   ```

2. Instale dependências e teste a conexão:

   ```bash
   npm install
   npm run test:supabase
   ```

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

   Cria e envia para: **https://github.com/samu-svg/promocoes-pro**

**Alternativa (sem CLI):** crie o repo vazio em github.com/new (owner `samu-svg`, nome `promocoes-pro`), depois:

   ```powershell
   Set-Location -LiteralPath 'C:\promoçõesPro'
   git remote add origin https://github.com/samu-svg/promocoes-pro.git
   git push -u origin master
   ```
