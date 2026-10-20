import { renderMarkdown, escapeHtml } from "./markdown.js";

/* ------------------------------------------------------------------ Zustand */

const zustand = {
  daten: null,
  ansicht: "uebersicht",
  portfolio: null,
  fremd: null, // { kuerzel, name } wenn ein Portfolio-Projekt angezeigt wird
};

/* ------------------------------------------------------------------ Helfer */

const e = escapeHtml;

function alsListe(wert) {
  return Array.isArray(wert) ? wert : [];
}

function hatFehler(wert) {
  return wert && typeof wert === "object" && !Array.isArray(wert) && wert._fehler;
}

function text(wert, ersatz = "–") {
  if (wert === null || wert === undefined || wert === "") return ersatz;
  return String(wert);
}

function datum(wert) {
  if (!wert) return "–";
  const d = new Date(wert);
  if (Number.isNaN(d.getTime())) return String(wert);
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function zahl(wert, waehrung) {
  if (typeof wert !== "number") return "–";
  return wert.toLocaleString("de-CH", { maximumFractionDigits: 0 }) + (waehrung ? ` ${waehrung}` : "");
}

function ampel(wert) {
  const stufe = String(wert || "").toLowerCase();
  const beschriftung = { gruen: "grün", gelb: "gelb", rot: "rot" }[stufe] || "keine Angabe";
  return `<span class="ampel ampel--${e(stufe)}">${e(beschriftung)}</span>`;
}

function marke(wert) {
  const status = String(wert || "offen").toLowerCase();
  const beschriftung = {
    offen: "offen",
    in_arbeit: "in Arbeit",
    erledigt: "erledigt",
    erreicht: "erreicht",
    geschlossen: "geschlossen",
  }[status] || status;
  return `<span class="marke marke--${e(status)}">${e(beschriftung)}</span>`;
}

function leer(meldung) {
  return `<p class="leer">${e(meldung)}</p>`;
}

function tabelle(spalten, zeilen) {
  if (!zeilen.length) return leer("Noch keine Einträge vorhanden.");
  return `<div class="tabelle-huelle"><table><thead><tr>${spalten
    .map((s) => `<th>${e(s)}</th>`)
    .join("")}</tr></thead><tbody>${zeilen
    .map((z) => `<tr>${z.map((zelle) => `<td>${zelle}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function meldung(nachricht, istFehler = false) {
  document.querySelectorAll(".meldung").forEach((el) => el.remove());
  const box = document.createElement("div");
  box.className = "meldung" + (istFehler ? " meldung--fehler" : "");
  box.textContent = nachricht;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 6000);
}

function offeneAufgaben(daten) {
  return alsListe(daten["05-aufgaben"]).filter(
    (a) => String(a?.status || "").toLowerCase() !== "erledigt"
  ).length;
}

function kritischeRisiken(daten) {
  return alsListe(daten["06-risiken"]).filter((r) => {
    const status = String(r?.status || "").toLowerCase();
    if (status === "geschlossen" || status === "erledigt") return false;
    return (Number(r?.wahrscheinlichkeit) || 0) * (Number(r?.auswirkung) || 0) >= 9;
  }).length;
}

function naechsterMeilenstein(daten) {
  return alsListe(daten["04-meilensteine"])
    .filter((m) => String(m?.status || "").toLowerCase() !== "erreicht" && m?.datum)
    .sort((a, b) => String(a.datum).localeCompare(String(b.datum)))[0];
}

function letzterBericht(daten) {
  return alsListe(daten["08-statusberichte"])
    .slice()
    .sort((a, b) => String(a?.datum || "").localeCompare(String(b?.datum || "")))
    .pop();
}

/* ------------------------------------------------------------------ Ansichten */

function ansichtUebersicht(daten) {
  const stamm = daten.projekt || {};
  const bericht = letzterBericht(daten);
  const meilenstein = naechsterMeilenstein(daten);
  const fortschritt = Number(stamm.fortschritt_prozent) || 0;

  const karten = [
    `<div class="karte"><h3>Status</h3><div class="kennzahl" style="font-size:20px">${e(
      text(stamm.status)
    )}</div><div class="kennzahl__label">Phase: ${e(text(stamm.phase))}</div></div>`,
    `<div class="karte"><h3>Gesamtampel</h3><div style="font-size:18px;margin-top:6px">${ampel(
      bericht?.ampel || stamm.ampel
    )}</div><div class="kennzahl__label">Letzter Bericht: ${e(datum(bericht?.datum))}</div></div>`,
    `<div class="karte"><h3>Fortschritt</h3><div class="kennzahl">${fortschritt}&nbsp;%</div>
      <div class="fortschritt"><div class="fortschritt__wert" style="width:${Math.min(
        Math.max(fortschritt, 0),
        100
      )}%"></div></div></div>`,
    `<div class="karte"><h3>Offene Aufgaben</h3><div class="kennzahl">${offeneAufgaben(
      daten
    )}</div><div class="kennzahl__label">von ${alsListe(daten["05-aufgaben"]).length} gesamt</div></div>`,
    `<div class="karte"><h3>Kritische Risiken</h3><div class="kennzahl">${kritischeRisiken(
      daten
    )}</div><div class="kennzahl__label">Wahrscheinlichkeit × Auswirkung ≥ 9</div></div>`,
    `<div class="karte"><h3>Nächster Meilenstein</h3><div style="font-weight:600">${e(
      text(meilenstein?.titel, "keiner offen")
    )}</div><div class="kennzahl__label">${e(datum(meilenstein?.datum))}</div></div>`,
  ];

  const stammdaten = tabelle(
    ["Feld", "Wert"],
    [
      ["Projektname", e(text(stamm.name))],
      ["Kürzel", e(text(stamm.kuerzel))],
      ["Projektleiter:in", e(text(stamm.projektleiter))],
      ["Auftraggeber", e(text(stamm.auftraggeber))],
      ["Start", e(datum(stamm.start))],
      ["Ende (geplant)", e(datum(stamm.ende_geplant))],
    ].map(([feld, wert]) => [`<strong>${e(feld)}</strong>`, wert])
  );

  return `
    ${stamm.kurzbeschreibung ? `<div class="hinweis">${e(stamm.kurzbeschreibung)}</div>` : ""}
    <div class="karten">${karten.join("")}</div>
    <div class="block"><h2>Stammdaten</h2>${stammdaten}</div>
    ${
      bericht
        ? `<div class="block"><h2>Letzter Statusbericht</h2><div class="karte">
             <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px">
               <span>Termine: ${ampel(bericht.ampel_termine)}</span>
               <span>Kosten: ${ampel(bericht.ampel_kosten)}</span>
               <span>Inhalt: ${ampel(bericht.ampel_inhalt)}</span>
             </div>
             <p style="margin:0">${e(text(bericht.zusammenfassung))}</p></div></div>`
        : ""
    }`;
}

