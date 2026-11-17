"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  supabase: Record<"public" | "secret", { ok: boolean; detail: string }>;
};

const labels = { public: "Supabase (chiave pubblica)", secret: "Supabase (chiave segreta)" };

export function HealthStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-red-600">Errore: {error}</p>;
  if (!health) return <p className="text-zinc-500">Controllo connessione…</p>;

  return (
    <ul className="space-y-2 text-left">
      {(Object.keys(labels) as (keyof typeof labels)[]).map((k) => (
        <li key={k} className="flex items-center gap-3">
          <span
            className={`inline-block size-3 rounded-full ${health.supabase[k].ok ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <span className="font-medium">{labels[k]}</span>
          <span className="text-zinc-500">— {health.supabase[k].detail}</span>
        </li>
      ))}
    </ul>
  );
}
