import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { OFFICES, US_STATES, ELECTION_YEARS, CANDIDATE_TYPES } from '../../data/brandData';
import StageContainer from '../StageContainer';
import USMapSVG from '../USMapSVG';
import { Building2, Home, Landmark, Star, Crown, ClipboardList, Users, Gavel } from 'lucide-react';

/* ── Design tokens ── */
const accent = '#8B1A2B';
const navy = '#1C2E5B';
const bg = '#FAFAFA';
const cardBorder = '#E5E7EB';
const ease = [0.4, 0, 0.2, 1];

/* ── Icon map for offices ── */
const OFFICE_ICONS = {
  'city-council': <Building2 size={26} />,
  'county':       <Home size={26} />,
  'state-house':  <Landmark size={26} />,
  'state-senate': <Star size={26} />,
  'us-congress':  <Users size={26} />,
  'us-senate':    <Gavel size={26} />,
  'governor':     <Crown size={26} />,
  'other':        <ClipboardList size={26} />,
};

/* ── Inline styles (CSS-in-JS) ── */
const styles = {
  keyframes: `
    @keyframes floatDot {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
      50% { transform: translateY(-8px) scale(1.15); opacity: 1; }
    }
    @keyframes pulseGlow {
      0%, 100% { filter: drop-shadow(0 0 4px rgba(139,26,43,0.2)); }
      50% { filter: drop-shadow(0 0 12px rgba(139,26,43,0.45)); }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes emojiBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `,
};

/* ── Interactive Falling Confetti ── */
const CONFETTI_COLORS = ['#8B1A2B', '#1C2E5B', '#B22234', '#ffffff', '#C8A951', '#3B5998'];
const PARTICLE_COUNT = 20;

function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  const makeParticle = useCallback((w, h, fromTop = false) => {
    const size = 6 + Math.random() * 8;
    return {
      x: Math.random() * w,
      y: fromTop ? -size - Math.random() * h : Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.15 + Math.random() * 0.25,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      w: size,
      h: size * (0.4 + Math.random() * 0.4),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      opacity: 0.7 + Math.random() * 0.3,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      makeParticle(canvas.width, canvas.height)
    );

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        // Cursor repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (80 - dist) / 80;
          p.vx += (dx / dist) * force * 3.5;
          p.vy += (dy / dist) * force * 3.5;
        }

        // Physics
        p.vy += 0.005; // gravity
        p.vx *= 0.99; // drag
        p.vy = Math.min(p.vy, 1); // terminal velocity
        // enforce minimum fall speed so nothing appears static
        if (p.vy < 0.12) p.vy = 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Wrap horizontally, reset when off bottom
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) Object.assign(p, makeParticle(width, height, true));

        // Draw
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [makeParticle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'all',
        zIndex: 2,
        cursor: 'crosshair',
      }}
    />
  );
}

