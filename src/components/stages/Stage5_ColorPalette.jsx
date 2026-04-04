import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';

const PRESET_PALETTES = [
  {
    id: 'classic-patriot',
    name: 'Classic Patriot',
    colors: { primary: '#1B2A4A', secondary: '#BF0A30', accent: '#E8E4DD', background: '#F7F5F0', text: '#1B2A4A', highlight: '#996B00' },
  },
  {
    id: 'modern-navy',
    name: 'Modern Navy',
    colors: { primary: '#0F1D33', secondary: '#D42B3C', accent: '#C8C3B8', background: '#F0F1F3', text: '#1A1E2A', highlight: '#2563EB' },
  },
  {
    id: 'bold-crimson',
    name: 'Bold Crimson',
    colors: { primary: '#8B1A2B', secondary: '#2C2C2C', accent: '#C8A951', background: '#FAF8F5', text: '#3A3A3A', highlight: '#BF0A30' },
  },
  {
    id: 'liberty-blue',
    name: 'Liberty Blue',
    colors: { primary: '#1A4B8C', secondary: '#CC2936', accent: '#D8D4CC', background: '#F5F4F1', text: '#1A2744', highlight: '#1A4B8C' },
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    colors: { primary: '#0C2340', secondary: '#A67C00', accent: '#F0E4C2', background: '#FAF6EC', text: '#0C2340', highlight: '#8C6D0F' },
  },
  {
    id: 'stars-stripes',
    name: 'Stars & Stripes',
    colors: { primary: '#002868', secondary: '#BF0A30', accent: '#F5E6B8', background: '#FFFFFF', text: '#14213D', highlight: '#9A7B0A' },
  },
  {
    id: 'federal-blue',
    name: 'Federal Blue',
    colors: { primary: '#2C3E56', secondary: '#7B2D3B', accent: '#B8C4D0', background: '#EFF1F4', text: '#2C3344', highlight: '#3B6D8C' },
  },
  {
    id: 'sunrise-energy',
    name: 'Sunrise Energy',
    colors: { primary: '#1A2744', secondary: '#CC3D2E', accent: '#E8D9A0', background: '#FBF7ED', text: '#1A2744', highlight: '#B07C12' },
  },
];

const COLOR_ROLES = [
  { key: 'primary', label: 'Primary', desc: 'Main brand color for headers and key elements' },
  { key: 'secondary', label: 'Secondary', desc: 'Supporting color for buttons and accents' },
  { key: 'accent', label: 'Accent', desc: 'Contrast color for highlights and details' },
  { key: 'background', label: 'Background', desc: 'Page and section backgrounds' },
  { key: 'text', label: 'Text', desc: 'Body text and headings' },
  { key: 'highlight', label: 'Highlight', desc: 'Call-to-action and emphasis elements' },
];

