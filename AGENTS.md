# AGENTS.md — Regeln für KI-Agenten in diesem Projekt

Diese Datei wird von KI-Assistenten (z. B. GitHub Copilot) **automatisch** gelesen.
Sie legt fest, wie in diesem Projekt gearbeitet wird.

## 🧠 Gedächtnis: immer zuerst lesen, immer fortschreiben

Dieses Projekt hat ein persistentes Gedächtnis: **`GEHIRN.md`**.

**Zu Beginn JEDER Sitzung / bei jedem neuen Chatfenster:**
1. **Zuerst `GEHIRN.md` vollständig lesen**, um den bisherigen Stand, getroffene
   Entscheidungen und offene Punkte zu kennen.
2. Bei Bedarf `design/design-vorgaben.md` lesen (verbindliche Designvorgaben).

**Während / am Ende JEDER Sitzung:**
3. In `GEHIRN.md` unter **„Sitzungs-Log"** einen **neuen `###`-Block** einfügen
   (neueste zuerst, oben). Festhalten: *Was gemacht wurde*, *was entschieden wurde*,
   *was offen ist*.
4. **Decision Log** und **Offene Punkte / To-do** in `GEHIRN.md` aktuell halten.
   - Bei **jeder Aufgabe** im To-do zusätzlich **„🔎 Benötigte Infos"** angeben:
     welche Angaben vom Nutzer noch fehlen, um sie zu erledigen (oder „keine").
5. Bestehende Log-Einträge **nicht löschen** – nur ergänzen oder als erledigt
   markieren (`[x]`).

> Kurz: **Erst Gehirn lesen → arbeiten → Gehirn aktualisieren.**

## 📥 Wissensquellen einlesen — Befehl „Input fetch"

Damit Wissen aus dem realen Projektordner (z. B. ein per **OneDrive** lokal
synchronisierter **MS-Teams-Ordner**) nicht verloren geht, gibt es einen
**manuellen Einlese-Befehl**.

**Auslöser:** Sagt der Nutzer **„Input fetch"** (oder „Quellen einlesen"), dann:
1. `python tools/input_fetch.py` ausführen (scannt die in `tools/quellen.json`
   registrierten Ordner, erkennt **neue/geänderte** Dateien seit dem letzten Lauf).
2. Den Bericht `inbox/_last-fetch.md` lesen (Liste neu/geändert/gelöscht) und den
   extrahierten Text unter `inbox/_text/` sichten.
3. Relevantes Wissen **verarbeiten**: strukturierte Fakten → `projekt/*.json`,
   Chronik/Begründungen → `GEHIRN.md` (Sitzungs-Log, Decision Log, To-do).
4. Im Sitzungs-Log kurz festhalten, **welche Quelle** eingelesen und **was**
   übernommen wurde.

**Grundsätze:**
- **Nur lokal & datensparsam:** kein Cloud-/Graph-API-Zugriff; es wird nur der
  bereits lokal synchronisierte Ordner gelesen. Quellordner **nur lesend**;
  geschrieben wird ausschliesslich nach `inbox/`.
- **Kein Auto-Lauf:** Ein Chat läuft nicht im Hintergrund. „Regelmässig" heisst:
  der Nutzer triggert „Input fetch" **oder** `input_fetch.py` wird per
  **Windows-Aufgabenplanung** zeitgesteuert ausgeführt; die Verarbeitung ins
  Gehirn erfolgt beim nächsten Chat.
- In der **Vorlage/Hülle** ist die Quelle in `tools/quellen.json` nur ein
  **Demo-Beispiel**; echte Projekte tragen dort ihre eigenen Ordner ein.

## 🚀 Projekt-Initialisierung — zuerst den Team-Ordner einlesen

Wird ein **neues Projekt** aufgesetzt (frische Kopie der Hülle, leeres Teil B /
`projekt/`), gilt **Schritt 0 vor allen anderen Abfragen**:

1. **Zuerst nach dem Projekt-/Team-Ordner fragen** — dem per **OneDrive** lokal
   synchronisierten **MS-Teams-Ordner** des Projekts (vollständiger lokaler Pfad).
2. Diesen Pfad in **`tools/quellen.json`** als aktive Quelle eintragen (in der
   Hülle den **Demo-Eintrag ersetzen**, nicht ergänzen).
