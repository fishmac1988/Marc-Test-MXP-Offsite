#!/usr/bin/env python3
"""Lokaler Server für die MXP-Projektmanagement-Umgebung.

Nur Python-Standardbibliothek, kein Node/npm. Der Server bindet ausschliesslich
an 127.0.0.1 und sendet keine Daten nach aussen.

Aufruf:
    python tools/server.py [--port=8000] [--no-browser]
"""

from __future__ import annotations

import json
import os
import socket
import socketserver
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
WEBAPP_DIR = REPO_ROOT / "webapp"
PROJEKT_DIR = REPO_ROOT / "projekt"
PORTFOLIO_DATEI = REPO_ROOT / "portfolio" / "projekte.json"
QUELLEN_DATEI = REPO_ROOT / "tools" / "quellen.json"

STANDARD_PORT = 8000
MAX_PORT_VERSUCHE = 20

# Reihenfolge bestimmt die Navigation in der Web-App.
PROJEKT_DATEIEN = [
    "projekt.json",
    "01-projektauftrag.md",
    "02-ziele-scope.md",
    "03-stakeholder.json",
    "04-meilensteine.json",
    "05-aufgaben.json",
    "06-risiken.json",
    "07-budget.json",
    "08-statusberichte.json",
    "09-entscheidungen.json",
    "10-lessons-learned.md",
    "11-streams.json",
]


def lies_projektdaten(projekt_dir: Path) -> dict:
    """Liest alle bekannten Dateien eines `projekt/`-Ordners ein.

    JSON wird geparst, Markdown als Text geliefert. Fehlende Dateien werden als
    `None` zurückgegeben, defekte JSON-Dateien als `{"_fehler": "..."}`.
    """
    daten: dict = {}
    for name in PROJEKT_DATEIEN:
        pfad = projekt_dir / name
        schluessel = name.rsplit(".", 1)[0]
        if not pfad.is_file():
            daten[schluessel] = None
            continue
        try:
            inhalt = pfad.read_text(encoding="utf-8")
        except OSError as exc:
            daten[schluessel] = {"_fehler": f"Datei nicht lesbar: {exc}"}
            continue
        if name.endswith(".json"):
            try:
                daten[schluessel] = json.loads(inhalt)
            except json.JSONDecodeError as exc:
                daten[schluessel] = {"_fehler": f"Ungültiges JSON in {name}: {exc}"}
        else:
            daten[schluessel] = inhalt
    return daten


def _zahl(wert, standard=0):
    return wert if isinstance(wert, (int, float)) else standard


def erzeuge_kurzfassung(daten: dict) -> dict:
    """Verdichtet Projektdaten zu den Kennzahlen der Portfolio-Ansicht."""
    stamm = daten.get("projekt") or {}
    if not isinstance(stamm, dict):
        stamm = {}

    risiken = daten.get("06-risiken") or []
    kritische_risiken = 0
    if isinstance(risiken, list):
        for risiko in risiken:
            if not isinstance(risiko, dict):
                continue
            if str(risiko.get("status", "")).lower() in ("geschlossen", "erledigt"):
                continue
            schwere = _zahl(risiko.get("wahrscheinlichkeit")) * _zahl(risiko.get("auswirkung"))
            if schwere >= 9:
                kritische_risiken += 1

    meilensteine = daten.get("04-meilensteine") or []
    offene_meilensteine = 0
    if isinstance(meilensteine, list):
        offene_meilensteine = sum(
            1
            for m in meilensteine
            if isinstance(m, dict) and str(m.get("status", "")).lower() != "erreicht"
        )

    berichte = daten.get("08-statusberichte") or []
    letzte_ampel = stamm.get("ampel")
    letzter_bericht = None
    if isinstance(berichte, list) and berichte:
        sortiert = sorted(
            (b for b in berichte if isinstance(b, dict)),
            key=lambda b: str(b.get("datum", "")),
        )
        if sortiert:
            letzter_bericht = sortiert[-1].get("datum")
            letzte_ampel = sortiert[-1].get("ampel", letzte_ampel)

    return {
        "name": stamm.get("name"),
        "kuerzel": stamm.get("kuerzel"),
        "projektleiter": stamm.get("projektleiter"),
        "status": stamm.get("status"),
        "phase": stamm.get("phase"),
        "fortschritt_prozent": stamm.get("fortschritt_prozent"),
        "ampel": letzte_ampel,
        "kurzbeschreibung": stamm.get("kurzbeschreibung"),
        "kritische_risiken": kritische_risiken,
        "offene_meilensteine": offene_meilensteine,
        "letzter_bericht": letzter_bericht,
    }


