# 🧠 GEHIRN – Projekt-Gedächtnis

> Persistentes Gedächtnis dieses Projekts. **Zu Beginn jeder Sitzung zuerst lesen,
> am Ende fortschreiben** (siehe `AGENTS.md`). Fakten gehören nach `projekt/*.json`,
> Chronik/Begründungen hierher.

## ⚡ TL;DR – Aktueller Stand (immer zuerst lesen, immer überschreiben)

- **Frische Projektvorlage (leere Hülle).** Noch kein Projekt angelegt.
- **Umgebung ist lauffähig:** `tools/server.py` + `webapp/` wurden am 2026-09-11
  neu gebaut (siehe Sitzungs-Log). Noch offen: `tools/input_fetch.py` und
  `tools/export_html.py`.
- **Nächster Schritt:** Bei neuem Projekt zuerst den MS-Teams-/OneDrive-Ordner in
  `tools/quellen.json` eintragen und `python tools/input_fetch.py --full` laufen
  lassen (Schritt 0, Teil A). Danach die Pflichtfelder erfragen und `projekt/*`
  befüllen.
- **Start:** `start.bat` → `http://127.0.0.1:8000`.

---

# TEIL A — Arbeitsweise (Anweisungen & Abfragen)

> Dieser Teil ist **allgemeingültig** und gilt für jedes Projekt, das diese Vorlage
> nutzt. Er beschreibt, **wie** der Assistent arbeitet und **was** er beim Nutzer
> aktiv nachfragt, wenn Informationen fehlen.

## A.1 Grundsätzliche Arbeitsweise

