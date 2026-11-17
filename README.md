# Evento Allitude — minigioco interattivo

Esperienza web per un evento dal vivo: i partecipanti scansionano un QR, ricevono un avatar 3D, giocano a minigiochi dal telefono e reagiscono alla presentazione. Specifica completa in [`game-design.md`](game-design.md); stato e decisioni in [`CLAUDE.md`](CLAUDE.md).

## Stack
Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · React Three Fiber · Framer Motion · Zustand · Supabase (Postgres, Realtime, Storage) · Vercel.

## Setup locale
Requisiti: Node 20.9+ e npm.

```bash
npm install
cp .env.example .env.local   # poi compila i valori
npm run dev
```

Apri http://localhost:3000: la home mostra se la connessione a Supabase funziona (con chiave pubblica e segreta). Lo stesso controllo è disponibile in JSON su `/api/health`.

### Variabili d'ambiente
| Variabile | Dove si trova | Note |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API | Pubblica |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys | Pubblica |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys | **Segreta**, solo server |
| `ADMIN_PASSWORD` | scelta da voi | Dalla Fase 2 |
| `ADMIN_SESSION_SECRET` | `openssl rand -hex 32` | Dalla Fase 2 |

Su Vercel vanno inserite le stesse variabili in Project → Settings → Environment Variables.

## Script
| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo |
| `npm run build` / `npm start` | Build e avvio di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | Controllo TypeScript |
| `npm run format` | Prettier |

## Struttura
```
src/
  app/
    page.tsx            home "hello" + stato connessione
    api/health/         verifica connessione Supabase
    join/               vista giocatore (telefono)
    screen/             schermo dell'evento
    admin/              dashboard admin
  components/           componenti React condivisi
  lib/
    env.ts              variabili d'ambiente pubbliche
    supabase/browser.ts client per il browser (lettura + Realtime)
    supabase/server.ts  client con secret key, solo Route Handlers
  stores/               store Zustand
supabase/migrations/    migrazioni SQL del database
```
