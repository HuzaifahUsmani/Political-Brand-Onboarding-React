import { useState, useCallback, useMemo } from 'react';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../context/BrandContext';

const CONFETTI_COLORS = ['#8B1A2B', '#1C2E5B', '#B22234', '#FFD700'];

function ConfettiBurst({ onDone }) {
  const particles = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 80),
    rotate: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 6 + 4,
    isCircle: Math.random() > 0.5,
  })), []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.5 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          onAnimationComplete={() => {
            if (p.id === 0 && onDone) onDone();
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

export default function StageContainer({ children, title, subtitle, stageNumber, hideNavigation = false, canContinue = true, onContinue }) {
  const { prevStage, nextStage, state } = useBrand();
  const isFirst = state.currentStage === 0;
  const isLast = state.currentStage === 8;
  const [showConfetti, setShowConfetti] = useState(false);

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    if (!isMobile) setShowConfetti(true);
    if (onContinue) onContinue();
    else nextStage();
  }, [nextStage, onContinue, canContinue]);

  return (
    <div style={{ position: 'relative', paddingTop: '72px' }}>
      {/* Decorative dot grid background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />

      {/* Decorative SVG abstract lines */}
      <svg
        style={{ position: 'absolute', top: 0, right: 0, width: 384, height: 384, opacity: 0.03, pointerEvents: 'none' }}
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="300" cy="100" r="180" stroke="#1C2E5B" strokeWidth="0.5" />
        <circle cx="300" cy="100" r="140" stroke="#1C2E5B" strokeWidth="0.5" />
        <circle cx="300" cy="100" r="100" stroke="#B22234" strokeWidth="0.5" />
        <line x1="0" y1="200" x2="400" y2="150" stroke="#1C2E5B" strokeWidth="0.5" />
        <line x1="0" y1="250" x2="400" y2="200" stroke="#1C2E5B" strokeWidth="0.3" />
      </svg>

      {/* Rounded container */}
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '24px 8px', position: 'relative', zIndex: 10 }}>

        {/* ── Sticky nav bar ── */}
        {(!isFirst || (!isLast && !hideNavigation)) && (
          <div
            className="no-print"
            style={{
              position: 'sticky',
              top: 72,
              zIndex: 40,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '10px 8px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            }}
          >
            {/* Back button — left */}
            {!isFirst ? (
              <button
                onClick={prevStage}
                className="flex items-center gap-2 font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  color: '#FFFFFF',
                  backgroundColor: '#374151',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(55,65,81,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1F2937')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : <div />}

            {/* Continue button — right */}
            {!isLast && !hideNavigation && (
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="flex items-center gap-2 font-bold transition-all active:scale-95"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  color: '#FFFFFF',
                  backgroundColor: canContinue ? '#8B1A2B' : '#C0C0C0',
                  borderRadius: 12,
                  boxShadow: canContinue ? '0 2px 10px rgba(139,26,43,0.35)' : 'none',
                  border: 'none',
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  opacity: canContinue ? 1 : 0.6,
                }}
                onMouseEnter={(e) => { if (canContinue) e.currentTarget.style.backgroundColor = '#6E1522'; }}
                onMouseLeave={(e) => { if (canContinue) e.currentTarget.style.backgroundColor = '#8B1A2B'; }}
              >
                Continue
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div
          className={`px-4 sm:px-8 md:px-12 py-8 md:py-14 ${isMobile ? 'bg-white' : 'bg-white/70 backdrop-blur-sm'}`}
          style={{ borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-8 md:mb-14">
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isMobile ? 0 : 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-navy-800 text-white text-sm font-bold">
                {stageNumber}
              </span>
              <div className="h-px flex-1 bg-navy-200" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: isMobile ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isMobile ? 0 : 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Onest', sans-serif", color: '#1C2E5B' }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: isMobile ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0 : 0.3 }}
                className="mt-2 text-sm sm:text-base md:text-lg max-w-2xl text-gray-900"
                style={{ opacity: 0.6 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isMobile ? 0 : 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showConfetti && (
          <ConfettiBurst onDone={() => setShowConfetti(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