/* ── WCAG 2.1 AA Contrast Helpers ── */

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function srgbToLinear(value) {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isLightColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/* ── Palette Card Component ── */
function PaletteCard({ name, colors, isActive, onClick, badge, description, index, fullWidth }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={onClick}
      whileHover={!isActive ? { y: -2, boxShadow: '0 6px 18px rgba(0,0,0,0.10)' } : {}}
      style={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        background: isActive ? '#FDF2F2' : '#FFFFFF',
        border: isActive ? '2px solid #8B1A2B' : '0.5px solid #64748B',
        borderRadius: fullWidth ? 12 : 10,
        boxShadow: isActive
          ? '0 0 0 3px rgba(139,26,43,0.12)'
          : fullWidth ? '0 2px 8px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
      }}
    >
      {/* Card body */}
      <div style={{
        padding: fullWidth ? '14px 20px' : '12px 14px',
        display: fullWidth ? 'flex' : 'block',
        alignItems: fullWidth ? 'center' : undefined,
        gap: fullWidth ? 24 : undefined,
      }}>
        {/* Name + badge + description */}
        <div style={{ flex: fullWidth ? '0 0 auto' : undefined, minWidth: fullWidth ? 200 : undefined, marginBottom: fullWidth ? 0 : 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: description ? 4 : 0 }}>
            {isActive && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8B1A2B',
                fontSize: 10, color: '#FFFFFF', fontWeight: 700, flexShrink: 0, lineHeight: 1,
              }}>{'\u2713'}</span>
            )}
            {badge && (
              <span style={{
                fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '2px 7px', borderRadius: 4,
                backgroundColor: colors.primary,
                color: isLightColor(colors.primary) ? colors.text : '#FFFFFF',
              }}>
                {badge}
              </span>
            )}
            <h3 style={{ fontSize: fullWidth ? 17 : 14, fontWeight: 700, color: '#1C2E5B', margin: 0, flex: 1 }}>
              {name}
            </h3>
          </div>
          {description && (
            <p style={{ fontSize: 10, color: '#6B7280', margin: 0, lineHeight: 1.4, maxWidth: fullWidth ? 260 : undefined }}>{description}</p>
          )}
        </div>

        {/* Color swatches */}
        <div style={{
          flex: fullWidth ? 1 : undefined,
          display: 'flex',
          gap: 6,
        }}>
          {COLOR_ROLES.map(({ key, label }) => {
            const color = colors[key] || colors.secondary;
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '100%',
                  height: fullWidth ? 38 : 28,
                  borderRadius: 5,
                  backgroundColor: color,
                }} />
                <span style={{ fontSize: 7.5, fontWeight: 600, marginTop: 4, color: '#6B7280', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Realistic Campaign Website Mockup (HTML/JSX) ── */
function CampaignWebsiteMockup({ colors, candidateName, candidateOffice, candidateState }) {
  const bgColor = colors.background;
  const secColor = colors.secondary;
  const priColor = colors.primary;
  const accColor = colors.highlight || colors.accent;
  const textColor = colors.text;
  const accentColor = colors.accent;

  const name = candidateName || 'Jane Smith';
  const office = candidateOffice || 'State Senate';
  const usState = candidateState || 'Virginia';

  // Derive initials and last name
  const nameParts = name.split(' ');
  const initials = nameParts.map(n => n[0]).join('').toUpperCase();
  const lastName = nameParts[nameParts.length - 1] || 'Smith';
  const firstName = nameParts[0] || 'Jane';

  const labelStyle = {
    position: 'absolute',
    right: -72,
    fontSize: 9,
    fontWeight: 700,
    color: '#9CA3AF',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Browser frame */}
      <div style={{ border: '1px solid #D1D5DB', borderRadius: 10, overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
        {/* Browser chrome bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E' }} />
          </div>
          <div style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 6,
            padding: '4px 12px',
            fontSize: 11,
            color: '#6B7280',
            fontFamily: 'monospace',
            border: '1px solid #E5E7EB',
          }}>
            www.{lastName.toLowerCase()}for{office.toLowerCase().replace(/\s+/g, '')}.com
          </div>
        </div>

        {/* Website content - scaled down */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>

            {/* ===== HEADER / NAV (30% - Secondary) ===== */}
            <div style={{ position: 'relative', backgroundColor: secColor, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Logo area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  backgroundColor: priColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                  color: isLightColor(priColor) ? textColor : '#FFFFFF',
                  letterSpacing: '0.05em',
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                  {name.toUpperCase()}
                </span>
              </div>
              {/* Nav links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {['Home', 'About', 'Issues', 'Contact'].map((link) => (
                  <span key={link} style={{ fontSize: 11, color: '#FFFFFF', opacity: 0.85, fontWeight: 500 }}>{link}</span>
                ))}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '5px 14px', borderRadius: 5,
                  backgroundColor: accColor,
                  color: isLightColor(accColor) ? textColor : '#FFFFFF',
                }}>
                  Donate Now
                </span>
              </div>
            </div>

            {/* ===== HERO SECTION (60% - Background) ===== */}
            <div style={{ position: 'relative', backgroundColor: bgColor, padding: '20px 24px 18px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: textColor, margin: 0, marginBottom: 4, lineHeight: 1.2 }}>
                Fighting for {usState}&apos;s Future
              </h2>
              <p style={{ fontSize: 11, color: textColor, opacity: 0.65, margin: 0, marginBottom: 12, maxWidth: 420, lineHeight: 1.4 }}>
                Experienced leadership. Proven results. Ready to serve the people of {usState}.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '8px 18px', borderRadius: 6,
                  backgroundColor: accColor,
                  color: isLightColor(accColor) ? textColor : '#FFFFFF',
                }}>
                  Join the Campaign
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '8px 18px', borderRadius: 6,
                  backgroundColor: 'transparent',
                  color: textColor,
                  border: `1.5px solid ${textColor}`,
                  opacity: 0.6,
                }}>
                  Learn More
                </span>
              </div>
            </div>

            {/* ===== ISSUES SECTION (60% bg with 30% cards) ===== */}
            <div style={{ backgroundColor: bgColor, padding: '14px 24px 16px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: 0, marginBottom: 8, textAlign: 'center' }}>
                Key Issues
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: '\uD83D\uDCCA', title: 'Economy', desc: 'Creating jobs and growing our local economy.' },
                  { icon: '\uD83C\uDF93', title: 'Education', desc: 'Investing in schools and empowering parents.' },
                  { icon: '\u2764\uFE0F', title: 'Healthcare', desc: 'Affordable care for every family.' },
                ].map((issue) => (
                  <div key={issue.title} style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 6,
                    padding: 10,
                    borderTop: `2px solid ${secColor}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 3 }}>{issue.icon}</div>
                    <h4 style={{ fontSize: 10, fontWeight: 700, color: textColor, margin: 0, marginBottom: 2 }}>{issue.title}</h4>
                    <p style={{ fontSize: 9, color: textColor, opacity: 0.6, margin: 0, lineHeight: 1.3 }}>{issue.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== CTA BANNER (30% - Secondary) ===== */}
            <div style={{
              backgroundColor: secColor,
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: 2 }}>
                  Support the Campaign
                </h3>
                <p style={{ fontSize: 9, color: '#FFFFFF', opacity: 0.7, margin: 0 }}>
                  Join 2,847 supporters standing with {firstName}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '5px 0 0 5px',
                  padding: '7px 14px',
                  fontSize: 10,
                  color: '#9CA3AF',
                  minWidth: 140,
                }}>
                  Enter your email
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '7px 14px',
                  borderRadius: '0 5px 5px 0',
                  backgroundColor: accColor,
                  color: isLightColor(accColor) ? textColor : '#FFFFFF',
                }}>
                  Sign Up
                </span>
              </div>
            </div>

            {/* ===== FOOTER (Primary) ===== */}
            <div style={{
              backgroundColor: priColor,
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: 4, opacity: 0.9 }}>
                  {name} for {office}
                </p>
                <p style={{ fontSize: 9, color: '#FFFFFF', opacity: 0.5, margin: 0, lineHeight: 1.4 }}>
                  Paid for by {name} for {office}<br />
                  {usState} Campaign Committee
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {['About', 'Issues', 'Donate', 'Contact', 'Privacy'].map((link) => (
                  <span key={link} style={{ fontSize: 9, color: '#FFFFFF', opacity: 0.6, fontWeight: 500 }}>{link}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Side color labels */}
          <div style={{ position: 'absolute', top: 0, right: 6, height: '100%', pointerEvents: 'none' }}>
            {/* Header label */}
            <div style={{ position: 'absolute', top: 18, right: 8, ...labelStyle, right: 8, color: '#FFFFFF', opacity: 0.7 }}>
              Secondary (30%)
            </div>
            {/* Hero label */}
            <div style={{ position: 'absolute', top: 116, right: 8, ...labelStyle, color: textColor, opacity: 0.35 }}>
              Background (60%)
            </div>
            {/* CTA label */}
            <div style={{ position: 'absolute', bottom: 80, right: 8, ...labelStyle, color: '#FFFFFF', opacity: 0.7 }}>
              Secondary (30%)
            </div>
            {/* Footer label */}
            <div style={{ position: 'absolute', bottom: 18, right: 8, ...labelStyle, color: '#FFFFFF', opacity: 0.5 }}>
              Primary
            </div>
          </div>
        </div>
      </div>

      {/* Legend below browser frame */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { color: bgColor, label: 'Primary Surface (60%)', needsBorder: true },
          { color: secColor, label: 'Secondary (30%)', needsBorder: false },
          { color: accColor, label: 'Accent (10%)', needsBorder: false },
          { color: priColor, label: 'Primary', needsBorder: false },
          { color: textColor, label: 'Text', needsBorder: false },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              backgroundColor: item.color,
              border: item.needsBorder ? '1px solid #D1D5DB' : 'none',
            }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Phone Mockup for Mobile Preview ── */
function CampaignPhoneMockup({ colors, candidateName, candidateOffice, candidateState }) {
  const bgColor = colors.background;
  const secColor = colors.secondary;
  const priColor = colors.primary;
  const accColor = colors.highlight || colors.accent;
  const textColor = colors.text;

  const name = candidateName || 'Jane Smith';
  const office = candidateOffice || 'State Senate';
  const usState = candidateState || 'Virginia';

  const nameParts = name.split(' ');
  const initials = nameParts.map(n => n[0]).join('').toUpperCase();
  const firstName = nameParts[0] || 'Jane';
  const lastName = nameParts[nameParts.length - 1] || 'Smith';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Phone frame */}
      <div style={{
        width: 220,
        borderRadius: 32,
        border: '8px solid #1A1A1A',
        backgroundColor: '#1A1A1A',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Status bar / notch */}
        <div style={{
          backgroundColor: '#1A1A1A',
          padding: '8px 16px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 9, color: '#FFFFFF', fontWeight: 600 }}>9:41</span>
          {/* Dynamic island pill */}
          <div style={{ width: 60, height: 12, borderRadius: 8, backgroundColor: '#000000' }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ width: 10, height: 7, borderRadius: 1, border: '1.5px solid #FFFFFF', position: 'relative' }}>
              <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2, height: 4, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
              <div style={{ width: '70%', height: '100%', backgroundColor: '#FFFFFF', borderRadius: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ backgroundColor: bgColor, overflow: 'hidden' }}>

          {/* Mobile nav bar */}
          <div style={{ backgroundColor: secColor, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                backgroundColor: priColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800,
                color: isLightColor(priColor) ? textColor : '#FFFFFF',
              }}>
                {initials}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                {lastName.toUpperCase()}
              </span>
            </div>
            {/* Hamburger icon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 14, height: 1.5, backgroundColor: '#FFFFFF', borderRadius: 2, opacity: i === 1 ? 0.7 : 1 }} />
              ))}
            </div>
          </div>

          {/* Hero section */}
          <div style={{ backgroundColor: bgColor, padding: '14px 12px 10px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: textColor, lineHeight: 1.2, marginBottom: 4 }}>
              Fighting for<br />{usState}&apos;s Future
            </div>
            <div style={{ fontSize: 8, color: textColor, opacity: 0.6, marginBottom: 10, lineHeight: 1.4 }}>
              Experienced leadership.<br />Proven results. Ready to serve.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{
                fontSize: 8, fontWeight: 700,
                padding: '5px 10px', borderRadius: 4,
                backgroundColor: accColor,
                color: isLightColor(accColor) ? textColor : '#FFFFFF',
              }}>
                Join Us
              </div>
              <div style={{
                fontSize: 8, fontWeight: 600,
                padding: '5px 10px', borderRadius: 4,
                backgroundColor: 'transparent',
                color: textColor,
                border: `1px solid ${textColor}`,
                opacity: 0.6,
              }}>
                Learn More
              </div>
            </div>
          </div>

          {/* Issues section */}
          <div style={{ backgroundColor: bgColor, padding: '8px 12px 10px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: textColor, marginBottom: 6, textAlign: 'center' }}>
              Key Issues
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { title: 'Economy', desc: 'Creating jobs and growing our economy.' },
                { title: 'Education', desc: 'Investing in schools for our children.' },
                { title: 'Healthcare', desc: 'Affordable care for every family.' },
              ].map(issue => (
                <div key={issue.title} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 5,
                  padding: '6px 8px',
                  borderLeft: `3px solid ${secColor}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: textColor, marginBottom: 1 }}>{issue.title}</div>
                    <div style={{ fontSize: 7, color: textColor, opacity: 0.55, lineHeight: 1.3 }}>{issue.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA strip */}
          <div style={{ backgroundColor: secColor, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              Support the Campaign
            </div>
            <div style={{ display: 'flex', gap: 0, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                flex: 1, backgroundColor: '#FFFFFF',
                padding: '5px 8px', fontSize: 7, color: '#9CA3AF',
              }}>
                Your email
              </div>
              <div style={{
                fontSize: 8, fontWeight: 700,
                padding: '5px 9px',
                backgroundColor: accColor,
                color: isLightColor(accColor) ? textColor : '#FFFFFF',
              }}>
                Sign Up
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ backgroundColor: priColor, padding: '8px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#FFFFFF', marginBottom: 2, opacity: 0.9 }}>
              {firstName} for {office}
            </div>
            <div style={{ fontSize: 7, color: '#FFFFFF', opacity: 0.5, lineHeight: 1.4 }}>
              Paid for by {name} for {office}<br />{usState} Campaign Committee
            </div>
          </div>

        </div>

        {/* Home indicator bar */}
        <div style={{
          backgroundColor: bgColor,
          padding: '6px 0 4px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ width: 60, height: 4, borderRadius: 2, backgroundColor: '#1A1A1A', opacity: 0.2 }} />
        </div>
      </div>

      {/* URL hint below phone */}
      <div style={{ marginTop: 8, fontSize: 9, color: '#9CA3AF', fontFamily: 'monospace' }}>
        {lastName.toLowerCase()}for{office.toLowerCase().replace(/\s+/g, '')}.com
      </div>
    </div>
  );
}

export default function Stage5_ColorPalette() {
  const { state, dispatch } = useBrand();
  const [activeTab, setActiveTab] = useState(state.colorMode || 'theme');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const coreData = state.brandCore ? BRAND_CORES[state.brandCore] : null;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Restore preset selection from state
  useState(() => {
    if (state.colorMode === 'custom' && state.customColors.primary) {
      const match = PRESET_PALETTES.find(p => p.colors.primary === state.customColors.primary && p.colors.secondary === state.customColors.secondary);
      if (match) setSelectedPreset(match.id);
    }
  });

  const activeColors = useMemo(() => {
    if (activeTab === 'custom' && selectedPreset) {
      const preset = PRESET_PALETTES.find(p => p.id === selectedPreset);
      return preset?.colors || { primary: '#1C2E5B', secondary: '#B22234', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333', highlight: '#4A90D9' };
    }
    if (coreData) {
      return { ...coreData.colors, highlight: coreData.colors.secondary };
    }
    return { primary: '#1C2E5B', secondary: '#C93545', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333', highlight: '#2E6FBA' };
  }, [activeTab, selectedPreset, coreData]);

  const activePaletteName = useMemo(() => {
    if (activeTab === 'theme') return `${coreData?.name || 'Theme'} Palette`;
    const preset = PRESET_PALETTES.find(p => p.id === selectedPreset);
    return preset?.name || 'Custom Palette';
  }, [activeTab, selectedPreset, coreData]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    dispatch({ type: 'SET_COLOR_MODE', payload: tab });
  };

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    handleTabSwitch('custom');
    const preset = PRESET_PALETTES.find(p => p.id === presetId);
    if (preset) {
      dispatch({ type: 'SET_CUSTOM_COLORS', payload: preset.colors });
    }
  };

  const handleRecommendedSelect = () => {
    handleTabSwitch('theme');
    setSelectedPreset(null);
  };

  const themeColors = coreData
    ? { ...coreData.colors, highlight: coreData.colors.secondary }
    : null;

  const showPreview = activeTab === 'theme' || (activeTab === 'custom' && selectedPreset);

  // Candidate data for the mockup
  const candidateName = state.candidate?.fullName || '';
  const candidateOffice = state.candidate?.office || '';
  const candidateState = state.candidate?.state || '';

  return (
    <>
      <StageContainer
        title="Color Palette"
        subtitle="Choose the colors that will define your campaign's visual identity."
        stageNumber={5}
      >
        {/* Live palette strip across the top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            height: 12, borderRadius: 999, overflow: 'hidden', display: 'flex',
            marginBottom: 24, transformOrigin: 'left',
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
          }}
        >
          {COLOR_ROLES.map(({ key }) => (
            <div
              key={key}
              style={{ flex: 1, backgroundColor: showPreview ? activeColors[key] : (key === 'primary' ? '#1C2E5B' : key === 'secondary' ? '#C93545' : '#E5E7EB'), transition: 'background-color 0.4s ease' }}
            />
          ))}
        </motion.div>

        {/* 1. Recommended palette — full width banner */}
        {themeColors && (
          <div style={{ marginBottom: 16 }}>
            <PaletteCard
              name={`${coreData?.name} Palette`}
              colors={themeColors}
              isActive={activeTab === 'theme'}
              onClick={handleRecommendedSelect}
              badge="Recommended"
              description={`Curated for the ${coreData?.emotionalFeel?.toLowerCase()} quality of your ${coreData?.name} brand core.`}
              index={0}
              fullWidth
            />
          </div>
        )}

        {/* 2. Other palettes — 2-col grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 28,
        }}>
          {PRESET_PALETTES.map((preset, index) => {
            const isActive = activeTab === 'custom' && selectedPreset === preset.id;
            return (
              <PaletteCard
                key={preset.id}
                name={preset.name}
                colors={preset.colors}
                isActive={isActive}
                onClick={() => handlePresetSelect(preset.id)}
                index={index + 1}
              />
            );
          })}
        </div>

        {/* 3. Website preview — full width below */}
        <AnimatePresence mode="wait">
          {showPreview && (
            <motion.div
              key={activeTab + selectedPreset}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
            >
              {/* Bold palette identity banner */}
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 16,
                padding: '32px 36px',
                marginBottom: 16,
                background: `linear-gradient(135deg, ${activeColors.primary} 0%, ${activeColors.text || activeColors.primary} 100%)`,
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.04,
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)`,
                  pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.75)', margin: '0 0 10px' }}>
                    Your Color Palette
                  </p>
                  <h2 style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 900, color: '#FFFFFF', margin: 0, lineHeight: 0.95, textTransform: 'uppercase' }}>
                    {activePaletteName}
                  </h2>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                    {COLOR_ROLES.map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          backgroundColor: activeColors[key],
                          border: '2px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
                        }} />
                        <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize', letterSpacing: '0.04em' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                padding: 20,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF', margin: 0, marginBottom: 2 }}>
                      60 / 30 / 10 Preview
                    </p>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1C2E5B', margin: 0 }}>
                      {activePaletteName}
                    </h3>
                  </div>
                  {/* Color spec chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                    {COLOR_ROLES.map(({ key, label }) => {
                      const color = activeColors[key];
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: 3,
                            backgroundColor: color,
                            boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : 'none',
                          }} />
                          <span style={{ fontSize: 9, fontWeight: 600, color: '#374151' }}>{label}</span>
                          <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#9CA3AF' }}>{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isMobile ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CampaignPhoneMockup
                      colors={activeColors}
                      candidateName={candidateName}
                      candidateOffice={candidateOffice}
                      candidateState={candidateState}
                    />
                  </div>
                ) : (
                  <CampaignWebsiteMockup
                    colors={activeColors}
                    candidateName={candidateName}
                    candidateOffice={candidateOffice}
                    candidateState={candidateState}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </StageContainer>
    </>
  );
}
