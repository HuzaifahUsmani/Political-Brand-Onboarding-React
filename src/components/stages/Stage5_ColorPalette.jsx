import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';
import AnimatedCheckmark from '../AnimatedCheckmark';

const PRESET_PALETTES = [
  {
    id: 'classic-patriot',
    name: 'Classic Patriot',
    colors: { primary: '#002868', secondary: '#BF0A30', accent: '#FFFFFF', background: '#F5F5F5', text: '#1A1A2E', highlight: '#FFD700' },
  },
  {
    id: 'modern-navy',
    name: 'Modern Navy',
    colors: { primary: '#1B2A4A', secondary: '#C8102E', accent: '#E8E8E8', background: '#FAFAFA', text: '#2D2D2D', highlight: '#4A90D9' },
  },
  {
    id: 'bold-crimson',
    name: 'Bold Crimson',
    colors: { primary: '#8B0000', secondary: '#1C1C1C', accent: '#D4AF37', background: '#FFF8F0', text: '#2C2C2C', highlight: '#C41E3A' },
  },
  {
    id: 'liberty-blue',
    name: 'Liberty Blue',
    colors: { primary: '#003366', secondary: '#CC0000', accent: '#F0F0F0', background: '#F7F9FC', text: '#333333', highlight: '#0066CC' },
  },
  {
    id: 'heritage-gold',
    name: 'Heritage Gold',
    colors: { primary: '#1A2744', secondary: '#8B1A2B', accent: '#D4C5A9', background: '#FAF8F5', text: '#4A3728', highlight: '#B8860B' },
  },
  {
    id: 'grassroots-green',
    name: 'Grassroots Green',
    colors: { primary: '#1B4332', secondary: '#2D6A4F', accent: '#D8F3DC', background: '#F0FFF4', text: '#1B1B1B', highlight: '#40916C' },
  },
  {
    id: 'executive-slate',
    name: 'Executive Slate',
    colors: { primary: '#2F3E46', secondary: '#354F52', accent: '#CAD2C5', background: '#F8F9FA', text: '#212529', highlight: '#52796F' },
  },
  {
    id: 'sunrise-energy',
    name: 'Sunrise Energy',
    colors: { primary: '#1C2E5B', secondary: '#E63946', accent: '#F1FAEE', background: '#FFFFFF', text: '#2B2D42', highlight: '#FF6B35' },
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

/* Key contrast pairs to check for AA compliance */
function getContrastChecks(colors) {
  return [
    { label: 'Text on Background', fg: colors.text, bg: colors.background, type: 'normal' },
    { label: 'Text on Primary', fg: '#FFFFFF', bg: colors.primary, type: 'large' },
    { label: 'Text on Secondary', fg: '#FFFFFF', bg: colors.secondary, type: 'large' },
    { label: 'Highlight on Background', fg: colors.highlight, bg: colors.background, type: 'normal' },
  ];
}

function passesAA(ratio, type) {
  return type === 'large' ? ratio >= 3 : ratio >= 4.5;
}

function palettePassesAA(colors) {
  const checks = getContrastChecks(colors);
  return checks.every((c) => passesAA(contrastRatio(c.fg, c.bg), c.type));
}

/* ── Contrast Badge Component ── */
function ContrastBadge({ ratio, type }) {
  const passes = passesAA(ratio, type);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 4,
        backgroundColor: passes ? '#ECFDF5' : '#FEF2F2',
        color: passes ? '#065F46' : '#991B1B',
        border: `1px solid ${passes ? '#A7F3D0' : '#FECACA'}`,
      }}
    >
      AA {passes ? '\u2713' : '\u2717'}
      <span style={{ fontWeight: 500, opacity: 0.7 }}>{ratio.toFixed(1)}:1</span>
    </span>
  );
}

