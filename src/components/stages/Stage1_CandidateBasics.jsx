import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { OFFICES, US_STATES, ELECTION_YEARS, CANDIDATE_TYPES } from '../../data/brandData';
import StageContainer from '../StageContainer';

/* ── Design tokens ── */
const accent = '#8B1A2B';
const navy = '#1C2E5B';
const bg = '#FAFAFA';
const cardBorder = '#E5E7EB';
const ease = [0.4, 0, 0.2, 1];

/* ── Emoji map for offices ── */
const OFFICE_EMOJIS = {
  'city-council': '\u{1F3DB}\uFE0F',
  'county': '\u{1F3D8}\uFE0F',
  'state-house': '\u{1F3DB}\uFE0F',
  'state-senate': '\u2B50',
  'us-congress': '\u{1F1FA}\u{1F1F8}',
  'us-senate': '\u{1F985}',
  'governor': '\u{1F451}',
  'other': '\u{1F4CB}',
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

/* ── Capitol Building SVG ── */
function CapitolIllustration() {
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
        width="160"
        height="110"
        viewBox="0 0 160 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}
      >
        {/* Base platform */}
        <rect x="10" y="90" width="140" height="10" rx="2" fill={accent} />
        <rect x="20" y="82" width="120" height="10" rx="1" fill={accent} opacity="0.85" />

        {/* Columns */}
        {[32, 52, 72, 92, 112, 128].map((x, i) => (
          <rect key={i} x={x} y="42" width="6" height="40" rx="1" fill={accent} opacity="0.9" />
        ))}

        {/* Pediment / triangular roof */}
        <polygon points="25,44 80,18 135,44" fill={accent} opacity="0.95" />

        {/* Dome */}
        <ellipse cx="80" cy="20" rx="22" ry="14" fill={accent} opacity="0.9" />
        <ellipse cx="80" cy="18" rx="14" ry="9" fill={accent} />

        {/* Dome top / cupola */}
        <rect x="77" y="6" width="6" height="8" rx="1" fill={accent} />
        <circle cx="80" cy="5" r="3" fill={accent} />

        {/* Small flag */}
        <line x1="80" y1="0" x2="80" y2="5" stroke={accent} strokeWidth="1" />
        <rect x="80" y="0" width="10" height="6" rx="1" fill="#B22234" opacity="0.9" />
        <rect x="80" y="2" width="10" height="2" fill="#fff" opacity="0.6" />

        {/* Window details */}
        <rect x="60" y="52" width="8" height="12" rx="1" fill="#fff" opacity="0.2" />
        <rect x="76" y="52" width="8" height="12" rx="1" fill="#fff" opacity="0.2" />
        <rect x="92" y="52" width="8" height="12" rx="1" fill="#fff" opacity="0.2" />
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
          TOP ILLUSTRATION: Capitol Building
          ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease }}
      >
        <CapitolIllustration />
      </motion.div>

      {/* ──────────────────────────────────────────
          HERO HEADING
          ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease }}
        style={{ textAlign: 'center', marginBottom: '3rem' }}
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
            const emoji = OFFICE_EMOJIS[office.id] || '\u{1F3DB}\uFE0F';
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
                    fontSize: '1.75rem',
                    display: 'block',
                    marginBottom: '0.4rem',
                    transition: 'transform 0.3s ease',
                  }}
                  className="office-emoji"
                  onMouseEnter={(e) => { e.currentTarget.style.animation = 'emojiBounce 0.5s ease'; }}
                  onAnimationEnd={(e) => { e.currentTarget.style.animation = 'none'; }}
                >
                  {emoji}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.5rem',
          }}
        >
          State
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
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              outline: 'none',
              background: '#fff',
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

        {/* District */}
        <div>
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
