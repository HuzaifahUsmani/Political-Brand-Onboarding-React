import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES, FONT_LIBRARY } from '../../data/brandData';
import StageContainer from '../StageContainer';
import TiltCard from '../TiltCard';
import AnimatedCheckmark from '../AnimatedCheckmark';

const coreStyleMap = {
  commander: {
    gradient: 'linear-gradient(135deg, #1C2E5B 0%, #2a4178 50%, #1C2E5B 100%)',
    cardGradient: 'linear-gradient(160deg, rgba(28,46,91,0.06) 0%, rgba(178,34,52,0.04) 100%)',
    selectedCardBg: '#1C2E5B',
    selectedTextColor: '#FFFFFF',
    numberBg: '#B22234',
    hoverBorder: '#B22234',
  },
  patriot: {
    gradient: 'linear-gradient(135deg, #1A2744 0%, #2d3f5e 50%, #1A2744 100%)',
    cardGradient: 'linear-gradient(160deg, rgba(26,39,68,0.05) 0%, rgba(212,197,169,0.08) 100%)',
    selectedCardBg: '#1A2744',
    selectedTextColor: '#FAF8F5',
    numberBg: '#8B1A2B',
    hoverBorder: '#8B1A2B',
  },
  reformer: {
    gradient: 'linear-gradient(135deg, #0D0D0D 0%, #2a2a2a 50%, #0D0D0D 100%)',
    cardGradient: 'linear-gradient(160deg, rgba(13,13,13,0.04) 0%, rgba(204,32,41,0.05) 100%)',
    selectedCardBg: '#0D0D0D',
    selectedTextColor: '#FFFFFF',
    numberBg: '#CC2029',
    hoverBorder: '#CC2029',
  },
  community: {
    gradient: 'linear-gradient(135deg, #2C4A7C 0%, #4a6fa0 50%, #2C4A7C 100%)',
    cardGradient: 'linear-gradient(160deg, rgba(44,74,124,0.05) 0%, rgba(232,220,200,0.1) 100%)',
    selectedCardBg: '#2C4A7C',
    selectedTextColor: '#FFF9F0',
    numberBg: '#C74B50',
    hoverBorder: '#C74B50',
  },
  executive: {
    gradient: 'linear-gradient(135deg, #1C2E5B 0%, #2a4178 50%, #1C2E5B 100%)',
    cardGradient: 'linear-gradient(160deg, rgba(28,46,91,0.04) 0%, rgba(184,134,11,0.06) 100%)',
    selectedCardBg: '#1C2E5B',
    selectedTextColor: '#F7F7F7',
    numberBg: '#B8860B',
    hoverBorder: '#B8860B',
  },
};

/* ── Decorative SVG dot pattern ── */
function DecorativeDots({ style }) {
  return (
    <svg
      width="200" height="200"
      style={{ position: 'absolute', pointerEvents: 'none', opacity: 0.04, ...style }}
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 20 + 10} cy={row * 20 + 10} r={2} fill="#1C2E5B" />
        ))
      )}
    </svg>
  );
}

/* ── Gradient heading style helper ── */
const gradientHeadingStyle = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

