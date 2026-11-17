"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertPublicEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

/** Client Supabase per il browser: solo lettura dati pubblici + Realtime. */
export function getBrowserSupabase(): SupabaseClient {
  if (!client) {
    const { supabaseUrl, supabasePublishableKey } = assertPublicEnv();
    client = createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
