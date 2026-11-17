import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-amber-50 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-zinc-900">Ciao! 👋</h1>
      <p className="max-w-md text-lg text-zinc-600">
        Minigioco interattivo per l&apos;evento — Fase 0: setup del progetto.
      </p>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <HealthStatus />
      </section>
    </main>
  );
}