/* ── White House SVG ── */
function WhiteHouseIllustration() {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '2rem 0 1rem' }}>
      {/* Decorative floating dots */}
      {[
        { top: '8px', left: '25%', delay: '0s', size: 6 },
        { top: '20px', right: '22%', delay: '0.5s', size: 5 },
        { top: '4px', left: '38%', delay: '1.2s', size: 4 },
        { top: '16px', right: '35%', delay: '0.8s', size: 5 },
        { bottom: '12px', left: '30%', delay: '1.5s', size: 4 },
        { bottom: '8px', right: '28%', delay: '0.3s', size: 6 },
      ].map((dot, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: dot.size,
            height: dot.size,
            borderRadius: '50%',
            background: accent,
            opacity: 0.5,
            animation: `floatDot 3s ease-in-out ${dot.delay} infinite`,
            ...dot,
          }}
        />
      ))}

      <svg
        width="200"
        height="130"
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}
      >
        {/* Ground / base strip */}
        <rect x="0" y="118" width="200" height="12" rx="2" fill={accent} opacity="0.15" />

        {/* Left wing */}
        <rect x="8" y="72" width="44" height="46" rx="2" fill="white" stroke={accent} strokeWidth="1.5" />
        <rect x="8" y="68" width="44" height="6" rx="1" fill={accent} opacity="0.8" />
        {/* Left wing windows */}
        <rect x="16" y="82" width="10" height="14" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
        <rect x="34" y="82" width="10" height="14" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
        <rect x="16" y="102" width="10" height="12" rx="1" fill={accent} opacity="0.1" stroke={accent} strokeWidth="1" />
        <rect x="34" y="102" width="10" height="12" rx="1" fill={accent} opacity="0.1" stroke={accent} strokeWidth="1" />

        {/* Right wing */}
        <rect x="148" y="72" width="44" height="46" rx="2" fill="white" stroke={accent} strokeWidth="1.5" />
        <rect x="148" y="68" width="44" height="6" rx="1" fill={accent} opacity="0.8" />
        {/* Right wing windows */}
        <rect x="156" y="82" width="10" height="14" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
        <rect x="174" y="82" width="10" height="14" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
        <rect x="156" y="102" width="10" height="12" rx="1" fill={accent} opacity="0.1" stroke={accent} strokeWidth="1" />
        <rect x="174" y="102" width="10" height="12" rx="1" fill={accent} opacity="0.1" stroke={accent} strokeWidth="1" />

        {/* Main central building */}
        <rect x="52" y="58" width="96" height="60" rx="2" fill="white" stroke={accent} strokeWidth="1.5" />

        {/* Portico / columned porch */}
        <rect x="62" y="80" width="76" height="38" rx="1" fill="white" stroke={accent} strokeWidth="1" />
        {/* Columns */}
        {[70, 82, 94, 106, 118, 128].map((x, i) => (
          <rect key={i} x={x} y="82" width="5" height="36" rx="1" fill={accent} opacity="0.7" />
        ))}
        {/* Portico entablature */}
        <rect x="62" y="78" width="76" height="6" rx="1" fill={accent} opacity="0.85" />
        {/* Portico pediment */}
        <polygon points="62,78 100,62 138,78" fill={accent} opacity="0.75" />

        {/* Central door */}
        <rect x="93" y="100" width="14" height="18" rx="2" fill={accent} opacity="0.2" stroke={accent} strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="7" ry="4" fill={accent} opacity="0.3" />

        {/* Upper windows on main building */}
        <rect x="58" y="65" width="12" height="10" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />
        <rect x="130" y="65" width="12" height="10" rx="2" fill={accent} opacity="0.15" stroke={accent} strokeWidth="1" />

        {/* Roof cornice */}
        <rect x="52" y="54" width="96" height="6" rx="1" fill={accent} opacity="0.9" />

        {/* Flagpole */}
        <line x1="100" y1="10" x2="100" y2="55" stroke={accent} strokeWidth="1.5" />
        {/* Flag */}
        <rect x="100" y="10" width="20" height="13" rx="1" fill="#B22234" opacity="0.9" />
        <rect x="100" y="10" width="20" height="4" fill="#B22234" />
        <rect x="100" y="14" width="20" height="3" fill="white" opacity="0.8" />
        <rect x="100" y="17" width="20" height="3" fill="#B22234" opacity="0.9" />
        <rect x="100" y="20" width="20" height="3" fill="white" opacity="0.8" />

        {/* Connecting colonnades (low wings between main and side) */}
        <rect x="52" y="88" width="10" height="30" rx="1" fill="white" stroke={accent} strokeWidth="1" opacity="0.9" />
        <rect x="138" y="88" width="10" height="30" rx="1" fill="white" stroke={accent} strokeWidth="1" opacity="0.9" />

        {/* Driveway / lawn hint */}
        <ellipse cx="100" cy="124" rx="60" ry="5" fill={accent} opacity="0.08" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAGE 1 -- CANDIDATE BASICS
   Build Your Campaign Brand
   ═══════════════════════════════════════════════════════════════════ */
