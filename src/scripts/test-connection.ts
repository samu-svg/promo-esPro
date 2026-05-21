import "dotenv/config";
import { supabase } from "../lib/supabase.js";

const { data, error } = await supabase.auth.getSession();

if (error) {
  console.error("Falha ao falar com o Supabase:", error.message);
  process.exit(1);
}

console.log("Conexão OK com PromoçõesPro / Supabase.");
console.log("URL:", process.env.SUPABASE_URL);
console.log("Sessão ativa:", data.session ? "sim" : "não (esperado antes do login)");
