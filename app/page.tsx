import { createClient } from "@/lib/supabase/server";

export default async function Home() {
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
