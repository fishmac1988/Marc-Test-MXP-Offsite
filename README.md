# MXP Projektmanagement-Umgebung

Eine standardisierte, kopierbare Vorlage für das Projektmanagement im Team der
Projektleiter. Jeder kopiert diesen Ordner für sein eigenes Projekt, pflegt die
Inhalte in VS Code und visualisiert alles in einer interaktiven Web-App. Über die
**Portfolio-Ansicht** sieht man zusätzlich alle anderen MXP-Projekte – mit derselben
Sicht wie beim eigenen Projekt.

---

## 🚀 Schnellstart

1. Diesen Ordner für dein Projekt **kopieren** (z. B. `MXP-042 Mein Projekt`).
2. **`start.bat`** per Doppelklick ausführen.
3. Der Browser öffnet automatisch die Web-App unter `http://127.0.0.1:8000`.
4. Zum Beenden das schwarze Fenster schließen.

> Voraussetzung: Python 3 ist installiert (keine weiteren Pakete nötig – nur
> Standardbibliothek). Node.js wird **nicht** benötigt.

---

## 🧠 Projekt-Gedächtnis (GEHIRN.md)

Der gesamte Arbeits- und Entscheidungsverlauf wird in **`GEHIRN.md`** festgehalten –
ein persistentes „Gedächtnis" über alle (KI-)Chat-Sitzungen hinweg. Wird ein neues
Chatfenster geöffnet, liest der Assistent laut **`AGENTS.md`** zuerst dieses Gehirn
und schreibt es am Ende der Sitzung fort. So bleibt nachvollziehbar, was bisher
geschehen ist, welche Entscheidungen getroffen wurden und was noch offen ist.

---

## 📁 Ordnerstruktur

```
Projektmanagement/
├── start.bat                 ← Doppelklick: Server starten + Web-App öffnen
├── README.md
├── projekt/                  ← HIER pflegst du dein Projekt
│   ├── projekt.json              Stammdaten (Name, PL, Status, Ampel …)
│   ├── 01-projektauftrag.md      Projektauftrag / Steckbrief
│   ├── 02-ziele-scope.md         Ziele & Scope
│   ├── 03-stakeholder.json       Stakeholder-Analyse
│   ├── 04-meilensteine.json      Meilensteine & Zeitplan
│   ├── 05-aufgaben.json          Aufgaben / Arbeitspakete (Kanban)
│   ├── 06-risiken.json           Risiken (Risk Register + Matrix)
│   ├── 07-budget.json            Budget / Kosten
│   ├── 08-statusberichte.json    Statusberichte (Ampeln)
│   ├── 09-entscheidungen.json    Entscheidungen (Decision Log)
│   ├── 10-lessons-learned.md     Lessons Learned
│   └── 11-streams.json           Streams mit Deliverables & Dokumenten
├── portfolio/
│   └── projekte.json         ← registrierte Pfade der anderen MXP-Projekte
├── design/
│   ├── design-vorgaben.md    ← verbindliche Axpo-Designvorgaben
│   └── assets/               ← Logo, Signet, Wallpapers
├── webapp/                   ← die Web-App (nicht ändern nötig)
└── tools/
    ├── server.py             ← lokaler Server (Python-Standardbibliothek)
    └── quellen.json          ← registrierte Wissensquellen (Teams-/OneDrive-Ordner)
```

---

## ✏️ Projekt pflegen

Alle Inhalte werden im Ordner **`projekt/`** gepflegt – direkt in VS Code:

- **Markdown-Dateien** (`.md`): frei formulierbarer Text (Projektauftrag, Ziele,
  Lessons Learned). Überschriften, Listen und Tabellen werden in der Web-App
  automatisch schön dargestellt.
- **JSON-Dateien** (`.json`): strukturierte Daten (Aufgaben, Risiken, Budget …).
  Einfach die Beispieleinträge anpassen oder neue Einträge hinzufügen. Auf gültiges
  JSON achten (Kommas, Anführungszeichen). VS Code zeigt Fehler direkt an.

Nach dem Speichern genügt ein **Neuladen der Web-App** (F5) – die Änderungen sind
sofort sichtbar.

### Wichtige Felder in `projekt.json`
| Feld                | Bedeutung                                    |
|---------------------|----------------------------------------------|
| `name`, `kuerzel`   | Projektname und Kürzel (z. B. MXP-042)       |
| `projektleiter`     | verantwortliche Person                       |
| `status`            | z. B. geplant / in_arbeit / abgeschlossen    |
| `ampel`             | gruen / gelb / rot (Gesamtampel)             |
| `fortschritt_prozent` | 0–100                                      |

---

## 🗂️ Portfolio – alle MXP-Projekte

In der Web-App links unter **„Portfolio"** siehst du alle registrierten Projekte
auf einen Blick (Fortschritt, kritische Risiken, offene Meilensteine, letzte Ampel).

So fügst du ein Projekt hinzu:
1. Web-App → **Portfolio** öffnen.
2. Kürzel, Name und **Ordner-Pfad** des anderen Projekts eintragen
   (z. B. `\\server\projekte\MXP-042` oder ein OneDrive-/Netzlaufwerk-Pfad).
3. **Hinzufügen** klicken.

Der Pfad muss auf den Projekt-Ordner zeigen, der den Unterordner `projekt/` enthält.
Nur Projekte, auf deren Ordner du **Zugriff** hast, werden live geladen; bei
fehlendem Zugriff wird das im Portfolio klar angezeigt.

Ein Klick auf den Projektnamen öffnet eine **Nur-Lese-Detailansicht** des fremden
Projekts – dieselbe Sicht wie beim eigenen Projekt.

> Damit der Chef alle Projekte zentral sieht, kann er einmalig alle Projektpfade
> registrieren. Die Registrierung wird in `portfolio/projekte.json` gespeichert.

---

## ❓ Häufige Fragen

**Die Web-App zeigt „Verbindung fehlgeschlagen".**
Du hast vermutlich `index.html` direkt geöffnet. Bitte immer über `start.bat`
starten – der lokale Server wird für den Ordner-Zugriff benötigt.

**Anderer Port gewünscht?**
`start.bat --port=8080` (oder `python tools/server.py --port=8080`).

**Browser soll sich nicht automatisch öffnen?**
`python tools/server.py --no-browser`.

**Sind meine Daten sicher?**
Ja. Der Server läuft nur lokal (`127.0.0.1`) und ist nicht aus dem Netzwerk
erreichbar. Es werden keine Daten nach außen gesendet.
