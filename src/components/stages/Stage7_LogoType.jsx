import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import StageContainer from '../StageContainer';

/* ── Design tokens ── */
const accent = '#8B1A2B';
const navy = '#1C2E5B';

/* ── Gradient style for headings ── */
const headingGradient = {
  background: 'linear-gradient(135deg, #1C2E5B, #8B1A2B)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/* ── Decorative SVG dot pattern ── */
function DecorativeDots({ style }) {
  return (
    <svg
      style={{
        position: 'absolute',
        opacity: 0.04,
        pointerEvents: 'none',
        ...style,
      }}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 20 + 10}
            cy={row * 20 + 10}
            r="2"
            fill={navy}
          />
        ))
      )}
    </svg>
  );
}

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
    image: '/logos/emblem.webp',
  },
  {
    id: 'symbol-text',
    name: 'Symbol + Text',
    description: 'An iconic symbol paired with the candidate name. Versatile and modern, great for yard signs and digital.',
    image: '/logos/symbol-text.webp',
    cropTop: true,
  },
  {
    id: 'monogram',
    name: 'Monogram',
    description: 'Stylized initials that create a bold, memorable mark. Clean and contemporary with strong brand recall.',
    image: '/logos/monogram.webp',
  },
  {
    id: 'wordmark',
    name: 'Wordmark',
    description: 'Pure typographic treatment of the candidate name. Elegant, direct, and lets the name speak for itself.',
    image: '/logos/wordmark.webp',
  },
];