function ansichtMarkdown(schluessel) {
  return (daten) => {
    const inhalt = daten[schluessel];
    if (inhalt === null || inhalt === undefined) {
      return leer(`Die Datei projekt/${schluessel}.md fehlt.`);
    }
    if (hatFehler(inhalt)) return `<div class="hinweis hinweis--fehler">${e(inhalt._fehler)}</div>`;
    return `<div class="markdown">${renderMarkdown(inhalt)}</div>`;
  };
}

function ansichtStakeholder(daten) {
  const eintraege = alsListe(daten["03-stakeholder"]);
  return tabelle(
    ["Name", "Rolle", "Organisation", "Einfluss", "Interesse", "Haltung", "Massnahme"],
    eintraege.map((s) => [
      `<strong>${e(text(s.name))}</strong>`,
      e(text(s.rolle)),
      e(text(s.organisation)),
      e(text(s.einfluss)),
      e(text(s.interesse)),
      e(text(s.haltung)),
      e(text(s.massnahme)),
    ])
  );
}

function ansichtMeilensteine(daten) {
  const eintraege = alsListe(daten["04-meilensteine"])
    .slice()
    .sort((a, b) => String(a?.datum || "").localeCompare(String(b?.datum || "")));
  return tabelle(
    ["Termin", "Meilenstein", "Status", "Beschreibung"],
    eintraege.map((m) => [
      e(datum(m.datum)),
      `<strong>${e(text(m.titel))}</strong>`,
      marke(m.status),
      e(text(m.beschreibung, "")),
    ])
  );
}

