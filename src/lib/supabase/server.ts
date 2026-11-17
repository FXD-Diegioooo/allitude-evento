import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertPublicEnv } from "@/lib/env";

/**
 * Client Supabase con la secret key (service role).
 * Da usare SOLO nelle Route Handlers: il server è l'unica autorità che scrive.
 */
export function getServiceSupabase(): SupabaseClient {
  const { supabaseUrl } = assertPublicEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Manca SUPABASE_SECRET_KEY (vedi .env.example)");
  }
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceKey() {
  return Boolean(process.env.SUPABASE_SECRET_KEY);
}