3. **Vollständigen Einlesevorgang** starten: `python tools/input_fetch.py --full`
   (alle Dokumente werden als „neu" behandelt und nach `inbox/_text/` extrahiert).
4. **Alle** extrahierten Texte in `inbox/_text/` sichten und einen **initialen
   Überblick** erstellen: Worum geht es, Auftrag/Ziele, Stakeholder, Termine,
   Struktur/Streams, Status. So viel wie möglich daraus **vorbefüllen**
   (`projekt/*.json`, Teil B) statt es zu erfragen.
5. **Erst danach** die Abfragen aus Teil A stellen — und **nur noch die Punkte**,
   die aus den Dokumenten nicht hervorgehen oder unklar sind (eine Frage pro Schritt).
6. Im Sitzungs-Log festhalten: welcher Ordner eingelesen wurde und was der initiale
   Überblick ergeben hat.

**Grundsätze:** nur lokal & datensparsam (siehe „Input fetch"); Quellordner nur
lesend; findet der Nutzer keinen Ordner (Projekt ohne Team-Ablage), wird Schritt 0
übersprungen und direkt mit den Pflichtfeldern begonnen.

## 🗂️ Quelle der Wahrheit (Single Source of Truth)

Damit `GEHIRN.md` und `projekt/*.json` nicht auseinanderdriften:
- **Strukturierte Projektfakten** (Meilensteine, Aufgaben, Risiken, Stakeholder,
  Statusberichte, Entscheidungen, Budget) → **`projekt/*.json`** ist führend
  (die Web-App rendert daraus).
- **Chronik, Begründungen, Arbeitsstände, offene Punkte** → **`GEHIRN.md`**
  (Sitzungs-Log, Decision Log, To-do).
- Bei Widerspruch gilt `projekt/*.json` für Fakten, `GEHIRN.md` für Kontext.
  Dopplungen vermeiden; im Gehirn auf die JSON-Datei verweisen statt Inhalte
  vollständig zu kopieren.

## 🧩 Aufbau von `GEHIRN.md`

- **Teil A – Arbeitsweise (Anweisungen & Abfragen):** allgemeingültig; wie der
  Assistent vorgeht und **welche fehlenden Informationen aktiv abgefragt** werden.
  → Bei unklaren/fehlenden Angaben **nachfragen statt annehmen** (eine Frage pro
  Schritt), anhand der Abfrage-Liste in Teil A.2.
- **Teil B – Projektspezifische Informationen:** die konkreten Projekt-Inhalte.
  **In diesem Repo bewusst LEER** – es ist die **Master-Vorlage/„Hülle"**.
  Hier **kein reales Projekt** anlegen; `projekt/`, `portfolio/` und Teil B
  bleiben **neutrale Platzhalter**. Echte Projekte entstehen in **Kopien** der
  Vorlage (dort wird Teil B aus den Antworten zu Teil A gefüllt).

## 🏗️ Dieses Repository ist eine Vorlage („Hülle")

- Ziel: eine **leere, kopierbare** PM-Umgebung, die **andere** verwenden.
- **Nicht** mit echten Projektdaten befüllen. Vorhandene „Beispiel"-Einträge in
  `projekt/` / `portfolio/` sind **Struktur-Demos** und bleiben erhalten.
- Weiterentwickelt wird nur die **Hülle**: Struktur, Design, Web-App-Funktionen,
  Vorlagen und Abfragen – nicht der Inhalt eines konkreten Projekts.

## 🎨 Design

- Alle sichtbaren Outputs (Web-App, Dokumente, Grafiken, Präsentationen) folgen
  **`design/design-vorgaben.md`** (Axpo Corporate Design).
- **Axpo Blue** `#313193` = funktionale Farbe (Buttons, Links, Akzente).
  **Axpo Red** `#ff5d64` nur **dekorativ** (WCAG AA – nicht für Text/Buttons/Links).
- **Green** `#008400` nur für Nachhaltigkeitsthemen. **Keine** Grossschreibung
  (kein UPPER CASE), keine farbigen Headlines (nur Highlights).

## 🛠️ Technik

- Web-App: reines HTML/CSS/Vanilla-JS in `webapp/`, ausgeliefert über
  `tools/server.py` (nur Python-Standardbibliothek, **kein** Node/npm).
- Der Server liefert **nur** Dateien aus `webapp/` aus → benötigte Assets dorthin
  kopieren (`webapp/assets/`).
- **Lokal & datensparsam:** keine externen CDNs/Fonts/Tracker einbinden
  (Zusage im README: läuft nur auf `127.0.0.1`, keine Daten nach aussen).
- **Streams-Ansicht:** Daten in `projekt/11-streams.json` (Streams mit
  `deliverables[]`, `offene_punkte[]`, `dokumente[]` + Top-Level `quelle_wurzel`).
  Server-Endpunkt **`GET /api/open?pfad=…`** öffnet ein lokales Dokument mit
  `os.startfile` — **nur** wenn der Pfad innerhalb einer erlaubten Wurzel liegt
  (`tools/quellen.json`-Quellen + `quelle_wurzel`). So bleibt es lokal und ohne
  beliebigen Dateizugriff. Dokumentlinks im Frontend rufen diesen Endpunkt
  (kein `file://`, da Browser das aus `http://` blockieren).

## ✍️ Sprache

- Projektsprache ist **Deutsch**.
