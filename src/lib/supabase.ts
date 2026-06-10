import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client public (côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin (côté serveur - accès complet)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Types Supabase
export type { User, Session } from "@supabase/supabase-js";
