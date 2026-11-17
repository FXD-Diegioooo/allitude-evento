# Game Design Document — Minigioco interattivo per evento

> **Istruzioni per Claude Code**
> Questo documento descrive l'intero progetto. Lavora **una fase alla volta** (vedi sezione 12).
> Alla fine di ogni fase: verifica i criteri di completamento, riassumi cosa hai fatto, **fermati e attendi la mia approvazione** prima di passare alla fase successiva.
> Se una scelta non è definita qui, proponi un'opzione e chiedi conferma invece di decidere in autonomia su aspetti di design o UX.
> Mantieni aggiornato un file `CLAUDE.md` con architettura, decisioni prese e stato delle fasi.

---

## 0. Brief originale (da usare come ispirazione)

> Il testo che segue è la richiesta originale da cui nasce il progetto. Il resto del documento lo struttura e lo precisa; in caso di dubbio sull'intento, torna qui.

Voglio fare una sorta di minigioco per un evento.

In generale il gioco deve avere due viste, una vista giocatori, una vista dashboard di controllo degli amministratori che regolano l'evento.

Si parte con un QR Code, gli utenti dell'evento possono scansionarlo dal loro telefono, se scansionato la persona vedrà nel suo telefono un form che deve compilare con delle domande. In base a come risponderà alle domande gli verrà creato un avatar personalizzato (l'idea è che ogni membro dell'evento abbia un avatar proprio diverso dagli altri).

Una volta che hai creato l'avatar, questo compare sullo schermo della presentazione, come se ci fosse una mini piazza in cui ci sono tutti questi avatar che si muovono in attesa che l'evento parta. Nel mentre l'utente sul suo telefono vede che si è in attesa e può vedere come è fatto il suo avatar.

In tutto questo nella vista amministratore si vede una dashboard in cui si vedono quante persone stanno partecipando, chi sono e la possibilità di stoppare la creazione avatar e partire con la fase successiva.

Quando l'amministratore passa alla fase successiva il telefono degli utenti dell'evento si trasforma in un controller in cui possono comandare il proprio avatar in alcuni minigiochi. I minigiochi si dividono in giochi interattivi e domande, quindi il telefono a seconda del gioco che si fa si trasforma (magari prima è un controller in cui puoi muovere il tuo omino, magari diventa una pulsantiera con 2 bottoni, ecc). Ad ogni fine gioco si vede la classifica o un recap delle risposte degli utenti. Se era un gioco ogni utente guadagnerà poi dei punti e alla fine del gioco si vede la classifica che si aggiorna. Quando si vede la classifica è l'amministratore dalla sua dashboard che dà l'ok per proseguire con il prossimo gioco.

Alla fine dei giochi si vedrà la classifica aggiornata e l'utente che avrà fatto più punti riceve una corona dorata (che terrà per tutto il tempo). La consegna della corona sarà un'animazione.

Una volta finita la fase di gioco parte la fase di presentazione. Dalla console amministratore deve essere possibile caricare una presentazione PDF o PPT, poi dallo schermo dell'evento si deve vedere la presentazione (si può andare avanti e indietro tramite la console amministratore) e nel mentre si vede la presentazione sotto c'è uno spazio in cui si vedono alcuni avatar che si muovono. Questo perché gli utenti dell'evento nel mentre le persone presentano vedranno sul loro telefono una pulsantiera in cui possono reagire alla presentazione (esempio: cuore, pollice in su, alzo la mano). Se viene fatta una reazione poi si vede sullo schermo (esempio: io premo cuore allora compaiono dei cuoricini con un'animazione sullo schermo dell'evento, se invece premo alza la mano compare il mio personaggio sotto o da un lato dello schermo come se volesse fare una domanda).

Il tutto deve essere utilizzabile tramite sito html, posso creare sia frontend e backend e host (Supabase e Vercel). Per la parte amministratore possiamo creare una sorta di dashboard di controllo e una pagina di "login" in modo che solo chi sa la password per accedere può entrare nel portale amministratore.

