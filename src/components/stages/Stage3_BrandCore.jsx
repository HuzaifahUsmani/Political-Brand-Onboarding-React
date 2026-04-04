import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { BRAND_CORES } from '../../data/brandData';
import StageContainer from '../StageContainer';
import AnimatedCheckmark from '../AnimatedCheckmark';
import { ShieldAlert, Flag, Flame, Users, Crown } from 'lucide-react';

const BRAND_KEYS = ['commander', 'patriot', 'reformer', 'community', 'executive'];

const CORE_GRADIENTS = {
  commander: 'linear-gradient(135deg, #1C2E5B 0%, #2a4178 50%, #1C2E5B 100%)',
  patriot:   'linear-gradient(135deg, #1A2744 0%, #2d3f5e 50%, #1A2744 100%)',
  reformer:  'linear-gradient(135deg, #0D0D0D 0%, #2a2a2a 50%, #0D0D0D 100%)',
  community: 'linear-gradient(135deg, #2C4A7C 0%, #4a6fa0 50%, #2C4A7C 100%)',
  executive: 'linear-gradient(135deg, #1C2E5B 0%, #2a4178 50%, #1C2E5B 100%)',
};

const BRAND_ICONS = {
  commander: <ShieldAlert size={28} />,
  patriot:   <Flag size={28} />,
  reformer:  <Flame size={28} />,
  community: <Users size={28} />,
  executive: <Crown size={28} />,
};

/* ── Google Font Loader ── */
const loadedFonts = new Set();
function loadBrandFont(fontName) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@700;900&display=swap`;
  document.head.appendChild(link);
}

export default function Stage3_BrandCore() {
  const { state, dispatch } = useBrand();
  const [hoveredId, setHoveredId] = useState(null);
  const selectedId = state.brandCore;
  const previewRef = useRef(null);

  // Pre-load all brand fonts on mount
  useEffect(() => {
    Object.values(BRAND_CORES).forEach(core => loadBrandFont(core.fonts?.heading));
  }, []);

  const selectBrand = (id) => {
    const newId = id === selectedId ? null : id;
    dispatch({ type: 'SET_BRAND_CORE', payload: newId });
    if (newId) {
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
  };

  return (
    <StageContainer
      stageNumber={3}
      title="Choose Your Brand Core"
      subtitle="This is the defining moment. Select the brand archetype that best represents the candidate's identity and campaign."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {BRAND_KEYS.map((key, index) => {
          const brand = BRAND_CORES[key];
          const isSelected = selectedId === key;
          const isHovered = hoveredId === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              onClick={() => selectBrand(key)}
              onMouseEnter={() => setHoveredId(key)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={!isSelected ? {
                y: -2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              } : {}}
              style={{
                position: 'relative',
                cursor: 'pointer',
                padding: 24,
                background: isSelected ? '#FEF2F2' : '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: isSelected ? '4px solid #8B1A2B' : '1px solid #E5E7EB',
                borderRadius: 8,
                boxShadow: isSelected
                  ? '0 1px 3px rgba(0,0,0,0.08)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'background 0.2s ease, border 0.2s ease',
              }}
            >
              {/* Checkmark indicator top-right */}
              <AnimatePresence>
                {isSelected && (
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

              {/* Icon + Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <span style={{ color: isSelected ? '#8B1A2B' : '#1C2E5B', flexShrink: 0 }}>
                  {BRAND_ICONS[key]}
                </span>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1C2E5B',
                  margin: 0,
                }}>
                  {brand.name}
                </h3>
              </div>

              {/* Descriptor */}
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#6B7280',
                margin: 0,
                marginBottom: 8,
              }}>
                {brand.descriptor}
              </p>

              {/* Tagline */}
              <p style={{
                fontSize: '0.95rem',
                fontStyle: 'italic',
                color: '#4B5563',
                margin: 0,
                marginBottom: 12,
              }}>
                &ldquo;{brand.tagline}&rdquo;
              </p>

              {/* Positioning statement */}
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 400,
                color: '#374151',
                margin: 0,
                marginBottom: 12,
                lineHeight: 1.6,
              }}>
                {brand.positioning}
              </p>

              {/* Best-for text from subDirections */}
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 400,
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 600, color: '#4B5563' }}>Best for: </span>
                {(brand.subDirections || []).map((sd) => sd.bestFor).join(' · ')}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Selected brand core banner */}
      <AnimatePresence mode="wait">
        {selectedId && (
          <motion.div
            ref={previewRef}
            key={selectedId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              marginTop: 24,
              padding: '36px 40px',
              background: CORE_GRADIENTS[selectedId],
              borderRadius: 20,
            }}
          >
            {/* Subtle diagonal line texture */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)`,
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              {/* Descriptor as label */}
              <p style={{
                fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.2em', color: '#D4A843',
                margin: '0 0 12px',
              }}>
                {BRAND_CORES[selectedId].descriptor}
              </p>

              {/* Giant brand name using brand font */}
              <h2 style={{
                fontFamily: `'${BRAND_CORES[selectedId].fonts?.heading}', sans-serif`,
                fontSize: 'clamp(3rem, 12vw, 6rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 0.9,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
              }}>
                {BRAND_CORES[selectedId].name}
              </h2>

              {/* Tagline */}
              <p style={{
                marginTop: 14,
                fontSize: '0.9rem',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.92)',
                margin: '14px 0 0',
              }}>
                &ldquo;{BRAND_CORES[selectedId].tagline}&rdquo;
              </p>

              {/* Color dots row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
                {[
                  BRAND_CORES[selectedId].colors.primary,
                  BRAND_CORES[selectedId].colors.secondary,
                  BRAND_CORES[selectedId].colors.accent,
                ].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    backgroundColor: c,
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StageContainer>
  );
}
