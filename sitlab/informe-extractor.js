/**
 * informe-extractor.js
 * -----------------------------------------------------------------------
 * Standalone, dependency-free ES module for extracting key fields from a
 * Spanish Seguridad Social "Informe de Situación Laboral / Situación Actual"
 * PDF, for use directly in a web page (no Node.js, no bundler required).
 *
 * This module does NOT bundle pdf.js itself — you load pdf.js in your page
 * (via a <script type="module"> CDN import, or your own bundler) and pass
 * the `pdfjsLib` object in. That keeps this file small and lets you control
 * exactly which pdf.js build/version/worker you use.
 *
 * ------------------------------- USAGE ----------------------------------
 *
 * <script type="module">
 *   import * as pdfjsLib from
 *     "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
 *   pdfjsLib.GlobalWorkerOptions.workerSrc =
 *     "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
 *
 *   import { extractInformeSituacionLaboral } from "./informe-extractor.js";
 *
 *   const fileInput = document.querySelector("#pdfInput");
 *   fileInput.addEventListener("change", async () => {
 *     const result = await extractInformeSituacionLaboral(pdfjsLib, fileInput.files[0]);
 *     console.log(result);
 *   });
 * </script>
 *
 * `source` (2nd argument) accepts: a File/Blob (e.g. from <input type="file">),
 * an ArrayBuffer/Uint8Array, or a URL string (fetched automatically).
 *
 * See demo.html for a complete working example.
 * -----------------------------------------------------------------------
 */

// ---- Spanish month lookup for date normalization ----
const MONTHS = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10',
  noviembre: '11', diciembre: '12',
};

function spanishLongDateToIso(str) {
  // "10 de agosto de 2026" -> "2026-08-10"
  const m = str.match(/(\d{1,2})\s+de\s+([a-zA-Zá-úñ]+)\s+de\s+(\d{4})/i);
  if (!m) return null;
  const day = m[1].padStart(2, '0');
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return `${m[3]}-${month}-${day}`;
}

