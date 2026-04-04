import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';

const PRESET_PALETTES = [
  {
    id: 'classic-patriot',
    name: 'Classic Patriot',
    colors: { primary: '#002868', secondary: '#BF0A30', accent: '#FFFFFF', background: '#F5F5F5', text: '#1A1A2E', highlight: '#876A0A' },
  },
  {
    id: 'modern-navy',
    name: 'Modern Navy',
    colors: { primary: '#1B2A4A', secondary: '#C8102E', accent: '#E8E8E8', background: '#FAFAFA', text: '#2D2D2D', highlight: '#2E6FBA' },
  },
  {
    id: 'bold-crimson',
    name: 'Bold Crimson',
    colors: { primary: '#8B0000', secondary: '#1C1C1C', accent: '#D4AF37', background: '#FFF8F0', text: '#2C2C2C', highlight: '#B5232A' },
  },
  {
    id: 'liberty-blue',
    name: 'Liberty Blue',
    colors: { primary: '#003366', secondary: '#CC0000', accent: '#F0F0F0', background: '#F7F9FC', text: '#333333', highlight: '#0059B3' },
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    colors: { primary: '#1A2744', secondary: '#8B1A2B', accent: '#D4C5A9', background: '#FAF8F5', text: '#4A3728', highlight: '#7A5700' },
  },
  {
    id: 'grassroots-green',
    name: 'Grassroots Green',
    colors: { primary: '#1B4332', secondary: '#2D6A4F', accent: '#D8F3DC', background: '#F0FFF4', text: '#1B1B1B', highlight: '#2B7A4B' },
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    colors: { primary: '#2F3E46', secondary: '#354F52', accent: '#CAD2C5', background: '#F8F9FA', text: '#212529', highlight: '#3D6B5E' },
  },
  {
    id: 'sunrise-energy',
    name: 'Sunrise Energy',
    colors: { primary: '#1C2E5B', secondary: '#E63946', accent: '#F1FAEE', background: '#FFFFFF', text: '#2B2D42', highlight: '#B54A15' },
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
function PaletteCard({ name, colors, isActive, onClick, badge, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={onClick}
      whileHover={!isActive ? { y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } : {}}
      style={{
        position: 'relative',
        cursor: 'pointer',
        padding: '14px 16px',
        background: isActive ? '#FDF2F2' : '#FFFFFF',
        border: isActive ? '2px solid #8B1A2B' : '1px solid #E5E7EB',
        borderRadius: 8,
        boxShadow: isActive ? '0 0 0 3px rgba(139,26,43,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header row: name + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        {isActive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8B1A2B',
            fontSize: 10, color: '#FFFFFF', fontWeight: 700, flexShrink: 0, lineHeight: 1,
          }}>{'\u2713'}</span>
        )}
        {badge && (
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '1px 5px',
              borderRadius: 3,
              backgroundColor: colors.primary,
              color: isLightColor(colors.primary) ? colors.text : '#FFFFFF',
            }}
          >
            {badge}
          </span>
        )}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1C2E5B', margin: 0, flex: 1 }}>
          {name}
        </h3>
      </div>

      {description && (
        <p style={{ fontSize: 10, color: '#6B7280', margin: 0, marginBottom: 6, lineHeight: 1.3 }}>{description}</p>
      )}

      {/* 6 color swatches in a horizontal row */}
      <div style={{ display: 'flex', gap: 6 }}>
        {COLOR_ROLES.map(({ key, label }) => {
          const color = colors[key] || colors.secondary;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: color,
                  boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 600, marginTop: 3, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
            </div>
          );
        })}
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

export default function Stage5_ColorPalette() {
  const { state, dispatch } = useBrand();
  const [activeTab, setActiveTab] = useState(state.colorMode || 'theme');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const coreData = state.brandCore ? BRAND_CORES[state.brandCore] : null;

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
        {showPreview && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              height: 6, borderRadius: 999, overflow: 'hidden', display: 'flex',
              marginBottom: 16, transformOrigin: 'left',
            }}
          >
            {COLOR_ROLES.map(({ key }) => (
              <div
                key={key}
                style={{ flex: 1, backgroundColor: activeColors[key], transition: 'background-color 0.4s ease' }}
              />
            ))}
          </motion.div>
        )}

        {/* Two-column layout: palette cards on left, preview on right */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* LEFT: Palette selection cards — takes 60% */}
          <div style={{ flex: showPreview ? '0 0 60%' : '1', minWidth: 0 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              maxHeight: showPreview ? '70vh' : 'none',
              overflowY: showPreview ? 'auto' : 'visible',
              paddingRight: showPreview ? 6 : 0,
            }}>
              {/* Recommended palette card */}
              {themeColors && (
                <PaletteCard
                  name={`${coreData?.name} Palette`}
                  colors={themeColors}
                  isActive={activeTab === 'theme'}
                  onClick={handleRecommendedSelect}
                  badge="Recommended"
                  description={`Curated for the ${coreData?.emotionalFeel?.toLowerCase()} quality of your ${coreData?.name} brand core.`}
                  index={0}
                />
              )}

              {/* Preset palette cards */}
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
          </div>

          {/* RIGHT: Live website mockup preview */}
          <AnimatePresence mode="wait">
            {showPreview && (
              <motion.div
                key={activeTab + selectedPreset}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                style={{
                  flex: '0 0 38%',
                  minWidth: 0,
                  position: 'sticky',
                  top: 120,
                }}
              >
                <div style={{
                  padding: 14,
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF', marginTop: 0, marginBottom: 2 }}>
                    60 / 30 / 10 Preview
                  </p>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1C2E5B', margin: 0, marginBottom: 4 }}>
                    {activePaletteName}
                  </h3>

                  <CampaignWebsiteMockup
                    colors={activeColors}
                    candidateName={candidateName}
                    candidateOffice={candidateOffice}
                    candidateState={candidateState}
                  />

                  {/* Color spec row */}
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {COLOR_ROLES.map(({ key, label }) => {
                      const color = activeColors[key];
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div
                            style={{
                              width: 16, height: 16, borderRadius: 3,
                              backgroundColor: color,
                              boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : 'none',
                            }}
                          />
                          <span style={{ fontSize: 9, fontWeight: 600, color: '#374151' }}>{label}</span>
                          <span style={{ fontSize: 8, fontFamily: 'monospace', color: '#9CA3AF' }}>{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StageContainer>
    </>
  );
}