function ansichtAufgaben(daten) {
  const eintraege = alsListe(daten["05-aufgaben"]);
  if (!eintraege.length) return leer("Noch keine Aufgaben erfasst.");

  const spalten = [
    ["offen", "Offen"],
    ["in_arbeit", "In Arbeit"],
    ["erledigt", "Erledigt"],
  ];

  return `<div class="kanban">${spalten
    .map(([status, titel]) => {
      const karten = eintraege.filter(
        (a) => String(a?.status || "offen").toLowerCase() === status
      );
      return `<div class="kanban__spalte">
        <div class="kanban__titel"><span>${e(titel)}</span><span>${karten.length}</span></div>
        ${karten
          .map(
            (a) => `<div class="kanban__karte">
              <h4>${e(text(a.titel))}</h4>
              <div class="kanban__meta">${e(text(a.verantwortlich, "ohne Zuordnung"))}${
              a.faellig ? " · fällig " + e(datum(a.faellig)) : ""
            }</div>
              ${a.beschreibung ? `<p style="margin:8px 0 0;font-size:13px">${e(a.beschreibung)}</p>` : ""}
            </div>`
          )
          .join("")}
      </div>`;
    })
    .join("")}</div>`;
}

function ansichtRisiken(daten) {
  const eintraege = alsListe(daten["06-risiken"]);
  const tab = tabelle(
    ["ID", "Risiko", "W", "A", "Schwere", "Status", "Verantwortlich", "Massnahme"],
    eintraege
      .slice()
      .sort(
        (a, b) =>
          (Number(b?.wahrscheinlichkeit) || 0) * (Number(b?.auswirkung) || 0) -
          (Number(a?.wahrscheinlichkeit) || 0) * (Number(a?.auswirkung) || 0)
      )
      .map((r) => {
        const schwere = (Number(r.wahrscheinlichkeit) || 0) * (Number(r.auswirkung) || 0);
        return [
          e(text(r.id)),
          `<strong>${e(text(r.titel))}</strong>`,
          e(text(r.wahrscheinlichkeit)),
          e(text(r.auswirkung)),
          schwere >= 9 ? `<span class="marke marke--kritisch">${schwere}</span>` : String(schwere),
          marke(r.status),
          e(text(r.verantwortlich)),
          e(text(r.massnahme, "")),
        ];
      })
  );

  // 5×5-Matrix: Zeilen = Wahrscheinlichkeit (5 oben), Spalten = Auswirkung.
  const zeilen = [];
  for (let w = 5; w >= 1; w -= 1) {
    const zellen = [`<div class="matrix__achse">W ${w}</div>`];
    for (let a = 1; a <= 5; a += 1) {
      const schwere = w * a;
      const stufe = schwere >= 9 ? (schwere >= 15 ? "hoch" : "mittel") : "gering";
      const punkte = eintraege
        .filter(
          (r) =>
            Number(r?.wahrscheinlichkeit) === w &&
            Number(r?.auswirkung) === a &&
            String(r?.status || "").toLowerCase() !== "geschlossen"
        )
        .map((r) => `<span class="matrix__punkt" title="${e(text(r.titel))}">${e(text(r.id))}</span>`)
        .join("");
      zellen.push(`<div class="matrix__zelle matrix__zelle--${stufe}">${punkte}</div>`);
    }
    zeilen.push(zellen.join(""));
  }
  const achse = ['<div class="matrix__achse"></div>']
    .concat([1, 2, 3, 4, 5].map((a) => `<div class="matrix__achse">A ${a}</div>`))
    .join("");

  return `${tab}
    <div class="block"><h2>Risikomatrix</h2>
      <div class="karte" style="max-width:620px">
        <div class="matrix">${zeilen.join("")}${achse}</div>
        <p class="kennzahl__label" style="margin-top:12px">W = Wahrscheinlichkeit, A = Auswirkung (je 1–5). Geschlossene Risiken werden ausgeblendet.</p>
      </div>
    </div>`;
}

