import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import StageContainer from '../StageContainer';

/* ── Font Options ── */
const HEADING_FONT_OPTIONS = [
  { name: 'Playfair Display', category: 'Serif Display' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Oswald', category: 'Sans-Serif Condensed' },
  { name: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Libre Baskerville', category: 'Serif' },
  { name: 'Lora', category: 'Serif' },
  { name: 'Raleway', category: 'Sans-Serif' },
  { name: 'Poppins', category: 'Sans-Serif' },
];

const BODY_FONT_OPTIONS = [
  { name: 'Open Sans', category: 'Sans-Serif' },
  { name: 'Lato', category: 'Sans-Serif' },
  { name: 'Source Sans Pro', category: 'Sans-Serif' },
  { name: 'Roboto', category: 'Sans-Serif' },
  { name: 'Nunito', category: 'Sans-Serif' },
  { name: 'Inter', category: 'Sans-Serif' },
  { name: 'Work Sans', category: 'Sans-Serif' },
  { name: 'PT Sans', category: 'Sans-Serif' },
];

const ALL_SELECTION_FONTS = [
  ...new Set([
    ...HEADING_FONT_OPTIONS.map((f) => f.name),
    ...BODY_FONT_OPTIONS.map((f) => f.name),
  ]),
];

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function textOnColor(bgHex) {
  return luminance(bgHex) > 0.55 ? '#1a1a1a' : '#ffffff';
}

export default function Stage6_FontSelection() {
  const { state, dispatch } = useBrand();
  const coreData = state.brandCore ? BRAND_CORES[state.brandCore] : null;

  const selectedHeading = state.customFonts?.heading || '';
  const selectedBody = state.customFonts?.body || '';

  const recommendedHeading = coreData?.fonts?.heading || '';
  const recommendedBody = coreData?.fonts?.body || '';

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

  const candidateName = state.candidate?.fullName || 'John Smith';
  const candidateNameUpper = candidateName.toUpperCase();
  const office = state.candidate?.office || 'Senate';
  const officeLabel = office.charAt(0).toUpperCase() + office.slice(1).replace(/-/g, ' ');

  /* Load Google Fonts via style tag with @import */
  useEffect(() => {
    const id = 'font-selection-google-fonts';
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    // Also include recommended fonts from brandCore if not already in the list
    const allFonts = [...new Set([...ALL_SELECTION_FONTS, recommendedHeading, recommendedBody].filter(Boolean))];

    const families = allFonts.map((f) => {
      const meta = FONT_LIBRARY[f];
      const weights = meta?.weights?.join(';') || '400;700';
      return `family=${f.replace(/\s/g, '+')}:wght@${weights}`;
    }).join('&');

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');`;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [recommendedHeading, recommendedBody]);

  const handleSelectHeading = (fontName) => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { heading: fontName } });
  };

  const handleSelectBody = (fontName) => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { body: fontName } });
  };

  const handleUseRecommended = () => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { heading: recommendedHeading, body: recommendedBody } });
  };

  const isRecommendedActive = selectedHeading === recommendedHeading && selectedBody === recommendedBody;

  // For preview, use selected or fall back to recommended
  const previewHeading = selectedHeading || recommendedHeading;
  const previewBody = selectedBody || recommendedBody;

  if (!coreData) {
    return (
      <StageContainer title="Choose Your Fonts" subtitle="Select a heading font and a body font for your campaign brand." stageNumber={6}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg" style={{ color: '#1C2E5B', opacity: 0.6 }}>Please complete the previous stages first.</p>
        </div>
      </StageContainer>
    );
  }

  return (
    <StageContainer
      title="Choose Your Fonts"
      subtitle="Select a heading font and a body font for your campaign brand."
      stageNumber={6}
    >
      <div className="space-y-8">

        {/* ── Recommended Font Pair ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
            Recommended for {coreData.name}
          </p>
          <div
            className="rounded-xl border px-6 py-5"
            style={{
              borderColor: isRecommendedActive ? activeColors.primary : '#E5E7EB',
              backgroundColor: isRecommendedActive ? `${activeColors.primary}08` : '#FAFAFA',
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 block">Heading</span>
                    <span
                      className="text-lg font-bold"
                      style={{ fontFamily: `'${recommendedHeading}', serif`, color: '#1C2E5B' }}
                    >
                      {recommendedHeading}
                    </span>
                  </div>
                  <span className="text-gray-300">+</span>
                  <div>
                    <span className="text-xs text-gray-400 block">Body</span>
                    <span
                      className="text-base"
                      style={{ fontFamily: `'${recommendedBody}', sans-serif`, color: '#1C2E5B' }}
                    >
                      {recommendedBody}
                    </span>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: `'${recommendedBody}', sans-serif`, color: '#6B7280' }}
                >
                  <span style={{ fontFamily: `'${recommendedHeading}', serif`, fontWeight: 700, fontSize: '1rem' }}>
                    Bold leadership starts here.
                  </span>{' '}
                  This pairing was chosen to match the tone and personality of your brand direction.
                </p>
              </div>
              <button
                onClick={handleUseRecommended}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: isRecommendedActive ? activeColors.primary : '#F3F4F6',
                  color: isRecommendedActive ? textOnColor(activeColors.primary) : '#374151',
                  border: isRecommendedActive ? 'none' : '1px solid #D1D5DB',
                }}
              >
                {isRecommendedActive ? 'Selected' : 'Use Recommended'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Or Choose Your Own ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
            Or choose your own
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heading Font Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Heading Font
              </label>
              <select
                value={selectedHeading}
                onChange={(e) => handleSelectHeading(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  fontFamily: selectedHeading ? `'${selectedHeading}', serif` : 'inherit',
                  focusRingColor: activeColors.primary,
                }}
              >
                <option value="">Select a heading font...</option>
                {HEADING_FONT_OPTIONS.map((font) => (
                  <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}', serif` }}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Body Font Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Body Font
              </label>
              <select
                value={selectedBody}
                onChange={(e) => handleSelectBody(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  fontFamily: selectedBody ? `'${selectedBody}', sans-serif` : 'inherit',
                }}
              >
                <option value="">Select a body font...</option>
                {BODY_FONT_OPTIONS.map((font) => (
                  <option key={font.name} value={font.name} style={{ fontFamily: `'${font.name}', sans-serif` }}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* ── Live Preview ── */}
        {previewHeading && previewBody && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B7280' }}>
              Live Preview
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              {/* Preview header */}
              <div className="px-6 py-5" style={{ backgroundColor: activeColors.primary }}>
                <h2
                  className="text-2xl md:text-3xl leading-tight"
                  style={{
                    fontFamily: `'${previewHeading}', serif`,
                    fontWeight: 700,
                    color: activeColors.accent || '#FFFFFF',
                  }}
                >
                  {candidateNameUpper} FOR {officeLabel.toUpperCase()}
                </h2>
              </div>
              {/* Preview body */}
              <div className="px-6 py-5" style={{ backgroundColor: activeColors.background || '#F5F5F5' }}>
                <p
                  className="text-base leading-relaxed mb-4"
                  style={{
                    fontFamily: `'${previewBody}', sans-serif`,
                    color: activeColors.text || '#333333',
                  }}
                >
                  Fighting for our community's future. Join us in building a stronger tomorrow for every family in our state.
                </p>
                <span
                  className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
                  style={{
                    fontFamily: `'${previewHeading}', serif`,
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
      </div>
    </StageContainer>
  );
}
