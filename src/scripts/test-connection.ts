import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Defina SUPABASE_URL e SUPABASE_ANON_KEY (ou NEXT_PUBLIC_*) no .env");
  process.exit(1);
}

const supabase = createClient(url, key);
const { data, error } = await supabase.auth.getSession();

if (error) {
  console.error("Falha ao falar com o Supabase:", error.message);
  process.exit(1);
}

console.log("Conexão OK com PromoçõesPro / Supabase.");
console.log("URL:", url);
console.log("Sessão ativa:", data.session ? "sim" : "não (esperado antes do login)");