/* ── 60/30/10 Website Mockup SVG ── */
function WebsiteMockup({ colors }) {
  const bgColor = colors.background;
  const secColor = colors.secondary;
  const priColor = colors.primary;
  const accColor = colors.highlight || colors.accent;
  const textColor = colors.text;

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox="0 0 600 520"
        width="100%"
        style={{ display: 'block', borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Browser chrome */}
        <rect x="0" y="0" width="600" height="28" fill="#F3F4F6" rx="8" />
        <rect x="0" y="14" width="600" height="14" fill="#F3F4F6" />
        <circle cx="16" cy="14" r="4" fill="#EF4444" />
        <circle cx="30" cy="14" r="4" fill="#F59E0B" />
        <circle cx="44" cy="14" r="4" fill="#22C55E" />

        {/* Header — 30% secondary */}
        <rect x="0" y="28" width="600" height="50" fill={secColor} />
        <rect x="24" y="42" width="80" height="14" rx="2" fill="#FFFFFF" opacity="0.9" />
        <rect x="400" y="44" width="40" height="10" rx="2" fill="#FFFFFF" opacity="0.6" />
        <rect x="450" y="44" width="40" height="10" rx="2" fill="#FFFFFF" opacity="0.6" />
        <rect x="500" y="44" width="40" height="10" rx="2" fill="#FFFFFF" opacity="0.6" />
        {/* 30% annotation */}
        <text x="570" y="58" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="end" opacity="0.8">30%</text>

        {/* Hero — 60% background/primary area */}
        <rect x="0" y="78" width="600" height="180" fill={bgColor} />
        {/* Hero headline */}
        <rect x="60" y="116" width="260" height="18" rx="3" fill={priColor} />
        <rect x="60" y="142" width="200" height="12" rx="2" fill={textColor} opacity="0.5" />
        <rect x="60" y="160" width="180" height="12" rx="2" fill={textColor} opacity="0.3" />
        {/* CTA button — 10% accent */}
        <rect x="60" y="188" width="120" height="36" rx="6" fill={accColor} />
        <rect x="80" y="201" width="80" height="10" rx="2" fill={isLightColor(accColor) ? textColor : '#FFFFFF'} opacity="0.9" />
        {/* 60% annotation */}
        <text x="540" y="176" fontSize="10" fontWeight="700" fill={textColor} textAnchor="end" opacity="0.5">60%</text>
        {/* 10% annotation near CTA */}
        <text x="196" y="210" fontSize="10" fontWeight="700" fill={accColor} textAnchor="start" opacity="0.8">10%</text>

        {/* Cards section — on 60% background */}
        <rect x="0" y="258" width="600" height="170" fill={bgColor} />
        {/* Card 1 */}
        <rect x="30" y="278" width="165" height="120" rx="6" fill="#FFFFFF" />
        <rect x="30" y="278" width="165" height="120" rx="6" fill={secColor} opacity="0.08" />
        <rect x="46" y="296" width="100" height="10" rx="2" fill={priColor} opacity="0.85" />
        <rect x="46" y="314" width="130" height="8" rx="2" fill={textColor} opacity="0.35" />
        <rect x="46" y="328" width="120" height="8" rx="2" fill={textColor} opacity="0.25" />
        <rect x="46" y="354" width="80" height="24" rx="4" fill={accColor} />
        {/* Card 2 */}
        <rect x="218" y="278" width="165" height="120" rx="6" fill="#FFFFFF" />
        <rect x="218" y="278" width="165" height="120" rx="6" fill={secColor} opacity="0.08" />
        <rect x="234" y="296" width="110" height="10" rx="2" fill={priColor} opacity="0.85" />
        <rect x="234" y="314" width="130" height="8" rx="2" fill={textColor} opacity="0.35" />
        <rect x="234" y="328" width="120" height="8" rx="2" fill={textColor} opacity="0.25" />
        <rect x="234" y="354" width="80" height="24" rx="4" fill={accColor} />
        {/* Card 3 */}
        <rect x="406" y="278" width="165" height="120" rx="6" fill="#FFFFFF" />
        <rect x="406" y="278" width="165" height="120" rx="6" fill={secColor} opacity="0.08" />
        <rect x="422" y="296" width="90" height="10" rx="2" fill={priColor} opacity="0.85" />
        <rect x="422" y="314" width="130" height="8" rx="2" fill={textColor} opacity="0.35" />
        <rect x="422" y="328" width="120" height="8" rx="2" fill={textColor} opacity="0.25" />
        <rect x="422" y="354" width="80" height="24" rx="4" fill={accColor} />

        {/* Footer — 30% secondary */}
        <rect x="0" y="428" width="600" height="92" fill={secColor} />
        <rect x="30" y="450" width="120" height="10" rx="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="30" y="468" width="80" height="8" rx="2" fill="#FFFFFF" opacity="0.4" />
        <rect x="250" y="450" width="100" height="10" rx="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="250" y="468" width="70" height="8" rx="2" fill="#FFFFFF" opacity="0.4" />
        <rect x="470" y="450" width="100" height="10" rx="2" fill="#FFFFFF" opacity="0.7" />
        <rect x="470" y="468" width="80" height="8" rx="2" fill="#FFFFFF" opacity="0.4" />
        {/* 30% annotation */}
        <text x="570" y="505" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="end" opacity="0.8">30%</text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bgColor, border: '1px solid #E5E7EB' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>60% Primary Surface</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: secColor }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>30% Secondary</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: accColor }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>10% Accent</span>
        </div>
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
    return { primary: '#1C2E5B', secondary: '#B22234', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333', highlight: '#4A90D9' };
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

  return (
    <StageContainer
      title="Color Palette"
      subtitle="Choose the colors that will define your campaign's visual identity."
      stageNumber={5}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* RECOMMENDED PALETTE — full-width box like Stage 3 */}
        {themeColors && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleRecommendedSelect}
            style={{
              position: 'relative',
              cursor: 'pointer',
              padding: 24,
              background: activeTab === 'theme' ? '#FEF2F2' : '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderLeft: activeTab === 'theme' ? '4px solid #8B1A2B' : '1px solid #E5E7EB',
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'background 0.2s ease, border 0.2s ease',
            }}
          >
            {/* Checkmark */}
            <AnimatePresence>
              {activeTab === 'theme' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                >
                  <AnimatedCheckmark size={32} color="#8B1A2B" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Badge + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: themeColors.primary,
                  color: isLightColor(themeColors.primary) ? themeColors.text : '#FFFFFF',
                }}
              >
                Recommended
              </span>
              {!palettePassesAA(themeColors) && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    border: '1px solid #FECACA',
                  }}
                >
                  Contrast Warning
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C2E5B', margin: 0, marginBottom: 4 }}>
              {coreData?.name} Palette
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, marginBottom: 16 }}>
              Curated for the <em>{coreData?.emotionalFeel?.toLowerCase()}</em> quality of your {coreData?.name} brand core.
            </p>

            {/* Swatches row */}
            <div style={{ display: 'flex', gap: 12 }}>
              {COLOR_ROLES.map(({ key, label }) => {
                const color = themeColors[key] || themeColors.secondary;
                return (
                  <div key={key} style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '4 / 3',
                        borderRadius: 6,
                        backgroundColor: color,
                        boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : 'none',
                      }}
                    />
                    <p style={{ fontSize: 11, fontWeight: 600, marginTop: 6, marginBottom: 0, color: '#374151' }}>{label}</p>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', marginTop: 2, marginBottom: 0, color: '#9CA3AF' }}>{color}</p>
                  </div>
                );
              })}
            </div>

            {/* AA Contrast checks */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {getContrastChecks(themeColors).map((check) => {
                const ratio = contrastRatio(check.fg, check.bg);
                return (
                  <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#6B7280' }}>{check.label}:</span>
                    <ContrastBadge ratio={ratio} type={check.type} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }}>
          <div style={{ height: 1, flex: 1, backgroundColor: '#E5E7EB' }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}>
            or pick a preset
          </span>
          <div style={{ height: 1, flex: 1, backgroundColor: '#E5E7EB' }} />
        </div>

        {/* PRESET PALETTES — full-width stacked boxes like Stage 3 */}
        {PRESET_PALETTES.map((preset, index) => {
          const isActive = activeTab === 'custom' && selectedPreset === preset.id;
          const aaPass = palettePassesAA(preset.colors);

          return (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              onClick={() => handlePresetSelect(preset.id)}
              whileHover={!isActive ? {
                y: -2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              } : {}}
              style={{
                position: 'relative',
                cursor: 'pointer',
                padding: 24,
                background: isActive ? '#FEF2F2' : '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: isActive ? '4px solid #8B1A2B' : '1px solid #E5E7EB',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'background 0.2s ease, border 0.2s ease',
              }}
            >
              {/* Checkmark */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
                  >
                    <AnimatedCheckmark size={32} color="#8B1A2B" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1C2E5B', margin: 0 }}>
                  {preset.name}
                </h3>
                {aaPass ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    AA {'\u2713'}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: '#FEF2F2',
                      color: '#991B1B',
                      border: '1px solid #FECACA',
                    }}
                  >
                    Contrast Warning
                  </span>
                )}
              </div>

              {/* Swatches row */}
              <div style={{ display: 'flex', gap: 12 }}>
                {COLOR_ROLES.map(({ key, label }) => {
                  const color = preset.colors[key] || preset.colors.secondary;
                  return (
                    <div key={key} style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '4 / 3',
                          borderRadius: 6,
                          backgroundColor: color,
                          boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : 'none',
                        }}
                      />
                      <p style={{ fontSize: 11, fontWeight: 600, marginTop: 6, marginBottom: 0, color: '#374151' }}>{label}</p>
                      <p style={{ fontSize: 10, fontFamily: 'monospace', marginTop: 2, marginBottom: 0, color: '#9CA3AF' }}>{color}</p>
                    </div>
                  );
                })}
              </div>

              {/* AA Contrast checks row */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {getContrastChecks(preset.colors).map((check) => {
                  const ratio = contrastRatio(check.fg, check.bg);
                  return (
                    <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#6B7280' }}>{check.label}:</span>
                      <ContrastBadge ratio={ratio} type={check.type} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* 60/30/10 PREVIEW SECTION */}
        <AnimatePresence mode="wait">
          {showPreview && (
            <motion.div
              key={activeTab + selectedPreset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: 16,
                padding: 24,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF', marginTop: 0, marginBottom: 4 }}>
                60 / 30 / 10 Preview
              </p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C2E5B', margin: 0, marginBottom: 6 }}>
                {activePaletteName}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0, marginBottom: 20 }}>
                See how your selected palette maps to the 60/30/10 color rule in a website layout.
              </p>
              <WebsiteMockup colors={activeColors} />

              {/* Detailed color spec */}
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {COLOR_ROLES.map(({ key, label, desc }) => {
                  const color = activeColors[key];
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          backgroundColor: color,
                          flexShrink: 0,
                          boxShadow: isLightColor(color) ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.12)',
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</span>
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF' }}>{color}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full palette bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  {COLOR_ROLES.map(({ key }) => (
                    <div
                      key={key}
                      style={{ flex: 1, backgroundColor: activeColors[key], transition: 'background-color 0.3s ease' }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', textAlign: 'right', color: '#9CA3AF', marginTop: 6, marginBottom: 0 }}>
                  {COLOR_ROLES.map(({ key }) => activeColors[key]).join(' / ')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StageContainer>
  );
}
