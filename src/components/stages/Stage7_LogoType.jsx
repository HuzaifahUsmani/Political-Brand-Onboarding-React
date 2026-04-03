import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import StageContainer from '../StageContainer';

/* ── Design tokens ── */
const accent = '#8B1A2B';
const navy = '#1C2E5B';

/* ── Keyframes ── */
const keyframes = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Logo Type Data ── */
const LOGO_TYPES = [
  {
    id: 'emblem',
    name: 'Emblem',
    description: 'Classic seal or badge design — circular, authoritative, and timeless. Ideal for official-feeling campaigns.',
    image: '/logos/emblem.png',
  },
  {
    id: 'symbol-text',
    name: 'Symbol + Text',
    description: 'An iconic symbol paired with the candidate name. Versatile and modern, great for yard signs and digital.',
    image: '/logos/symbol-text.png',
  },
  {
    id: 'monogram',
    name: 'Monogram',
    description: 'Stylized initials that create a bold, memorable mark. Clean and contemporary with strong brand recall.',
    image: '/logos/monogram.png',
  },
  {
    id: 'wordmark',
    name: 'Wordmark',
    description: 'Pure typographic treatment of the candidate name. Elegant, direct, and lets the name speak for itself.',
    image: '/logos/wordmark.png',
  },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export default function Stage7_LogoType() {
  const { state, dispatch } = useBrand();
  const selected = state.logoType;

  const handleSelect = (id) => {
    dispatch({ type: 'SET_LOGO_TYPE', payload: id });
  };

  return (
    <StageContainer
      title="Logo Style"
      subtitle="Choose the type of logo that best represents your campaign's visual identity."
      stageNumber={7}
    >
      <style>{keyframes}</style>

      {/* ── Heading section ── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 28,
            fontWeight: 700,
            color: navy,
            margin: '0 0 8px',
            letterSpacing: 1,
          }}
        >
          Select Your Logo Type
        </h2>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 15,
            color: '#6B7280',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          Each style communicates a different kind of authority and personality
        </p>
        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, opacity: 0.5 }} />
          <div style={{ width: 40, height: 1, background: accent, opacity: 0.3 }} />
        </div>
      </div>

      {/* ── Logo type cards — single column, full-width image ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {LOGO_TYPES.map((logoType, index) => {
          const isSelected = selected === logoType.id;

          return (
            <motion.div
              key={logoType.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => handleSelect(logoType.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                position: 'relative',
                background: isSelected ? '#FFF9FA' : '#FFFFFF',
                border: `2px solid ${isSelected ? accent : '#E5E7EB'}`,
                borderRadius: 16,
                cursor: 'pointer',
                boxShadow: isSelected
                  ? `0 6px 24px rgba(139,26,43,0.18), 0 0 0 1px ${accent}`
                  : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
                overflow: 'hidden',
              }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(139,26,43,0.35)',
                    zIndex: 2,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7.5L5.5 10L11 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Logo reference image */}
              <div
                style={{
                  background: '#FAFAFA',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 180,
                  overflow: 'hidden',
                  borderBottom: `1px solid ${isSelected ? 'rgba(139,26,43,0.12)' : '#F0F0F0'}`,
                }}
              >
                <img
                  src={logoType.image}
                  alt={`${logoType.name} logo examples`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Text content */}
              <div style={{ padding: '18px 24px 20px' }}>
                <h3
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 20,
                    fontWeight: 700,
                    color: isSelected ? accent : navy,
                    margin: '0 0 6px',
                    transition: 'color 0.25s',
                  }}
                >
                  {logoType.name}
                </h3>

                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#6B7280',
                    margin: 0,
                  }}
                >
                  {logoType.description}
                </p>
              </div>

              {/* Bottom accent bar when selected */}
              {isSelected && (
                <motion.div
                  layoutId="selectedBar"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: accent,
                    borderRadius: '0 0 14px 14px',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Hover style for image zoom */}
      <style>{`
        .logo-preview-img:hover {
          transform: scale(1.03);
        }
      `}</style>
    </StageContainer>
  );
}
