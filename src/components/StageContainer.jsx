import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../context/BrandContext';

const CONFETTI_COLORS = ['#8B1A2B', '#1C2E5B', '#B22234', '#FFD700'];

function ConfettiBurst({ onDone }) {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 80),
    rotate: Math.random() * 720 - 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 6 + 4,
    isCircle: Math.random() > 0.5,
  }));

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

export default function StageContainer({ children, title, subtitle, stageNumber, hideNavigation = false }) {
  const { prevStage, nextStage, state } = useBrand();
  const isFirst = state.currentStage === 0;
  const isLast = state.currentStage === 9;
  const [showConfetti, setShowConfetti] = useState(false);

  const handleContinue = useCallback(() => {
    setShowConfetti(true);
    nextStage();
  }, [nextStage]);

  return (
    <div className="relative" style={{ paddingTop: '100px' }}>
      {/* Sticky back button - fixed to left side */}
      {!isFirst && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            top: 100,
            left: 20,
            zIndex: 40,
          }}
        >
          <button
            onClick={prevStage}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md"
            style={{
              color: '#1C2E5B',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>
      )}

      {/* Decorative dot grid background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" aria-hidden="true" />

      {/* Decorative SVG abstract lines */}
      <svg
        className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none"
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

      {/* Rounded 40px container */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative z-10">
        <div
          className="bg-white/70 backdrop-blur-sm px-8 md:px-12 py-10 md:py-14"
          style={{ borderRadius: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-10 md:mb-14">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-navy-800 text-white text-sm font-bold">
                {stageNumber}
              </span>
              <div className="h-px flex-1 bg-navy-200" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "'Poppins', 'Inter', sans-serif", color: '#1C2E5B' }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 text-lg max-w-2xl text-gray-900"
                style={{ opacity: 0.6 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>

          {!isLast && !hideNavigation && (
            <>
              {/* Wave SVG divider */}
              <div className="mt-16 -mx-8 md:-mx-12 overflow-hidden">
                <svg
                  viewBox="0 0 1440 48"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  className="w-full h-10 text-gray-100"
                >
                  <path
                    d="M0 24C240 4 480 44 720 24C960 4 1200 44 1440 24V48H0Z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between pt-6 px-0 no-print">
                {!isFirst ? (
                  <button
                    onClick={prevStage}
                    className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors"
                    style={{
                      color: '#1C2E5B',
                      border: '2px solid #1C2E5B',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                ) : <div />}
                <button
                  onClick={handleContinue}
                  className="flex items-center justify-center gap-2 py-4 px-8 text-white rounded-xl font-bold uppercase tracking-wide transition-colors w-full sm:w-auto"
                  style={{
                    backgroundColor: '#8B1A2B',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6E1522')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8B1A2B')}
                >
                  Continue to Next Step
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </>
          )}
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
