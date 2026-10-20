# Design-Vorgaben (Axpo Corporate Design)

> **Single Source of Truth** für alle sichtbaren Outputs dieser Umgebung:
> Web-App, Dokumente, Grafiken, Präsentationen.
> Umgesetzt in [`webapp/css/app.css`](../webapp/css/app.css).

## Brand Colours

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| Axpo Blue | `#313193` | **funktional**: Buttons, Links, Akzente, aktive Navigation |
| Axpo Red | `#ff5d64` | **nur dekorativ**: Flächen, Verläufe, Grafikelemente |

**Accessibility (WCAG AA):** Axpo Red erfüllt auf Weiss den Kontrastwert für Text
nicht und wird deshalb **nie** für Text, Buttons oder Links eingesetzt.

## Supportive Colours

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| White | `#ffffff` | Flächen, Karten |
| Dark Grey | `#3d3d3d` | Fliesstext, Überschriften |
| Green | `#008400` | **ausschliesslich** Nachhaltigkeitsthemen |

## Statusfarben (Ampel)

Die Ampel braucht Signalfarben, die weder Axpo Red (dekorativ) noch Axpo Green
(nur Nachhaltigkeit) belegen. Verwendet werden kontraststarke Töne:

| Status | Hex |
|--------|-----|
| grün | `#2e7d32` |
| gelb | `#a8620a` |
| rot | `#c62828` |

## Axpo Gradient

Verlauf Yellow → Red → Blue, ausschliesslich dekorativ (z. B. Akzentlinie im
Seitenkopf):

```css
background: linear-gradient(120deg, #ffd24d 0%, #ff5d64 45%, #313193 100%);
```

**Do-nots:** kein Text auf dem Verlauf ohne ausreichenden Kontrast, keine
Verlaufsfüllung in Diagrammen, kein Verlauf hinter dem Logo.

## Typografie

| Einsatz | Schrift |
|---------|---------|
| Headlines | Almarena |
| Body | Open Sans |
| Office-Dokumente | Verdana |

In der Web-App werden **keine externen Fonts geladen** (datensparsam, offline
lauffähig). Die CSS-Schriftkaskade nutzt lokal installierte Schriften und fällt
sonst auf die Systemschrift zurück:

```css
font-family: "Open Sans", "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
```

## Schreibweise

- **Kein UPPER CASE** – keine durchgängige Grossschreibung in Headlines, Buttons
  oder Navigation.
- **Keine farbigen Headlines** – Überschriften in Dark Grey; Farbe nur für
  einzelne Highlights.
- Projektsprache ist **Deutsch**.

## Assets

| Pfad | Inhalt |
|------|--------|
| `design/assets/logo/` | Logo und Signet-Varianten (`axpo-logo.png`, `axpo-x*.png`) |
| `design/assets/imagery/` | Wallpapers (Corporate, Hydro, Solar, Wind, Nuclear, Hydrogen) |
| `webapp/assets/` | Kopien der in der Web-App genutzten Assets |

Der Server liefert ausschliesslich Dateien aus `webapp/` aus. Assets, die die
Web-App braucht, müssen deshalb nach `webapp/assets/` **kopiert** werden.

> Noch nicht in diesem Repo: das Icon-Set (`design/assets/icons/`) sowie die
> Original-Schriftdateien. Beides liegt im Axpo-Brand-Portal.
