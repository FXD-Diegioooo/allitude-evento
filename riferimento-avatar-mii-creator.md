# Riferimento avatar — analisi di Mii Creator

> Documento di supporto a `game-design.md` (sezione 6). Raccoglie come è strutturato l'editor di [Mii Creator](https://mii.nxw.pw/app) (versione "Summer 2026 Update"), da usare come **esempio di struttura** per progettare il nostro sistema avatar con **asset e stile propri**.
> Le forme e le texture di Mii Creator provengono dal file di risorse Nintendo (`FFLResHigh.dat`): qui si riprendono solo l'organizzazione, le categorie e i parametri, non le grafiche.

---

## 1. Come funziona tecnicamente

| Elemento | Come lo fanno | Cosa ne prendiamo |
|---|---|---|
| Rendering | Three.js nel browser, renderer scritto da loro | Stesso approccio: Three.js / React Three Fiber lato client |
| Testa, viso, capelli | Letti da `FFLResLow/Middle/High.dat` (formato risorse FFL di Nintendo) con un lettore JS custom | Asset nostri: SVG per il viso, GLB per testa e capelli |
| Viso | Parti 2D (occhi, sopracciglia, bocca, naso, baffi, neo) composte su una texture-maschera e applicate alla testa | Stessa tecnica: canvas/SVG → texture |
| Corpo | Modelli separati (`body_models_bundle.zip`) con scala per altezza e corporatura | Corpo semplice parametrico |
| Vestiti | Texture applicate al corpo (`mii_clothes_textures_bundle.zip`), fino a 3 colori | Texture/materiali nostri, 1–2 colori |
| Cappelli, accessori | Modelli GLB separati (`hat_models_bundle.zip`, `acce_models_bundle.zip`), fino a 3 colori, agganciati alla testa o al corpo | Mesh GLB nostre agganciate a punti fissi |
| Riflesso occhi, ambiente | Texture dedicate (`eye_shine.zip`, `env.zip`) | Facoltativo, migliora molto la resa |
| Shader | Diversi stili selezionabili: toon, Wii, Wii U, 3DS, Switch, Miitomo, matcap, senza luce | Un solo shader toon nostro |
| Dati | Ogni Mii è un insieme di numeri interi (indice di parte + colore + parametri), salvato in formati binari compatti | Stesso principio, in JSON |

**Principio chiave:** ogni avatar è descritto da una manciata di numeri. Pochi asset combinati con parametri (posizione, scala, rotazione, colore) generano milioni di combinazioni.

---

## 2. Struttura dell'editor (14 schede)

Ordine delle schede nella barra superiore, con le sottoschede e il numero di opzioni rilevato.

| # | Scheda | Sottoschede | Opzioni |
|---|---|---|---|
| 1 | **Viso** | Forma · Trucco/guance · Rughe · Colore pelle · Face paint* | 12 forme · 12 trucchi · 12 rughe · 10 tonalità pelle (6 classiche + estese) · face paint con ~100 colori |
| 2 | **Capelli** | Tipo · Colore · Sfumatura* | ~130 acconciature · 8 colori classici + ~100 estesi · sfumatura a 2 colori |
| 3 | **Sopracciglia** | Tipo · Colore · Posizione | ~24 tipi · stessi colori dei capelli · 5 parametri |
| 4 | **Occhi** | Tipo · Colore · Colore alternativo* · Posizione | ~60 tipi · 6 colori classici + ~100 estesi · 5 parametri |
| 5 | **Naso** | Tipo · Posizione | ~18 tipi · 2 parametri |
| 6 | **Bocca** | Tipo · Colore · Posizione | ~36 tipi · 5 colori classici + estesi · 4 parametri (rotazione*) |
| 7 | **Baffi e barba** | Baffi · Posizione · Barba · Colore | 6 baffi · 6 barbe · 2 parametri · colori dei capelli |
| 8 | **Neo** | Attiva/disattiva + posizione | 3 parametri |
| 9 | **Occhiali** | Tipo · Colore · Posizione | ~20 tipi · 6 colori classici + estesi · 2 parametri |
| 10 | **Corporatura** | Altezza · Peso | 2 slider 0–127, con confronto con un altro Mii |
| 11 | **Cappelli*** | Tipo · Colore · Colore 2 · Colore 3 | ~55 cappelli · ~100 colori per canale |
| 12 | **Vestiti*** | Tipo · Colore maglia · Colore pantaloni · Colore 3 | 57 outfit (vedi elenco) · ~90 colori per canale |
| 13 | **Accessori*** | Tipo · Colore · Colore 2 · Colore 3 | 17 accessori (vedi elenco) |
| 14 | **Dettagli** | — | Nome, creatore, compleanno, ecc. |

\* = funzioni esclusive di Mii Creator, non presenti nei Mii originali.

---

## 3. Parametri di posizione (slider)

Ogni parte del viso ha slider a valori interi. È il meccanismo che rende unico ogni viso anche con pochi asset.

