import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import StageContainer from '../StageContainer';
import AnimatedCheckmark from '../AnimatedCheckmark';

/* ── Font Options ── */
const HEADING_FONT_OPTIONS = [
  { name: 'Playfair Display', category: 'Serif Display' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Oswald', category: 'Sans-Serif Condensed' },
  { name: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Libre Baskerville', category: 'Serif' },
];

const BODY_FONT_OPTIONS = [
  { name: 'Open Sans', category: 'Sans-Serif' },
  { name: 'Lato', category: 'Sans-Serif' },
  { name: 'Source Sans Pro', category: 'Sans-Serif' },
  { name: 'Roboto', category: 'Sans-Serif' },
  { name: 'Nunito', category: 'Sans-Serif' },
];

const ALL_SELECTION_FONTS = [
  ...HEADING_FONT_OPTIONS.map((f) => f.name),
  ...BODY_FONT_OPTIONS.map((f) => f.name),
];

const SAMPLE_SENTENCE = 'The quick brown fox jumps over the lazy dog';

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

  const selectedHeading = state.customFonts?.heading || null;
  const selectedBody = state.customFonts?.body || null;

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

  /* Load Google Fonts via style tag with @import */
  useEffect(() => {
    const id = 'font-selection-google-fonts';
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const families = ALL_SELECTION_FONTS.map((f) => {
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
  }, []);

  const handleSelectHeading = (fontName) => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { heading: fontName } });
  };

  const handleSelectBody = (fontName) => {
    dispatch({ type: 'SET_CUSTOM_FONTS', payload: { body: fontName } });
  };

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
      <div className="space-y-12">
        {/* Heading Font Section */}
        <div>
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: '#1C2E5B' }}
          >
            Heading Font
          </h3>
          <div className="space-y-3">
            {HEADING_FONT_OPTIONS.map((font) => {
              const isSelected = selectedHeading === font.name;
              return (
                <motion.button
                  key={font.name}
                  onClick={() => handleSelectHeading(font.name)}
                  whileTap={{ scale: 0.995 }}
                  className="w-full text-left rounded-xl px-6 py-5 transition-colors duration-150"
                  style={{
                    backgroundColor: isSelected ? '#FEF2F2' : '#F9FAFB',
                    border: '1px solid',
                    borderColor: isSelected ? '#FEF2F2' : '#E5E7EB',
                    borderLeftWidth: '4px',
                    borderLeftColor: isSelected ? '#8B1A2B' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-base font-bold"
                        style={{
                          fontFamily: `'${font.name}', serif`,
                          color: '#1C2E5B',
                        }}
                      >
                        {font.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                        {font.category}
                      </span>
                    </div>
                    {isSelected && (
                      <AnimatedCheckmark color="#8B1A2B" size={22} />
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: `'${font.name}', serif`,
                      color: '#6B7280',
                    }}
                  >
                    {SAMPLE_SENTENCE}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Body Font Section */}
        <div>
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: '#1C2E5B' }}
          >
            Body Font
          </h3>
          <div className="space-y-3">
            {BODY_FONT_OPTIONS.map((font) => {
              const isSelected = selectedBody === font.name;
              return (
                <motion.button
                  key={font.name}
                  onClick={() => handleSelectBody(font.name)}
                  whileTap={{ scale: 0.995 }}
                  className="w-full text-left rounded-xl px-6 py-5 transition-colors duration-150"
                  style={{
                    backgroundColor: isSelected ? '#FEF2F2' : '#F9FAFB',
                    border: '1px solid',
                    borderColor: isSelected ? '#FEF2F2' : '#E5E7EB',
                    borderLeftWidth: '4px',
                    borderLeftColor: isSelected ? '#8B1A2B' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-base font-bold"
                        style={{
                          fontFamily: `'${font.name}', sans-serif`,
                          color: '#1C2E5B',
                        }}
                      >
                        {font.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                        {font.category}
                      </span>
                    </div>
                    {isSelected && (
                      <AnimatedCheckmark color="#8B1A2B" size={22} />
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: `'${font.name}', sans-serif`,
                      color: '#6B7280',
                    }}
                  >
                    {SAMPLE_SENTENCE}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Live Preview */}
        {selectedHeading && selectedBody && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#1C2E5B', opacity: 0.7 }}>
              Live Preview
            </p>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              {/* Preview header bar */}
              <div
                className="px-8 py-6"
                style={{ backgroundColor: activeColors.primary }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                  style={{
                    fontFamily: `'${selectedBody}', sans-serif`,
                    color: activeColors.secondary,
                  }}
                >
                  Paid for by Friends of {candidateName}
                </p>
                <h2
                  className="text-3xl md:text-4xl leading-tight"
                  style={{
                    fontFamily: `'${selectedHeading}', serif`,
                    fontWeight: 700,
                    color: activeColors.accent || '#FFFFFF',
                  }}
                >
                  Fighting for Our Community's Future
                </h2>
              </div>
              {/* Preview body */}
              <div
                className="px-8 py-6"
                style={{ backgroundColor: activeColors.background || '#F5F5F5' }}
              >
                <p
                  className="text-base md:text-lg leading-relaxed mb-4"
                  style={{
                    fontFamily: `'${selectedBody}', sans-serif`,
                    color: activeColors.text || '#333333',
                  }}
                >
                  Every family in our district deserves leadership that listens, acts, and delivers real results.
                  Together we can build a stronger, safer, and more prosperous community for our children and grandchildren.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: `'${selectedBody}', sans-serif`,
                    color: activeColors.text || '#333333',
                    opacity: 0.7,
                  }}
                >
                  Join us at the town hall this Saturday to hear the plan and ask questions.
                  Your voice matters, and this campaign is built on neighbors helping neighbors.
                </p>
                <div className="mt-6 flex gap-3">
                  <span
                    className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
                    style={{
                      fontFamily: `'${selectedHeading}', serif`,
                      backgroundColor: activeColors.secondary,
                      color: textOnColor(activeColors.secondary),
                    }}
                  >
                    Get Involved
                  </span>
                  <span
                    className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
                    style={{
                      fontFamily: `'${selectedHeading}', serif`,
                      backgroundColor: activeColors.primary,
                      color: textOnColor(activeColors.primary),
                    }}
                  >
                    Donate
                  </span>
                </div>
              </div>
              {/* Preview footer with font labels */}
              <div className="px-8 py-4 bg-white border-t border-gray-200 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B1A2B' }} />
                  <span className="text-xs text-gray-500">
                    Heading: <strong style={{ fontFamily: `'${selectedHeading}', serif` }}>{selectedHeading}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1C2E5B' }} />
                  <span className="text-xs text-gray-500">
                    Body: <strong style={{ fontFamily: `'${selectedBody}', sans-serif` }}>{selectedBody}</strong>
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