export default function Stage1_CandidateBasics() {
  const { state, dispatch } = useBrand();
  const { candidate } = state;
  const [stateQuery, setStateQuery] = useState('');
  const [showStates, setShowStates] = useState(false);
  const inputRef = useRef(null);

  const filteredStates = useMemo(
    () =>
      stateQuery.length > 0
        ? US_STATES.filter((s) => s.toLowerCase().startsWith(stateQuery.toLowerCase()))
        : US_STATES,
    [stateQuery]
  );

  const update = (payload) => dispatch({ type: 'UPDATE_CANDIDATE', payload });

  /* ── Section animation stagger helper ── */
  const sectionVariant = (delay) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <StageContainer
      stageNumber={1}
      title="Candidate Basics"
      subtitle="Let's start with the essentials. Who's running, and what are they running for?"
    >
      {/* Inject keyframe animations */}
      <style>{styles.keyframes}</style>

      {/* ──────────────────────────────────────────
          HERO: White House + Confetti + Heading
          ────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: '3rem' }}>
        {/* Interactive confetti canvas */}
        <ConfettiCanvas />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <WhiteHouseIllustration />
        </motion.div>

        {/* ──────────────────────────────────────────
            HERO HEADING
            ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
        <h1
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 700,
            color: navy,
            letterSpacing: '0.04em',
            marginBottom: '0.25rem',
            lineHeight: 1.2,
          }}
        >
          BUILD YOUR
        </h1>
        <h2
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: accent,
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}
        >
          CAMPAIGN BRAND
        </h2>
        <p
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            color: '#6B7280',
            fontSize: '0.95rem',
            lineHeight: 1.7,
          }}
        >
          Complete this 8-step discovery process to build a powerful, cohesive political brand
          that resonates with your voters and sets you apart from the competition.
        </p>
        </motion.div>
      </div>

      {/* ──────────────────────────────────────────
          1. FULL NAME INPUT
          ────────────────────────────────────────── */}
      <motion.section {...sectionVariant(0.25)} style={{ marginBottom: '2.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.5rem',
          }}
        >
          Full Legal Name
        </label>
        <motion.input
          ref={inputRef}
          type="text"
          value={candidate.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder="Enter your full legal name"
          spellCheck={false}
          whileFocus={{ boxShadow: `0 0 0 3px ${accent}30` }}
          style={{
            width: '100%',
            padding: '0.85rem 1rem',
            fontSize: '1rem',
            fontFamily: "'Poppins', system-ui, sans-serif",
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            outline: 'none',
            background: '#fff',
            color: navy,
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </motion.section>

      {/* ──────────────────────────────────────────
          2. OFFICE SELECTION — 4-column grid
          ────────────────────────────────────────── */}
      <motion.section {...sectionVariant(0.35)} style={{ marginBottom: '2.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Office You're Seeking
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
        >
          {OFFICES.map((office, i) => {
            const selected = candidate.office === office.id;
            const icon = OFFICE_ICONS[office.id] || <Building2 size={26} />;
            return (
              <motion.button
                key={office.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.05, ease }}
                whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => update({ office: office.id })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 0.5rem',
                  background: selected ? accent : '#fff',
                  border: `1px solid ${selected ? accent : cardBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: selected ? '0 4px 20px rgba(139,26,43,0.25)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    color: selected ? '#fff' : accent,
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = 'emojiBounce 0.5s ease'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = 'none'; }}
                >
                  {icon}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: selected ? '#fff' : '#374151',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    fontFamily: "'Poppins', system-ui, sans-serif",
                    transition: 'color 0.3s ease',
                  }}
                >
                  {office.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────
          3. STATE SELECTION — Interactive US Map
          ────────────────────────────────────────── */}
      <motion.section
        {...sectionVariant(0.45)}
        style={{ marginBottom: '2.5rem' }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Select Your State
        </label>

        {/* Selected state badge */}
        <AnimatePresence>
          {candidate.state && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: accent,
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Poppins', system-ui, sans-serif",
                marginBottom: '0.75rem',
                boxShadow: '0 4px 15px rgba(139,26,43,0.3)',
              }}
            >
              {candidate.state}
              <button
                onClick={() => {
                  update({ state: '' });
                  setStateQuery('');
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Clear state selection"
              >
                X
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive US Map */}
        <div
          style={{
            background: '#fff',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            marginBottom: '1rem',
          }}
        >
          <USMapSVG
            selectedState={candidate.state}
            onSelect={(stateName) => {
              update({ state: stateName });
              setStateQuery(stateName);
            }}
          />
        </div>

        {/* Text autocomplete fallback */}
        <div style={{ position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: '#9CA3AF',
              marginBottom: '0.35rem',
            }}
          >
            Or type your state:
          </label>
          <input
            type="text"
            value={showStates ? stateQuery : candidate.state || stateQuery}
            onFocus={() => {
              setShowStates(true);
              setStateQuery(candidate.state || '');
            }}
            onChange={(e) => {
              setStateQuery(e.target.value);
              setShowStates(true);
              if (!e.target.value) update({ state: '' });
            }}
            onBlur={() => setTimeout(() => setShowStates(false), 200)}
            placeholder="Start typing your state..."
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              fontSize: '0.9rem',
              border: `1px solid ${cardBorder}`,
              borderRadius: '10px',
              outline: 'none',
              background: '#FAFAFA',
              color: navy,
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onFocusCapture={(e) => {
              e.target.style.boxShadow = `0 0 0 3px ${accent}30`;
              e.target.style.borderColor = accent;
            }}
            onBlurCapture={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = cardBorder;
            }}
          />

          <AnimatePresence>
            {showStates && filteredStates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  zIndex: 30,
                  top: '100%',
                  marginTop: '4px',
                  width: '100%',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  background: '#fff',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '12px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                }}
              >
                {filteredStates.map((s) => {
                  const isActive = candidate.state === s;
                  return (
                    <button
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        update({ state: s });
                        setStateQuery(s);
                        setShowStates(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                        color: isActive ? accent : '#374151',
                        fontWeight: isActive ? 700 : 400,
                        background: isActive ? `${accent}08` : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? `${accent}08` : 'transparent';
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* District input */}
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem',
            }}
          >
            District
          </label>
          <input
            type="text"
            value={candidate.district}
            onChange={(e) => update({ district: e.target.value })}
            placeholder="e.g. 4"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              fontSize: '1rem',
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              outline: 'none',
              background: '#fff',
              color: navy,
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 3px ${accent}30`;
              e.target.style.borderColor = accent;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = cardBorder;
            }}
          />
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────
          4. ELECTION CYCLE — 4 buttons in a row
          ────────────────────────────────────────── */}
      <motion.section {...sectionVariant(0.55)} style={{ marginBottom: '2.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Election Cycle
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {ELECTION_YEARS.map((year) => {
            const selected = candidate.electionYear === year;
            return (
              <motion.button
                key={year}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ electionYear: year })}
                style={{
                  padding: '0.85rem 0',
                  fontSize: '1.05rem',
                  fontWeight: selected ? 700 : 500,
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  color: selected ? '#fff' : '#374151',
                  background: selected ? accent : '#fff',
                  border: `1px solid ${selected ? accent : cardBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: selected ? '0 4px 20px rgba(139,26,43,0.25)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {year}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────
          5. RACE FOCUS — Two buttons side by side
          ────────────────────────────────────────── */}
      <motion.section {...sectionVariant(0.65)} style={{ marginBottom: '2.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Race Focus
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { id: 'primary', label: 'Primary Election' },
            { id: 'general', label: 'General Election' },
          ].map((type) => {
            const selected = candidate.raceFocus === type.id;
            return (
              <motion.button
                key={type.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ raceFocus: type.id })}
                style={{
                  padding: '0.85rem 1rem',
                  fontSize: '1rem',
                  fontWeight: selected ? 700 : 500,
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  color: selected ? '#fff' : '#374151',
                  background: selected ? accent : '#fff',
                  border: `1px solid ${selected ? accent : cardBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: selected ? '0 4px 20px rgba(139,26,43,0.25)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {type.label}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────
          6. CANDIDATE TYPE — 3 cards in a row
          ────────────────────────────────────────── */}
      <motion.section {...sectionVariant(0.75)} style={{ marginBottom: '2.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Candidate Type
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {CANDIDATE_TYPES.map((type, i) => {
            const selected = candidate.candidateType === type.id;
            return (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.07, ease }}
                whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ candidateType: type.id })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '1.25rem 1rem',
                  background: selected ? accent : '#fff',
                  border: `1px solid ${selected ? accent : cardBorder}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: selected ? '0 4px 20px rgba(139,26,43,0.25)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: selected ? '#fff' : '#111827',
                    fontFamily: "'Poppins', system-ui, sans-serif",
                    marginBottom: '0.35rem',
                    lineHeight: 1.3,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {type.label}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: selected ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                    lineHeight: 1.5,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {type.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────
          7. PARTY AFFILIATION — Badge indicator
          ────────────────────────────────────────── */}
      <motion.section
        {...sectionVariant(0.85)}
        style={{ marginBottom: '1rem' }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.75rem',
          }}
        >
          Party Affiliation
        </label>

        <motion.div
          whileHover={{ y: -1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.65rem 1.25rem',
            background: '#fff',
            border: `1px solid ${cardBorder}`,
            borderRadius: '9999px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#DC2626',
              display: 'inline-block',
              boxShadow: '0 0 6px rgba(220,38,38,0.4)',
            }}
          />
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#111827',
              fontFamily: "'Poppins', system-ui, sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            Republican
          </span>
        </motion.div>
      </motion.section>
    </StageContainer>
  );
}
