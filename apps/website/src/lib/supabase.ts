// apps/website/src/lib/supabase.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ SINGLETON - Une seule instance par type
let clientComponentInstance: any = null;
let simpleClientInstance: any = null;

// ✅ Client pour Client Components avec cookies cross-domain (SINGLETON)
export const createClientClient = () => {
  if (!clientComponentInstance) {
    clientComponentInstance = createClientComponentClient({
      cookieOptions: {
        domain: ".oppsys.io",
        path: "/",
        secure: true,
        sameSite: "lax",
      },
    });
  }
  return clientComponentInstance;
};

// ✅ Client simple SANS cookies (SINGLETON)
export const getSimpleSupabaseClient = () => {
  if (!simpleClientInstance) {
    simpleClientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return simpleClientInstance;
};

// ✅ Alias pour compatibilité - MÊME INSTANCE
export const createSupabaseClient = createClientClient;

// ✅ Export par défaut - MÊME INSTANCE
export default createClientClient;

// ✅ Instance simple pour les cas où on n'a pas besoin de cookies
export const supabase = getSimpleSupabaseClient();

// ✅ NETTOYAGE - Fonction pour reset les instances si besoin (dev uniquement)
export const resetSupabaseInstances = () => {
  if (process.env.NODE_ENV === "development") {
    clientComponentInstance = null;
    simpleClientInstance = null;
  }
};