- **Erst Gehirn lesen → arbeiten → Gehirn aktualisieren** (siehe Regeln oben).
- **Projekt-Initialisierung – zuerst der Team-Ordner:** Bei einem **neuen** Projekt
  **vor** allen inhaltlichen Abfragen nach dem **MS-Teams-/OneDrive-Projektordner**
  fragen, diesen in `tools/quellen.json` eintragen, mit `python tools/input_fetch.py
  --full` **alle** Dokumente einlesen und einen **initialen Überblick** erstellen.
  Damit so viel wie möglich **vorbefüllen** und nur noch Offenes erfragen
  (Details siehe `AGENTS.md` → „Projekt-Initialisierung").
- **Nachfragen statt annehmen:** Bei unklaren oder fehlenden Informationen
  **gezielt eine Frage stellen** (eine Frage pro Schritt), statt Annahmen zu treffen.
- **Design einhalten:** Alle Outputs folgen `design/design-vorgaben.md`
  (Axpo CD; Blue funktional, Red dekorativ, kein UPPER CASE).
- **Sprache:** Deutsch.
- **Datensparsam & lokal:** keine externen Dienste/Fonts/Tracker einbinden.
- **Änderungen dokumentieren:** Decision Log + Sitzungs-Log pflegen.

## A.2 Abfragen – fehlende Projekt-Informationen

Wenn ein Projekt **neu** aufgesetzt wird oder Felder leer/„TBD" sind, fragt der
Assistent diese Punkte aktiv ab (Häkchen setzen, sobald geklärt → Teil B / `projekt/`).

**Regeln für die Abfrage (mit dem Nutzer festgelegt):**
- **Frage-Stil:** **immer nur EINE Frage nach der anderen** (keine Sammelabfragen).
- **Reihenfolge:** **priorisiert** – erst das **Wichtigste** (Auftrag, Ziele,
  Stakeholder), **Details später**.
- **Pflicht vs. optional:** Nur wenige **Pflichtfelder** (unten mit **(Pflicht)**
  markiert); alles andere ist **optional** und kann später ergänzt werden.
- Ein Projekt kann bereits mit den **Pflichtfeldern** angelegt werden; fehlende
  optionale Angaben werden als „TBD" geführt und nach und nach nachgefragt.

**Reihenfolge der Abfrage (Priorität von oben nach unten):**

**0. Zuerst: Team-/Projektordner einlesen (bei neuem Projekt, → `tools/quellen.json`):**
- [ ] **MS-Teams-/OneDrive-Projektordner** (lokaler Pfad) **(zuerst fragen)** –
  danach `python tools/input_fetch.py --full`, **alle** Dokumente aus
  `inbox/_text/` sichten und einen **initialen Überblick** erstellen. So viel wie
  möglich daraus vorbefüllen; die folgenden Punkte nur noch für **Lücken** erfragen.
  (Kein Team-Ordner vorhanden? → Schritt 0 überspringen.)

**1. Pflicht-Minimum zum Anlegen (→ `projekt/projekt.json`):**
- [ ] Projektname **(Pflicht)**
- [ ] Kürzel (z. B. „MXP-042") **(Pflicht)**
- [ ] Projektleiter:in **(Pflicht)**

**2. Das Wichtigste (Auftrag, Ziele, Stakeholder):**
- [ ] Projektauftrag / Zweck – wozu das Projekt? (`01-projektauftrag.md`)
- [ ] Ziele & Scope, inkl. **Nicht-Ziele** / Abgrenzung (`02-ziele-scope.md`)
- [ ] Stakeholder (Name, Rolle, Einfluss, Interesse, Haltung) (`03-stakeholder.json`)

**3. Weitere Stammdaten (optional, → `projekt/projekt.json`):**
- [ ] Auftraggeber / Sponsor
- [ ] Status (geplant / in_arbeit / abgeschlossen) und Phase
- [ ] Startdatum und geplantes Enddatum
- [ ] Gesamtampel (gruen / gelb / rot) und Fortschritt (%)
- [ ] Kurzbeschreibung (Kurzfassung für Übersicht/Portfolio)

**4. Details (optional, → `projekt/*.md` und `*.json`):**
- [ ] Meilensteine & Termine (`04-meilensteine.json`)
- [ ] Aufgaben / Arbeitspakete (`05-aufgaben.json`)
- [ ] Risiken (Wahrscheinlichkeit, Auswirkung, Maßnahme) (`06-risiken.json`)
- [ ] Budget / Kosten (`07-budget.json`)
- [ ] Statusbericht-Rhythmus & Ampellogik (`08-statusberichte.json`)
- [ ] Entscheidungen (Decision Log) (`09-entscheidungen.json`)
- [ ] Lessons Learned (`10-lessons-learned.md`)

> Diese Abfrage-Liste kann jederzeit weiter verfeinert werden
> (Fragen ergänzen/streichen, Pflichtfelder anpassen).

## A.3 Standard-Fragen (Vorlagen – in Abfrage-Reihenfolge)

> Jeweils **eine** Frage pro Schritt stellen, in dieser Reihenfolge.

**0. Zuerst (neues Projekt):**
0. „In welchem **MS-Teams-/OneDrive-Ordner** liegen die Projektunterlagen (lokaler
   Pfad)? Ich lese zuerst **alle** Dokumente ein, um einen ersten Überblick zu
   bekommen." → dann `input_fetch.py --full`, Dokumente sichten, vorbefüllen.

**1. Pflicht-Minimum:**
1. „Wie lautet der **Projektname**?"
2. „Welches **Kürzel** soll das Projekt haben (z. B. „MXP-042")?"
3. „Wer ist **Projektleiter:in**?"

**2. Das Wichtigste:**
4. „Was ist der **Projektauftrag / Hauptzweck** – wozu das Projekt?"
5. „Was sind die **Ziele**, und was gehört **nicht** zum Scope (Abgrenzung)?"
6. „Wer sind die **wichtigsten Stakeholder** (Name, Rolle, Haltung)?"

**3. Weitere Stammdaten (optional):**
7. „Wer ist **Auftraggeber / Sponsor**?"
8. „Was ist der aktuelle **Status/Phase**, und wie steht die **Ampel/Fortschritt**?"
9. „Wann ist **Start**, wann **geplantes Ende**?"
10. „Gibt es eine **Kurzbeschreibung** für die Übersicht?"

**4. Details (optional, nach Bedarf):**
11. „Welche **Meilensteine/Termine** gibt es?"
12. „Welche **Aufgaben/Arbeitspakete** stehen an?"
13. „Welche **Risiken** siehst du aktuell?"
14. „Wie hoch ist das **Budget** und wie wird es aufgeteilt?"

---


---

# TEIL B — Projektspezifische Informationen

> Hier stehen die konkreten Inhalte **deines** Projekts. Aktuell leer – wird über
> die Abfragen aus Teil A gefüllt.

## B.1 Projekt-Stammdaten

| Feld | Wert |
|------|------|
| Projektname | *(TBD)* |
| Kürzel | *(TBD)* |
| Projektleiter:in | *(TBD)* |
| Auftraggeber | *(TBD)* |
| Status / Phase | geplant / Initialisierung |
| Start / Ende (geplant) | *(TBD)* |
| Ampel / Fortschritt | gruen / 0 % |
| Kurzbeschreibung | *(TBD)* |

## B.2 Kontext & Besonderheiten

- *(Rahmenbedingungen, Annahmen, wichtige Kontakte, Systeme, Abhängigkeiten …)*

## B.3 Aktueller Fokus / nächste Schritte im Projekt

- *(Woran gerade gearbeitet wird.)*


---

## 📌 Projekt-Steckbrief (Umgebung)

- **Was:** Standardisierte, lokal laufende Projektmanagement-Umgebung mit
  interaktiver Web-App (Python-Standardbibliothek, kein Node).
- **Struktur:** `projekt/` (Inhalte als MD/JSON), `webapp/` (UI), `tools/server.py`
  (lokaler Server), `tools/input_fetch.py` + `tools/quellen.json` (Wissensquellen
  einlesen), `inbox/` (eingelesener Text), `portfolio/` (andere Projekte),
  `design/` (Designvorgaben), `GEHIRN.md` (Gedächtnis), `AGENTS.md` (Agenten-Regeln).
- **Start:** `start.bat` (oder `python tools/server.py`) → `http://127.0.0.1:8000`.


---

## 🎨 Design – Single Source of Truth

**Datei:** `design/design-vorgaben.md` — verbindliche Axpo-Designvorgaben für die
Web-App **und alle künftigen Outputs**. Enthält u. a.:

- Brand Colours: **Axpo Red** `#ff5d64` (dekorativ), **Axpo Blue** `#313193`
  (funktional). Accessibility: Axpo Red **nicht** für Text/Buttons/Links (WCAG AA).
- Supportive Colours (White, Dark Grey `#3d3d3d`, Green `#008400` nur Nachhaltigkeit)
- Energy Colours (nur Datenvisualisierung), Tonwert-Skalen 50–900
- Axpo Gradient (Yellow→Red→Blue) inkl. CSS + Do-nots
- Typografie: **Almarena** (Headlines), **Open Sans** (Body), **Verdana** (Office)
- Icons (`design/assets/icons/`, 135 SVGs), Bildwelt (`design/assets/imagery/`)
- Diagramm-/Chart-Farbregeln, UI-Referenz

**Assets:** `design/assets/` (Logo, Signet-Varianten, Icons, Wallpapers).

---


---

## ✅ Entscheidungen (Decision Log)

| Datum | Entscheidung | Begründung |
|-------|--------------|------------|
| 2026-09-11 | Server/Web-App anhand der Doku neu gebaut statt auf die Originaldateien zu warten | Die lokalen Windows-Ordner waren aus dem Codespace nicht lesbar; die Umgebung sollte trotzdem startklar sein. |
| 2026-09-11 | Ampelfarben als eigene Signalfarben (`#2e7d32` / `#a8620a` / `#c62828`) definiert | Axpo Red ist nur dekorativ (WCAG AA) und Axpo Green nur für Nachhaltigkeit – beide scheiden für Statusanzeigen aus. |
| 2026-09-11 | `inbox/` per `.gitignore` ausgeschlossen | Dort landen Texte aus dem Teams-Ordner; die gehören nicht ins Repo. |
| 2026-08-06 | `server.py`: `allow_reuse_address=False` + automatischer Fallback auf nächsten freien Port | Verhindert, dass ein noch laufender Server aus einem anderen Projekt den Port 8000 belegt und altes Projekt anzeigt. |
| — | *(Noch keine projektspezifischen Entscheidungen.)* | — |

> Grundlegende Entscheidungen zur **Umgebung/Hülle** (Design zentral in
> `design/design-vorgaben.md`, Axpo Blue funktional / Red dekorativ, keine externen
> Fonts, „Gehirn" via `GEHIRN.md`+`AGENTS.md`, „Input fetch"-System, Quelle der
> Wahrheit = `projekt/*.json`) sind in der Vorlage bereits umgesetzt.


---

## 🔧 Offene Punkte / To-do

> **Konvention:** Jede Aufgabe führt unter **„🔎 Benötigte Infos"** auf, welche
> Angaben noch fehlen, um sie zu erledigen.

### Offene Aufgaben
- [ ] **`tools/input_fetch.py` nachliefern oder neu bauen** – ohne das Skript
  funktioniert der Befehl „Input fetch" nicht (`tools/quellen.json` und
  `inbox/` sind vorbereitet).
  - 🔎 Benötigte Infos: Original-Skript aus der Vorlage **oder** Freigabe, es
    anhand der Beschreibung in `AGENTS.md` neu zu schreiben (inkl. gewünschter
    Dateiformate für die Textextraktion: docx, pdf, xlsx, pptx?).
- [ ] **`tools/export_html.py` nachliefern oder neu bauen** – wird von
  `tools/Prozesslandkarte-exportieren.bat` aufgerufen, existiert aber nicht.
  - 🔎 Benötigte Infos: Wie soll die Prozesslandkarte aussehen und aus welcher
    Datenquelle wird sie erzeugt?
- [ ] **Icon-Set und Schriftdateien ergänzen** (`design/assets/icons/`).
  - 🔎 Benötigte Infos: Icons aus dem Axpo-Brand-Portal.
- [ ] **Projekt initialisieren** – Team-/OneDrive-Ordner in `tools/quellen.json`
  eintragen, `input_fetch.py --full` laufen lassen, Pflichtfelder erfragen und
  `projekt/*` befüllen.
  - 🔎 Benötigte Infos: Projektname, Kürzel, Projektleiter:in; idealerweise der
    Pfad zum Projektordner.

### Erledigt
- [x] Leere Hülle aus der Vorlage erstellt.
- [x] Vorlage ins Git-Repo übernommen (Doku, Start-Skripte, Axpo-Assets).
- [x] `tools/server.py` und `webapp/` neu gebaut; `projekt/`, `portfolio/` und
  `design/design-vorgaben.md` angelegt.


---

## 🗒️ Sitzungs-Log (neueste zuerst)

### 2026-09-11 — Repo aufgesetzt, Server und Web-App neu gebaut
- Die Vorlage wurde ins Git-Repo `Maximilianabc123/MXP-Projekt` übernommen:
  `AGENTS.md`, `GEHIRN.md`, `README.md`, `start.bat`,
  `tools/Prozesslandkarte-exportieren.bat` und die Axpo-Assets
  (`design/assets/logo/`, `design/assets/imagery/`).
- **Problem:** Die Ordner `tools/`, `webapp/`, `projekt/`, `portfolio/`, `design/`
  und `inbox/` liessen sich aus dem Codespace nicht lesen (lokale Windows-Pfade
  im OneDrive-Ordner). Mehrere Anhänge enthielten nur erneut README und Bilder.
- **Entscheid des Nutzers:** Server und Web-App **anhand der Doku neu bauen**
  statt auf die Originaldateien zu warten. Neu erstellt:
  `tools/server.py`, `tools/quellen.json` (Demo-Eintrag, inaktiv),
  `projekt/*` (neutrale Platzhalter inkl. `11-streams.json`),
  `portfolio/projekte.json`, `webapp/` (HTML/CSS/Vanilla-JS),
  `design/design-vorgaben.md`.
- **Offen:** `tools/input_fetch.py` und `tools/export_html.py` fehlen weiterhin —
  „Input fetch" und der Prozesslandkarten-Export funktionieren noch nicht.

### 2026-08-06 — Initialisierungsversuch pausiert
- Nutzer wollte neues Projekt anlegen; kein MS-Teams-/OneDrive-Ordner vorhanden
  (Schritt 0 übersprungen). Bei Abfrage des Pflichtfelds „Projektname" kam keine
  Antwort — Nutzer hat die Initialisierung für später verschoben.
- **Offen:** Beim nächsten Mal direkt mit Pflicht-Minimum fortfahren
  (Projektname, Kürzel, Projektleiter:in), siehe Teil A.3.

### 2026-08-06 — Fix: Server zeigte altes Projekt (Port-Kollision)
- **Problem:** Beim Start zeigte die Web-App ein *anderes/altes* Projekt. Ursache:
  Ein alter `server.py`-Prozess (vom Vormittag) lief noch und belegte Port 8000;
  unter Windows „gewann" dieser den Port, sodass der neue Start dessen Inhalte
  auslieferte.
- **Sofortmassnahme:** Alten Prozess beendet → Port frei → Server aus dem aktuellen
  Ordner liefert wieder dieses Projekt.
- **Dauerhafte Lösung (Hülle):** `tools/server.py` robuster gemacht:
  `allow_reuse_address = False` (belegter Port wird sauber erkannt) und `main()`
  weicht bei belegtem Port automatisch auf den nächsten freien Port (8000→8001…)
  aus und öffnet den Browser dort. Getestet: zwei Instanzen → 8000 + 8001, beide
  liefern korrekt diesen Repo-Root.
- Nebenbefund: `start.bat` ist im OneDrive-Ordner ein „Files On-Demand"-Platzhalter
  (ReparsePoint); per Doppelklick funktioniert er, `call` aus cmd bei reinem
  Online-Zustand ggf. nicht – kein Handlungsbedarf, da Doppelklick greift.

### 2026-08-06 — Leere Hülle erstellt
- Diese saubere Projektvorlage („leere Hülle") wurde aus der bestehenden
  PM-Umgebung erzeugt: generische Teile (Web-App, Design, Tools, README, AGENTS)
  übernommen; alle projektspezifischen Inhalte entfernt bzw. auf neutrale
  Platzhalter/leere Strukturen zurückgesetzt (`projekt/*`, `portfolio/`,
  `tools/quellen.json`, Prozesslandkarte-Gerüst).
- Bereit zur Weitergabe: Kopieren, `start.bat` starten, mit Teil A initialisieren.
