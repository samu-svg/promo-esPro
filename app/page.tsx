import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/env";

export default async function Home() {
  const env = getSupabaseEnv();

  if (!env) {
    return (
      <main>
        <h1>PromoçõesPro</h1>
        <p className="warn">
          Variáveis de ambiente do Supabase não configuradas neste deploy.
        </p>
        <div className="card">
          <p>
            Na <strong>Vercel</strong> → projeto <strong>promo-es-pro</strong> →
            Settings → Environment Variables, adicione:
          </p>
          <ul>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_URL</code> ={" "}
              <code>https://xtgnqttklwsyecrutmut.supabase.co</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = chave anon do projeto
              Promoções
            </li>
          </ul>
          <p>Marque Production, Preview e Development. Depois faça <strong>Redeploy</strong>.</p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  const conectado = !error;
  const sessao = data.session ? "ativa" : "nenhuma (normal antes do login)";

  return (
    <main>
      <h1>PromoçõesPro</h1>
      <p>Gestão de promoções — projeto conectado ao Supabase.</p>

      <div className="card">
        <p>
          <strong>Supabase:</strong>{" "}
          <span className={conectado ? "ok" : "err"}>
            {conectado ? "conectado" : "erro"}
          </span>
        </p>
        {error && <p className="err">{error.message}</p>}
        <p>
          <strong>Sessão:</strong> {sessao}
        </p>
        <p>
          <strong>Projeto:</strong>{" "}
          <code>xtgnqttklwsyecrutmut</code> (Promoções, sa-east-1)
        </p>
      </div>
    </main>
  );
}
