// api/generate-docx.js
// Focusynthesis® — Rapport naar .docx convertor
// Deploy to Vercel alongside api/analyse.js

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat
} = require('docx');

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const BRAND_DARK = "1A1A2E"; const BRAND_GOLD = "B8860B";
const EARTH_BG = "EAF3DE"; const EARTH_TXT = "3B6D11";
const FIRE_BG  = "FAECE7"; const FIRE_TXT  = "993C1D";
const WATER_BG = "E6F1FB"; const WATER_TXT = "185FA5";
const AIR_BG   = "EEEDFE"; const AIR_TXT   = "534AB7";
const SELF_BG  = "FAEEDA"; const SELF_TXT  = "854F0B";
const INTAKE_BG = "FFF8E1"; const INTAKE_TXT = "5D4037";
const SHADOW_BG = "FCEBEB"; const SHADOW_TXT = "A32D2D";
const OK_TXT   = "3B6D11"; const WARN_TXT  = "BA7517"; const GAP_TXT = "A32D2D";
const LIGHT_GRAY = "F5F5F5"; const MID_GRAY = "CCCCCC"; const DARK_GRAY = "555555";

const border   = { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY };
const noBorders = {
  top:    { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right:  { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
};

// ─── DOCX HELPERS ─────────────────────────────────────────────────────────────
const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_GOLD, space: 4 } },
  children: [new TextRun({ text: t, font: "Arial", size: 34, bold: true, color: BRAND_DARK })]
});

const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 },
  children: [new TextRun({ text: t, font: "Arial", size: 24, bold: true, color: BRAND_DARK })]
});

const h3 = t => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 },
  children: [new TextRun({ text: t, font: "Arial", size: 22, bold: true, color: DARK_GRAY })]
});

const body = (t, opts = {}) => new Paragraph({
  spacing: { before: 60, after: 100 },
  children: [new TextRun({ text: t, font: "Arial", size: 22, color: opts.color || "333333", italic: opts.italic || false, bold: opts.bold || false })]
});

const spacer = (sz = 100) => new Paragraph({ spacing: { before: 0, after: sz }, children: [new TextRun("")] });

const bullet = t => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 40, after: 50 },
  children: [new TextRun({ text: t, font: "Arial", size: 22, color: "333333" })]
});

const quote = t => new Paragraph({
  spacing: { before: 100, after: 100 }, indent: { left: 600 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: BRAND_GOLD, space: 8 } },
  children: [new TextRun({ text: `\u201C${t}\u201D`, font: "Arial", size: 22, italic: true, color: "555555" })]
});

const badge = (t, bg, txt) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    borders: noBorders, shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    width: { size: 9360, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 20, bold: true, color: txt })] })]
  })]})],
});

const intakeRow = t => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [200, 9160],
  rows: [new TableRow({ children: [
    new TableCell({ borders: noBorders, shading: { fill: INTAKE_BG, type: ShadingType.CLEAR }, width: { size: 200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 80, right: 80 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u25BC", font: "Arial", size: 18, bold: true, color: INTAKE_TXT })] })] }),
    new TableCell({ borders: noBorders, shading: { fill: INTAKE_BG, type: ShadingType.CLEAR }, width: { size: 9160, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 160 },
      children: [new Paragraph({ children: [new TextRun({ text: "Intake: ", font: "Arial", size: 20, bold: true, color: INTAKE_TXT }), new TextRun({ text: t, font: "Arial", size: 20, italic: true, color: INTAKE_TXT })] })] })
  ]})]
});

const elRow = (icon, label, bg, txt, desc) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [600, 8760],
  rows: [new TableRow({ children: [
    new TableCell({ borders: noBorders, shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 600, type: WidthType.DXA },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: icon, font: "Arial", size: 22, bold: true, color: txt })] })] }),
    new TableCell({ borders: noBorders, margins: { top: 80, bottom: 80, left: 200, right: 120 }, width: { size: 8760, type: WidthType.DXA },
      children: [
        new Paragraph({ spacing: { before: 0, after: 30 }, children: [new TextRun({ text: label, font: "Arial", size: 22, bold: true, color: "1A1A2E" })] }),
        new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: desc, font: "Arial", size: 20, color: "444444" })] })
      ] })
  ]})]
});

