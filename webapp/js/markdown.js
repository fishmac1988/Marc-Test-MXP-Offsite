/* Minimaler Markdown-Renderer (lokal, ohne externe Bibliothek).
   Unterstuetzt: Ueberschriften, Absaetze, Listen, Tabellen, Zitate,
   Codebloecke, fett/kursiv/Code-Spans und Links. */

export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // Nur http(s)-Links zulassen – kein javascript:, kein file:.
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return html;
}

function istTrenner(zeile) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(zeile);
}

function zellen(zeile) {
  return zeile
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((z) => z.trim());
}

export function renderMarkdown(quelltext) {
  if (!quelltext || !String(quelltext).trim()) {
    return '<p class="leer">Diese Datei ist noch leer.</p>';
  }

  const zeilen = String(quelltext).replace(/\r\n/g, "\n").split("\n");
  const teile = [];
  let i = 0;

  while (i < zeilen.length) {
    const zeile = zeilen[i];

    if (!zeile.trim()) {
      i += 1;
      continue;
    }

    // Codeblock
    if (/^```/.test(zeile)) {
      const inhalt = [];
      i += 1;
      while (i < zeilen.length && !/^```/.test(zeilen[i])) {
        inhalt.push(zeilen[i]);
        i += 1;
      }
      i += 1;
      teile.push(`<pre><code>${escapeHtml(inhalt.join("\n"))}</code></pre>`);
      continue;
    }

    // Ueberschrift
    const ueberschrift = zeile.match(/^(#{1,6})\s+(.*)$/);
    if (ueberschrift) {
      const stufe = ueberschrift[1].length;
      teile.push(`<h${stufe}>${inline(ueberschrift[2])}</h${stufe}>`);
      i += 1;
      continue;
    }

    // Horizontale Linie
    if (/^\s*(\*\s*){3,}$|^\s*(-\s*){3,}$/.test(zeile) && !zeile.includes("|")) {
      teile.push("<hr>");
      i += 1;
      continue;
    }

    // Tabelle
    if (zeile.includes("|") && i + 1 < zeilen.length && istTrenner(zeilen[i + 1])) {
      const kopf = zellen(zeile);
      i += 2;
      const zeilenHtml = [];
      while (i < zeilen.length && zeilen[i].includes("|") && zeilen[i].trim()) {
        zeilenHtml.push(
          `<tr>${zellen(zeilen[i]).map((z) => `<td>${inline(z)}</td>`).join("")}</tr>`
        );
        i += 1;
      }
      teile.push(
        `<table><thead><tr>${kopf
          .map((z) => `<th>${inline(z)}</th>`)
          .join("")}</tr></thead><tbody>${zeilenHtml.join("")}</tbody></table>`
      );
      continue;
    }

    // Zitat
    if (/^\s*>/.test(zeile)) {
      const inhalt = [];
      while (i < zeilen.length && /^\s*>/.test(zeilen[i])) {
        inhalt.push(zeilen[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      teile.push(`<blockquote>${renderMarkdown(inhalt.join("\n"))}</blockquote>`);
      continue;
    }

    // Listen
    const istAufzaehlung = /^\s*[-*+]\s+/.test(zeile);
    const istNummeriert = /^\s*\d+[.)]\s+/.test(zeile);
    if (istAufzaehlung || istNummeriert) {
      const muster = istAufzaehlung ? /^\s*[-*+]\s+/ : /^\s*\d+[.)]\s+/;
      const eintraege = [];
      while (i < zeilen.length && muster.test(zeilen[i])) {
        eintraege.push(`<li>${inline(zeilen[i].replace(muster, ""))}</li>`);
        i += 1;
      }
      const tag = istAufzaehlung ? "ul" : "ol";
      teile.push(`<${tag}>${eintraege.join("")}</${tag}>`);
      continue;
    }

    // Absatz
    const absatz = [];
    while (
      i < zeilen.length &&
      zeilen[i].trim() &&
      !/^(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|\s*>|```)/.test(zeilen[i])
    ) {
      absatz.push(zeilen[i].trim());
      i += 1;
    }
    if (absatz.length) {
      teile.push(`<p>${inline(absatz.join(" "))}</p>`);
    }
  }

  return teile.join("\n");
}
