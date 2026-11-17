import { connection } from "next/server";
import { publicEnv } from "@/lib/env";
import { getServiceSupabase, hasServiceKey } from "@/lib/supabase/server";

type Check = { ok: boolean; detail: string };

/** Verifica la connessione a Supabase con la chiave pubblica e con quella segreta. */
export async function GET() {
  await connection(); // sempre a runtime, mai prerenderizzata

  const publicCheck: Check = { ok: false, detail: "" };
  try {
    const res = await fetch(`${publicEnv.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: publicEnv.supabasePublishableKey },
      cache: "no-store",
    });
    publicCheck.ok = res.ok;
    publicCheck.detail = res.ok ? "raggiungibile" : `HTTP ${res.status}`;
  } catch (e) {
    publicCheck.detail = e instanceof Error ? e.message : "errore";
  }

  const secretCheck: Check = { ok: false, detail: "SUPABASE_SECRET_KEY non impostata" };
  if (hasServiceKey()) {
    try {
      const { error } = await getServiceSupabase().auth.admin.listUsers({ perPage: 1 });
      secretCheck.ok = !error;
      secretCheck.detail = error ? error.message : "chiave valida";
    } catch (e) {
      secretCheck.detail = e instanceof Error ? e.message : "errore";
    }
  }

  return Response.json({
    ok: publicCheck.ok && secretCheck.ok,
    supabase: { public: publicCheck, secret: secretCheck },
    time: new Date().toISOString(),
  });
}