const conformRow = (mark, label, desc) => {
  const dotColor = mark === "\u2713" ? OK_TXT : mark === "\u26A0\uFE0F" ? WARN_TXT : GAP_TXT;
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [300, 2800, 6260],
    rows: [new TableRow({ children: [
      new TableCell({ borders: noBorders, margins: { top: 80, bottom: 80, left: 80, right: 80 }, width: { size: 300, type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: mark, font: "Arial", size: 20, color: dotColor, bold: true })] })] }),
      new TableCell({ borders: noBorders, margins: { top: 80, bottom: 80, left: 80, right: 80 }, width: { size: 2800, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 20, bold: true, color: "1A1A2E" })] })] }),
      new TableCell({ borders: noBorders, margins: { top: 80, bottom: 80, left: 80, right: 80 }, width: { size: 6260, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: desc, font: "Arial", size: 20, color: "444444" })] })] })
    ]})]
  });
};

const oppCard = (title, bodyText) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [120, 9240],
  rows: [new TableRow({ children: [
    new TableCell({ borders: { ...noBorders, left: { style: BorderStyle.SINGLE, size: 12, color: BRAND_GOLD, space: 0 } },
      shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: 120, type: WidthType.DXA }, margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({ children: [new TextRun("")] })] }),
    new TableCell({ borders: noBorders, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, width: { size: 9240, type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing: { before: 0, after: 50 }, children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: "1A1A2E" })] }),
        new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: bodyText, font: "Arial", size: 20, color: "444444" })] })
      ] })
  ]})]
});

// ─── ELEMENT DETECTION ────────────────────────────────────────────────────────
const EL_MAP = {
  'earth': { bg: EARTH_BG, txt: EARTH_TXT, icon: 'E' },
  'air':   { bg: AIR_BG,   txt: AIR_TXT,   icon: 'A' },
  'water': { bg: WATER_BG, txt: WATER_TXT, icon: 'W' },
  'fire':  { bg: FIRE_BG,  txt: FIRE_TXT,  icon: 'F' },
  'kinetic self': { bg: SELF_BG, txt: SELF_TXT, icon: 'KS' },
  'ks':    { bg: SELF_BG,  txt: SELF_TXT,  icon: 'KS' },
};

function detectElement(line) {
  const lower = line.toLowerCase();
  for (const [key, val] of Object.entries(EL_MAP)) {
    if (lower.startsWith('- ' + key) || lower.startsWith('• ' + key) || lower.startsWith(key + ' —') || lower.startsWith(key + ' -')) {
      return val;
    }
  }
  return null;
}

function parseElementLine(line) {
  // Pattern: - Earth — label — description
  const m = line.replace(/^[-•]\s*/, '').match(/^(.+?)\s*[—\-]{1,2}\s*(.+?)\s*[—\-]{1,2}\s*(.+)$/);
  if (m) return { element: m[1].trim(), label: m[2].trim(), desc: m[3].trim() };
  // Fallback: - Earth — rest
  const m2 = line.replace(/^[-•]\s*/, '').match(/^(.+?)\s*[—\-]{1,2}\s*(.+)$/);
  if (m2) return { element: m2[1].trim(), label: '', desc: m2[2].trim() };
  return null;
}

