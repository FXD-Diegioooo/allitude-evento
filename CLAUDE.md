# CLAUDE.md — Minigioco interattivo per evento

Documenti di riferimento:
- `game-design.md` — specifica completa del progetto (fonte di verità).
- `riferimento-avatar-mii-creator.md` — analisi dell'editor Mii Creator, usata come riferimento di struttura per gli asset.

Regola di lavoro: una fase alla volta (sezione 12 di `game-design.md`); a fine fase verifico i criteri, riassumo, aggiorno questo file e attendo approvazione.

## Stato delle fasi

| Fase | Stato |
|---|---|
| 0 — Setup progetto | In corso: codice pronto e verificato in locale; mancano secret key, primo push e deploy Vercel (a cura di Diego) |
| 1 — Prototipo avatar | Da iniziare |
| 2–10 | Da iniziare |

## Decisioni prese

| Data | Tema | Decisione |
|---|---|---|
| 2026-11-17 | Asset avatar | Li produce Claude via codice (geometrie Three.js, viso disegnato su canvas). Il sistema deve permettere di sostituire in seguito ogni parte con SVG/GLB senza toccare il resto. |
| 2026-11-17 | Scelte dell'utente sull'avatar | L'unica scelta diretta dell'utente è **uomo / donna**. Tutto il resto è generato (risposte del form + casualità). |
| 2026-11-17 | Varietà / unicità | Ogni avatar deve essere **visibilmente diverso** dagli altri. Si usano tutti i parametri disponibili, anche colori "pazzi" (es. pelle verde, capelli blu). L'unicità si valuta sui tratti discreti, non sui parametri di posizione. |
| 2026-11-17 | Tornare indietro di fase | Rollback completo "come se nulla fosse successo": punteggi, scelte e score_events dello stato annullato vengono rimossi. |

## Da definire (rimandato dall'organizzatore)

- Domande del form avatar: da rivedere.
- Catalogo e regole dei minigiochi: da rivedere.
- Indovina il collega: avatar sul telefono in 3D o immagine statica → si decide in base alla resa.
- Restano aperte le decisioni della sezione 14 di `game-design.md`.

## Architettura e convenzioni

@AGENTS.md

- **Next.js 16.4** con `cacheComponents: true`: le pagine/route sono prerenderizzate se non usano dati runtime. Le Route Handlers che leggono DB o stato chiamano `await connection()` (da `next/server`) o usano `use cache` in un helper. Prima di usare API Next, leggere `node_modules/next/dist/docs/`.
- **Supabase**, progetto `chtgehihrzjyhuwdooxg`. Chiavi nuove: `sb_publishable_…` (browser) e `sb_secret_…` (server).
  - `src/lib/supabase/browser.ts` → client pubblico (lettura + Realtime).
  - `src/lib/supabase/server.ts` → client con secret key, `import "server-only"`, usato solo nelle Route Handlers.
  - Migrazioni SQL in `supabase/migrations/` (CLI Supabase non installata: si applicano dal SQL editor o con `npx supabase` quando servirà).
- **Repo:** `git@github.com:FXD-Diegioooo/allitude-evento.git`, branch `main`. **Commit/push e deploy Vercel li fa Diego manualmente**: Claude prepara il codice, non fa push né deploy.
- **Env:** `.env.local` locale (ignorato da git), template in `.env.example`.
- **Stile codice:** Prettier (printWidth 100, plugin Tailwind) + ESLint (next + prettier). Testi UI e commenti in italiano, identificatori in inglese.
- **Struttura:** `src/app/{join,screen,admin}` per le tre viste, `src/app/api/*` per le API, `src/components`, `src/lib`, `src/stores` (Zustand).
