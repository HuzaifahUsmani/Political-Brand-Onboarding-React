import { useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';

/* ── Font Presets per brand core ── */
const FONT_PRESETS = {
  commander: [
    {
      id: 'iron-authority',
      name: 'Iron Authority',
      heading: 'Oswald', headingWeight: 700,
      body: 'Source Sans 3', bodyWeight: 400,
      description: 'Tall condensed headlines demand attention. Clean sans body keeps it readable.',
      bestFor: 'Iron Commander, American Defender',
      recommended: true,
    },
    {
      id: 'tactical-precision',
      name: 'Tactical Precision',
      heading: 'Montserrat', headingWeight: 700,
      body: 'Archivo', bodyWeight: 400,
      description: 'Geometric, structured, military-grid energy. Less aggressive than Oswald, more methodical.',
      bestFor: 'Tactical Leader, Silent Strength',
    },
    {
      id: 'rank-file',
      name: 'Rank & File',
      heading: 'Fjalla One', headingWeight: 400,
      body: 'Montserrat', bodyWeight: 400,
      description: 'Heavy condensed display heading with a clean geometric body. Maximum poster-impact.',
      bestFor: 'Iron Commander, American Defender',
    },
    {
      id: 'shield-serif',
      name: 'Shield & Serif',
      heading: 'Oswald', headingWeight: 700,
      body: 'Domine', bodyWeight: 400,
      description: 'Condensed sans heading over a sturdy serif body. Adds institutional weight — the badge-and-seal feel.',
      bestFor: 'Law & Order Guardian',
    },
    {
      id: 'command-post',
      name: 'Command Post',
      heading: 'Teko', headingWeight: 600,
      body: 'Source Sans 3', bodyWeight: 400,
      description: 'Tall, narrow, military-stencil energy. More technical and spec-ops than Oswald.',
      bestFor: 'Tactical Leader, Silent Strength',
    },
  ],
  patriot: [
    {
      id: 'heritage-serif',
      name: 'Heritage Serif',
      heading: 'Libre Baskerville', headingWeight: 700,
      body: 'Merriweather', bodyWeight: 400,
      description: 'Institutional Baskerville headlines with warm, readable Merriweather body.',
      bestFor: 'Heritage Classic, Founding Values',
      recommended: true,
    },
    {
      id: 'founding-document',
      name: 'Founding Document',
      heading: 'EB Garamond', headingWeight: 700,
      body: 'Source Serif Pro', bodyWeight: 400,
      description: 'Old-world elegance. Garamond feels ratified, not designed.',
      bestFor: 'Constitution First, Founding Values',
    },
    {
      id: 'legacy-script',
      name: 'Legacy Script',
      heading: 'Cormorant Garamond', headingWeight: 700,
      body: 'Lora', bodyWeight: 400,
      description: 'High-contrast refined heading with a warm brushstroke-influenced body. Elegant, almost calligraphic.',
      bestFor: 'American Legacy, Faith & Freedom',
    },
    {
      id: 'steadfast-tradition',
      name: 'Steadfast Tradition',
      heading: 'Vollkorn', headingWeight: 700,
      body: 'Crimson Pro', bodyWeight: 400,
      description: 'Sturdy, no-nonsense serifs on both ends. German reliability meets British readability.',
      bestFor: 'Heritage Classic, Constitution First',
    },
    {
      id: 'chapel-state',
      name: 'Chapel & State',
      heading: 'Lora', headingWeight: 700,
      body: 'Source Serif Pro', bodyWeight: 400,
      description: 'Warm, slightly calligraphic heading over a clean editorial body. Faith-forward without being ornate.',
      bestFor: 'Faith & Freedom, American Legacy',
    },
  ],
  reformer: [
    {
      id: 'rally-poster',
      name: 'Rally Poster',
      heading: 'Bebas Neue', headingWeight: 400,
      body: 'Barlow Condensed', bodyWeight: 500,
      description: 'All-caps display over tight condensed body. Feels like a protest sign printed at scale.',
      bestFor: 'Anti-Establishment Firebrand, America Rebuilt',
      recommended: true,
    },
    {
      id: 'megaphone',
      name: 'Megaphone',
      heading: 'Anton', headingWeight: 400,
      body: 'DM Sans', bodyWeight: 400,
      description: 'Impact-weight punchy headlines with a clean geometric body. Confrontational heading, controlled body.',
      bestFor: 'Clean Disruptor, NextGen Conservative',
    },
    {
      id: 'straight-talk',
      name: 'Straight Talk',
      heading: 'Barlow Condensed', headingWeight: 700,
      body: 'Space Grotesk', bodyWeight: 400,
      description: 'No-frills condensed heading, techy geometric body. Stripped-down, anti-design honesty.',
      bestFor: 'Straight Shooter',
    },
    {
      id: 'next-wave',
      name: 'Next Wave',
      heading: 'Sora', headingWeight: 700,
      body: 'Outfit', bodyWeight: 400,
      description: 'Modern geometric heading with a clean contemporary body. Digital-native disruption.',
      bestFor: 'NextGen Conservative, Clean Disruptor',
    },
    {
      id: 'blueprint',
      name: 'Blueprint',
      heading: 'Bebas Neue', headingWeight: 400,
      body: 'DM Sans', bodyWeight: 500,
      description: 'Same rally energy in the heading but paired with a warmer, more constructive body.',
      bestFor: 'America Rebuilt',
    },
  ],
  community: [
    {
      id: 'good-neighbor',
      name: 'Good Neighbor',
      heading: 'Poppins', headingWeight: 600,
      body: 'Lato', bodyWeight: 400,
      description: 'Round, friendly heading with a clean neutral body. Feels warm without trying too hard.',
      bestFor: 'Family First, Grassroots Voice',
      recommended: true,
    },
    {
      id: 'town-square',
      name: 'Town Square',
      heading: 'Nunito', headingWeight: 700,
      body: 'Open Sans', bodyWeight: 400,
      description: 'Rounded, gentle heading with the most universally readable body font. Maximum accessibility.',
      bestFor: 'Neighbor Leadership, Unity Builder',
    },
    {
      id: 'front-porch',
      name: 'Front Porch',
      heading: 'Cabin', headingWeight: 700,
      body: 'Karla', bodyWeight: 400,
      description: 'Humanist, slightly quirky heading with a grotesque body that reads like handwritten notes cleaned up.',
      bestFor: 'Local Hero, Grassroots Voice',
    },
    {
      id: 'backyard-bbq',
      name: 'Backyard BBQ',
      heading: 'Quicksand', headingWeight: 700,
      body: 'Nunito', bodyWeight: 400,
      description: 'Rounded everything. The softest, most approachable pairing. Feels like a neighborhood newsletter.',
      bestFor: 'Family First, Neighbor Leadership',
    },
    {
      id: 'community-board',
      name: 'Community Board',
      heading: 'Figtree', headingWeight: 700,
      body: 'Lato', bodyWeight: 400,
      description: 'Modern, geometric-rounded heading with a trusted neutral body. Clean but warm.',
      bestFor: 'Unity Builder, Local Hero',
    },
  ],
  executive: [
    {
      id: 'boardroom',
      name: 'Boardroom',
      heading: 'Inter', headingWeight: 600,
      body: 'Roboto', bodyWeight: 400,
      description: 'Clean, premium sans heading with a neutral professional body. Annual report energy.',
      bestFor: 'Corporate Leader, Strategic Operator, Policy Architect',
      recommended: true,
    },
    {
      id: 'gala-invite',
      name: 'Gala Invite',
      heading: 'Playfair Display', headingWeight: 700,
      body: 'Raleway', bodyWeight: 400,
      description: 'Luxury serif heading with an elegant thin-stroked body. Donor-class, prestige design.',
      bestFor: 'Elite Campaign',
    },
    {
      id: 'startup-statehouse',
      name: 'Startup to Statehouse',
      heading: 'Plus Jakarta Sans', headingWeight: 700,
      body: 'Work Sans', bodyWeight: 400,
      description: 'Modern tech-forward heading with a clean geometric body. Silicon Valley meets public service.',
      bestFor: 'Results First, Strategic Operator',
    },
    {
      id: 'the-brief',
      name: 'The Brief',
      heading: 'Manrope', headingWeight: 700,
      body: 'Inter', bodyWeight: 400,
      description: 'Geometric, precise heading with the cleanest possible body. Feels like a McKinsey deck.',
      bestFor: 'Policy Architect, Corporate Leader',
    },
    {
      id: 'corner-office',
      name: 'Corner Office',
      heading: 'Playfair Display', headingWeight: 700,
      body: 'Manrope', bodyWeight: 400,
      description: 'Luxury editorial heading over a modern geometric body. Old money meets new efficiency.',
      bestFor: 'Elite Campaign, Corporate Leader',
    },
  ],
};

/* ── Google Font Loader ── */
const loadedFonts = new Set();

function loadGoogleFont(fontName, weights = ['400', '700']) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const family = `${fontName.replace(/\s/g, '+')}:wght@${weights.join(';')}`;
  const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function loadPresetFonts(presets) {
  presets.forEach(p => {
    loadGoogleFont(p.heading, [String(p.headingWeight)]);
    loadGoogleFont(p.body, [String(p.bodyWeight)]);
  });
}

/* ── Helpers ── */
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function textOnColor(bgHex) {
  return luminance(bgHex) > 0.55 ? '#1a1a1a' : '#ffffff';
}

/* ── Preset Card ── */
function PresetCard({ preset, isActive, onClick, activeColors, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      whileHover={!isActive ? { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.09)' } : {}}
      style={{
        cursor: 'pointer',
        borderRadius: 12,
        border: isActive ? `2px solid ${activeColors.primary}` : '1px solid #E5E7EB',
        backgroundColor: isActive ? `${activeColors.primary}08` : '#FFFFFF',
        boxShadow: isActive
          ? `0 0 0 3px ${activeColors.primary}18, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 1px 3px rgba(0,0,0,0.05)',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Active top bar */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          backgroundColor: activeColors.primary,
        }} />
      )}

      {/* Header row: name + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {preset.recommended && (
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '2px 7px', borderRadius: 4,
            backgroundColor: activeColors.primary,
            color: textOnColor(activeColors.primary),
          }}>
            ★ Recommended
          </span>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1C2E5B' }}>{preset.name}</span>
        {isActive && (
          <span style={{
            marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            backgroundColor: activeColors.primary, color: textOnColor(activeColors.primary),
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>✓</span>
        )}
      </div>

      {/* Font samples side by side */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {/* Heading */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', display: 'block', marginBottom: 3 }}>
            Heading · {preset.heading} {preset.headingWeight}
          </span>
          <div style={{
            fontFamily: `'${preset.heading}', serif`,
            fontWeight: preset.headingWeight,
            fontSize: 20,
            color: '#1C2E5B',
            lineHeight: 1.15,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Bold Leadership
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, backgroundColor: '#E5E7EB', flexShrink: 0 }} />

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', display: 'block', marginBottom: 3 }}>
            Body · {preset.body} {preset.bodyWeight}
          </span>
          <div style={{
            fontFamily: `'${preset.body}', sans-serif`,
            fontWeight: preset.bodyWeight,
            fontSize: 13,
            color: '#4B5563',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            Fighting for our community's future and a stronger tomorrow.
          </div>
        </div>
      </div>

      {/* Description + best-for */}
      <p style={{ fontSize: 11, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
        {preset.description}{' '}
        <span style={{ color: '#9CA3AF' }}>Best for: {preset.bestFor}.</span>
      </p>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function Stage6_FontSelection() {
  const { state, dispatch } = useBrand();
  const coreData = state.brandCore ? BRAND_CORES[state.brandCore] : null;
  const presets = state.brandCore ? (FONT_PRESETS[state.brandCore] || []) : [];

  const activeColors = useMemo(() => {
    if (state.colorMode === 'custom' && state.customColors.primary) {
      return {
        primary: state.customColors.primary,
        secondary: state.customColors.secondary || '#B22234',
        accent: state.customColors.accent || '#FFFFFF',
        background: state.customColors.background || '#F5F5F5',
        text: state.customColors.text || '#333333',
      };
    }
    return coreData?.colors || { primary: '#1C2E5B', secondary: '#B22234', accent: '#FFFFFF', background: '#F5F5F5', text: '#333333' };
  }, [state.colorMode, state.customColors, coreData]);

  const selectedHeading = state.customFonts?.heading || '';
  const selectedBody = state.customFonts?.body || '';

  // Find which preset is active (if any)
  const activePresetId = useMemo(() => {
    if (!selectedHeading || !selectedBody) return null;
    const match = presets.find(p => p.heading === selectedHeading && p.body === selectedBody);
    return match ? match.id : null;
  }, [selectedHeading, selectedBody, presets]);

  // Load all fonts for the active brand core's presets on mount/core change
  useEffect(() => {
    if (presets.length > 0) loadPresetFonts(presets);
  }, [state.brandCore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select recommended preset if nothing selected yet
  useEffect(() => {
    if (!selectedHeading && !selectedBody && presets.length > 0) {
      const rec = presets.find(p => p.recommended) || presets[0];
      dispatch({ type: 'SET_CUSTOM_FONTS', payload: { heading: rec.heading, body: rec.body } });
    }
  }, [state.brandCore]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPreset = useCallback((preset) => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { heading: preset.heading, body: preset.body } });
  }, [dispatch]);

  const candidateName = state.candidate?.fullName || 'John Smith';
  const office = state.candidate?.office || 'Senate';
  const officeLabel = office.charAt(0).toUpperCase() + office.slice(1).replace(/-/g, ' ');

  const previewHeading = selectedHeading || (presets[0]?.heading ?? '');
  const previewBody = selectedBody || (presets[0]?.body ?? '');
  const activePreset = presets.find(p => p.heading === previewHeading && p.body === previewBody);

  if (!coreData) {
    return (
      <StageContainer title="Choose Your Fonts" subtitle="Select a typography style for your campaign brand." stageNumber={6}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg" style={{ color: '#1C2E5B', opacity: 0.6 }}>Please complete the previous stages first.</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer
      title="Choose Your Typography"
      subtitle={`Select the font pairing that best fits your ${coreData.name} brand.`}
      stageNumber={6}
    >
      <div className="space-y-10">

        {/* ── Preset Grid ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#6B7280' }}>
            Font Pairings for {coreData.name}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {presets.map((preset, i) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onClick={() => handleSelectPreset(preset)}
                activeColors={activeColors}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* ── Live Preview ── */}
        <AnimatePresence mode="wait">
          {previewHeading && previewBody && (
            <motion.div
              key={`${previewHeading}-${previewBody}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
                Live Preview
              </p>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* Preview header */}
                <div className="px-6 py-5" style={{ backgroundColor: activeColors.primary }}>
                  <h2
                    style={{
                      fontFamily: `'${previewHeading}', serif`,
                      fontWeight: activePreset?.headingWeight || 700,
                      fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                      color: activeColors.accent || '#FFFFFF',
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    {candidateName.toUpperCase()} FOR {officeLabel.toUpperCase()}
                  </h2>
                </div>
                {/* Preview body */}
                <div className="px-6 py-5" style={{ backgroundColor: activeColors.background || '#F5F5F5' }}>
                  <p
                    style={{
                      fontFamily: `'${previewBody}', sans-serif`,
                      fontWeight: activePreset?.bodyWeight || 400,
                      fontSize: 15,
                      color: activeColors.text || '#333333',
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    Fighting for our community's future. Join us in building a stronger tomorrow for every family in our state.
                  </p>
                  <span
                    style={{
                      fontFamily: `'${previewHeading}', serif`,
                      fontWeight: activePreset?.headingWeight || 700,
                      fontSize: 13,
                      display: 'inline-block',
                      padding: '10px 20px',
                      borderRadius: 8,
                      backgroundColor: activeColors.secondary,
                      color: textOnColor(activeColors.secondary),
                    }}
                  >
                    Get Involved
                  </span>
                </div>
                {/* Font labels */}
                <div className="px-6 py-3 bg-white border-t border-gray-200 flex flex-wrap gap-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColors.secondary }} />
                    <span className="text-xs text-gray-500">
                      Heading: <strong style={{ fontFamily: `'${previewHeading}', serif` }}>{previewHeading}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColors.primary }} />
                    <span className="text-xs text-gray-500">
                      Body: <strong style={{ fontFamily: `'${previewBody}', sans-serif` }}>{previewBody}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </StageContainer>
  );
}