| Parte | Parametri (range) |
|---|---|
| Sopracciglia | Altezza (3–18) · Distanza (0–12) · Rotazione (0–11) · Dimensione (0–8) · Allungamento verticale (0–6) |
| Occhi | Altezza (0–18) · Distanza (0–12) · Rotazione (0–7) · Dimensione (0–7) · Allungamento verticale (0–6) |
| Naso | Altezza (0–18) · Dimensione (0–8) |
| Bocca | Altezza (0–18) · Dimensione (0–8) · Allungamento (0–6) · Rotazione (1–7)* |
| Baffi | Altezza (0–16) · Dimensione (0–8) |
| Neo | Posizione verticale (0–30) · Posizione orizzontale (0–16) · Dimensione (0–8) |
| Occhiali | Altezza (0–20) · Dimensione (0–7) |
| Corpo | Altezza (0–127) · Peso (0–127) |

Il pulsante "Reset" riporta i parametri ai valori di default della parte.

---

## 4. Palette colori rilevate

Ogni categoria ha una **palette classica corta** (6–10 colori) e una **palette estesa** di circa 100 colori comune a tutte le categorie.

| Categoria | Palette classica |
|---|---|
| Pelle | `#FFD3AD` `#FEB66B` `#DE7942` `#FFAA8C` `#AD5129` `#632C18`, più tonalità intermedie: `#FFC58F` `#FFBEA5` `#8C3C23` `#3C2D23` |
| Capelli / sopracciglia / barba | `#000000` `#402010` `#5C180A` `#7C3A14` `#787880` `#4E3E10` `#885818` `#D0A04A` |
| Occhi | `#000000` `#6C7070` `#663C2C` `#605E30` `#4654A8` `#387058` |
| Occhiali | `#000000` `#603810` `#A81008` `#203068` `#A86000` `#787068` |
| Palette estesa (inizio) | `#5C180A` `#842626` `#663C2C` `#8C5040` `#A81008` `#F00C08` `#F54848` `#FF7366` `#FFA6A6` `#FFC0BA` `#732E3B` `#991F3D` … |

Per il nostro stile conviene definire palette nostre. Queste servono come riferimento per **quante** tonalità servono e **come distribuirle** (es. pelle: almeno 6–10 tonalità ben distribuite dalla più chiara alla più scura).

---

## 5. Elenchi completi

**Vestiti (57):** Default, Long-Sleeve, Short-Sleeve, Tank Top, Hoodie, Suit, Pajamas, Table Tennis, Overalls/Dress, Leather Jacket, Cleats, Cowboy, Button-up Coat, Kung-Fu, Jester, Parade, Royal, Turtleneck, Aristocrat, Adventure, Wizard, Swordplay, Star, Long Dress, Striped, Plaid, Lab Coat, Prison, Garden, Tunic, Sweater, Winter, Traveler, Chef, Polo, Baseball, Coat, Pirate, Zombie, Skydiving, Cycling, Golf, Referee, Basketball, Super, Raincoat, Knitted Sweater, Space, Hoodie2, Vacation, Hex, Swirl, Checker, Walking, OverallsB, Vampire, Casual.

**Accessori (17):** Butterfly Wings, Staff, Shell, Cat Tail, Dog Tail, Demon Tail, Headphones, Scarf, Sword, Bat, Wind-up Key, Tank, Bracelets, Gloves, Bunny Tail, Bandana, Crowbar.

**Cappelli (~55):** nell'interfaccia sono solo icone, senza nomi. Dai crediti risultano tra gli altri: Cap, Beanie, Top Hat, Ribbon, Bow, Pot Hat, King's Crown, Propeller Hat, Halo, Cowboy Hat, Bucket Hat, Viking Helmet, Eye Patch, Snow Hat, Chef Hat, Cat Ears, Straw Hat, Hunting Cap, Santa Hat.

---

## 6. Proposta per il nostro sistema (versione evento)

Per ~25 persone e un form di 6–8 domande non servono centinaia di opzioni. Serve un set curato, coerente con il nostro stile, che garantisca unicità e un bel colpo d'occhio nella piazza.

| Categoria | Mii Creator | Nostra proposta | Formato asset |
|---|---|---|---|
| Forma viso | 12 | 4–6 | Mesh GLB |
| Pelle | 10 | 8 | Palette |
| Capelli | ~130 | 12–16 | Mesh GLB |
| Colore capelli | 8 + 100 | 10 | Palette |
| Sopracciglia | ~24 | 8 | SVG |
| Occhi | ~60 | 12 | SVG |
| Naso | ~18 | 6 | SVG |
| Bocca | ~36 | 10 (incluse espressioni) | SVG |
| Baffi / barba | 6 + 6 | 3 + 3 | SVG / mesh |
| Guance / lentiggini | 12 | 4 | SVG |
| Occhiali | ~20 | 5 | Mesh GLB |
| Cappelli | ~55 | 8 (+ corona) | Mesh GLB |
| Vestiti | 57 | 6–8 | Texture / materiali |
| Accessori | 17 | 6 | Mesh GLB |
| Corporatura | 2 slider | 3 preset | Parametri |

**Parametri:** usare gli stessi slider di posizione (sezione 3), ma **non esporli all'utente**. Li imposta il sistema in base alle risposte del form, con piccole variazioni casuali per rendere ogni viso unico.

**Combinazioni:** anche con questo set ridotto le combinazioni sono nell'ordine dei milioni, ampiamente sufficienti per garantire l'unicità.

**Priorità di produzione degli asset:**
1. Viso SVG (occhi, sopracciglia, bocca, naso): è ciò che dà il carattere.
2. Capelli: il punto estetico più delicato.
3. Corpo e vestiti.
4. Cappelli, occhiali, accessori, corona.