function ansichtBudget(daten) {
  const budget = daten["07-budget"];
  if (!budget || hatFehler(budget)) {
    return hatFehler(budget)
      ? `<div class="hinweis hinweis--fehler">${e(budget._fehler)}</div>`
      : leer("Noch kein Budget erfasst.");
  }
  const waehrung = budget.waehrung || "CHF";
  const positionen = alsListe(budget.positionen);
  const summeBudget = positionen.reduce((s, p) => s + (Number(p?.budget) || 0), 0);
  const summeIst = positionen.reduce((s, p) => s + (Number(p?.ist) || 0), 0);

  const karten = `<div class="karten">
    <div class="karte"><h3>Gesamtbudget</h3><div class="kennzahl">${e(
      zahl(Number(budget.gesamtbudget) || summeBudget, waehrung)
    )}</div></div>
    <div class="karte"><h3>Ist-Kosten</h3><div class="kennzahl">${e(
      zahl(summeIst, waehrung)
    )}</div></div>
    <div class="karte"><h3>Abweichung</h3><div class="kennzahl">${e(
      zahl(summeBudget - summeIst, waehrung)
    )}</div><div class="kennzahl__label">Budget minus Ist</div></div>
  </div>`;

  const tab = tabelle(
    ["Position", `Budget (${waehrung})`, `Ist (${waehrung})`, "Abweichung", "Bemerkung"],
    positionen.map((p) => {
      const abweichung = (Number(p?.budget) || 0) - (Number(p?.ist) || 0);
      return [
        `<strong>${e(text(p.position))}</strong>`,
        e(zahl(Number(p.budget) || 0)),
        e(zahl(Number(p.ist) || 0)),
        e(zahl(abweichung)),
        e(text(p.bemerkung, "")),
      ];
    })
  );

  return `${karten}<div class="block"><h2>Positionen</h2>${tab}</div>`;
}

function ansichtStatusberichte(daten) {
  const berichte = alsListe(daten["08-statusberichte"])
    .slice()
    .sort((a, b) => String(b?.datum || "").localeCompare(String(a?.datum || "")));
  if (!berichte.length) return leer("Noch keine Statusberichte erfasst.");

  return berichte
    .map(
      (b) => `<div class="karte" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <h3 style="margin:0">${e(datum(b.datum))}</h3>
          <div>Gesamt: ${ampel(b.ampel)}</div>
        </div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin:10px 0">
          <span>Termine: ${ampel(b.ampel_termine)}</span>
          <span>Kosten: ${ampel(b.ampel_kosten)}</span>
          <span>Inhalt: ${ampel(b.ampel_inhalt)}</span>
        </div>
        <p style="margin:0 0 6px">${e(text(b.zusammenfassung, ""))}</p>
        ${
          b.naechste_schritte
            ? `<p class="kennzahl__label" style="margin:0"><strong>Nächste Schritte:</strong> ${e(
                b.naechste_schritte
              )}</p>`
            : ""
        }
      </div>`
    )
    .join("");
}

function ansichtEntscheidungen(daten) {
  const eintraege = alsListe(daten["09-entscheidungen"])
    .slice()
    .sort((a, b) => String(b?.datum || "").localeCompare(String(a?.datum || "")));
  return tabelle(
    ["Datum", "ID", "Entscheidung", "Begründung", "Entschieden von"],
    eintraege.map((d) => [
      e(datum(d.datum)),
      e(text(d.id)),
      `<strong>${e(text(d.entscheidung))}</strong>`,
      e(text(d.begruendung, "")),
      e(text(d.entschieden_von)),
    ])
  );
}