L'idea è di fare qualcosa in stile 3D come i Mii della Wii. Le immagini di riferimento mostrano: minigiochi in split-screen in cucina, un'arena divisa in due zone colorate con gli avatar che scelgono da che parte stare, un percorso stile gioco dell'oca con dadi, un palco da quiz show con punteggio "Bank +500" e una piazza piena di avatar che passeggiano.

**Aggiornamenti successivi al brief:**
- Partecipanti previsti: circa 25.
- I minigiochi sono solo **a scelta** (nessun joystick per muovere liberamente il personaggio).

---

## 1. Visione

Un'esperienza web interattiva per un evento dal vivo (~25 partecipanti). Ogni partecipante scansiona un QR code, crea un avatar 3D personale rispondendo ad alcune domande, lo vede comparire su un grande schermo in una "piazza" condivisa, poi usa il telefono come controller per una serie di minigiochi a scelta. Alla fine il vincitore riceve una corona dorata con un'animazione. Segue una fase di presentazione in cui il pubblico reagisce in tempo reale dal telefono.

**Atmosfera:** allegra, morbida, colorata, in stile "party game" da console anni 2000. Avatar semplici e simpatici, con teste tonde e facce espressive.

**Principi guida**
- Zero installazioni: tutto dal browser.
- Il telefono è semplice, lo schermo grande è lo spettacolo.
- Ogni scelta fatta sul telefono deve **vedersi** sullo schermo (l'avatar si muove, reagisce, festeggia).
- Tollerante ai ritardi di rete: nessun gioco dipende da tempi di reazione al millisecondo.
- L'amministratore ha sempre il controllo del ritmo: nessun passaggio di fase automatico senza il suo ok (tranne i timer interni ai round).

---

## 2. Vincoli e requisiti

| Voce | Valore |
|---|---|
| Partecipanti previsti | ~25 (progettare e testare per 50) |
| Schermo evento | 1920×1080, browser Chrome a schermo intero su PC/Mac collegato al proiettore |
| Telefoni | iOS Safari 16+ e Android Chrome recenti |
| Lingua | Italiano |
| Hosting | Vercel (frontend + API), Supabase (DB, Realtime, Storage) |
| Accesso admin | Pagina di login con password |
| Rete | Wi-Fi dell'evento, potenzialmente instabile → riconnessione automatica obbligatoria |

---

## 3. Stack tecnico

- **Framework:** Next.js (App Router) + TypeScript
- **3D:** Three.js tramite React Three Fiber + @react-three/drei
- **UI e animazioni 2D:** Tailwind CSS + Framer Motion
- **Stato client:** Zustand
- **Backend:** Next.js Route Handlers (API) su Vercel
- **Database:** Supabase Postgres
- **Tempo reale:** Supabase Realtime (Broadcast per eventi veloci, Presence per chi è online)
- **File:** Supabase Storage (PDF della presentazione)
- **PDF:** pdf.js (es. `react-pdf`)
- **QR:** libreria di generazione QR lato client (es. `qrcode`)

**Regola architetturale:** il **server è l'autorità**. Punteggi, cambi di fase, validazione delle scelte e assegnazione della corona avvengono nelle API con la service role key di Supabase. I client (telefono, schermo, admin) leggono lo stato e si iscrivono ai canali realtime, ma non scrivono direttamente le tabelle sensibili.

---

## 4. Le tre viste

| Vista | Route | Dispositivo | Ruolo |
|---|---|---|---|
| Giocatore | `/join` | Telefono | Form, attesa, controller, reazioni |
| Schermo | `/screen` | PC collegato al proiettore | Piazza, minigiochi, classifiche, corona, presentazione |
| Admin | `/admin` (+ `/admin/login`) | Laptop/tablet dell'organizzatore | Controllo dell'evento |

Il QR code punta a `/join?e=<CODICE_EVENTO>` ed è mostrato sullo schermo durante la fase lobby.

---

## 5. Flusso dell'evento (macchina a stati)

```
SETUP → LOBBY → [per ogni minigioco: GAME_INTRO → ROUND_ACTIVE → ROUND_REVEAL → (ripeti round) → GAME_RESULTS]
      → FINAL_LEADERBOARD → CROWN_CEREMONY → PRESENTATION → END
```

| Stato | Schermo | Telefono | Admin |
|---|---|---|---|
| `SETUP` | Schermata di benvenuto | "L'evento non è ancora iniziato" | Crea/configura evento, carica PDF, ordina minigiochi |
| `LOBBY` | Piazza con avatar che passeggiano + QR + contatore | Form → creazione avatar → attesa con anteprima del proprio avatar | Lista partecipanti, contatore, "Chiudi registrazioni", "Inizia giochi" |
| `GAME_INTRO` | Titolo e regole del minigioco | "Preparati!" + regole brevi | "Avvia round" |
| `ROUND_ACTIVE` | Domanda/scenario + timer, gli avatar si spostano verso le scelte | Interfaccia di scelta specifica del gioco | Vede quanti hanno risposto, "Chiudi round" anticipato |
| `ROUND_REVEAL` | Rivelazione esito con animazione | Esito personale (+punti) | "Round successivo" / "Termina gioco" |
| `GAME_RESULTS` | Classifica aggiornata animata | Posizione e punti personali | "Prossimo gioco" |
| `FINAL_LEADERBOARD` | Classifica finale | Posizione finale | "Avvia cerimonia" |
| `CROWN_CEREMONY` | Animazione consegna corona al vincitore | Vincitore: schermata celebrativa; altri: "Complimenti a X!" | "Vai alla presentazione" |
| `PRESENTATION` | Slide PDF + striscia avatar in basso + reazioni | Pulsantiera reazioni | Avanti/indietro slide, coda mani alzate |
| `END` | Schermata di chiusura con tutti gli avatar | "Grazie!" + il proprio avatar | Reset evento |

L'admin deve poter **tornare indietro di uno stato** in caso di errore e **riportare** lo schermo allo stato corrente dopo un refresh (lo stato vive nel DB).

---

## 6. Sistema avatar

### 6.1 Stile visivo
- Testa grande e tonda, corpo piccolo a capsula, mani sferiche, gambe corte. Proporzioni da "chibi".
- **Viso disegnato come texture 2D** (canvas/SVG) applicata sulla parte frontale della testa: occhi, sopracciglia, bocca, eventuali lentiggini o guance rosse. Permette tante espressioni con poco costo.
- Toon shading morbido, colori pastello saturi, ombre circolari a terra.
- Capelli e accessori: set di **mesh low-poly** (modellate o prese da asset CC0) combinate via codice. È il punto estetico più delicato → va validato nella Fase 1.
- Animazioni procedurali: idle (leggero ondeggiamento), camminata (bob + gambe), saluto, salto/festa, delusione, mano alzata.

### 6.1b Riferimento tecnico: come sono costruiti i Mii
Riferimento da studiare per la tecnica: [datkat21/mii-creator](https://github.com/datkat21/mii-creator) (vecchia versione open source, non più aggiornata) e [mii.nxw.pw](https://mii.nxw.pw/app).

Cosa riprendere (l'**architettura**, non il codice o le risorse):
- Ogni tratto è un **indice di parte + colore + parametri** (posizione verticale, scala, rotazione, distanza tra occhi). Pochi asset generano moltissime combinazioni.
- Il viso è composto **a strati 2D** (occhi, sopracciglia, bocca, naso, nei) disegnati su una texture/maschera e poi applicati sulla mesh della testa. Basta cambiare la texture per cambiare l'espressione.
- Capelli, cappelli e accessori sono **mesh separate** agganciate a punti fissi della testa.
- Tabelle colore predefinite per pelle, capelli, occhi e maglia.

Cosa **non** fare: Mii Creator genera le teste con FFL (la libreria Mii di Nintendo, decompilata) e il file di risorse originale `FFLResHigh.dat` (modelli e texture Nintendo dei Mii). Non riusare né la libreria né le risorse. Il nostro progetto deve avere **asset e renderer propri**, interamente in Three.js lato client.

**Analisi completa dell'editor** (categorie, numero di opzioni, parametri, palette e proposta di set ridotto per l'evento): vedi `riferimento-avatar-mii-creator.md`.

**Asset propri:** le parti del viso (occhi, sopracciglia, bocca, naso, extra) si disegnano come SVG in Figma, una parte per file, con colore applicabile via codice. Capelli, accessori e corona sono mesh low-poly in GLB.

### 6.2 Principio: nessun editor, avatar generato
- **L'utente non crea né modifica l'avatar.** Non esiste un editor lato giocatore.
- L'utente risponde alle domande del form; il **server genera l'avatar** combinando le risposte con una componente casuale.
- L'editor di Mii Creator è solo un **riferimento per progettare gli asset** (categorie, numero di varianti, parametri, palette): vedi `riferimento-avatar-mii-creator.md`.
- Per lo sviluppo e la validazione dello stile esiste una pagina interna `/dev/avatar` (non accessibile ai giocatori) con generazione casuale e controllo manuale dei tratti.

### 6.3 Configurazione (schema indicativo)
Ogni tratto è un **indice di parte + colore + parametri**, come nei Mii.
```ts
type AvatarConfig = {
  nickname: string;
  face:     { shape: number; skinTone: number; cheeks: number | null };
  hair:     { style: number; color: number };
  eyebrows: { type: number; color: number; y: number; spacing: number; rotation: number; scale: number };
  eyes:     { type: number; color: number; y: number; spacing: number; rotation: number; scale: number };
  nose:     { type: number; y: number; scale: number };
  mouth:    { type: number; y: number; scale: number };
  facialHair: { mustache: number | null; beard: number | null };
  glasses:  { type: number; color: number } | null;
  hat:      { type: number; color: number } | null;
  outfit:   { type: number; color: number; secondaryColor: number };
  accessory: number | null;
  build:    { height: number; weight: number };
  hasCrown: boolean; // assegnata solo dal server
  seed: string;      // seme della generazione, per riprodurre lo stesso avatar
};
```
I parametri di posizione (y, spacing, rotation, scale) non sono mai scelti dall'utente: li imposta il generatore entro range "belli" definiti nella Fase 1.

### 6.4 Il form e la generazione (proposta da validare)
Da 6 a 8 domande veloci e divertenti, una per schermata, con opzioni visive a tile. Le domande sono **di personalità**, non "scegli i tuoi capelli". Ogni risposta **orienta** alcuni tratti (restringe le opzioni possibili), poi il generatore sceglie a caso all'interno di quelle opzioni.

Esempio di mappatura:

| Domanda | Opzioni | Tratti orientati |
|---|---|---|
| Come ti chiami? | testo (max 12 caratteri, filtro parole) | `nickname` |
| Come sei la mattina prima del caffè? | Raggiante / Zombie / Concentrato / Sorridente | occhi, sopracciglia, bocca (espressione) |
| Il tuo colore preferito? | 8 colori | colore vestito |
| Il tuo weekend ideale? | Divano / Montagna / Città / Festa | tipo di vestito, cappello |
| Cosa non può mancarti? | Musica / Sole / Libri / Sport / … | accessorio, occhiali |
| Il tuo superpotere in ufficio? | 4 opzioni | dettagli extra (guance, lentiggini, baffi) |
| Il tuo animale guida? | 4 opzioni | acconciatura, colore capelli |

I tratti non orientati da nessuna domanda (forma del viso, carnagione, naso, corporatura, parametri di posizione) sono **casuali**.

**Rivelazione:** dopo l'ultima domanda, breve animazione di "assemblaggio" dell'avatar e schermata "Ecco il tuo avatar!" con anteprima 3D che ruota.

**Decisione aperta:** permettere un solo "Rigenera" (stesse risposte, nuovo seme) se l'avatar non piace, oppure nessuna possibilità di cambio.

Le risposte del form vengono salvate anche per il minigioco **Indovina il collega**.

### 6.5 Unicità
- Calcolare un hash dei tratti principali (escluso il nickname).
- Se esiste già, il generatore cambia seme e rigenera i tratti casuali finché la combinazione è unica.
- Con il set di asset previsto le combinazioni sono nell'ordine dei milioni: le collisioni su 25-50 persone sono rarissime, ma la regola deve esserci.

---

## 7. Minigiochi

Tutti i giochi sono **a scelta**: niente joystick. Sul telefono compaiono 2-4 grandi pulsanti colorati (o tile con immagini). Sullo schermo l'avatar **cammina verso l'opzione scelta**.

### 7.1 Framework comune
Ogni minigioco implementa un'interfaccia comune:
```ts
interface MiniGame {
  type: string;
  intro: { title: string; rules: string };
  rounds: Round[];
  phoneUI: (round) => ChoiceOption[];        // cosa vede il telefono
  screenScene: (round, choices) => Scene;     // cosa vede lo schermo
  score: (round, choices) => ScoreDelta[];    // calcolato dal server
  reveal: (round, choices) => RevealData;     // animazione di esito
}
```
- Timer per round configurabile (default 15 s).
- Una sola scelta per giocatore per round (vincolo unique nel DB). La scelta si può cambiare fino allo scadere? **Decisione da prendere** (default: no, la prima è definitiva).
- Chi non risponde: 0 punti, l'avatar resta fermo con un "?" sopra la testa.
- I contenuti (domande, opzioni, risposte corrette) sono configurabili da file JSON/admin, non hardcoded.

### 7.2 Catalogo (proposta: 4-5 giochi per 20-30 minuti)

| # | Gioco | Meccanica | Punti (indicativi) |
|---|---|---|---|
| 1 | **Quiz lampo** | Domanda + 4 risposte. Gli avatar si posizionano sotto la risposta scelta. Reveal: la risposta giusta si illumina. | 100 se giusta + bonus velocità fino a 50 |
| 2 | **Piattaforma che crolla** | 2-4 piattaforme colorate con una domanda/indizio. Ognuno sceglie dove stare, le piattaforme sbagliate crollano e gli avatar cadono (con un rimbalzo comico, poi riappaiono). | 75 per ogni round superato |
| 3 | **Maggioranza / Minoranza** | Domanda d'opinione con 2-3 opzioni. Prima del reveal si annuncia se vince la maggioranza o la minoranza. Mostra la distribuzione delle risposte. | 80 per chi è nel gruppo vincente |
| 4 | **Indovina il collega** | Usa le risposte del form: "Chi ha scelto X come superpotere?" con 4 avatar tra cui scegliere. | 100 se giusto |
| 5 | **Porte misteriose** | 3 porte o forzieri, dietro premi o malus casuali. Rimescola la classifica. | da −30 a +150 |
| 6 | **Scommessa finale** (opzionale) | Ognuno punta 25 / 50 / 100% dei propri punti, poi risponde a un'ultima domanda. | ± puntata |

Per i giochi d'opinione (es. Maggioranza/Minoranza) il reveal mostra anche un **recap delle risposte** (grafico a barre animato con le facce degli avatar).

### 7.3 Classifica
- Dopo ogni gioco: classifica animata con avatar, nickname, punti e frecce di variazione di posizione.
- Sullo schermo i primi 10 in evidenza, poi gli altri a scorrimento. Sul telefono, posizione personale.
- **Parità:** a parità di punti vince chi ha il tempo di risposta cumulativo più basso.

---

## 8. Cerimonia della corona

- Rullo di tamburi (visivo, eventualmente sonoro), luci a riflettore, gli altri avatar in cerchio o sui lati.
- La corona scende dall'alto con particelle dorate e si posa sulla testa del vincitore, che fa un'animazione di festa.
- Da quel momento `hasCrown = true`: la corona resta sull'avatar in **tutte** le viste (schermo, telefono, striscia della presentazione).
- Il telefono del vincitore mostra una schermata celebrativa dedicata.

---

## 9. Presentazione e reazioni

### 9.1 Presentazione
- L'admin carica un **PDF** nella fase `SETUP` (Supabase Storage). Per i PowerPoint: esportare in PDF prima del caricamento. Va indicato chiaramente nell'interfaccia admin.
- Lo schermo mostra la slide corrente nella parte superiore (circa 80% dell'altezza) e una **striscia con gli avatar** che passeggiano in basso (circa 20%).
- L'admin va avanti e indietro con dei pulsanti (supporto anche alle frecce della tastiera). La pagina corrente è sincronizzata via realtime.
- Le slide vanno pre-renderizzate o messe in cache per avere cambi istantanei.

### 9.2 Reazioni dal telefono
Pulsantiera con: ❤️ Cuore, 👍 Pollice su, 👏 Applauso, 😂 Risata, ✋ Alzo la mano.

| Reazione | Effetto sullo schermo |
|---|---|
| Cuore / Pollice / Applauso / Risata | Icone animate che salgono dal basso partendo dal proprio avatar; il proprio avatar fa un piccolo gesto |
| Alzo la mano | Il proprio avatar compare in una colonna laterale con la mano alzata e resta lì finché l'admin non lo congeda |

- Limite: 1 reazione ogni 1,5 s per giocatore (anti-spam), con feedback visivo sul pulsante.
- Admin: vede la **coda delle mani alzate** in ordine e può congedarle una per una o tutte.
- Le reazioni passano da Broadcast (non si salvano necessariamente nel DB). Facoltativo: contatori aggregati per un recap finale.

---

## 10. Dashboard admin

- **Login:** password confrontata lato server con la variabile d'ambiente `ADMIN_PASSWORD`. Se corretta, cookie httpOnly firmato con durata limitata. Tutte le API admin verificano il cookie.
- **Sezioni**
  - *Evento:* stato corrente, pulsante del passaggio successivo ben visibile, pulsante "indietro", reset evento (con conferma).
  - *Partecipanti:* contatore, lista con avatar, nickname, stato online/offline (Presence), punti. Azioni: rimuovi giocatore, rinomina (per nickname inappropriati).
  - *Registrazioni:* apri/chiudi.
  - *Minigiochi:* ordine, attiva/disattiva, modifica contenuti (domande, risposte).
  - *Round in corso:* risposte ricevute / totale, tempo restante, chiudi round.
  - *Presentazione:* carica PDF, anteprima, avanti/indietro, coda mani alzate.
- Pensata per essere usata in fretta durante l'evento: pulsanti grandi, l'azione principale sempre in evidenza.

---

## 11. Modello dati e realtime (proposta)

### 11.1 Tabelle
```
events        (id, code, phase, current_game_index, current_round_index,
               registrations_open, round_ends_at, presentation_page, created_at)
players       (id, event_id, session_token, nickname, avatar_config jsonb,
               avatar_hash, form_answers jsonb, score, total_response_ms,
               has_crown, removed, created_at, last_seen_at)
games         (id, event_id, order_index, type, config jsonb, enabled)
choices       (id, event_id, game_id, round_index, player_id, choice,
               response_ms, created_at,
               UNIQUE(player_id, game_id, round_index))
score_events  (id, event_id, player_id, game_id, round_index, delta, reason)
presentations (id, event_id, storage_path, page_count)
```
Abilitare RLS: i client anonimi possono solo leggere i dati pubblici necessari (avatar, nickname, punteggi, stato dell'evento). Tutte le scritture passano dalle API.

### 11.2 Canali realtime
- `event:<code>` (Broadcast): cambi di fase, avvio/fine round, reveal, pagina della slide, reazioni, mani alzate.
- `event:<code>:presence` (Presence): chi è online (telefoni) e se lo schermo è connesso.
- Alla connessione o riconnessione, ogni client chiede lo **stato completo** a un'API (`GET /api/state`) e poi applica gli eventi successivi.

### 11.3 Sessione del giocatore e riconnessione
- Alla creazione dell'avatar il server restituisce un `session_token`, salvato in `localStorage`.
- Se la pagina si ricarica o la connessione cade, il telefono si ricollega con il token e ritrova avatar, punti e schermata corrente.
- Indicatore discreto "riconnessione…" sul telefono.
- Usare la Screen Wake Lock API dove disponibile per evitare che lo schermo del telefono si spenga, con fallback silenzioso.

---

## 12. Fasi di sviluppo

> Ogni fase si chiude con: criteri verificati, breve demo (link o istruzioni per provarla), aggiornamento di `CLAUDE.md`, **stop e attesa della mia approvazione**.

### Fase 0 — Setup del progetto
- Repo git, Next.js + TypeScript + Tailwind, struttura delle cartelle, lint/format.
- Progetto Supabase collegato, file `.env.example` con le variabili necessarie.
- Primo deploy su Vercel di una pagina "hello".
- `CLAUDE.md` iniziale con architettura e convenzioni.

**Fatto quando:** l'app è online su Vercel, si connette a Supabase e il setup locale funziona seguendo il README.

### Fase 1 — Prototipo avatar (validazione dello stile) ⚠️ fase critica
- Pagina `/dev/avatar`: generatore 3D dell'avatar da `AvatarConfig`, con pannello interno per cambiare ogni tratto (solo per lo sviluppo, non per i giocatori), pulsante "random" e animazioni idle, camminata, festa e mano alzata.
- Mini piazza di prova con 25 avatar casuali che passeggiano.
- Prima proposta di capelli, accessori e corona.
- Nessun backend.

**Fatto quando:** approvo lo stile. Prevedere 2-3 giri di iterazione. Non procedere senza ok esplicito.

### Fase 2 — Fondamenta backend
- Schema DB e migrazioni, RLS, API di stato.
- Login admin + protezione delle route admin.
- Creazione dell'evento e macchina a stati (solo transizioni, senza grafica).
- Canali realtime e `GET /api/state`.
- Pagine scheletro di `/join`, `/screen` e `/admin` che mostrano lo stato corrente e reagiscono ai cambi.

**Fatto quando:** cambiando fase dall'admin, schermo e telefono si aggiornano in tempo reale, e un refresh di qualsiasi vista recupera lo stato corretto.

### Fase 3 — Onboarding giocatore
- QR code generato per l'evento.
- Form a step sul telefono (domande di personalità, nessun editor).
- Generatore lato server: risposte + seme casuale → `AvatarConfig`, animazione di rivelazione dell'avatar.
- Salvataggio, controllo di unicità, session token.
- Schermata di attesa con il proprio avatar (ruotabile, che saluta).
- Riconnessione funzionante; registrazioni chiuse = messaggio dedicato.

**Fatto quando:** da un telefono reale scansiono il QR, creo l'avatar, chiudo il browser, lo riapro e ritrovo il mio avatar.

### Fase 4 — Lobby: piazza + dashboard
- `/screen`: piazza 3D con gli avatar che passeggiano, animazione d'ingresso quando qualcuno si unisce, QR visibile, contatore.
- `/admin`: lista partecipanti con stato online, rimozione/rinomina, apri/chiudi registrazioni, "Inizia giochi".

**Fatto quando:** con 5+ telefoni reali gli avatar compaiono in piazza in pochi secondi e l'admin vede tutti online.

### Fase 5 — Motore dei minigiochi + Quiz lampo
- Framework comune (sezione 7.1): intro, round con timer, raccolta scelte, reveal, punteggi lato server, classifica animata.
- Interfacce telefono per ogni stato.
- Primo gioco completo: **Quiz lampo**.
- Contenuti da file di configurazione.

**Fatto quando:** posso fare un quiz completo di 3 domande con più telefoni, dall'intro alla classifica, guidandolo dall'admin.

### Fase 6 — Altri minigiochi
Un gioco alla volta, con approvazione dopo ciascuno:
1. Piattaforma che crolla
2. Maggioranza / Minoranza (con recap delle risposte)
3. Indovina il collega
4. Porte misteriose
5. (opzionale) Scommessa finale

**Fatto quando:** ogni gioco è giocabile da inizio a fine e configurabile dall'admin.

### Fase 7 — Classifica finale + cerimonia della corona
- Classifica finale con suspense (rivelazione dal basso verso l'alto).
- Animazione della corona, persistenza di `hasCrown` in tutte le viste, schermata celebrativa sul telefono del vincitore.

**Fatto quando:** la corona viene consegnata con l'animazione e resta visibile sull'avatar del vincitore in schermo, telefono e presentazione.

### Fase 8 — Presentazione + reazioni
- Upload del PDF, rendering delle slide, navigazione dall'admin sincronizzata.
- Striscia degli avatar in basso.
- Pulsantiera reazioni sul telefono, animazioni sullo schermo, rate limit.
- Mano alzata con coda gestita dall'admin.

**Fatto quando:** con più telefoni le reazioni compaiono sullo schermo in meno di un secondo e la coda delle mani alzate funziona.

### Fase 9 — Rifinitura
- Transizioni tra le fasi, micro-animazioni, schermate di attesa e di fine.
- Audio opzionale (effetti originali o CC0, con interruttore muto dall'admin).
- Branding dell'evento (logo, colori), copy definitivi.
- Accessibilità di base sul telefono (contrasto, dimensione dei tasti, testi leggibili).
- Ottimizzazione delle performance dello schermo (60 fps con 50 avatar).

**Fatto quando:** approvo la resa grafica complessiva.

### Fase 10 — Test e prova generale
- **Simulatore di bot:** script che crea 30-50 giocatori finti che si registrano, rispondono e reagiscono, per i test di carico.
- Test su dispositivi reali: almeno un iPhone e un Android, e il PC dello schermo.
- Test di resilienza: Wi-Fi spento e riacceso sul telefono, refresh dello schermo a metà gioco, admin che torna indietro di fase.
- Pulsante "reset evento" e checklist del giorno dell'evento (aprire lo schermo, verificare la rete, caricare il PDF, ecc.).
- Prova generale completa con colleghi.

**Fatto quando:** la prova generale si chiude dall'inizio alla fine senza interventi tecnici.

---

## 13. Contenuti da preparare (a cura dell'organizzatore)

- Domande del form avatar (versione definitiva).
- Domande e risposte del Quiz lampo e della Piattaforma che crolla.
- Domande d'opinione per Maggioranza / Minoranza.
- Testi delle regole di ogni minigioco.
- PDF della presentazione.
- Logo e colori dell'evento.

---

## 14. Decisioni aperte

- La scelta in un round è definitiva o modificabile fino allo scadere?
- Avatar: consentire un solo "Rigenera" o nessun cambio?
- Chi arriva dopo la chiusura delle registrazioni può unirsi più tardi (con 0 punti)?
- In caso di parità serve un tie-break diverso dal tempo di risposta?
- Audio sì o no, e da dove esce (casse dello schermo)?
- Numero e ordine finale dei minigiochi.
- Nome e branding dell'esperienza.