// ─── REPORT PARSER → DOCX ELEMENTS ───────────────────────────────────────────
function parseReport(report) {
  const lines = report.split('\n');
  const elements = [];
  let i = 0;
  let currentOpp = null;

  const flushOpp = () => {
    if (currentOpp) {
      elements.push(oppCard(currentOpp.title, currentOpp.body));
      elements.push(spacer(60));
      currentOpp = null;
    }
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    i++;

    if (!line) {
      if (currentOpp) currentOpp.body += ' ';
      continue;
    }

    // ── SECTION HEADINGS ──────────────────────────────────────────────────────
    if (line.match(/^###\s+SECTION\s+\d+:/i) || line.match(/^###\s+Sessie Analyse/i)) {
      flushOpp();
      elements.push(h1(line.replace(/^###\s+/, '')));
      continue;
    }
    if (line.match(/^###\s+/)) {
      flushOpp();
      elements.push(h2(line.replace(/^###\s+/, '')));
      continue;
    }
    if (line.match(/^##\s+/)) {
      flushOpp();
      elements.push(h2(line.replace(/^##\s+/, '')));
      continue;
    }

    // ── BADGE: **[text]** ─────────────────────────────────────────────────────
    const badgeM = line.match(/^\*\*\[(.+)\]\*\*$/);
    if (badgeM) {
      flushOpp();
      const txt = badgeM[1];
      // determine colour from content keywords
      let bg = SELF_BG, tc = SELF_TXT;
      const lower = txt.toLowerCase();
      if (lower.includes('drift') || lower.includes('freeze') || lower.includes('smolder') || lower.includes('drought') || lower.includes('grindstone') || lower.includes('firestorm') || lower.includes('mist') || lower.includes('mud') || lower.includes('absolute zero') || lower.includes('inertia')) { bg = SHADOW_BG; tc = SHADOW_TXT; }
      else if (lower.includes('earth')) { bg = EARTH_BG; tc = EARTH_TXT; }
      else if (lower.includes('air')) { bg = AIR_BG; tc = AIR_TXT; }
      else if (lower.includes('water')) { bg = WATER_BG; tc = WATER_TXT; }
      else if (lower.includes('fire')) { bg = FIRE_BG; tc = FIRE_TXT; }
      elements.push(badge(txt, bg, tc));
      elements.push(spacer(80));
      continue;
    }

    // ── INTAKE CALLOUT: ▼ Intake: *text* ─────────────────────────────────────
    const intakeM = line.match(/^▼\s*Intake:\s*\*(.+)\*$/);
    if (intakeM) {
      flushOpp();
      elements.push(intakeRow(intakeM[1]));
      elements.push(spacer(40));
      continue;
    }

    // ── CONFORM ROW: ✓ / ⚠️ / ■ — **label** — desc ───────────────────────────
    const conformM = line.match(/^(✓|⚠️|■)\s+—\s+\*\*(.+?)\*\*\s+—\s+(.+)$/);
    if (conformM) {
      flushOpp();
      elements.push(conformRow(conformM[1], conformM[2], conformM[3]));
      elements.push(spacer(30));
      continue;
    }

    // ── DEVELOPMENT DIRECTION: **Richting N — Title** ────────────────────────
    const richtingM = line.match(/^\*\*Richting\s+\d+\s+[—\-]\s+(.+)\*\*$/);
    if (richtingM) {
      flushOpp();
      currentOpp = { title: line.replace(/\*\*/g, ''), body: '' };
      continue;
    }

    // If we're building an opp card body, append text to it
    if (currentOpp && !line.startsWith('**') && !line.startsWith('###') && !line.startsWith('##')) {
      const cleaned = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
      currentOpp.body += (currentOpp.body ? ' ' : '') + cleaned;
      continue;
    }

    // ── ELEMENT ROW: - Earth — label — desc ──────────────────────────────────
    if ((line.startsWith('- ') || line.startsWith('• ')) && detectElement(line)) {
      flushOpp();
      const el = detectElement(line);
      const parsed = parseElementLine(line);
      if (parsed && el) {
        const label = parsed.label ? `${parsed.element} — ${parsed.label}` : parsed.element;
        elements.push(elRow(el.icon, label, el.bg, el.txt, parsed.desc));
        elements.push(spacer(50));
      }
      continue;
    }

    // ── BLOCKQUOTE: > text ────────────────────────────────────────────────────
    if (line.startsWith('>')) {
      flushOpp();
      elements.push(quote(line.replace(/^>\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')));
      continue;
    }

    // ── BULLET LIST: - item ───────────────────────────────────────────────────
    if ((line.startsWith('- ') || line.startsWith('• ')) && !detectElement(line)) {
      flushOpp();
      const t = line.replace(/^[-•]\s*/, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
      elements.push(bullet(t));
      continue;
    }

    // ── BOLD SUB-HEADING (not badge, not richting): **text** ─────────────────
    if (line.match(/^\*\*.+\*\*$/) && !line.match(/^\*\*\[/) && !line.match(/^\*\*Richting/)) {
      flushOpp();
      elements.push(h3(line.replace(/\*\*/g, '')));
      continue;
    }

    // ── HORIZONTAL RULE ───────────────────────────────────────────────────────
    if (line.match(/^---+$/)) {
      flushOpp();
      continue;
    }

    // ── PLAIN PARAGRAPH ───────────────────────────────────────────────────────
    if (line) {
      flushOpp();
      const t = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
      elements.push(body(t));
    }
  }

  flushOpp();
  return elements;
}

// ─── DOCUMENT BUILDER ─────────────────────────────────────────────────────────
function buildDocument(report, meta) {
  const { client, coach, sessionNum, date } = meta;

  const titleLine = [client, sessionNum ? `Sessie #${sessionNum}` : ''].filter(Boolean).join(' — ');
  const subLine   = [date, coach ? `Coach: ${coach}` : ''].filter(Boolean).join(' — ');

  const reportElements = parseReport(report);

  return new Document({
    numbering: { config: [{ reference: "bullets", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 600, hanging: 300 } } } }
    ]}]},
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 34, bold: true, font: "Arial", color: BRAND_DARK },
          paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: BRAND_DARK },
          paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: DARK_GRAY },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // Title block
        new Paragraph({ spacing: { before: 0, after: 80 }, children: [
          new TextRun({ text: "Focusynthesis\u00AE \u2014 Sessie Analyse", font: "Arial", size: 42, bold: true, color: BRAND_DARK })
        ]}),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [
          new TextRun({ text: titleLine, font: "Arial", size: 24, color: "555555" })
        ]}),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [
          new TextRun({ text: subLine, font: "Arial", size: 22, color: "777777", italic: true })
        ]}),
        new Paragraph({
          spacing: { before: 80, after: 400 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_GOLD, space: 4 } },
          children: [new TextRun({ text: "Intern document \u2014 Proprietary IP Focusynthesis\u00AE", font: "Arial", size: 18, color: "999999", italic: true })]
        }),
        spacer(80),

        // Report body
        ...reportElements,

        // Colofon
        spacer(160),
        new Paragraph({
          spacing: { before: 0, after: 80 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY, space: 4 } },
          children: [new TextRun({ text: "Focus Academy Global \u2014 Focusynthesis\u00AE \u2014 Proprietary & Confidential", font: "Arial", size: 18, color: "999999", italic: true })]
        }),
      ]
    }]
  });
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { report, client, coach, sessionNum, date } = req.body || {};

  if (!report || report.trim().length < 100) {
    return res.status(400).json({ error: 'Rapport ontbreekt of is te kort.' });
  }

  try {
    const doc = buildDocument(report, { client, coach, sessionNum, date });
    const buffer = await Packer.toBuffer(doc);

    const filename = [
      'focusynthesis_rapport',
      client ? client.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '',
      sessionNum ? `sessie_${sessionNum}` : '',
      date ? date.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '',
    ].filter(Boolean).join('_') + '.docx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);

  } catch (err) {
    console.error('generate-docx error:', err);
    return res.status(500).json({ error: err.message || 'Fout bij het genereren van het document.' });
  }
};