function ansichtStreams(daten) {
  const quelle = daten["11-streams"];
  if (!quelle || hatFehler(quelle)) {
    return hatFehler(quelle)
      ? `<div class="hinweis hinweis--fehler">${e(quelle._fehler)}</div>`
      : leer("Noch keine Streams erfasst.");
  }
  const streams = alsListe(quelle.streams);
  if (!streams.length) return leer("Noch keine Streams erfasst.");

  const hinweis = quelle.quelle_wurzel
    ? `<div class="hinweis">Dokumente werden lokal geöffnet. Erlaubte Wurzel: <code>${e(
        quelle.quelle_wurzel
      )}</code></div>`
    : `<div class="hinweis">Noch keine <code>quelle_wurzel</code> gesetzt – Dokumente lassen sich erst öffnen, wenn in <code>projekt/11-streams.json</code> oder <code>tools/quellen.json</code> ein erlaubter Ordner eingetragen ist.</div>`;

  return (
    hinweis +
    streams
      .map((s) => {
        const liste = (eintraege, leerText, zeile) =>
          alsListe(eintraege).length
            ? `<ul>${alsListe(eintraege).map(zeile).join("")}</ul>`
            : `<p class="kennzahl__label">${e(leerText)}</p>`;

        return `<div class="karte" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
            <h3 style="margin:0">${e(text(s.name))}</h3>
            <div>${marke(s.status)}</div>
          </div>
          <p class="kennzahl__label" style="margin:4px 0 14px">Verantwortlich: ${e(
            text(s.verantwortlich)
          )}${s.beschreibung ? " · " + e(s.beschreibung) : ""}</p>

          <h4 style="margin:0 0 4px;font-size:14px">Deliverables</h4>
          ${liste(
            s.deliverables,
            "Keine Deliverables erfasst.",
            (d) =>
              `<li>${e(text(d.titel))} — ${marke(d.status)}${
                d.faellig ? ` <span class="kennzahl__label">fällig ${e(datum(d.faellig))}</span>` : ""
              }</li>`
          )}

          <h4 style="margin:14px 0 4px;font-size:14px">Offene Punkte</h4>
          ${liste(
            s.offene_punkte,
            "Keine offenen Punkte.",
            (p) =>
              `<li>${e(text(p.titel))}${
                p.verantwortlich
                  ? ` <span class="kennzahl__label">(${e(p.verantwortlich)})</span>`
                  : ""
              }</li>`
          )}

          <h4 style="margin:14px 0 4px;font-size:14px">Dokumente</h4>
          ${liste(
            s.dokumente,
            "Keine Dokumente verknüpft.",
            (d) =>
              `<li>${
                d.pfad
                  ? `<button class="verweis" data-oeffnen="${e(d.pfad)}">${e(
                      text(d.titel, d.pfad)
                    )}</button>`
                  : e(text(d.titel))
              }${d.bemerkung ? ` <span class="kennzahl__label">${e(d.bemerkung)}</span>` : ""}</li>`
          )}
        </div>`;
      })
      .join("")
  );
}

function ansichtPortfolio() {
  const eintraege = zustand.portfolio?.projekte;

  const formular = `<div class="karte">
    <h3>Projekt registrieren</h3>
    <form class="formular" id="portfolio-formular">
      <div><label for="pf-kuerzel">Kürzel</label><input type="text" id="pf-kuerzel" placeholder="MXP-042" required></div>
      <div><label for="pf-name">Name</label><input type="text" id="pf-name" placeholder="Mein Projekt" required></div>
      <div><label for="pf-pfad">Ordner-Pfad</label><input type="text" id="pf-pfad" placeholder="\\\\server\\projekte\\MXP-042" required></div>
      <div><button class="knopf" type="submit">Hinzufügen</button></div>
    </form>
    <p class="kennzahl__label" style="margin:12px 0 0">Der Pfad muss auf den Projektordner zeigen, der den Unterordner <code>projekt/</code> enthält. Gespeichert wird in <code>portfolio/projekte.json</code>.</p>
  </div>`;

  if (eintraege === undefined) {
    return `${formular}<div class="block">${leer("Portfolio wird geladen …")}</div>`;
  }

  const tab = !eintraege.length
    ? leer("Noch keine Projekte registriert.")
    : tabelle(
        ["Kürzel", "Projekt", "Fortschritt", "Ampel", "Kritische Risiken", "Offene Meilensteine", "Pfad"],
        eintraege.map((p) => {
          const name = p.erreichbar
            ? `<button class="verweis" data-projekt="${e(p.kuerzel)}">${e(text(p.name))}</button>`
            : `${e(text(p.name))}<br><span class="marke marke--kritisch">kein Zugriff</span>
               <span class="kennzahl__label">${e(text(p.hinweis, ""))}</span>`;
          return [
            `<strong>${e(text(p.kuerzel))}</strong>`,
            name,
            p.erreichbar ? `${e(text(p.fortschritt_prozent, "0"))}&nbsp;%` : "–",
            p.erreichbar ? ampel(p.ampel) : "–",
            p.erreichbar ? e(text(p.kritische_risiken, "0")) : "–",
            p.erreichbar ? e(text(p.offene_meilensteine, "0")) : "–",
            `<span class="kennzahl__label">${e(text(p.pfad))}</span>`,
          ];
        })
      );

  return `${formular}<div class="block"><h2>Registrierte Projekte</h2>${tab}</div>`;
}

