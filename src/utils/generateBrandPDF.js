import { jsPDF } from 'jspdf';

/* ─── Constants ─────────────────────────────────────────────────── */
const W   = 210;   // A4 width  (mm)
const H   = 297;   // A4 height (mm)
const ML  = 18;    // left margin
const MR  = 18;    // right margin
const MT  = 18;    // top margin
const MB  = 14;    // bottom margin
const CW  = W - ML - MR;  // content width

/* ─── Color helpers ──────────────────────────────────────────────── */
function rgb(hex) {
  const h = (hex || '#000000').replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function isLight(hex) {
  const { r, g, b } = rgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}
function tc(doc, hex) { const { r, g, b } = rgb(hex); doc.setTextColor(r, g, b); }
function fc(doc, hex) { const { r, g, b } = rgb(hex); doc.setFillColor(r, g, b); }
function dc(doc, hex) { const { r, g, b } = rgb(hex); doc.setDrawColor(r, g, b); }

/* ─── Page header / footer (called after each addPage) ──────────── */
function drawPageChrome(doc, primary, secondary, textOnDark, accentOnDark, candidateName, pageNum) {
  // Top bar — primary colour
  fc(doc, primary);
  doc.rect(0, 0, W, 13, 'F');

  // Top accent stripe — secondary
  fc(doc, secondary);
  doc.rect(0, 0, W, 2.5, 'F');

  // Candidate name left
  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text((candidateName || '').toUpperCase(), ML, 9);

  // "OPERATION 1776" right
  tc(doc, textOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('OPERATION 1776', W - MR, 9, { align: 'right' });

  // Footer line
  dc(doc, '#D1D5DB');
  doc.setLineWidth(0.25);
  doc.line(ML, H - MB, W - MR, H - MB);

  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Operation 1776  ·  Brand Discovery Report  ·  Confidential', ML, H - MB + 4.5);
  doc.text(`${pageNum}`, W - MR, H - MB + 4.5, { align: 'right' });
}

/* ─── Section label with coloured left-bar accent ───────────────── */
function sectionLabel(doc, text, x, y, primaryHex) {
  fc(doc, primaryHex);
  doc.rect(x, y - 3, 2.5, 4.5, 'F');
  tc(doc, primaryHex);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(text, x + 5, y);
}

/* ─── Pill / tag chip ───────────────────────────────────────────── */
function drawTag(doc, text, x, y, bgHex, textHex) {
  const textW = doc.getTextWidth(text);
  const padH = 2.5;
  const padV = 1.8;
  const boxW = textW + padH * 2;
  const boxH = 5;

  fc(doc, bgHex);
  doc.roundedRect(x, y - boxH + padV, boxW, boxH, 1.5, 1.5, 'F');
  tc(doc, textHex);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(text, x + padH, y);

  return boxW + 2.5; // return advance width
}

/* ─── Render a row of tags, wrapping to next line if needed ─────── */
function drawTagRow(doc, items, startX, y, bgHex, textHex, maxW) {
  doc.setFontSize(7);
  let x = startX;
  let curY = y;
  items.forEach((item) => {
    const textW = doc.getTextWidth(item);
    const tagW = textW + 7;
    if (x + tagW > startX + maxW) {
      x = startX;
      curY += 7;
    }
    drawTag(doc, item, x, curY, bgHex, textHex);
    x += tagW;
  });
  return curY + 8;
}

/* ─── Main export ────────────────────────────────────────────────── */
export function generateBrandPDF(state, colors, brandCoreData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const primary     = colors.primary     || '#1C2E5B';
  const secondary   = colors.secondary   || '#B22234';
  const accent      = colors.accent      || '#FFFFFF';
  const bgColor     = colors.background  || '#F5F5F5';
  const textColor   = colors.text        || '#333333';
  const additional  = colors.additional  || accent;
  const textOnDark  = colors.textOnDark  || '#FFFFFF';
  const accentOnDark = colors.accentOnDark || '#FFFFFF';

  const candidate  = state.candidate  || {};
  const profile    = state.profile    || {};
  const headingFont = state.customFonts?.heading || brandCoreData?.fonts?.heading || 'Georgia';
  const bodyFont    = state.customFonts?.body    || brandCoreData?.fonts?.body    || 'Arial';

  const subDir = brandCoreData?.subDirections?.find(s => s.id === state.subDirection) || null;

  /* ════════════════════════════════════════════════════════════════
     COVER PAGE
  ════════════════════════════════════════════════════════════════ */

  // Full-bleed primary background
  fc(doc, primary);
  doc.rect(0, 0, W, H, 'F');

  // Secondary stripe at very top
  fc(doc, secondary);
  doc.rect(0, 0, W, 4, 'F');

  // "OPERATION 1776" — top right
  tc(doc, textOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OPERATION 1776', W - MR, MT + 6, { align: 'right' });

  // Decorative large circle — top left, partially off-page
  const { r: sr, g: sg, b: sb } = rgb(secondary);
  doc.setFillColor(sr, sg, sb);
  doc.setGState(new doc.GState({ opacity: 0.15 }));
  doc.circle(-20, 60, 70, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Decorative small circle — bottom right
  doc.setFillColor(sr, sg, sb);
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.circle(W + 10, H - 50, 55, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // "BRAND DISCOVERY REPORT" label
  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BRAND DISCOVERY REPORT', ML, H * 0.4);

  // Thin accent line below label
  dc(doc, secondary);
  doc.setLineWidth(1);
  doc.line(ML, H * 0.4 + 3, ML + 55, H * 0.4 + 3);

  // Candidate name — very large
  const fullName = (candidate.fullName || 'CANDIDATE NAME').toUpperCase();
  tc(doc, textOnDark);
  doc.setFont('helvetica', 'bold');
  const nameFontSize = fullName.length > 22 ? 28 : fullName.length > 16 ? 34 : 40;
  doc.setFontSize(nameFontSize);
  const nameLines = doc.splitTextToSize(fullName, CW);
  nameLines.forEach((line, i) => {
    doc.text(line, ML, H * 0.4 + 16 + i * (nameFontSize * 0.45));
  });
  const nameBlockEnd = H * 0.4 + 16 + nameLines.length * (nameFontSize * 0.45);

  // Office · State · Year
  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  const officeStr = [candidate.office, candidate.state, candidate.electionYear]
    .filter(Boolean).join('  ·  ');
  doc.text(officeStr, ML, nameBlockEnd + 6);

  // Party affiliation
  if (candidate.partyAffiliation) {
    tc(doc, textOnDark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setGState(new doc.GState({ opacity: 0.7 }));
    doc.text(candidate.partyAffiliation, ML, nameBlockEnd + 14);
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  // Horizontal rule divider
  dc(doc, secondary);
  doc.setLineWidth(0.5);
  doc.line(ML, nameBlockEnd + 20, W - MR, nameBlockEnd + 20);

  // Brand archetype (if set)
  if (brandCoreData) {
    tc(doc, accentOnDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('BRAND ARCHETYPE', ML, nameBlockEnd + 29);

    tc(doc, textOnDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(brandCoreData.name, ML, nameBlockEnd + 39);

    tc(doc, accentOnDark);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(brandCoreData.descriptor || '', ML, nameBlockEnd + 47);
  }

  // Color swatch strip at bottom
  const swatchY = H - 36;
  const swatchColors = [primary, secondary, accent, bgColor, textColor, additional];
  const swatchW = CW / swatchColors.length;
  swatchColors.forEach((hex, i) => {
    fc(doc, hex);
    doc.rect(ML + i * swatchW, swatchY, swatchW - 0.5, 14, 'F');
    // hex label
    const labelColor = isLight(hex) ? '#333333' : '#FFFFFF';
    tc(doc, labelColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(hex.toUpperCase(), ML + i * swatchW + swatchW / 2, swatchY + 9, { align: 'center' });
  });

  // Date at very bottom
  tc(doc, textOnDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setGState(new doc.GState({ opacity: 0.55 }));
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Prepared ${dateStr}  ·  Confidential`, ML, H - 8);
  doc.setGState(new doc.GState({ opacity: 1 }));

  /* ════════════════════════════════════════════════════════════════
     PAGE 2 — CANDIDATE PROFILE
  ════════════════════════════════════════════════════════════════ */
  doc.addPage();
  drawPageChrome(doc, primary, secondary, textOnDark, accentOnDark, candidate.fullName, 2);
  let y = 22;

  // ── Candidate details ──────────────────────────────────────────
  sectionLabel(doc, 'CANDIDATE DETAILS', ML, y, primary);
  y += 8;

  tc(doc, primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(candidate.fullName || '', ML, y);
  y += 7;

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const officeDetail = [candidate.office, candidate.officeCustom].filter(Boolean).join(' — ');
  if (officeDetail) { doc.text(officeDetail, ML, y); y += 5.5; }

  const locationDetail = [
    candidate.state,
    candidate.district ? `District ${candidate.district}` : '',
    candidate.electionYear,
  ].filter(Boolean).join('  ·  ');
  if (locationDetail) { doc.text(locationDetail, ML, y); y += 5.5; }

  const partyDetail = [
    candidate.partyAffiliation,
    candidate.candidateType,
    candidate.raceFocus === 'primary' ? 'Primary Race' : candidate.raceFocus === 'general' ? 'General Election' : '',
  ].filter(Boolean).join('  ·  ');
  if (partyDetail) { doc.text(partyDetail, ML, y); y += 5.5; }

  y += 5;
  dc(doc, '#E5E7EB');
  doc.setLineWidth(0.25);
  doc.line(ML, y, W - MR, y);
  y += 8;

  // ── Professional backgrounds ───────────────────────────────────
  if (profile.backgrounds?.length > 0) {
    sectionLabel(doc, 'PROFESSIONAL BACKGROUND', ML, y, primary);
    y += 7;
    const items = profile.backgrounds
      .map(b => typeof b === 'string' ? b : b?.label || b?.id || '')
      .filter(Boolean);
    const { r: pr, g: pg, b: pb } = rgb(primary);
    const lightBg = `#${Math.round(pr + (255 - pr) * 0.88).toString(16).padStart(2, '0')}${Math.round(pg + (255 - pg) * 0.88).toString(16).padStart(2, '0')}${Math.round(pb + (255 - pb) * 0.88).toString(16).padStart(2, '0')}`;
    y = drawTagRow(doc, items, ML, y, lightBg, primary, CW);
  }

  // ── Policy priorities ──────────────────────────────────────────
  if (profile.policyPriorities?.length > 0) {
    sectionLabel(doc, 'POLICY PRIORITIES', ML, y, primary);
    y += 7;
    const items = profile.policyPriorities
      .map(p => typeof p === 'string' ? p : p?.label || p?.id || '')
      .filter(Boolean);
    const { r: sr2, g: sg2, b: sb2 } = rgb(secondary);
    const lightSec = `#${Math.round(sr2 + (255 - sr2) * 0.88).toString(16).padStart(2, '0')}${Math.round(sg2 + (255 - sg2) * 0.88).toString(16).padStart(2, '0')}${Math.round(sb2 + (255 - sb2) * 0.88).toString(16).padStart(2, '0')}`;
    y = drawTagRow(doc, items, ML, y, lightSec, secondary, CW);
  }

  // ── Defining story ─────────────────────────────────────────────
  if (profile.definingStory) {
    sectionLabel(doc, 'DEFINING STORY', ML, y, primary);
    y += 7;

    // Quote block with left border
    fc(doc, secondary);
    doc.rect(ML, y - 2, 1.5, 999, 'F'); // will clip naturally at content

    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const storyLines = doc.splitTextToSize(`"${profile.definingStory}"`, CW - 8);
    fc(doc, secondary);
    doc.rect(ML, y - 2, 1.5, storyLines.length * 5 + 4, 'F');
    doc.text(storyLines, ML + 6, y);
    y += storyLines.length * 5 + 8;
  }

  // ── Family & Endorsements ──────────────────────────────────────
  const hasFamilyOrEndorsements = profile.familyStatus || profile.endorsements?.length > 0;
  if (hasFamilyOrEndorsements) {
    dc(doc, '#E5E7EB');
    doc.setLineWidth(0.25);
    doc.line(ML, y, W - MR, y);
    y += 8;

    if (profile.familyStatus) {
      sectionLabel(doc, 'FAMILY STATUS', ML, y, primary);
      y += 7;
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(profile.familyStatus, ML, y);
      y += 8;
    }

    if (profile.endorsements?.length > 0) {
      sectionLabel(doc, 'ENDORSEMENTS', ML, y, primary);
      y += 7;
      const endItems = profile.endorsements
        .map(e => typeof e === 'string' ? e : e?.label || e?.id || '')
        .filter(Boolean);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const endLines = doc.splitTextToSize(endItems.join('  ·  '), CW);
      doc.text(endLines, ML, y);
      y += endLines.length * 5 + 5;
    }
  }

  /* ════════════════════════════════════════════════════════════════
     PAGE 3 — BRAND DIRECTION
  ════════════════════════════════════════════════════════════════ */
  doc.addPage();
  drawPageChrome(doc, primary, secondary, textOnDark, accentOnDark, candidate.fullName, 3);
  y = 22;

  if (brandCoreData) {
    // ── Brand archetype block ────────────────────────────────────
    // Full-width colored header block
    fc(doc, primary);
    doc.rect(ML, y, CW, 38, 'F');

    // Small secondary accent stripe at top of block
    fc(doc, secondary);
    doc.rect(ML, y, CW, 2.5, 'F');

    tc(doc, accentOnDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('BRAND ARCHETYPE', ML + 6, y + 10);

    tc(doc, textOnDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(brandCoreData.name, ML + 6, y + 22);

    tc(doc, accentOnDark);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(brandCoreData.descriptor || '', ML + 6, y + 31);

    y += 44;

    // Emotional feel + positioning
    if (brandCoreData.emotionalFeel) {
      sectionLabel(doc, 'EMOTIONAL QUALITY', ML, y, primary);
      y += 7;
      tc(doc, primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(brandCoreData.emotionalFeel, ML, y);
      y += 8;
    }

    if (brandCoreData.philosophy) {
      sectionLabel(doc, 'BRAND PHILOSOPHY', ML, y, primary);
      y += 7;
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const philLines = doc.splitTextToSize(brandCoreData.philosophy, CW);
      doc.text(philLines, ML, y);
      y += philLines.length * 4.8 + 8;
    }

    // ── Sub-direction ────────────────────────────────────────────
    if (subDir) {
      dc(doc, '#E5E7EB');
      doc.setLineWidth(0.25);
      doc.line(ML, y, W - MR, y);
      y += 8;

      sectionLabel(doc, 'SUB-DIRECTION', ML, y, secondary);
      y += 8;

      tc(doc, secondary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(subDir.name, ML, y);
      y += 7;

      if (subDir.desc) {
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(subDir.desc, CW);
        doc.text(descLines, ML, y);
        y += descLines.length * 4.8 + 4;
      }

      if (subDir.visual) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const visualLines = doc.splitTextToSize(`Visual direction: ${subDir.visual}`, CW);
        doc.text(visualLines, ML, y);
        y += visualLines.length * 4.8 + 4;
      }

      if (subDir.bestFor) {
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`Best for: ${subDir.bestFor}`, ML, y);
        y += 8;
      }
    }

    // ── Voice & Tone ─────────────────────────────────────────────
    if (brandCoreData.voiceTone) {
      dc(doc, '#E5E7EB');
      doc.setLineWidth(0.25);
      doc.line(ML, y, W - MR, y);
      y += 8;

      sectionLabel(doc, 'VOICE & TONE', ML, y, primary);
      y += 8;

      const vt = brandCoreData.voiceTone;

      if (vt.headlineStyle) {
        tc(doc, primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Headline style:', ML, y);
        y += 5;
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const hlLines = doc.splitTextToSize(vt.headlineStyle, CW);
        doc.text(hlLines, ML, y);
        y += hlLines.length * 4.8 + 4;
      }

      if (vt.headlineExamples?.length > 0) {
        tc(doc, primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Example headlines:', ML, y);
        y += 5;
        vt.headlineExamples.slice(0, 3).forEach((ex) => {
          // Bullet
          fc(doc, secondary);
          doc.circle(ML + 1, y - 1, 0.8, 'F');
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`"${ex}"`, ML + 4, y);
          y += 5.5;
        });
        y += 2;
      }

      if (vt.ctaLanguage?.length > 0) {
        tc(doc, primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Call-to-action language:', ML, y);
        y += 6;
        const ctas = vt.ctaLanguage.map(c => c.replace('[Name]', candidate.fullName?.split(' ').pop() || 'Us').replace('[State]', candidate.state || 'America').replace('[District]', candidate.district || 'Our District'));
        y = drawTagRow(doc, ctas, ML, y, secondary, '#FFFFFF', CW);
      }
    }
  }

  /* ════════════════════════════════════════════════════════════════
     PAGE 4 — COLOR PALETTE
  ════════════════════════════════════════════════════════════════ */
  doc.addPage();
  drawPageChrome(doc, primary, secondary, textOnDark, accentOnDark, candidate.fullName, 4);
  y = 22;

  sectionLabel(doc, 'BRAND COLOR PALETTE', ML, y, primary);
  y += 10;

  // Sub-palette name if custom
  if (state.colorMode === 'custom' || state.subDirection) {
    const paletteName = state.colorMode === 'theme'
      ? `${brandCoreData?.name || ''} — Recommended Palette`
      : brandCoreData?.subPalettes?.find(p => p.colors.primary === colors.primary)?.name || 'Custom Palette';
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(paletteName, ML, y);
    y += 8;
  }

  const swatchDefs = [
    { label: 'Primary',             hex: colors.primary     || '#1C2E5B', role: 'Headers, hero backgrounds, key brand elements' },
    { label: 'Secondary',           hex: colors.secondary   || '#B22234', role: 'Buttons, highlights, calls to action' },
    { label: 'Tertiary',            hex: colors.accent      || '#FFFFFF', role: 'Third supporting brand color' },
    { label: 'Additional Colour 1', hex: colors.background  || '#F5F5F5', role: 'Page backgrounds, section fills' },
    { label: 'Additional Colour 2', hex: colors.text        || '#333333', role: 'Body text, headings on light backgrounds' },
    { label: 'Additional Colour 3', hex: colors.additional  || accent,    role: 'Extra brand accent or tint' },
  ];

  swatchDefs.forEach((swatch) => {
    const { r: cr, g: cg, b: cb } = rgb(swatch.hex);
    const light = isLight(swatch.hex);
    const labelHex = light ? '#1F2937' : '#FFFFFF';
    const mutedHex = light ? '#6B7280' : 'rgba(255,255,255,0.7)';

    // Main color block
    doc.setFillColor(cr, cg, cb);
    doc.rect(ML, y, CW, 24, 'F');

    // Border for very light colors
    if (light) {
      dc(doc, '#D1D5DB');
      doc.setLineWidth(0.25);
      doc.rect(ML, y, CW, 24, 'S');
    }

    // Label name
    tc(doc, labelHex);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(swatch.label.toUpperCase(), ML + 5, y + 8);

    // Role description
    doc.setTextColor(...(light ? [107, 114, 128] : [255, 255, 255]));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(swatch.role, ML + 5, y + 15);

    // HEX value — right aligned
    tc(doc, labelHex);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(swatch.hex.toUpperCase(), W - MR - 5, y + 9, { align: 'right' });

    // RGB values
    doc.setTextColor(...(light ? [107, 114, 128] : [200, 200, 200]));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`RGB (${cr}, ${cg}, ${cb})`, W - MR - 5, y + 16, { align: 'right' });

    y += 27;
  });

  /* ════════════════════════════════════════════════════════════════
     PAGE 5 — TYPOGRAPHY & LOGO
  ════════════════════════════════════════════════════════════════ */
  doc.addPage();
  drawPageChrome(doc, primary, secondary, textOnDark, accentOnDark, candidate.fullName, 5);
  y = 22;

  // ── Typography ────────────────────────────────────────────────
  sectionLabel(doc, 'TYPOGRAPHY', ML, y, primary);
  y += 10;

  const cardH = 42;
  const cardW = (CW - 5) / 2;

  // Heading font card — primary background
  fc(doc, primary);
  doc.rect(ML, y, cardW, cardH, 'F');
  fc(doc, secondary);
  doc.rect(ML, y, cardW, 2.5, 'F');

  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('HEADING FONT', ML + 4, y + 9);

  tc(doc, textOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(headingFont, ML + 4, y + 21);

  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Aa  Bb  Cc  123', ML + 4, y + 31);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.text('Display & Headlines', ML + 4, y + 39);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Body font card — light background
  const bx = ML + cardW + 5;
  doc.setFillColor(245, 245, 248);
  doc.rect(bx, y, cardW, cardH, 'F');
  dc(doc, '#E5E7EB');
  doc.setLineWidth(0.25);
  doc.rect(bx, y, cardW, cardH, 'S');

  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('BODY FONT', bx + 4, y + 9);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(bodyFont, bx + 4, y + 21);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Aa  Bb  Cc  123', bx + 4, y + 31);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.text('Paragraphs & UI text', bx + 4, y + 39);
  doc.setGState(new doc.GState({ opacity: 1 }));

  y += cardH + 10;

  // Type hierarchy sample
  sectionLabel(doc, 'TYPE HIERARCHY SAMPLE', ML, y, primary);
  y += 9;

  tc(doc, primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(candidate.fullName || 'Candidate Name', ML, y);
  y += 8;

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text(`For ${candidate.office || 'Office'}`, ML, y);
  y += 7;

  doc.setTextColor(130, 130, 130);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const sampleText = `Experienced leadership. Proven results. Ready to serve the people of ${candidate.state || 'our state'} with integrity, purpose, and unwavering commitment.`;
  const sampleLines = doc.splitTextToSize(sampleText, CW);
  doc.text(sampleLines, ML, y);
  y += sampleLines.length * 4.8 + 10;

  dc(doc, '#E5E7EB');
  doc.setLineWidth(0.25);
  doc.line(ML, y, W - MR, y);
  y += 10;

  // ── Logo ──────────────────────────────────────────────────────
  sectionLabel(doc, 'LOGO DIRECTION', ML, y, primary);
  y += 8;

  const logoStatus = state.hasExistingLogo === true
    ? 'Using existing logo'
    : state.hasExistingLogo === false
    ? 'New logo to be designed by Operation 1776'
    : 'To be confirmed';

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(logoStatus, ML, y);
  y += 7;

  if (state.logoType) {
    const logoDisplayNames = {
      emblem: 'Emblem',
      'symbol-text': 'Symbol + Text',
      monogram: 'Monogram',
      wordmark: 'Wordmark',
    };
    const logoDescs = {
      emblem: 'Classic seal or badge design — circular, authoritative, and timeless. Ideal for official-feeling campaigns.',
      'symbol-text': 'An iconic symbol paired with the candidate name. Versatile and modern, great for yard signs and digital.',
      monogram: 'Stylized initials that create a bold, memorable mark. Clean and contemporary with strong brand recall.',
      wordmark: 'Pure typographic treatment of the candidate name. Elegant, direct, and lets the name speak for itself.',
    };

    tc(doc, primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(logoDisplayNames[state.logoType] || state.logoType, ML, y);
    y += 6;

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    const logoDescLines = doc.splitTextToSize(logoDescs[state.logoType] || '', CW);
    doc.text(logoDescLines, ML, y);
    y += logoDescLines.length * 4.8 + 8;
  }

  // ── Next steps block ──────────────────────────────────────────
  y = Math.max(y, H - 80);
  fc(doc, primary);
  doc.rect(ML, y, CW, 40, 'F');
  fc(doc, secondary);
  doc.rect(ML, y, 3, 40, 'F');

  tc(doc, accentOnDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('NEXT STEPS', ML + 7, y + 8);

  tc(doc, textOnDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const nextSteps = [
    '01  Logo delivery — 2 working days',
    '02  Brand kit & guidelines — 3 working days',
    '03  Website content drafting — In progress',
  ];
  nextSteps.forEach((step, i) => {
    doc.text(step, ML + 7, y + 17 + i * 7);
  });

  return doc;
}