/* ── Floating animation for mockup cards ── */
const floatAnimation = {
  y: [0, -6, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

/* ── Wrapper card for each campaign mockup ── */
function CampaignMockupCard({ index, label, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.05 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <motion.div animate={floatAnimation} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </motion.div>
      <span
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 14,
          fontWeight: 600,
          color: navy,
          opacity: 0.7,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

/* ── Yard Sign SVG Mockup ── */
function YardSignMockup({ name, office }) {
  const displayName = name.length > 16 ? name.split(' ').pop() : name;
  return (
    <svg viewBox="0 0 280 220" width="100%" style={{ maxWidth: 280 }}>
      {/* Grass */}
      <rect x="0" y="185" width="280" height="35" fill="#4A7C3F" rx="2" />
      <ellipse cx="30" cy="185" rx="18" ry="4" fill="#5A9C4F" />
      <ellipse cx="120" cy="188" rx="22" ry="5" fill="#5A9C4F" />
      <ellipse cx="230" cy="186" rx="16" ry="4" fill="#5A9C4F" />
      {/* Metal stakes (H-frame) */}
      <rect x="80" y="140" width="4" height="60" fill="#999" rx="1" />
      <rect x="196" y="140" width="4" height="60" fill="#999" rx="1" />
      <rect x="80" y="160" width="120" height="3" fill="#999" rx="1" />
      {/* Sign body */}
      <rect x="40" y="20" width="200" height="125" rx="6" fill="#1C2E5B" />
      {/* Red accent stripe */}
      <rect x="40" y="20" width="200" height="8" rx="6" ry="6" fill="#B22234" />
      <rect x="40" y="24" width="200" height="4" fill="#B22234" />
      {/* Candidate name */}
      <text
        x="140"
        y="75"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={displayName.length > 12 ? 20 : 26}
        fontWeight="bold"
        fill="white"
        letterSpacing="1"
      >
        {displayName.toUpperCase()}
      </text>
      {/* FOR OFFICE */}
      <text
        x="140"
        y="100"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fill="white"
        opacity="0.85"
        letterSpacing="2"
      >
        {'FOR ' + office.toUpperCase()}
      </text>
      {/* Bottom red accent */}
      <rect x="90" y="115" width="100" height="3" rx="1.5" fill="#B22234" />
      {/* Stars */}
      <text x="60" y="130" fontFamily="Arial" fontSize="10" fill="white" opacity="0.5">&#9733;</text>
      <text x="210" y="130" fontFamily="Arial" fontSize="10" fill="white" opacity="0.5">&#9733;</text>
    </svg>
  );
}

/* ── Podium Banner SVG Mockup ── */
function PodiumBannerMockup({ name, office }) {
  const displayName = name.length > 16 ? name.split(' ').pop() : name;
  return (
    <svg viewBox="0 0 280 220" width="100%" style={{ maxWidth: 280 }}>
      {/* Podium body */}
      <path d="M70 90 L60 210 L220 210 L210 90 Z" fill="#3B3026" />
      <path d="M65 90 L55 210 L60 210 L70 90 Z" fill="#2A2018" />
      <path d="M210 90 L220 210 L225 210 L215 90 Z" fill="#2A2018" />
      {/* Podium top */}
      <rect x="55" y="82" width="170" height="12" rx="3" fill="#4A3C2E" />
      {/* Microphones */}
      <rect x="110" y="60" width="2" height="24" fill="#666" />
      <circle cx="111" cy="58" r="4" fill="#333" />
      <rect x="168" y="60" width="2" height="24" fill="#666" />
      <circle cx="169" cy="58" r="4" fill="#333" />
      {/* Banner/Seal on podium front */}
      <rect x="90" y="110" width="100" height="70" rx="5" fill="#1C2E5B" />
      {/* Red top stripe */}
      <rect x="90" y="110" width="100" height="6" rx="5" ry="5" fill="#B22234" />
      <rect x="90" y="113" width="100" height="3" fill="#B22234" />
      {/* Stars row */}
      <text x="107" y="130" fontFamily="Arial" fontSize="7" fill="white" opacity="0.7">&#9733; &#9733; &#9733; &#9733; &#9733;</text>
      {/* Name */}
      <text
        x="140"
        y="152"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={displayName.length > 12 ? 11 : 14}
        fontWeight="bold"
        fill="white"
        letterSpacing="0.5"
      >
        {displayName.toUpperCase()}
      </text>
      {/* Office */}
      <text
        x="140"
        y="167"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fill="white"
        opacity="0.8"
        letterSpacing="1.5"
      >
        {'FOR ' + office.toUpperCase()}
      </text>
      {/* Bottom red stripe */}
      <rect x="115" y="172" width="50" height="2" rx="1" fill="#B22234" />
      {/* Floor shadow */}
      <ellipse cx="140" cy="214" rx="90" ry="6" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

/* ── Bumper Sticker SVG Mockup ── */
function BumperStickerMockup({ name, year }) {
  const displayName = name.length > 16 ? name.split(' ').pop() : name;
  return (
    <svg viewBox="0 0 300 130" width="100%" style={{ maxWidth: 300 }}>
      {/* Car bumper hint */}
      <rect x="0" y="100" width="300" height="30" rx="4" fill="#D0D0D0" />
      <rect x="0" y="100" width="300" height="4" fill="#BFBFBF" />
      {/* Sticker body */}
      <rect x="30" y="10" width="240" height="85" rx="8" fill="#1C2E5B" stroke="#B22234" strokeWidth="3" />
      {/* Top red stripe */}
      <rect x="50" y="16" width="200" height="4" rx="2" fill="#B22234" />
      {/* Stars left */}
      <text x="42" y="53" fontFamily="Arial" fontSize="10" fill="white" opacity="0.6">&#9733;</text>
      <text x="42" y="70" fontFamily="Arial" fontSize="8" fill="white" opacity="0.4">&#9733;</text>
      {/* Stars right */}
      <text x="248" y="53" fontFamily="Arial" fontSize="10" fill="white" opacity="0.6">&#9733;</text>
      <text x="250" y="70" fontFamily="Arial" fontSize="8" fill="white" opacity="0.4">&#9733;</text>
      {/* VOTE text */}
      <text
        x="150"
        y="38"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="#B22234"
        fontWeight="bold"
        letterSpacing="4"
      >
        VOTE
      </text>
      {/* Candidate name */}
      <text
        x="150"
        y="63"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={displayName.length > 12 ? 16 : 22}
        fontWeight="bold"
        fill="white"
        letterSpacing="1"
      >
        {displayName.toUpperCase()}
      </text>
      {/* Year */}
      <text
        x="150"
        y="82"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fill="white"
        opacity="0.7"
        letterSpacing="3"
      >
        {year}
      </text>
      {/* Bottom stripes decoration */}
      <rect x="100" y="88" width="100" height="2" rx="1" fill="#B22234" />
    </svg>
  );
}

/* ── Social Media Avatar SVG Mockup ── */
function SocialAvatarMockup({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 200 }}>
      {/* Outer red accent ring */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#B22234" strokeWidth="6" />
      {/* Inner navy circle */}
      <circle cx="100" cy="100" r="84" fill="#1C2E5B" />
      {/* Subtle inner ring */}
      <circle cx="100" cy="100" r="74" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
      {/* Initials */}
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="42"
        fontWeight="bold"
        fill="white"
        letterSpacing="2"
      >
        {initials}
      </text>
      {/* Verified badge */}
      <circle cx="155" cy="155" r="18" fill="white" />
      <circle cx="155" cy="155" r="15" fill="#1DA1F2" />
      <path
        d="M148 155 L153 160 L163 150"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export default function Stage7_LogoType() {
  const { state, dispatch } = useBrand();
  const selected = state.logoType;

  const handleSelect = (id) => {
    dispatch({ type: 'SET_LOGO_TYPE', payload: id });
  };

  // Preload all logo images as soon as component mounts
  useEffect(() => {
    LOGO_TYPES.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  return (
    <StageContainer
      title="Logo Style"
      subtitle="Choose the type of logo that best represents your campaign's visual identity."
      stageNumber={7}
    >
      <style>{keyframes}</style>

      {/* ── Rounded section container with decorative background ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          borderRadius: 40,
          background: 'white',
          padding: 40,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative SVG backgrounds */}
        <DecorativeDots style={{ top: -20, right: -20 }} />
        <DecorativeDots style={{ bottom: -20, left: -20 }} />

        {/* ── Heading section ── */}
        <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 8px',
              letterSpacing: 1,
              ...headingGradient,
            }}
          >
            Select Your Logo Type
          </h2>
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              color: navy,
              opacity: 0.6,
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
            position: 'relative',
            zIndex: 1,
          }}
        >
          {LOGO_TYPES.map((logoType, index) => {
            const isSelected = selected === logoType.id;

            return (
              <motion.div
                key={logoType.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => handleSelect(logoType.id)}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.99 }}
                style={{
                  position: 'relative',
                  background: isSelected ? '#FFF9FA' : '#FFFFFF',
                  border: `2px solid ${isSelected ? accent : '#E5E7EB'}`,
                  borderRadius: 16,
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(139,26,43,0.3), 0 0 40px rgba(139,26,43,0.1)'
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
                    background: '#FFFFFF',
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
                    loading="eager"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{
                      width: '100%',
                      height: logoType.cropTop ? '130%' : '100%',
                      objectFit: logoType.cropTop ? 'cover' : 'contain',
                      objectPosition: logoType.cropTop ? 'center bottom' : 'center center',
                      transition: 'opacity 0.3s ease',
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
                      color: navy,
                      opacity: 0.6,
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
      </motion.div>

      {/* Hover style for image zoom */}
      <style>{`
        .logo-preview-img:hover {
          transform: scale(1.03);
        }
      `}</style>

    </StageContainer>
  );
}