const ANSICHTEN = [
  { id: "uebersicht", titel: "Übersicht", untertitel: "Kennzahlen und Stammdaten", gruppe: "Projekt", render: ansichtUebersicht },
  { id: "auftrag", titel: "Projektauftrag", untertitel: "projekt/01-projektauftrag.md", gruppe: "Projekt", render: ansichtMarkdown("01-projektauftrag") },
  { id: "ziele", titel: "Ziele & Scope", untertitel: "projekt/02-ziele-scope.md", gruppe: "Projekt", render: ansichtMarkdown("02-ziele-scope") },
  { id: "stakeholder", titel: "Stakeholder", untertitel: "projekt/03-stakeholder.json", gruppe: "Projekt", render: ansichtStakeholder, anzahl: (d) => alsListe(d["03-stakeholder"]).length },
  { id: "meilensteine", titel: "Meilensteine", untertitel: "projekt/04-meilensteine.json", gruppe: "Steuerung", render: ansichtMeilensteine, anzahl: (d) => alsListe(d["04-meilensteine"]).length },
  { id: "aufgaben", titel: "Aufgaben", untertitel: "projekt/05-aufgaben.json", gruppe: "Steuerung", render: ansichtAufgaben, anzahl: (d) => alsListe(d["05-aufgaben"]).length },
  { id: "risiken", titel: "Risiken", untertitel: "projekt/06-risiken.json", gruppe: "Steuerung", render: ansichtRisiken, anzahl: (d) => alsListe(d["06-risiken"]).length },
  { id: "budget", titel: "Budget", untertitel: "projekt/07-budget.json", gruppe: "Steuerung", render: ansichtBudget },
  { id: "streams", titel: "Streams", untertitel: "projekt/11-streams.json", gruppe: "Steuerung", render: ansichtStreams, anzahl: (d) => alsListe(d["11-streams"]?.streams).length },
  { id: "status", titel: "Statusberichte", untertitel: "projekt/08-statusberichte.json", gruppe: "Dokumentation", render: ansichtStatusberichte, anzahl: (d) => alsListe(d["08-statusberichte"]).length },
  { id: "entscheidungen", titel: "Entscheidungen", untertitel: "projekt/09-entscheidungen.json", gruppe: "Dokumentation", render: ansichtEntscheidungen, anzahl: (d) => alsListe(d["09-entscheidungen"]).length },
  { id: "lessons", titel: "Lessons Learned", untertitel: "projekt/10-lessons-learned.md", gruppe: "Dokumentation", render: ansichtMarkdown("10-lessons-learned") },
  { id: "portfolio", titel: "Portfolio", untertitel: "Alle registrierten MXP-Projekte", gruppe: "Portfolio", render: ansichtPortfolio },
];

/* ------------------------------------------------------------------ Rendern */

function zeichneNavigation() {
  const nav = document.getElementById("nav");
  const daten = zustand.daten || {};
  let letzteGruppe = null;
  nav.innerHTML = ANSICHTEN.map((a) => {
    const kopf = a.gruppe !== letzteGruppe ? `<div class="nav__gruppe">${e(a.gruppe)}</div>` : "";
    letzteGruppe = a.gruppe;
    const anzahl = a.anzahl ? a.anzahl(daten) : null;
    return `${kopf}<button class="nav__link${
      a.id === zustand.ansicht ? " is-aktiv" : ""
    }" data-ansicht="${e(a.id)}">
      <span>${e(a.titel)}</span>
      ${anzahl ? `<span class="nav__anzahl">${anzahl}</span>` : ""}
    </button>`;
  }).join("");
}

function zeichneKopfbereich() {
  const stamm = zustand.daten?.projekt || {};
  document.getElementById("projekt-kuerzel").textContent = text(stamm.kuerzel, "MXP-000");
  document.getElementById("projekt-name").textContent = text(stamm.name, "Unbenanntes Projekt");
}

function zeichneInhalt() {
  const ansicht = ANSICHTEN.find((a) => a.id === zustand.ansicht) || ANSICHTEN[0];
  document.getElementById("titel").textContent = ansicht.titel;
  document.getElementById("untertitel").textContent = ansicht.untertitel;

  const bereich = document.getElementById("bereich");
  const banner = zustand.fremd
    ? `<div class="hinweis">Nur-Lese-Ansicht des Projekts <strong>${e(
        zustand.fremd.name || zustand.fremd.kuerzel
      )}</strong>. <button class="verweis" id="zurueck">Zurück zum eigenen Projekt</button></div>`
    : "";

  try {
    bereich.innerHTML = banner + ansicht.render(zustand.daten || {});
  } catch (fehler) {
    bereich.innerHTML =
      banner + `<div class="hinweis hinweis--fehler">Anzeige fehlgeschlagen: ${e(fehler.message)}</div>`;
  }
}

