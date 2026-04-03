import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import TiltCard from '../TiltCard';

function ConfettiPiece({ index }) {
  const colors = ['#B22234', '#1C2E5B', '#FFD700', '#CC2029', '#2C4A7C', '#8B1A2B', '#B8860B', '#4CAF50', '#E91E63', '#9C27B0'];
  const style = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2.5 + Math.random() * 2}s`,
    backgroundColor: colors[index % colors.length],
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    transform: `rotate(${Math.random() * 360}deg)`,
  }), [index]);

  return <div className="confetti-piece" style={style} />;
}

function generatePDF(state, brandCore, colors) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;
  let pageNum = 0;

  const hexToRgb = (hex) => {
    const h = (hex || '#000000').replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  const primaryHex = colors.primary || '#1C2E5B';
  const secondaryHex = colors.secondary || '#B22234';
  const accentHex = colors.accent || '#FFD700';
  const primaryRgb = hexToRgb(primaryHex);
  const secondaryRgb = hexToRgb(secondaryHex);
  const accentRgb = hexToRgb(accentHex);

  const isLightColor = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000 > 186;
  };

  const addFooter = () => {
    pageNum++;
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`${state.candidate.fullName || 'Campaign'} Brand Guide`, margin, pageH - 10);
    doc.text(`${pageNum}`, pageW - margin, pageH - 10, { align: 'right' });
    // subtle footer line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
  };

  const newPage = () => {
    doc.addPage();
    y = 30;
    addFooter();
  };

  const addPageIfNeeded = (needed = 30) => {
    if (y + needed > pageH - 25) {
      newPage();
    }
  };

  // Draw a section header bar with primary color background and white text
  const sectionHeader = (title) => {
    addPageIfNeeded(20);
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(margin, y - 6, contentW, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 6, y + 1);
    doc.setFont('helvetica', 'normal');
    y += 14;
  };

  // Draw a sub-section label with left accent bar
  const subSectionLabel = (title) => {
    addPageIfNeeded(14);
    doc.setFillColor(...secondaryRgb);
    doc.rect(margin, y - 5, 3, 8, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 7, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
  };

  // Subtle horizontal divider
  const divider = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  // ============================================================
  // PAGE 1 - COVER
  // ============================================================
  // Full page primary background
  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Decorative top accent bar
  doc.setFillColor(...secondaryRgb);
  doc.rect(0, 0, pageW, 4, 'F');

  // Decorative accent rectangle at top-right corner
  doc.setFillColor(...accentRgb);
  doc.setGlobalAlpha && doc.setGlobalAlpha(0.15);
  doc.rect(pageW - 60, 20, 60, 60, 'F');
  doc.setGlobalAlpha && doc.setGlobalAlpha(1);

  // "BRAND DISCOVERY GUIDE" label
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BRAND DISCOVERY GUIDE', pageW / 2, 75, { align: 'center' });

  // Decorative line under label
  doc.setDrawColor(...secondaryRgb);
  doc.setLineWidth(0.8);
  doc.line(pageW / 2 - 30, 79, pageW / 2 + 30, 79);

  // Candidate name - large
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const candidateName = state.candidate.fullName || 'Campaign Brand Guide';
  const nameLines = doc.splitTextToSize(candidateName, contentW - 10);
  doc.text(nameLines, pageW / 2, 100, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  const nameEndY = 100 + nameLines.length * 14;

  // Office / State / Year
  doc.setFontSize(14);
  const subtitle = [state.candidate.office, state.candidate.state, state.candidate.electionYear].filter(Boolean).join('  |  ');
  if (subtitle) {
    doc.text(subtitle, pageW / 2, nameEndY + 8, { align: 'center' });
  }

  // District if any
  if (state.candidate.district) {
    doc.setFontSize(11);
    doc.text(state.candidate.district, pageW / 2, nameEndY + 20, { align: 'center' });
  }

  // Secondary color decorative divider line
  doc.setFillColor(...secondaryRgb);
  doc.roundedRect(pageW / 2 - 40, nameEndY + 30, 80, 1.5, 0.75, 0.75, 'F');

  // Brand Core name
  if (brandCore) {
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(`Brand Core: ${brandCore.name}`, pageW / 2, nameEndY + 45, { align: 'center' });
  }

  // Date generated
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated ${dateStr}`, pageW / 2, nameEndY + 58, { align: 'center' });

  // Decorative footer area - secondary color bar at bottom
  doc.setFillColor(...secondaryRgb);
  doc.rect(0, pageH - 20, pageW, 20, 'F');

  // Accent stripe above footer
  doc.setFillColor(...accentRgb);
  doc.rect(0, pageH - 22, pageW, 2, 'F');

  // Footer text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Confidential Campaign Material', pageW / 2, pageH - 8, { align: 'center' });

  // ============================================================
  // PAGE 2 - CANDIDATE INFORMATION
  // ============================================================
  newPage();

  sectionHeader('Candidate Information');
  y += 2;

  const candidateRows = [
    ['Full Name', state.candidate.fullName],
    ['Office', state.candidate.office],
    ['State', state.candidate.state],
    ['District', state.candidate.district],
    ['Election Year', state.candidate.electionYear],
    ['Race Focus', state.candidate.raceFocus],
    ['Candidate Type', state.candidate.candidateType],
    ['Party Affiliation', state.candidate.partyAffiliation],
  ];

  const colLabelW = 55;
  let rowIdx = 0;
  candidateRows.forEach(([label, val]) => {
    if (!val) return;
    // Alternating row backgrounds
    if (rowIdx % 2 === 0) {
      doc.setFillColor(245, 245, 245);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, y - 5, contentW, 9, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(String(val), margin + colLabelW, y);
    y += 9;
    rowIdx++;
  });

  // Table border
  if (rowIdx > 0) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(margin, y - 9 * rowIdx - 5, contentW, 9 * rowIdx, 'S');
  }

  // ============================================================
  // BRAND CORE (continues on same page if space)
  // ============================================================
  y += 10;
  addPageIfNeeded(60);

  sectionHeader('Brand Core');
  y += 4;

  if (brandCore) {
    // Brand core name - large
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text(brandCore.name, margin, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    // Descriptor - italic
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(brandCore.descriptor, margin, y);
    y += 8;

    // Tagline - italic, in quotes
    doc.setFontSize(11);
    const taglineLines = doc.splitTextToSize(`"${brandCore.tagline}"`, contentW);
    doc.text(taglineLines, margin, y);
    doc.setFont('helvetica', 'normal');
    y += taglineLines.length * 5 + 6;

    // Divider
    divider();
    y += 2;

    // Positioning
    subSectionLabel('Positioning');
    y += 2;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const posLines = doc.splitTextToSize(brandCore.positioning, contentW - 5);
    doc.text(posLines, margin + 2, y);
    y += posLines.length * 5 + 8;

    // Sub-direction
    if (state.subDirection) {
      const subDir = brandCore.subDirections?.find((s) => s.id === state.subDirection);
      if (subDir) {
        addPageIfNeeded(40);
        divider();
        y += 2;

        subSectionLabel('Sub-Direction');
        y += 2;

        // Light background box for sub-direction
        const descLines = doc.splitTextToSize(subDir.desc, contentW - 16);
        const boxH = 12 + descLines.length * 5;
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, y - 4, contentW, boxH, 3, 3, 'F');
        doc.setDrawColor(200, 210, 225);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y - 4, contentW, boxH, 3, 3, 'S');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(subDir.name, margin + 8, y + 4);
        doc.setFont('helvetica', 'normal');

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(descLines, margin + 8, y + 12);
        y += boxH + 6;
      }
    }
  }

  // ============================================================
  // COLOR PALETTE (continues on same page if space)
  // ============================================================
  y += 10;
  addPageIfNeeded(60);

  sectionHeader('Color Palette');
  y += 2;

  const swatches = [
    { label: 'Primary', hex: colors.primary },
    { label: 'Secondary', hex: colors.secondary },
    { label: 'Accent', hex: colors.accent },
    { label: 'Background', hex: colors.background || '#F5F5F5' },
    { label: 'Text', hex: colors.text || '#333333' },
    { label: 'Highlight', hex: colors.highlight || colors.secondary },
  ].filter((s) => s.hex);

  // Full-width palette bar at the top showing all colors side by side
  const barH = 10;
  const barSegW = contentW / swatches.length;
  swatches.forEach((swatch, i) => {
    const rgb = hexToRgb(swatch.hex);
    doc.setFillColor(...rgb);
    doc.rect(margin + i * barSegW, y, barSegW, barH, 'F');
  });
  // Border around full bar
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, barH, 'S');
  y += barH + 10;

  // Grid of large color swatches - 3 per row
  const swatchW = 40;
  const swatchH = 25;
  const gapX = (contentW - swatchW * 3) / 2;

  swatches.forEach((swatch, i) => {
    const col = i % 3;
    if (col === 0 && i > 0) {
      y += swatchH + 20;
      addPageIfNeeded(swatchH + 20);
    }
    const sx = margin + col * (swatchW + gapX);
    const sy = y;

    const rgb = hexToRgb(swatch.hex);
    doc.setFillColor(...rgb);
    doc.roundedRect(sx, sy, swatchW, swatchH, 2, 2, 'F');

    // Border for light colors
    const needsBorder = swatch.hex && (swatch.hex.toUpperCase() === '#FFFFFF' || swatch.hex.toUpperCase() === '#F5F5F5' || isLightColor(swatch.hex));
    if (needsBorder) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(sx, sy, swatchW, swatchH, 2, 2, 'S');
    }

    // Label below swatch
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(swatch.label, sx + swatchW / 2, sy + swatchH + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    // Hex code below label
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(swatch.hex.toUpperCase(), sx + swatchW / 2, sy + swatchH + 12, { align: 'center' });
  });

  y += swatchH + 22;

  // ============================================================
  // TYPOGRAPHY (continues on same page if space)
  // ============================================================
  if (brandCore?.fonts) {
    y += 10;
    addPageIfNeeded(50);

    sectionHeader('Typography');
    y += 6;

    // Heading font
    const headingMeta = FONT_LIBRARY[brandCore.fonts.heading];
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text(brandCore.fonts.heading, margin, y);
    doc.setFont('helvetica', 'normal');
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text('HEADING FONT', margin, y);
    y += 5;

    if (headingMeta) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Category: ${headingMeta.category}`, margin + 2, y);
      y += 5;
      doc.text(`Personality: ${headingMeta.personality}`, margin + 2, y);
      y += 8;
    }

    // Sample text for heading
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y - 4, contentW, 16, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    doc.text('Sample: The quick brown fox jumps over the lazy dog', margin + 6, y + 4);
    doc.setFont('helvetica', 'normal');
    y += 22;

    divider();
    y += 6;

    // Body font
    const bodyMeta = FONT_LIBRARY[brandCore.fonts.body];
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text(brandCore.fonts.body, margin, y);
    doc.setFont('helvetica', 'normal');
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text('BODY FONT', margin, y);
    y += 5;

    if (bodyMeta) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Category: ${bodyMeta.category}`, margin + 2, y);
      y += 5;
      doc.text(`Personality: ${bodyMeta.personality}`, margin + 2, y);
      y += 8;
    }

    // Sample text for body
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y - 4, contentW, 16, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    doc.text('Sample: The quick brown fox jumps over the lazy dog', margin + 6, y + 4);
    doc.setFont('helvetica', 'normal');
    y += 20;
  }

  // ============================================================
  // CANDIDATE PROFILE (continues on same page if space)
  // ============================================================
  y += 10;
  addPageIfNeeded(50);

  sectionHeader('Candidate Profile');
  y += 4;

  // Professional backgrounds as pill/tag items
  if (state.profile.backgrounds?.length) {
    subSectionLabel('Professional Backgrounds');
    y += 2;

    let pillX = margin;
    const pillH = 8;
    const pillPadX = 5;
    state.profile.backgrounds.forEach((bg) => {
      const textW = doc.getStringUnitWidth(bg) * 9 / doc.internal.scaleFactor + pillPadX * 2;
      if (pillX + textW > pageW - margin) {
        pillX = margin;
        y += pillH + 4;
        addPageIfNeeded(pillH + 8);
      }
      // Pill background
      doc.setFillColor(230, 235, 245);
      doc.roundedRect(pillX, y - 5, textW, pillH, 3, 3, 'F');
      doc.setDrawColor(...primaryRgb);
      doc.setLineWidth(0.3);
      doc.roundedRect(pillX, y - 5, textW, pillH, 3, 3, 'S');

      doc.setFontSize(9);
      doc.setTextColor(...primaryRgb);
      doc.text(bg, pillX + pillPadX, y);
      pillX += textW + 4;
    });
    y += pillH + 8;
  }

  // Policy priorities as bulleted list
  if (state.profile.policyPriorities?.length) {
    addPageIfNeeded(20);
    subSectionLabel('Policy Priorities');
    y += 2;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    state.profile.policyPriorities.forEach((p) => {
      addPageIfNeeded(8);
      // Bullet dot
      doc.setFillColor(...secondaryRgb);
      doc.circle(margin + 4, y - 1.2, 1.2, 'F');
      doc.text(p, margin + 9, y);
      y += 6;
    });
    y += 4;
  }

  // Defining story as paragraph
  if (state.profile.definingStory) {
    addPageIfNeeded(25);
    divider();
    y += 2;
    subSectionLabel('Defining Story');
    y += 2;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const storyLines = doc.splitTextToSize(state.profile.definingStory, contentW - 4);
    storyLines.forEach((line) => {
      addPageIfNeeded(6);
      doc.text(line, margin + 2, y);
      y += 5;
    });
    y += 6;
  }

  // Endorsements
  if (state.profile.endorsements?.length) {
    addPageIfNeeded(20);
    divider();
    y += 2;
    subSectionLabel('Endorsements');
    y += 2;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    state.profile.endorsements.forEach((e) => {
      addPageIfNeeded(6);
      doc.text(`- ${e}`, margin + 4, y);
      y += 6;
    });
    y += 4;
  }

  // ============================================================
  // COLLATERAL PRIORITY MATRIX (continues on same page if space)
  // ============================================================
  y += 10;
  addPageIfNeeded(40);

  sectionHeader('Collateral Priority Matrix');
  y += 4;

  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const prioColors = {
    CRITICAL: { bg: [220, 40, 50], light: [255, 235, 235] },
    HIGH: { bg: [234, 120, 0], light: [255, 243, 230] },
    MEDIUM: { bg: [200, 170, 0], light: [255, 252, 230] },
    LOW: { bg: [150, 150, 150], light: [245, 245, 245] },
  };

  priorities.forEach((prio) => {
    const items = Object.entries(state.collateralPriorities).filter(([, v]) => v === prio);
    if (items.length === 0) return;
    addPageIfNeeded(18 + items.length * 7);

    // Priority header bar with colored background
    const pc = prioColors[prio];
    doc.setFillColor(...pc.bg);
    doc.roundedRect(margin, y - 5, contentW, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${prio}`, margin + 6, y + 1);
    // Item count
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${items.length} item${items.length !== 1 ? 's' : ''}`, pageW - margin - 6, y + 1, { align: 'right' });
    y += 10;

    // Items listed under each priority on light background
    items.forEach(([type], idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(...pc.light);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y - 4, contentW, 7, 'F');

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(type, margin + 8, y);
      y += 7;
    });

    y += 6;
  });

  // ============================================================
  // PAGE 8 - LOGO TYPE (if selected)
  // ============================================================
  if (state.logoType) {
    y += 10;
    addPageIfNeeded(40);

    sectionHeader('Logo Type');
    y += 6;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryRgb);
    doc.text('Selected Logo Type', margin, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    // Display logo type in a styled box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y - 4, contentW, 18, 3, 3, 'F');
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 4, contentW, 18, 3, 3, 'S');

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(String(state.logoType), margin + 8, y + 7);
    y += 24;
  }

  // Save
  const fileName = `${(state.candidate.fullName || 'Campaign').replace(/\s+/g, '_')}_Brand_Guide.pdf`;
  doc.save(fileName);
}

function hexLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function textOnColor(hex) {
  return hexLuminance(hex || '#1C2E5B') > 0.4 ? '#1a1a1a' : '#ffffff';
}

function isLightColor(hex) {
  const h = (hex || '#000000').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}

/* Decorative dot pattern SVG background */
const DotPattern = ({ color = '#1C2E5B', position = 'topRight' }) => {
  const posStyle = position === 'topRight'
    ? { top: 0, right: 0 }
    : { bottom: 0, left: 0 };
  return (
    <svg
      style={{ position: 'absolute', ...posStyle, width: 200, height: 200, opacity: 0.04, pointerEvents: 'none' }}
      viewBox="0 0 200 200"
      fill="none"
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r={2} fill={color} />
        ))
      )}
    </svg>
  );
};

/* Decorative line pattern SVG background */
const LinePattern = ({ color = '#8B1A2B' }) => (
  <svg
    style={{ position: 'absolute', bottom: 0, left: 0, width: 160, height: 160, opacity: 0.03, pointerEvents: 'none' }}
    viewBox="0 0 160 160"
    fill="none"
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={i} x1={0} y1={i * 20 + 10} x2={160} y2={i * 20 + 10} stroke={color} strokeWidth={1} />
    ))}
  </svg>
);

const gradientHeadingStyle = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
};