function dotDateToIso(str) {
  // "10.08.2026" or "10/08/2026" -> "2026-08-10"
  const m = str.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

// ---- Turn PDF pages into text, grouped by visual line (so table columns
// read left-to-right in the right order instead of however pdf.js happens
// to enumerate glyphs internally). ----
function groupItemsIntoLines(items, yTolerance = 2) {
  const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
  const lines = [];
  for (const item of sorted) {
    const y = item.transform[5];
    let line = lines.find((l) => Math.abs(l.y - y) <= yTolerance);
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push(item);
  }
  for (const line of lines) {
    line.items.sort((a, b) => a.transform[4] - b.transform[4]);
  }
  lines.sort((a, b) => b.y - a.y);
  return lines
    .map((l) => l.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

async function getLinesForAllPages(pdf) {
  const allLines = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    allLines.push(...groupItemsIntoLines(content.items));
  }
  return allLines;
}

// ---- Locate embedded images (e.g. the Seguridad Social / Gobierno de España
// header logos) by walking the page's operator list and tracking the
// cumulative transform matrix, so we know where each image is drawn on the
// page rather than just whether one exists anywhere in the file. ----
async function getImageBoxesOnPage(page, pdfjsLib) {
  const viewport = page.getViewport({ scale: 1 });
  const opList = await page.getOperatorList();
  const OPS = pdfjsLib.OPS;

  const multiply = (m1, m2) => [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];

  const boxes = [];
  const stack = [[1, 0, 0, 1, 0, 0]];
  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    const args = opList.argsArray[i];
    if (fn === OPS.save) {
      stack.push([...stack[stack.length - 1]]);
    } else if (fn === OPS.restore) {
      if (stack.length > 1) stack.pop();
    } else if (fn === OPS.transform) {
      stack[stack.length - 1] = multiply(stack[stack.length - 1], args);
    } else if (
      fn === OPS.paintImageXObject ||
      fn === OPS.paintJpegXObject ||
      fn === OPS.paintImageXObjectRepeat
    ) {
      const m = stack[stack.length - 1];
      // The image occupies the unit square (0,0)-(1,1) before the CTM is applied.
      const corners = [
        [m[4], m[5]],
        [m[0] + m[4], m[1] + m[5]],
        [m[2] + m[4], m[3] + m[5]],
        [m[0] + m[2] + m[4], m[1] + m[3] + m[5]],
      ];
      const xs = corners.map((c) => c[0]);
      const ys = corners.map((c) => c[1]);
      boxes.push({
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
        pageWidth: viewport.width,
        pageHeight: viewport.height,
      });
    }
  }
  return boxes;
}

// ---- Field extraction ----
function extractName(flatText) {
  // "D/Dª YURIMAR YAREMY HIDALGO GRATEROL, nacido/a el ..."
  const m = flatText.match(/D\/D\S{0,2}\s+(.+?),\s*nacido/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function extractNif(flatText) {
  // Matches "N.I.F.", "N.I.E." or "D.N.I." (with or without dots) followed by the ID
  const m = flatText.match(/\b(N\.?I\.?F\.?|N\.?I\.?E\.?|D\.?N\.?I\.?)\.?\s*[:.]?\s*([0-9A-Z]{8,10})\b/i);
  if (!m) return null;
  const rawLabel = m[1].replace(/\./g, '').toUpperCase();
  return { type: rawLabel, value: m[2].toUpperCase() };
}

function extractReportDate(flatText) {
  // "al día 10 de agosto de 2026"
  const m = flatText.match(/al d[ií]a\s+(\d{1,2}\s+de\s+[a-zA-Zá-úñ]+\s+de\s+\d{4})/i);
  if (!m) return null;
  return { text: m[1], iso: spanishLongDateToIso(m[1]) };
}

function extractAutonomoAlta(lines) {
  const entries = [];
  for (const line of lines) {
    if (!/^AUT[ÓO]NOMO\b/i.test(line)) continue;
    const m = line.match(/\bALTA\b\s+(\d{1,2}[.\/]\d{1,2}[.\/]\d{4})/i);
    if (m) {
      entries.push({
        regimen: 'AUTONOMO',
        situacion: 'ALTA',
        fechaSituacion: m[1],
        fechaSituacionIso: dotDateToIso(m[1]),
        rawLine: line,
      });
    }
  }
  return { found: entries.length > 0, entries };
}

function extractReferenciasElectronicas(flatText) {
  const m = flatText.match(
    /REFERENCIAS ELECTR[ÓO]NICAS\s+Id\.\s*CEA:\s*Fecha:\s*C[oó]digo\s*CEA:\s*P[aá]gina:\s*([A-Z0-9]+)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+([A-Z0-9\-]+)\s+(\d+)/i
  );
  if (!m) return null;
  return {
    idCea: m[1],
    fecha: m[2],
    fechaIso: dotDateToIso(m[2]),
    codigoCea: m[3],
    pagina: m[4],
  };
}

// ---- Basic sanity checks that this is really a genuine "Informe de
// Situación Laboral / Situación Actual" from the Seguridad Social. ----
function checkTitlePresent(lines) {
  // Look for a line that is (essentially) just "SITUACIÓN ACTUAL", accent-insensitive.
  const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  return lines.some((line) => normalize(line).trim() === 'SITUACION ACTUAL');
}

function checkHeaderLogos(imageBoxes) {
  // The official template has two logos sitting in the top strip of page 1:
  // the "Gobierno de España / Ministerio..." mark on the left and the
  // "Tesorería General de la Seguridad Social" mark on the right.
  // We can't verify pixel content, but we can verify the *structural*
  // signature: at least one raster image anchored near the top of the page.
  const inHeaderBand = imageBoxes.filter((b) => {
    const distanceFromTop = b.pageHeight - b.maxY;
    return distanceFromTop <= b.pageHeight * 0.15; // top 15% of the page
  });
  const left = inHeaderBand.some((b) => b.minX < b.pageWidth * 0.5);
  const right = inHeaderBand.some((b) => b.maxX > b.pageWidth * 0.5);
  return {
    count: inHeaderBand.length,
    leftLogoFound: left,
    rightLogoFound: right,
    found: inHeaderBand.length > 0,
  };
}

function validateDocument(lines, imageBoxesPage1) {
  const titleFound = checkTitlePresent(lines);
  const logos = checkHeaderLogos(imageBoxesPage1);

  const issues = [];
  if (!titleFound) issues.push('Title "SITUACIÓN ACTUAL" not found.');
  if (!logos.found) issues.push('No logo image detected in the header area of page 1.');

  return {
    titleFound,
    logos,
    isValid: titleFound && logos.found,
    issues,
  };
}

// ---- Accept a File/Blob, ArrayBuffer/Uint8Array, or URL string ----
async function resolveSourceToBytes(source) {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (typeof Blob !== 'undefined' && source instanceof Blob) {
    return new Uint8Array(await source.arrayBuffer());
  }
  if (typeof source === 'string') {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Failed to fetch PDF from ${source}: HTTP ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error('Unsupported source: pass a File, Blob, ArrayBuffer, Uint8Array, or URL string.');
}

/**
 * Extracts the key fields from an "Informe de Situación Laboral" PDF.
 *
 * @param {object} pdfjsLib - the pdf.js library object (window.pdfjsLib, or an ESM import)
 * @param {File|Blob|ArrayBuffer|Uint8Array|string} source - the PDF to read
 * @returns {Promise<object>} extraction result (see demo.html for shape)
 */
export async function extractInformeSituacionLaboral(pdfjsLib, source) {
  const data = await resolveSourceToBytes(source);
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const lines = await getLinesForAllPages(pdf);
  const flatText = lines.join(' ').replace(/\s+/g, ' ').trim();

  const page1 = await pdf.getPage(1);
  const imageBoxesPage1 = await getImageBoxesOnPage(page1, pdfjsLib);

  return {
    validation: validateDocument(lines, imageBoxesPage1),
    name: extractName(flatText),
    nif: extractNif(flatText),
    reportDate: extractReportDate(flatText),
    autonomoAlta: extractAutonomoAlta(lines),
    referenciasElectronicas: extractReferenciasElectronicas(flatText),
  };
}

// Exported individually too, in case you want to reuse pieces (e.g. run your
// own text extraction and just call the regex parsers).
export {
  groupItemsIntoLines,
  getLinesForAllPages,
  getImageBoxesOnPage,
  extractName,
  extractNif,
  extractReportDate,
  extractAutonomoAlta,
  extractReferenciasElectronicas,
  checkTitlePresent,
  checkHeaderLogos,
  validateDocument,
};