function zeichne() {
  zeichneNavigation();
  zeichneKopfbereich();
  zeichneInhalt();
}

/* ------------------------------------------------------------------ Daten */

async function hole(pfad, optionen) {
  const antwort = await fetch(pfad, optionen);
  const inhalt = await antwort.json().catch(() => ({}));
  if (!antwort.ok) {
    throw new Error(inhalt.fehler || `Serverfehler ${antwort.status}`);
  }
  return inhalt;
}

async function ladeEigenesProjekt() {
  zustand.daten = await hole("/api/projekt");
  zustand.fremd = null;
}

async function ladePortfolio() {
  try {
    zustand.portfolio = await hole("/api/portfolio");
  } catch (fehler) {
    zustand.portfolio = { projekte: [] };
    meldung(`Portfolio konnte nicht geladen werden: ${fehler.message}`, true);
  }
}

async function oeffneFremdprojekt(kuerzel) {
  const eintrag = (zustand.portfolio?.projekte || []).find((p) => p.kuerzel === kuerzel);
  try {
    zustand.daten = await hole(`/api/portfolio/projekt?kuerzel=${encodeURIComponent(kuerzel)}`);
    zustand.fremd = { kuerzel, name: eintrag?.name };
    zustand.ansicht = "uebersicht";
    zeichne();
  } catch (fehler) {
    meldung(`Projekt konnte nicht geladen werden: ${fehler.message}`, true);
  }
}

/* ------------------------------------------------------------------ Events */

function verdrahteEreignisse() {
  document.getElementById("nav").addEventListener("click", (ereignis) => {
    const knopf = ereignis.target.closest("[data-ansicht]");
    if (!knopf) return;
    zustand.ansicht = knopf.dataset.ansicht;
    zeichne();
    if (zustand.ansicht === "portfolio" && !zustand.portfolio) {
      ladePortfolio().then(zeichneInhalt);
    }
  });

  document.getElementById("bereich").addEventListener("click", async (ereignis) => {
    const projektKnopf = ereignis.target.closest("[data-projekt]");
    if (projektKnopf) {
      oeffneFremdprojekt(projektKnopf.dataset.projekt);
      return;
    }

    const dokument = ereignis.target.closest("[data-oeffnen]");
    if (dokument) {
      try {
        await hole(`/api/open?pfad=${encodeURIComponent(dokument.dataset.oeffnen)}`);
        meldung("Dokument wird geöffnet.");
      } catch (fehler) {
        meldung(fehler.message, true);
      }
      return;
    }

    if (ereignis.target.id === "zurueck") {
      try {
        await ladeEigenesProjekt();
        zeichne();
      } catch (fehler) {
        meldung(fehler.message, true);
      }
    }
  });

  document.getElementById("bereich").addEventListener("submit", async (ereignis) => {
    if (ereignis.target.id !== "portfolio-formular") return;
    ereignis.preventDefault();
    const nutzlast = {
      kuerzel: document.getElementById("pf-kuerzel").value.trim(),
      name: document.getElementById("pf-name").value.trim(),
      pfad: document.getElementById("pf-pfad").value.trim(),
    };
    try {
      await hole("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nutzlast),
      });
      await ladePortfolio();
      zeichneInhalt();
      meldung(`${nutzlast.kuerzel} wurde registriert.`);
    } catch (fehler) {
      meldung(fehler.message, true);
    }
  });

  document.getElementById("neu-laden").addEventListener("click", async () => {
    try {
      await ladeEigenesProjekt();
      await ladePortfolio();
      zeichne();
      meldung("Daten neu geladen.");
    } catch (fehler) {
      meldung(fehler.message, true);
    }
  });
}

async function start() {
  verdrahteEreignisse();
  try {
    await ladeEigenesProjekt();
  } catch (fehler) {
    document.getElementById("bereich").innerHTML = `<div class="hinweis hinweis--fehler">
      <strong>Verbindung fehlgeschlagen.</strong> ${e(fehler.message)}<br>
      Bitte die Web-App über <code>start.bat</code> starten – ein direkt geöffnetes
      <code>index.html</code> kann nicht auf den Projektordner zugreifen.
    </div>`;
    return;
  }
  zeichne();
  ladePortfolio().then(() => {
    if (zustand.ansicht === "portfolio") zeichneInhalt();
  });
}

start();