export default function Stage9_FinalReview() {
  const { state, dispatch, prevStage, goToStage, getActiveColors } = useBrand();
  const brandCore = BRAND_CORES[state.brandCore];
  const colors = getActiveColors();
  const [showConfetti, setShowConfetti] = useState(true);

  const subDir = useMemo(() => {
    if (!brandCore || !state.subDirection) return null;
    return brandCore.subDirections?.find((s) => s.id === state.subDirection);
  }, [brandCore, state.subDirection]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadJSON = useCallback(() => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.candidate.fullName || 'brand').replace(/\s+/g, '_')}_discovery.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleReset = useCallback(() => {
    if (window.confirm('Start a completely new brand discovery? All current data will be lost.')) {
      dispatch({ type: 'RESET' });
      goToStage(0);
    }
  }, [dispatch, goToStage]);

  const collateralByPriority = useMemo(() => {
    const grouped = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
    Object.entries(state.collateralPriorities).forEach(([type, prio]) => {
      if (grouped[prio]) grouped[prio].push(type);
    });
    return grouped;
  }, [state.collateralPriorities]);

  const primaryHex = colors.primary || '#1C2E5B';
  const secondaryHex = colors.secondary || '#B22234';
  const accentHex = colors.accent || '#FFFFFF';
  const bgHex = colors.background || '#F5F5F5';
  const textHex = colors.text || '#333333';
  const highlightHex = colors.highlight || colors.secondary || '#B22234';

  const headingFont = brandCore?.fonts?.heading || 'Georgia';
  const bodyFont = brandCore?.fonts?.body || 'system-ui';
  const headingMeta = FONT_LIBRARY[brandCore?.fonts?.heading];
  const bodyMeta = FONT_LIBRARY[brandCore?.fonts?.body];

  const prioConfig = {
    CRITICAL: { color: '#b22234', bg: '#fef2f2', border: '#fecaca', label: 'Must have on day one' },
    HIGH: { color: '#ea7800', bg: '#fff7ed', border: '#fed7aa', label: 'Need before launch ramp-up' },
    MEDIUM: { color: '#a16207', bg: '#fefce8', border: '#fde68a', label: 'Build as capacity allows' },
    LOW: { color: '#737373', bg: '#f5f5f5', border: '#e5e5e5', label: 'Nice to have down the road' },
  };

  const candidateFields = [
    { label: 'Office', value: state.candidate.office },
    { label: 'State', value: state.candidate.state },
    { label: 'District', value: state.candidate.district },
    { label: 'Year', value: state.candidate.electionYear },
    { label: 'Type', value: state.candidate.candidateType },
    { label: 'Party', value: state.candidate.partyAffiliation },
  ].filter((f) => f.value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative overflow-hidden"
      style={{ fontFamily: bodyFont }}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <style>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          opacity: 0;
          animation: confettiFall linear forwards;
        }
        @keyframes confettiFall {
          0% { opacity: 1; top: -10px; transform: rotate(0deg) translateX(0px); }
          25% { opacity: 1; transform: rotate(180deg) translateX(30px); }
          50% { opacity: 0.9; transform: rotate(360deg) translateX(-20px); }
          75% { opacity: 0.6; transform: rotate(540deg) translateX(15px); }
          100% { opacity: 0; top: 100vh; transform: rotate(720deg) translateX(-10px); }
        }
      `}</style>

      {/* ================================================================ */}
      {/* HERO - Full-width brand-colored banner                           */}
      {/* ================================================================ */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryHex} 0%, ${primaryHex}ee 60%, ${secondaryHex} 100%)` }}
      >
        {/* Decorative SVG pattern on hero */}
        <svg
          style={{ position: 'absolute', top: 20, right: 20, width: 250, height: 250, opacity: 0.05, pointerEvents: 'none' }}
          viewBox="0 0 250 250"
          fill="none"
        >
          {Array.from({ length: 12 }).map((_, row) =>
            Array.from({ length: 12 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r={2.5} fill="#ffffff" />
            ))
          )}
        </svg>

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-10 md:pt-10 md:pb-14 relative z-10">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={prevStage}
            className="no-print flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium mb-10 transition-colors"
            style={{ color: `${textOnColor(primaryHex)}99`, background: `${textOnColor(primaryHex)}0d` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${textOnColor(primaryHex)}1a`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${textOnColor(primaryHex)}0d`; }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </motion.button>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: `${textOnColor(primaryHex)}80` }}
          >
            Brand Discovery Complete
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
            style={{ color: textOnColor(primaryHex), fontFamily: headingFont }}
          >
            {state.candidate.fullName || 'Your Campaign'}
          </motion.h1>

          {candidateFields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-5"
              style={{ color: `${textOnColor(primaryHex)}99` }}
            >
              {candidateFields.map((f, i) => (
                <span key={f.label} className="text-sm">
                  {i > 0 && <span className="mr-4" style={{ opacity: 0.3 }}>/</span>}
                  <span style={{ opacity: 0.5 }}>{f.label}</span>{' '}
                  <span className="font-medium" style={{ opacity: 0.85 }}>{f.value}</span>
                </span>
              ))}
            </motion.div>
          )}
        </div>

        {/* Decorative accent bar at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: secondaryHex }} />
      </div>

      {/* ================================================================ */}
      {/* BRAND CORE - Prominent full-width section with 40px container    */}
      {/* ================================================================ */}
      {brandCore && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
          style={{ backgroundColor: bgHex }}
        >
          <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
            <TiltCard style={{ borderRadius: 24, background: 'white', padding: 24, position: 'relative', overflow: 'hidden' }}>
              <DotPattern />
              <LinePattern />

              <div className="max-w-3xl">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ color: secondaryHex, opacity: 0.7 }}
                >
                  Brand Core
                </p>

                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                  style={{ ...gradientHeadingStyle, fontFamily: headingFont }}
                >
                  {brandCore.name}
                </h2>

                <p className="text-base mb-6" style={{ color: textHex, opacity: 0.6 }}>
                  {brandCore.descriptor}
                </p>

                <blockquote
                  className="text-xl md:text-2xl font-medium italic mb-8 pl-5"
                  style={{
                    color: primaryHex,
                    borderLeft: `3px solid ${secondaryHex}`,
                    fontFamily: headingFont,
                  }}
                >
                  &ldquo;{brandCore.tagline}&rdquo;
                </blockquote>

                <p className="text-base leading-relaxed" style={{ color: textHex, opacity: 0.6 }}>
                  {brandCore.positioning}
                </p>

                {subDir && (
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    className="mt-10 rounded-xl p-6 transition-all duration-300"
                    style={{
                      backgroundColor: `${primaryHex}0a`,
                      border: `1px solid ${primaryHex}18`,
                      boxShadow: '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1)',
                    }}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: textHex, opacity: 0.7 }}>
                      Sub-Direction
                    </p>
                    <p className="text-lg font-semibold mb-1" style={{ color: textHex, fontFamily: headingFont }}>
                      {subDir.name}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: textHex, opacity: 0.6 }}>
                      {subDir.desc}
                    </p>
                  </motion.div>
                )}
              </div>
            </TiltCard>
          </div>
        </motion.section>
      )}

      {/* ================================================================ */}
      {/* COLOR PALETTE - Full-width strip with large swatches             */}
      {/* ================================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white"
      >
        <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
          <TiltCard style={{ borderRadius: 24, background: 'white', padding: 24, position: 'relative', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <DotPattern />

            <h3 style={{ ...gradientHeadingStyle, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              Color Palette
            </h3>

            {/* Large swatch strip */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-4">
              {[
                { label: 'Primary', hex: primaryHex },
                { label: 'Secondary', hex: secondaryHex },
                { label: 'Accent', hex: accentHex },
                { label: 'Background', hex: bgHex },
                { label: 'Text', hex: textHex },
                { label: 'Highlight', hex: highlightHex },
              ].map((swatch) => (
                <motion.div
                  key={swatch.label}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                  className="transition-all duration-300"
                >
                  <div
                    className="aspect-[4/3] rounded-xl shadow-sm"
                    style={{ backgroundColor: swatch.hex, border: isLightColor(swatch.hex) ? '2px solid #e0e0e0' : '1px solid rgba(0,0,0,0.05)' }}
                  />
                  <p className="mt-2.5 text-sm font-semibold" style={{ color: '#1a1a1a', opacity: 0.85 }}>{swatch.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#1a1a1a', opacity: 0.6 }}>{swatch.hex}</p>
                </motion.div>
              ))}
            </div>

            {/* Continuous palette bar */}
            <div className="h-3 rounded-full overflow-hidden flex mt-8 shadow-inner">
              <div className="flex-[3]" style={{ backgroundColor: primaryHex }} />
              <div className="flex-[2]" style={{ backgroundColor: secondaryHex }} />
              <div className="flex-[2]" style={{ backgroundColor: accentHex }} />
              <div className="flex-[1] border-y border-black/5" style={{ backgroundColor: bgHex }} />
              <div className="flex-[2]" style={{ backgroundColor: textHex }} />
              <div className="flex-[2]" style={{ backgroundColor: highlightHex }} />
            </div>
          </TiltCard>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* TYPOGRAPHY - Font specimens                                      */}
      {/* ================================================================ */}
      {brandCore?.fonts && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: `${bgHex}` }}
        >
          <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
            <TiltCard style={{ borderRadius: 24, background: 'white', padding: 24, position: 'relative', overflow: 'hidden' }}>
              <DotPattern position="bottomLeft" />
              <LinePattern />

              <h3 style={{ ...gradientHeadingStyle, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                Typography
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                {/* Heading font */}
                <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                  <p className="text-xs font-medium mb-3" style={{ color: '#1a1a1a', opacity: 0.6 }}>Heading / Display</p>
                  <p
                    className="text-4xl md:text-5xl font-bold leading-tight mb-3"
                    style={{ fontFamily: headingFont, color: primaryHex }}
                  >
                    Aa Bb Cc
                  </p>
                  <p
                    className="text-lg font-semibold mb-1"
                    style={{ fontFamily: headingFont, color: textHex }}
                  >
                    {brandCore.fonts.heading}
                  </p>
                  {headingMeta && (
                    <p className="text-sm" style={{ color: '#1a1a1a', opacity: 0.6 }}>
                      {headingMeta.category} &middot; {headingMeta.personality}
                    </p>
                  )}
                  <p
                    className="mt-4 text-2xl leading-snug"
                    style={{ fontFamily: headingFont, color: `${textHex}bb` }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                </motion.div>

                {/* Body font */}
                <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                  <p className="text-xs font-medium mb-3" style={{ color: '#1a1a1a', opacity: 0.6 }}>Body / Running Text</p>
                  <p
                    className="text-4xl md:text-5xl font-normal leading-tight mb-3"
                    style={{ fontFamily: bodyFont, color: primaryHex }}
                  >
                    Aa Bb Cc
                  </p>
                  <p
                    className="text-lg font-semibold mb-1"
                    style={{ fontFamily: bodyFont, color: textHex }}
                  >
                    {brandCore.fonts.body}
                  </p>
                  {bodyMeta && (
                    <p className="text-sm" style={{ color: '#1a1a1a', opacity: 0.6 }}>
                      {bodyMeta.category} &middot; {bodyMeta.personality}
                    </p>
                  )}
                  <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ fontFamily: bodyFont, color: `${textHex}bb` }}
                  >
                    A strong campaign brand speaks with clarity and conviction. Every typeface, color,
                    and word should reinforce the candidate&apos;s core promise to voters.
                  </p>
                </motion.div>
              </div>
            </TiltCard>
          </div>
        </motion.section>
      )}

      {/* ================================================================ */}
      {/* PROFILE - Compact metadata                                       */}
      {/* ================================================================ */}
      {(state.profile.backgrounds?.length > 0 || state.profile.policyPriorities?.length > 0 || state.profile.definingStory) && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white"
        >
          <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
            <TiltCard style={{ borderRadius: 24, background: 'white', padding: 24, position: 'relative', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
              <DotPattern />
              <LinePattern />

              <h3 style={{ ...gradientHeadingStyle, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Candidate Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {state.profile.backgrounds?.length > 0 && (
                  <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                    <p className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a', opacity: 0.7 }}>Background</p>
                    <div className="flex flex-wrap gap-2">
                      {state.profile.backgrounds.map((b) => (
                        <span
                          key={b}
                          className="px-3 py-1.5 text-xs font-medium rounded-full"
                          style={{ backgroundColor: `${primaryHex}0f`, color: primaryHex }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {state.profile.policyPriorities?.length > 0 && (
                  <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                    <p className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a', opacity: 0.7 }}>Policy Priorities</p>
                    <ul className="space-y-1.5">
                      {state.profile.policyPriorities.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm" style={{ color: '#1a1a1a', opacity: 0.6 }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: secondaryHex }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {state.profile.definingStory && (
                  <motion.div whileHover={{ scale: 1.02 }} className="transition-all duration-300">
                    <p className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a', opacity: 0.7 }}>Defining Story</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#1a1a1a', opacity: 0.6 }}>{state.profile.definingStory}</p>
                  </motion.div>
                )}
              </div>
            </TiltCard>
          </div>
        </motion.section>
      )}

      {/* ================================================================ */}
      {/* COLLATERAL MATRIX - Priority sheet                               */}
      {/* ================================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: bgHex }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6 md:py-8">
          <TiltCard style={{ borderRadius: 24, background: 'white', padding: 24, position: 'relative', overflow: 'hidden' }}>
            <DotPattern />
            <LinePattern />

            <h3 style={{ ...gradientHeadingStyle, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
              Collateral Priority Matrix
            </h3>

            {Object.keys(state.collateralPriorities).length === 0 ? (
              <p className="text-sm italic" style={{ color: '#1a1a1a', opacity: 0.6 }}>No priorities set</p>
            ) : (
              <div className="space-y-6">
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((prio) => {
                  const items = collateralByPriority[prio] || [];
                  if (items.length === 0) return null;
                  const cfg = prioConfig[prio];
                  const isHighPriority = prio === 'CRITICAL' || prio === 'HIGH';
                  return (
                    <motion.div
                      key={prio}
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                      className="rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        border: `1px solid ${cfg.border}`,
                        ...(isHighPriority ? { boxShadow: '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1)' } : {}),
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-5 py-3"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <span className="text-sm font-bold" style={{ color: cfg.color }}>
                            {prio}
                          </span>
                          <span className="text-xs hidden sm:inline" style={{ color: '#1a1a1a', opacity: 0.6 }}>{cfg.label}</span>
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#1a1a1a', opacity: 0.6 }}>
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="bg-white px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          {items.map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 border border-gray-100"
                              style={{ color: '#1a1a1a', opacity: 0.7 }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TiltCard>
        </div>
      </motion.section>

      {/* ================================================================ */}
      {/* EXPORT - Premium CTA                                             */}
      {/* ================================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="no-print relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${primaryHex} 0%, ${primaryHex}dd 50%, ${secondaryHex}cc 100%)`,
        }}
      >
        {/* Decorative SVG pattern on export section */}
        <svg
          style={{ position: 'absolute', bottom: 10, right: 10, width: 200, height: 200, opacity: 0.04, pointerEvents: 'none' }}
          viewBox="0 0 200 200"
          fill="none"
        >
          {Array.from({ length: 10 }).map((_, row) =>
            Array.from({ length: 10 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r={2} fill="#ffffff" />
            ))
          )}
        </svg>
        <svg
          style={{ position: 'absolute', top: 10, left: 10, width: 160, height: 160, opacity: 0.03, pointerEvents: 'none' }}
          viewBox="0 0 160 160"
          fill="none"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={0} y1={i * 20 + 10} x2={160} y2={i * 20 + 10} stroke="#ffffff" strokeWidth={1} />
          ))}
        </svg>

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: textOnColor(primaryHex), fontFamily: headingFont }}
            >
              Take your brand with you
            </h2>
            <p
              className="text-sm mb-10 leading-relaxed"
              style={{ color: textOnColor(primaryHex), opacity: 0.6 }}
            >
              Download a ready-to-share brand guide, or export the raw data for your design team.
            </p>

            {/* Primary CTA */}
            <motion.button
              whileHover={{ y: -2, scale: 1.02, boxShadow: '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1), 0 25px 50px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generatePDF(state, brandCore, colors)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold shadow-xl transition-shadow hover:shadow-2xl mb-8"
              style={{
                backgroundColor: '#ffffff',
                color: primaryHex,
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download Brand Guide (PDF)
            </motion.button>

            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <button
                onClick={() => window.print()}
                className="text-sm font-medium underline underline-offset-2 decoration-1 transition-opacity hover:opacity-100"
                style={{ color: textOnColor(primaryHex), opacity: 0.6, textDecorationColor: `${textOnColor(primaryHex)}40` }}
              >
                Print this page
              </button>

              <span style={{ color: `${textOnColor(primaryHex)}30` }}>&middot;</span>

              <button
                onClick={handleDownloadJSON}
                className="text-sm font-medium underline underline-offset-2 decoration-1 transition-opacity hover:opacity-100"
                style={{ color: textOnColor(primaryHex), opacity: 0.6, textDecorationColor: `${textOnColor(primaryHex)}40` }}
              >
                Export as JSON
              </button>

              <span style={{ color: `${textOnColor(primaryHex)}30` }}>&middot;</span>

              <button
                onClick={handleReset}
                className="text-sm font-medium underline underline-offset-2 decoration-1 transition-opacity hover:opacity-100"
                style={{ color: textOnColor(primaryHex), opacity: 0.5, textDecorationColor: `${textOnColor(primaryHex)}30` }}
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