def lade_portfolio_eintraege() -> list:
    if not PORTFOLIO_DATEI.is_file():
        return []
    try:
        inhalt = json.loads(PORTFOLIO_DATEI.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if isinstance(inhalt, dict):
        inhalt = inhalt.get("projekte", [])
    return inhalt if isinstance(inhalt, list) else []


def speichere_portfolio_eintraege(eintraege: list) -> None:
    PORTFOLIO_DATEI.parent.mkdir(parents=True, exist_ok=True)
    PORTFOLIO_DATEI.write_text(
        json.dumps({"projekte": eintraege}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def finde_projekt_ordner(eintrag: dict) -> Path | None:
    """Liefert den `projekt/`-Ordner eines registrierten Portfolio-Eintrags."""
    pfad_text = str(eintrag.get("pfad", "")).strip()
    if not pfad_text:
        return None
    basis = Path(pfad_text)
    if not basis.is_absolute():
        basis = (REPO_ROOT / basis).resolve()
    if (basis / "projekt").is_dir():
        return basis / "projekt"
    if basis.name == "projekt" and basis.is_dir():
        return basis
    return None


def erlaubte_wurzeln() -> list[Path]:
    """Wurzeln, unterhalb derer `/api/open` Dokumente öffnen darf.

    Speist sich aus den registrierten Quellen (`tools/quellen.json`) und dem
    `quelle_wurzel` der Streams-Ansicht. Alles andere wird abgelehnt.
    """
    wurzeln: list[Path] = []

    if QUELLEN_DATEI.is_file():
        try:
            quellen = json.loads(QUELLEN_DATEI.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            quellen = {}
        eintraege = quellen.get("quellen", []) if isinstance(quellen, dict) else []
        for quelle in eintraege if isinstance(eintraege, list) else []:
            pfad = quelle.get("pfad") if isinstance(quelle, dict) else quelle
            if not pfad:
                continue
            if isinstance(quelle, dict) and quelle.get("aktiv") is False:
                continue
            try:
                wurzeln.append(Path(str(pfad)).resolve())
            except OSError:
                continue

    streams_datei = PROJEKT_DIR / "11-streams.json"
    if streams_datei.is_file():
        try:
            streams = json.loads(streams_datei.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            streams = {}
        wurzel = streams.get("quelle_wurzel") if isinstance(streams, dict) else None
        if wurzel:
            try:
                wurzeln.append(Path(str(wurzel)).resolve())
            except OSError:
                pass

    return [w for w in wurzeln if w.exists()]


def liegt_in_wurzel(ziel: Path, wurzeln: list[Path]) -> bool:
    for wurzel in wurzeln:
        try:
            ziel.relative_to(wurzel)
            return True
        except ValueError:
            continue
    return False


def oeffne_lokal(ziel: Path) -> None:
    """Öffnet eine Datei mit dem Standardprogramm des Betriebssystems."""
    if hasattr(os, "startfile"):
        os.startfile(str(ziel))  # type: ignore[attr-defined]  # nur Windows
        return
    # Fallback für Entwicklung/Tests auf macOS und Linux.
    import shutil
    import subprocess

    befehl = "open" if sys.platform == "darwin" else "xdg-open"
    if shutil.which(befehl) is None:
        raise RuntimeError(f"Kein Öffnen-Programm gefunden ({befehl} fehlt).")
    subprocess.Popen([befehl, str(ziel)])


class MXPHandler(SimpleHTTPRequestHandler):
    """Liefert statisch nur `webapp/` aus und beantwortet die `/api/*`-Routen."""

    server_version = "MXP/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEBAPP_DIR), **kwargs)

    def log_message(self, format: str, *args) -> None:
        sys.stderr.write("  %s\n" % (format % args))

    # ---------------------------------------------------------------- Helfer
    def sende_json(self, nutzlast, status: int = 200) -> None:
        rohdaten = json.dumps(nutzlast, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(rohdaten)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(rohdaten)

    def sende_fehler_json(self, status: int, meldung: str) -> None:
        self.sende_json({"fehler": meldung}, status=status)

    # ------------------------------------------------------------------ GET
    def do_GET(self) -> None:  # noqa: N802 - von BaseHTTPRequestHandler vorgegeben
        zerlegt = urlparse(self.path)
        if zerlegt.path.startswith("/api/"):
            self.behandle_api(zerlegt.path, parse_qs(zerlegt.query))
            return
        super().do_GET()

    def behandle_api(self, pfad: str, abfrage: dict) -> None:
        if pfad == "/api/projekt":
            self.sende_json(lies_projektdaten(PROJEKT_DIR))
        elif pfad == "/api/portfolio":
            self.api_portfolio()
        elif pfad == "/api/portfolio/projekt":
            self.api_portfolio_projekt(abfrage)
        elif pfad == "/api/open":
            self.api_open(abfrage)
        else:
            self.sende_fehler_json(404, f"Unbekannter Endpunkt: {pfad}")

    def api_portfolio(self) -> None:
        ergebnis = []
        for eintrag in lade_portfolio_eintraege():
            if not isinstance(eintrag, dict):
                continue
            zusammenfassung = {
                "kuerzel": eintrag.get("kuerzel"),
                "name": eintrag.get("name"),
                "pfad": eintrag.get("pfad"),
                "erreichbar": False,
                "hinweis": None,
            }
            projekt_dir = finde_projekt_ordner(eintrag)
            if projekt_dir is None:
                zusammenfassung["hinweis"] = "Kein Zugriff oder kein Unterordner 'projekt/'."
            else:
                try:
                    daten = lies_projektdaten(projekt_dir)
                except OSError as exc:
                    zusammenfassung["hinweis"] = f"Kein Zugriff: {exc}"
                else:
                    zusammenfassung["erreichbar"] = True
                    zusammenfassung.update(erzeuge_kurzfassung(daten))
                    zusammenfassung["kuerzel"] = eintrag.get("kuerzel") or zusammenfassung.get("kuerzel")
                    zusammenfassung["name"] = eintrag.get("name") or zusammenfassung.get("name")
            ergebnis.append(zusammenfassung)
        self.sende_json({"projekte": ergebnis})

    def api_portfolio_projekt(self, abfrage: dict) -> None:
        kuerzel = (abfrage.get("kuerzel") or [""])[0]
        if not kuerzel:
            self.sende_fehler_json(400, "Parameter 'kuerzel' fehlt.")
            return
        for eintrag in lade_portfolio_eintraege():
            if isinstance(eintrag, dict) and eintrag.get("kuerzel") == kuerzel:
                projekt_dir = finde_projekt_ordner(eintrag)
                if projekt_dir is None:
                    self.sende_fehler_json(404, "Projektordner nicht erreichbar.")
                    return
                self.sende_json(lies_projektdaten(projekt_dir))
                return
        self.sende_fehler_json(404, f"Kein Portfolio-Eintrag mit Kürzel '{kuerzel}'.")

    def api_open(self, abfrage: dict) -> None:
        """Öffnet ein lokales Dokument — nur innerhalb erlaubter Wurzeln."""
        pfad_text = (abfrage.get("pfad") or [""])[0]
        if not pfad_text:
            self.sende_fehler_json(400, "Parameter 'pfad' fehlt.")
            return
        try:
            ziel = Path(pfad_text).resolve()
        except OSError as exc:
            self.sende_fehler_json(400, f"Ungültiger Pfad: {exc}")
            return

        wurzeln = erlaubte_wurzeln()
        if not wurzeln:
            self.sende_fehler_json(
                403, "Keine erlaubte Wurzel konfiguriert (tools/quellen.json bzw. quelle_wurzel)."
            )
            return
        if not liegt_in_wurzel(ziel, wurzeln):
            self.sende_fehler_json(403, "Pfad liegt ausserhalb der erlaubten Ordner.")
            return
        if not ziel.exists():
            self.sende_fehler_json(404, "Datei nicht gefunden.")
            return

        try:
            oeffne_lokal(ziel)
        except Exception as exc:  # noqa: BLE001 - Fehler soll im Frontend sichtbar sein
            self.sende_fehler_json(500, f"Öffnen fehlgeschlagen: {exc}")
            return
        self.sende_json({"ok": True, "pfad": str(ziel)})

    # ----------------------------------------------------------------- POST
    def do_POST(self) -> None:  # noqa: N802 - von BaseHTTPRequestHandler vorgegeben
        zerlegt = urlparse(self.path)
        if zerlegt.path != "/api/portfolio":
            self.sende_fehler_json(404, f"Unbekannter Endpunkt: {zerlegt.path}")
            return

        laenge = int(self.headers.get("Content-Length") or 0)
        if laenge <= 0 or laenge > 1_000_000:
            self.sende_fehler_json(400, "Leerer oder zu grosser Request-Body.")
            return
        try:
            nutzlast = json.loads(self.rfile.read(laenge).decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            self.sende_fehler_json(400, f"Ungültiges JSON: {exc}")
            return
        if not isinstance(nutzlast, dict):
            self.sende_fehler_json(400, "Erwartet wird ein JSON-Objekt.")
            return

        kuerzel = str(nutzlast.get("kuerzel", "")).strip()
        name = str(nutzlast.get("name", "")).strip()
        pfad = str(nutzlast.get("pfad", "")).strip()
        if not (kuerzel and name and pfad):
            self.sende_fehler_json(400, "Kürzel, Name und Pfad sind Pflichtfelder.")
            return

        eintraege = lade_portfolio_eintraege()
        eintraege = [e for e in eintraege if not (isinstance(e, dict) and e.get("kuerzel") == kuerzel)]
        eintraege.append({"kuerzel": kuerzel, "name": name, "pfad": pfad})
        eintraege.sort(key=lambda e: str(e.get("kuerzel", "")))
        try:
            speichere_portfolio_eintraege(eintraege)
        except OSError as exc:
            self.sende_fehler_json(500, f"Speichern fehlgeschlagen: {exc}")
            return
        self.sende_json({"ok": True, "projekte": eintraege})


class MXPServer(socketserver.ThreadingTCPServer):
    """Erkennt belegte Ports zuverlässig, statt sie stillschweigend zu teilen.

    `allow_reuse_address = False` verhindert, dass ein noch laufender Server aus
    einem anderen Projektordner den Port behält und dessen Inhalte ausgeliefert
    werden (siehe Decision Log 2026-08-06 in GEHIRN.md).
    """

    allow_reuse_address = False
    daemon_threads = True


def starte_server(port: int) -> tuple[MXPServer, int]:
    """Bindet den ersten freien Port ab `port`."""
    letzter_fehler: OSError | None = None
    for versuch in range(MAX_PORT_VERSUCHE):
        kandidat = port + versuch
        try:
            return MXPServer(("127.0.0.1", kandidat), MXPHandler), kandidat
        except OSError as exc:
            if exc.errno not in (98, 48, 10048):  # EADDRINUSE (Linux/macOS/Windows)
                raise
            letzter_fehler = exc
            print(f"  Port {kandidat} ist belegt – versuche {kandidat + 1} …")
    raise SystemExit(
        f"Kein freier Port zwischen {port} und {port + MAX_PORT_VERSUCHE - 1} gefunden "
        f"({letzter_fehler})."
    )


def lies_argumente(argv: list[str]) -> tuple[int, bool]:
    port = STANDARD_PORT
    browser_oeffnen = True
    for arg in argv:
        if arg.startswith("--port="):
            try:
                port = int(arg.split("=", 1)[1])
            except ValueError:
                raise SystemExit(f"Ungültiger Port: {arg}")
        elif arg == "--no-browser":
            browser_oeffnen = False
        elif arg in ("-h", "--help"):
            print(__doc__)
            raise SystemExit(0)
        else:
            raise SystemExit(f"Unbekannte Option: {arg}")
    return port, browser_oeffnen


def main(argv: list[str]) -> int:
    port, browser_oeffnen = lies_argumente(argv)

    if not WEBAPP_DIR.is_dir():
        print(f"FEHLER: Ordner 'webapp/' fehlt ({WEBAPP_DIR}).")
        return 1

    server, tatsaechlicher_port = starte_server(port)
    adresse = f"http://127.0.0.1:{tatsaechlicher_port}"

    print()
    print("  MXP Projektmanagement")
    print(f"  Projektordner : {REPO_ROOT}")
    print(f"  Web-App       : {adresse}")
    print("  Beenden       : Strg+C oder Fenster schliessen")
    print()

    if browser_oeffnen:
        threading.Timer(0.5, lambda: webbrowser.open(adresse)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server beendet.")
    finally:
        server.shutdown()
        server.server_close()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except socket.error as fehler:
        print(f"Netzwerkfehler: {fehler}")
        raise SystemExit(1)
