import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Next.js 14 met en cache les fetch côté serveur (Data Cache, persistant sur Vercel) :
// sans no-store, les lectures Supabase renvoyaient des données périmées (créneaux déjà réservés affichés libres)
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });
const serverOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: noStoreFetch },
};

// Client public (côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (côté serveur - accès complet). Partagé entre requêtes :
// il ne doit JAMAIS porter de session utilisateur, sinon ses requêtes partent avec les droits de cet utilisateur.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, serverOptions);

// Client jetable, un par requête, pour les connexions par mot de passe (login, auto-login après inscription)
export function createAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, serverOptions);
}

// Types Supabase
export type { User, Session } from "@supabase/supabase-js";