export default function Stage4_SubDirection() {
  const { state, dispatch } = useBrand();
  const brandCore = state.brandCore;
  const coreData = brandCore ? BRAND_CORES[brandCore] : null;
  const styles = brandCore ? coreStyleMap[brandCore] : null;

  // Load Google Font for the brand's heading font
  useEffect(() => {
    if (!coreData) return;
    const fontName = coreData.fonts.heading;
    const fontData = FONT_LIBRARY[fontName];
    const weights = fontData ? fontData.weights.join(';') : '400;700';
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@${weights}&display=swap`;

    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }, [coreData]);

  if (!coreData) {
    return (
      <StageContainer title="Sub-Direction" subtitle="Refine your brand personality" stageNumber={4}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg" style={{ opacity: 0.6 }}>No Brand Core selected</p>
          <p className="text-sm" style={{ opacity: 0.5 }}>Please go back and choose a Brand Core first.</p>
        </div>
      </StageContainer>
    );
  }

  const subDirections = coreData.subDirections;

  return (
    <StageContainer
      title="Choose Your Sub-Direction"
      subtitle={`Refine the visual personality and tone of your ${coreData.name} brand.`}
      stageNumber={4}
    >
      {/* Brand Core Identity Banner — rounded 40px container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden mb-10 p-6 md:p-8"
        style={{ background: styles.gradient, borderRadius: 20 }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)`,
          }}
        />
        {/* Decorative dots in banner */}
        <DecorativeDots style={{ top: -40, right: -40, opacity: 0.06 }} />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] mb-2"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: `'${coreData.fonts.body}', sans-serif` }}>
              Your Brand Core
            </p>
            <h2
              className="text-3xl md:text-4xl tracking-tight"
              style={{
                fontFamily: `'${coreData.fonts.heading}', sans-serif`,
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              {coreData.name}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.65)', fontFamily: `'${coreData.fonts.body}', sans-serif` }}>
              {coreData.descriptor} &mdash; {coreData.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[coreData.colors.primary, coreData.colors.secondary, coreData.colors.accent].map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sub-Direction Grid — rounded 40px container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ borderRadius: 24, background: 'white', padding: 'clamp(16px, 4vw, 40px)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}
      >
        {/* Decorative background patterns */}
        <DecorativeDots style={{ top: -20, left: -20 }} />
        <DecorativeDots style={{ bottom: -20, right: -20 }} />

        {/* Section heading with gradient */}
        <h2 style={{ ...gradientHeadingStyle, fontSize: '1.5rem', fontWeight: 800, marginBottom: 24, display: 'inline-block' }}>
          Refine Your Direction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ position: 'relative', zIndex: 1 }}>
          {subDirections.map((sub, index) => {
            const isSelected = state.subDirection === sub.id;
            const isLastOdd = index === subDirections.length - 1 && subDirections.length % 2 === 1;

            return (
              <TiltCard
                key={sub.id}
                onClick={() => dispatch({ type: 'SET_SUB_DIRECTION', payload: sub.id })}
                className={`
                  relative text-left rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer group
                  ${isLastOdd ? 'md:col-span-2 md:max-w-[calc(50%-0.625rem)] md:mx-auto' : ''}
                `}
                style={{
                  background: isSelected ? styles.selectedCardBg : '#FFFFFF',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                }}
              >
                {/* Top accent strip */}
                <div className="h-1.5 w-full" style={{ background: styles.numberBg }} />

                {/* Card gradient overlay when not selected */}
                {!isSelected && (
                  <div className="absolute inset-0 top-1.5 opacity-100 pointer-events-none"
                    style={{ background: styles.cardGradient }} />
                )}

                <div className="relative p-5 md:p-6">
                  {/* Number + Title row */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-500"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : styles.numberBg,
                        color: '#FFFFFF',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg md:text-xl leading-tight transition-colors duration-500"
                        style={{
                          fontFamily: `'${coreData.fonts.heading}', sans-serif`,
                          fontWeight: 700,
                          color: isSelected ? styles.selectedTextColor : coreData.colors.primary,
                        }}
                      >
                        {sub.name}
                      </h3>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 20 }}>
                        <AnimatedCheckmark size={24} color={isSelected ? styles.selectedTextColor : (coreData.colors.secondary || '#8B1A2B')} />
                      </div>
                    )}
                  </div>

                  {/* Description — opacity-based text hierarchy */}
                  <p
                    className="text-sm leading-relaxed mb-4 transition-colors duration-500"
                    style={{
                      color: isSelected ? styles.selectedTextColor : coreData.colors.text,
                      opacity: isSelected ? 0.75 : 0.6,
                    }}
                  >
                    {sub.desc}
                  </p>

                  {/* Visual personality as inline italic quote */}
                  <p
                    className="text-xs italic leading-relaxed mb-4 pl-3 transition-colors duration-500"
                    style={{
                      borderLeft: `2px solid ${isSelected ? `${styles.selectedTextColor}30` : `${coreData.colors.secondary}40`}`,
                      color: isSelected ? styles.selectedTextColor : coreData.colors.text,
                      opacity: isSelected ? 0.6 : 0.5,
                    }}
                  >
                    {sub.visual}
                  </p>

                  {/* Best For — opacity-based label */}
                  <div className="flex items-center gap-2 pt-3 transition-colors duration-500"
                    style={{ borderTop: `1px solid ${isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}
                  >
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ color: isSelected ? `${styles.selectedTextColor}70` : coreData.colors.secondary }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p
                      className="text-xs transition-colors duration-500"
                      style={{
                        color: isSelected ? styles.selectedTextColor : coreData.colors.text,
                        opacity: 0.7,
                      }}
                    >
                      {sub.bestFor}
                    </p>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </motion.div>

      {/* Selection confirmation */}
      <AnimatePresence>
        {state.subDirection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 text-center"
          >
            <p className="text-sm" style={{ opacity: 0.7 }}>
              Selected:{' '}
              <span className="font-semibold" style={{ color: coreData.colors.primary }}>
                {subDirections.find(s => s.id === state.subDirection)?.name}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </StageContainer>
  );
}
